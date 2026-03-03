// =============================================
// Utility Functions
// =============================================

import { CONFIG } from './config.js';

/**
 * Generate unique Ticket ID
 * Format: TKT-YYYYMMDD-XXXX (e.g., TKT-20250303-0001)
 * @param {number} sequenceNumber - Daily sequence number
 * @returns {string}
 */
export const generateTicketId = (sequenceNumber = 1) => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const seq = String(sequenceNumber).padStart(4, '0');
    
    return `${CONFIG.TICKET_PREFIX}-${year}${month}${day}-${seq}`;
};

/**
 * Extract date part from Ticket ID
 * @param {string} ticketId 
 * @returns {string|null}
 */
export const getTicketIdDate = (ticketId) => {
    if (!ticketId) return null;
    const match = ticketId.match(/\d{8}/);
    return match ? match[0] : null;
};

/**
 * Extract sequence number from Ticket ID
 * @param {string} ticketId 
 * @returns {number}
 */
export const getTicketIdSequence = (ticketId) => {
    if (!ticketId) return 0;
    const parts = ticketId.split('-');
    return parts.length >= 3 ? parseInt(parts[2], 10) || 0 : 0;
};

/**
 * Calculate next sequence number for today
 * @param {Array} tickets - Existing tickets
 * @returns {number}
 */
export const getNextSequenceNumber = (tickets) => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    
    let maxSeq = 0;
    tickets.forEach(ticket => {
        if (ticket.ticketId && ticket.ticketId.includes(todayStr)) {
            const seq = getTicketIdSequence(ticket.ticketId);
            if (seq > maxSeq) maxSeq = seq;
        }
    });
    
    return maxSeq + 1;
};

/**
 * Format Ticket ID for display (shortened version)
 * @param {string} ticketId 
 * @returns {string}
 */
export const formatTicketIdShort = (ticketId) => {
    if (!ticketId) return '#???';
    // Extract just the sequence part for compact display
    const seq = getTicketIdSequence(ticketId);
    return `#${seq}`;
};

/**
 * Get file icon type based on extension
 * @param {string} filename 
 * @returns {string} icon type name
 */
export const getFileIconType = (filename) => {
    const ext = (filename || '').split('.').pop().toLowerCase();
    
    if (CONFIG.IMAGE_EXTENSIONS.includes(ext)) return 'Image';
    if (ext === 'pdf') return 'FilePdf';
    if (['doc', 'docx'].includes(ext)) return 'FileText';
    if (['xls', 'xlsx'].includes(ext)) return 'FileSpreadsheet';
    if (['zip', 'rar', '7z'].includes(ext)) return 'Archive';
    
    return 'File';
};

/**
 * Get file icon based on extension (legacy - returns emoji)
 * @param {string} filename 
 * @returns {string} emoji icon
 */
export const getFileIcon = (filename) => {
    const ext = (filename || '').split('.').pop().toLowerCase();
    
    if (CONFIG.IMAGE_EXTENSIONS.includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['ppt', 'pptx'].includes(ext)) return '📽️';
    if (['zip', 'rar', '7z'].includes(ext)) return '📦';
    if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) return '🎬';
    if (['mp3', 'wav', 'ogg'].includes(ext)) return '🎵';
    
    return '📎';
};

/**
 * Check if file is an image
 * @param {string} filename 
 * @returns {boolean}
 */
export const isImage = (filename) => {
    const ext = (filename || '').split('.').pop().toLowerCase();
    return CONFIG.IMAGE_EXTENSIONS.includes(ext);
};

/**
 * Detect text direction (RTL for Arabic, LTR for English)
 * @param {string} text 
 * @returns {string} 'rtl' or 'ltr'
 */
export const detectDirection = (text) => {
    if (!text) return 'rtl';
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(text.charAt(0)) ? 'rtl' : 'ltr';
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date 
 * @returns {string}
 */
export const formatDate = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

/**
 * Generate unique filename
 * @param {string} originalName 
 * @returns {string}
 */
export const generateFileName = (originalName) => {
    const ext = originalName.split('.').pop();
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    return `${timestamp}-${random}.${ext}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 25) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Parse Telegram export and extract ticket data
 * @param {string} text - Raw message text
 * @returns {object} Parsed ticket data
 */
export const parseTelegramMessage = (text) => {
    const nameMatch = text.match(/(?:اسم المشروع او الشركة|اسم الشركة)[:\s]*(.+?)(?=\n|$)/is);
    const urlMatch = text.match(/(https?:\/\/[^\s\n]+)/i);
    
    // Clean details - remove labels and URLs
    let details = text
        .replace(/^#\d+\s*$/gm, '')
        .replace(/^(?:اسم المشروع او الشركة|اسم الشركة)[:\s]*.*$/gim, '')
        .replace(/^الروابط?[:\s]*$/gim, '')
        .replace(/^التفاصيل[:\s]*$/gim, '')
        .replace(/https?:\/\/[^\s\n]+/gi, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
    
    return {
        name: nameMatch?.[1]?.trim() || text.split('\n')[0]?.substring(0, 100) || 'تذكرة',
        link: urlMatch?.[1] || '',
        details: details
    };
};

/**
 * Extract text from Telegram message object
 * @param {any} messageText 
 * @returns {string}
 */
export const extractTelegramText = (messageText) => {
    if (typeof messageText === 'string') return messageText;
    if (Array.isArray(messageText)) {
        return messageText.map(item => 
            typeof item === 'string' ? item : item?.text || ''
        ).join('');
    }
    return messageText?.text || '';
};

/**
 * Get status display info
 * @param {string} status 
 * @returns {object}
 */
export const getStatusInfo = (status) => {
    return CONFIG.STATUSES.find(s => s.value === status) || CONFIG.STATUSES[0];
};

/**
 * Get tag by ID
 * @param {string} tagId 
 * @returns {object|undefined}
 */
export const getTagById = (tagId) => {
    return CONFIG.TAGS.find(t => t.id === tagId);
};
