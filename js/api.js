// =============================================
// API Layer - Supabase Operations
// =============================================

import { supabase, CONFIG } from './config.js';
import { generateFileName } from './utils.js';

// =============================================
// Ticket Operations
// =============================================

/**
 * Fetch all tickets ordered by creation date
 * @returns {Promise<Array>}
 */
export const fetchTickets = async () => {
    const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(t => ({
        id: t.id,
        ticketId: t.ticket_id || `#T${String(t.ticket_number || 0).padStart(4, '0')}`,
        ticketNumber: t.ticket_number,
        name: t.name,
        link: t.link || '',
        details: t.details,
        attachments: t.attachments || [],
        status: t.status || 'new',
        priority: t.priority || 'normal',
        date: t.date,
        tags: t.tags || [],
        createdBy: t.created_by || null,
        assignedTo: t.assigned_to || null
    }));
};

/**
 * Create a new ticket
 * @param {object} ticketData 
 * @param {string} ticketId - Unique ticket ID
 * @param {number} ticketNumber - Sequential number
 * @param {string} createdBy - User ID who created the ticket
 * @returns {Promise<object>}
 */
export const createTicket = async (ticketData, ticketId, ticketNumber, createdBy = null) => {
    const { data, error } = await supabase
        .from('tickets')
        .insert([{
            ticket_id: ticketId,
            ticket_number: ticketNumber,
            name: ticketData.name,
            link: ticketData.link,
            details: ticketData.details,
            attachments: ticketData.attachments,
            status: 'new',
            priority: ticketData.priority || 'normal',
            date: ticketData.date,
            tags: ticketData.tags,
            created_by: createdBy,
            assigned_to: null
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Update an existing ticket
 * @param {string} id 
 * @param {object} ticketData 
 * @returns {Promise<object>}
 */
export const updateTicket = async (id, ticketData) => {
    const { data, error } = await supabase
        .from('tickets')
        .update({
            name: ticketData.name,
            link: ticketData.link,
            details: ticketData.details,
            attachments: ticketData.attachments,
            status: ticketData.status,
            date: ticketData.date,
            tags: ticketData.tags
        })
        .eq('id', id)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Delete a ticket by ID
 * @param {string} id 
 * @returns {Promise<void>}
 */
export const deleteTicket = async (id) => {
    const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);
    
    if (error) throw error;
};

/**
 * Delete all tickets
 * @returns {Promise<void>}
 */
export const deleteAllTickets = async () => {
    const { error } = await supabase
        .from('tickets')
        .delete()
        .neq('id', 0);
    
    if (error) throw error;
};

/**
 * Bulk insert tickets (for import)
 * @param {Array} tickets 
 * @param {number} startNumber 
 * @returns {Promise<Array>}
 */
export const bulkInsertTickets = async (tickets, startNumber) => {
    const ticketsToInsert = tickets.map((t, i) => ({
        ticket_number: startNumber + i,
        name: t.name,
        link: t.link,
        details: t.details,
        attachments: t.attachments || [],
        status: t.status || 'pending',
        date: t.date,
        tags: t.tags || []
    }));
    
    const { data, error } = await supabase
        .from('tickets')
        .insert(ticketsToInsert)
        .select();
    
    if (error) throw error;
    return data;
};

// =============================================
// File Storage Operations
// =============================================

/**
 * Upload a file to Supabase Storage
 * @param {File} file 
 * @returns {Promise<object>} { url, name, path }
 */
export const uploadFile = async (file) => {
    if (file.size > CONFIG.MAX_FILE_SIZE) {
        throw new Error(`الملف ${file.name} كبير جداً (الحد الأقصى ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }
    
    const fileName = generateFileName(file.name);
    const filePath = `uploads/${fileName}`;
    
    const { error } = await supabase.storage
        .from(CONFIG.STORAGE_BUCKET)
        .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
        .from(CONFIG.STORAGE_BUCKET)
        .getPublicUrl(filePath);
    
    return {
        url: urlData.publicUrl,
        name: file.name,
        path: filePath
    };
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filePath 
 * @returns {Promise<void>}
 */
export const deleteFile = async (filePath) => {
    if (!filePath) return;
    
    try {
        await supabase.storage
            .from(CONFIG.STORAGE_BUCKET)
            .remove([filePath]);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

/**
 * Upload multiple files
 * @param {FileList|Array} files 
 * @returns {Promise<Array>}
 */
export const uploadMultipleFiles = async (files) => {
    const uploaded = [];
    
    for (const file of files) {
        try {
            const result = await uploadFile(file);
            uploaded.push(result);
        } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            throw error;
        }
    }
    
    return uploaded;
};

/**
 * Delete multiple files
 * @param {Array} attachments 
 * @returns {Promise<void>}
 */
export const deleteMultipleFiles = async (attachments) => {
    if (!attachments || !attachments.length) return;
    
    for (const att of attachments) {
        if (att.path) {
            await deleteFile(att.path);
        }
    }
};

// =============================================
// Comments Operations
// =============================================

/**
 * Fetch comments for a ticket
 * @param {string} ticketId 
 * @returns {Promise<Array>}
 */
export const fetchComments = async (ticketId) => {
    const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
            *,
            user:user_id(id, username, full_name, role_id, roles(name))
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    return data.map(c => ({
        id: c.id,
        ticketId: c.ticket_id,
        content: c.content,
        createdAt: c.created_at,
        user: c.user ? {
            id: c.user.id,
            username: c.user.username,
            fullName: c.user.full_name,
            role: c.user.roles?.name
        } : null
    }));
};

/**
 * Add a comment to a ticket
 * @param {string} ticketId 
 * @param {string} userId 
 * @param {string} content 
 * @returns {Promise<object>}
 */
export const addComment = async (ticketId, userId, content) => {
    const { data, error } = await supabase
        .from('ticket_comments')
        .insert([{
            ticket_id: ticketId,
            user_id: userId,
            content
        }])
        .select(`
            *,
            user:user_id(id, username, full_name, role_id, roles(name))
        `)
        .single();
    
    if (error) throw error;
    
    return {
        id: data.id,
        ticketId: data.ticket_id,
        content: data.content,
        createdAt: data.created_at,
        user: data.user ? {
            id: data.user.id,
            username: data.user.username,
            fullName: data.user.full_name,
            role: data.user.roles?.name
        } : null
    };
};

/**
 * Delete a comment
 * @param {string} commentId 
 * @returns {Promise<void>}
 */
export const deleteComment = async (commentId) => {
    const { error } = await supabase
        .from('ticket_comments')
        .delete()
        .eq('id', commentId);
    
    if (error) throw error;
};

// =============================================
// Assignment Operations
// =============================================

/**
 * Assign ticket to a user
 * @param {string} ticketId 
 * @param {string} userId 
 * @returns {Promise<object>}
 */
export const assignTicket = async (ticketId, userId) => {
    const { data, error } = await supabase
        .from('tickets')
        .update({ assigned_to: userId })
        .eq('id', ticketId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Unassign ticket
 * @param {string} ticketId 
 * @returns {Promise<object>}
 */
export const unassignTicket = async (ticketId) => {
    const { data, error } = await supabase
        .from('tickets')
        .update({ assigned_to: null })
        .eq('id', ticketId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Get processors (users who can be assigned tickets)
 * @returns {Promise<Array>}
 */
export const getProcessors = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, full_name, roles(name)')
        .eq('is_active', true)
        .in('role_id', 
            supabase.from('roles').select('id').in('name', ['admin', 'processor'])
        );
    
    // Fallback: get all active users
    const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, username, full_name, role_id, roles(name)')
        .eq('is_active', true);
    
    if (allError) throw allError;
    
    // Filter to admin and processor roles
    return allUsers.filter(u => 
        u.roles?.name === 'admin' || u.roles?.name === 'processor'
    );
};
