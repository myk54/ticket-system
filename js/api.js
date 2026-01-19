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
        ticketNumber: t.ticket_number,
        name: t.name,
        link: t.link || '',
        details: t.details,
        attachments: t.attachments || [],
        status: t.status,
        date: t.date,
        tags: t.tags || []
    }));
};

/**
 * Create a new ticket
 * @param {object} ticketData 
 * @param {number} ticketNumber 
 * @returns {Promise<object>}
 */
export const createTicket = async (ticketData, ticketNumber) => {
    const { data, error } = await supabase
        .from('tickets')
        .insert([{
            ticket_number: ticketNumber,
            name: ticketData.name,
            link: ticketData.link,
            details: ticketData.details,
            attachments: ticketData.attachments,
            status: ticketData.status,
            date: ticketData.date,
            tags: ticketData.tags
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
