// =============================================
// Permissions & Role-Based Access Control
// =============================================

// Role IDs
export const ROLES = {
    ADMIN: 'admin',
    PROCESSOR: 'processor',
    REVIEWER: 'reviewer',
    SUPPORT: 'support'
};

// Role Display Names
export const ROLE_NAMES = {
    [ROLES.ADMIN]: 'مدير النظام',
    [ROLES.PROCESSOR]: 'معالج التذاكر',
    [ROLES.REVIEWER]: 'مدقق',
    [ROLES.SUPPORT]: 'الدعم الفني'
};

// Role Colors
export const ROLE_COLORS = {
    [ROLES.ADMIN]: 'bg-red-500',
    [ROLES.PROCESSOR]: 'bg-blue-500',
    [ROLES.REVIEWER]: 'bg-purple-500',
    [ROLES.SUPPORT]: 'bg-green-500'
};

// Ticket Statuses with workflow
export const TICKET_STATUS = {
    NEW: 'new',
    IN_PROGRESS: 'in-progress',
    RESOLVED: 'resolved',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CLOSED: 'closed'
};

// Status Display
export const STATUS_DISPLAY = {
    [TICKET_STATUS.NEW]: { label: 'جديد', color: 'bg-gray-500' },
    [TICKET_STATUS.IN_PROGRESS]: { label: 'قيد المعالجة', color: 'bg-blue-500' },
    [TICKET_STATUS.RESOLVED]: { label: 'تم الحل', color: 'bg-amber-500' },
    [TICKET_STATUS.APPROVED]: { label: 'معتمد', color: 'bg-green-500' },
    [TICKET_STATUS.REJECTED]: { label: 'مرفوض', color: 'bg-red-500' },
    [TICKET_STATUS.CLOSED]: { label: 'مغلق', color: 'bg-gray-700' }
};

// =============================================
// Permission Definitions
// =============================================

const PERMISSIONS = {
    // Ticket permissions
    TICKET_CREATE: 'ticket:create',
    TICKET_VIEW_OWN: 'ticket:view_own',
    TICKET_VIEW_ASSIGNED: 'ticket:view_assigned',
    TICKET_VIEW_ALL: 'ticket:view_all',
    TICKET_EDIT_OWN: 'ticket:edit_own',
    TICKET_EDIT_ASSIGNED: 'ticket:edit_assigned',
    TICKET_EDIT_ALL: 'ticket:edit_all',
    TICKET_DELETE: 'ticket:delete',
    TICKET_ASSIGN: 'ticket:assign',
    TICKET_REOPEN: 'ticket:reopen',
    
    // Status change permissions
    STATUS_NEW_TO_PROGRESS: 'status:new_to_progress',
    STATUS_PROGRESS_TO_RESOLVED: 'status:progress_to_resolved',
    STATUS_RESOLVED_TO_APPROVED: 'status:resolved_to_approved',
    STATUS_RESOLVED_TO_REJECTED: 'status:resolved_to_rejected',
    STATUS_ANY: 'status:any',
    
    // Comment permissions
    COMMENT_ADD: 'comment:add',
    COMMENT_VIEW: 'comment:view',
    
    // Attachment permissions
    ATTACHMENT_ADD: 'attachment:add',
    ATTACHMENT_DELETE_OWN: 'attachment:delete_own',
    ATTACHMENT_DELETE_ALL: 'attachment:delete_all',
    
    // Import/Export
    IMPORT_TICKETS: 'import:tickets',
    EXPORT_TICKETS: 'export:tickets',
    
    // User management
    USER_VIEW: 'user:view',
    USER_CREATE: 'user:create',
    USER_EDIT: 'user:edit',
    USER_DELETE: 'user:delete',
    USER_TOGGLE_STATUS: 'user:toggle_status',
    
    // Reports
    REPORT_VIEW: 'report:view',
    
    // Settings
    SETTINGS_VIEW: 'settings:view',
    SETTINGS_EDIT: 'settings:edit'
};

// =============================================
// Role Permission Mapping
// =============================================

const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
        // All permissions
        ...Object.values(PERMISSIONS)
    ],
    
    [ROLES.PROCESSOR]: [
        PERMISSIONS.TICKET_VIEW_ASSIGNED,
        PERMISSIONS.TICKET_EDIT_ASSIGNED,
        PERMISSIONS.STATUS_NEW_TO_PROGRESS,
        PERMISSIONS.STATUS_PROGRESS_TO_RESOLVED,
        PERMISSIONS.COMMENT_ADD,
        PERMISSIONS.COMMENT_VIEW,
        PERMISSIONS.ATTACHMENT_ADD,
        PERMISSIONS.ATTACHMENT_DELETE_OWN,
        PERMISSIONS.EXPORT_TICKETS
    ],
    
    [ROLES.REVIEWER]: [
        PERMISSIONS.TICKET_VIEW_ALL,
        PERMISSIONS.STATUS_RESOLVED_TO_APPROVED,
        PERMISSIONS.STATUS_RESOLVED_TO_REJECTED,
        PERMISSIONS.COMMENT_ADD,
        PERMISSIONS.COMMENT_VIEW,
        PERMISSIONS.REPORT_VIEW,
        PERMISSIONS.EXPORT_TICKETS
    ],
    
    [ROLES.SUPPORT]: [
        PERMISSIONS.TICKET_CREATE,
        PERMISSIONS.TICKET_VIEW_OWN,
        PERMISSIONS.TICKET_EDIT_OWN,
        PERMISSIONS.TICKET_REOPEN,
        PERMISSIONS.COMMENT_ADD,
        PERMISSIONS.COMMENT_VIEW,
        PERMISSIONS.ATTACHMENT_ADD,
        PERMISSIONS.ATTACHMENT_DELETE_OWN
    ]
};

// =============================================
// Status Transition Rules
// =============================================

const STATUS_TRANSITIONS = {
    [ROLES.ADMIN]: {
        // Admin can change any status to any status
        [TICKET_STATUS.NEW]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.CLOSED],
        [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.NEW, TICKET_STATUS.RESOLVED, TICKET_STATUS.CLOSED],
        [TICKET_STATUS.RESOLVED]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.APPROVED, TICKET_STATUS.REJECTED, TICKET_STATUS.CLOSED],
        [TICKET_STATUS.APPROVED]: [TICKET_STATUS.CLOSED, TICKET_STATUS.IN_PROGRESS],
        [TICKET_STATUS.REJECTED]: [TICKET_STATUS.IN_PROGRESS, TICKET_STATUS.CLOSED],
        [TICKET_STATUS.CLOSED]: [TICKET_STATUS.NEW, TICKET_STATUS.IN_PROGRESS]
    },
    
    [ROLES.PROCESSOR]: {
        [TICKET_STATUS.NEW]: [TICKET_STATUS.IN_PROGRESS],
        [TICKET_STATUS.IN_PROGRESS]: [TICKET_STATUS.RESOLVED],
        [TICKET_STATUS.REJECTED]: [TICKET_STATUS.IN_PROGRESS]
    },
    
    [ROLES.REVIEWER]: {
        [TICKET_STATUS.RESOLVED]: [TICKET_STATUS.APPROVED, TICKET_STATUS.REJECTED]
    },
    
    [ROLES.SUPPORT]: {
        [TICKET_STATUS.CLOSED]: [TICKET_STATUS.NEW] // Reopen
    }
};

// =============================================
// Permission Check Functions
// =============================================

/**
 * Check if role has permission
 */
export const hasPermission = (role, permission) => {
    if (!role || !ROLE_PERMISSIONS[role]) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
};

/**
 * Check if role can change status
 */
export const canChangeStatus = (role, fromStatus, toStatus) => {
    if (!role || !STATUS_TRANSITIONS[role]) return false;
    const allowed = STATUS_TRANSITIONS[role][fromStatus];
    return allowed && allowed.includes(toStatus);
};

/**
 * Get allowed status transitions for role
 */
export const getAllowedTransitions = (role, currentStatus) => {
    if (!role || !STATUS_TRANSITIONS[role]) return [];
    return STATUS_TRANSITIONS[role][currentStatus] || [];
};

/**
 * Check if user can view ticket
 */
export const canViewTicket = (role, ticket, userId) => {
    if (hasPermission(role, PERMISSIONS.TICKET_VIEW_ALL)) return true;
    if (hasPermission(role, PERMISSIONS.TICKET_VIEW_ASSIGNED) && ticket.assigned_to === userId) return true;
    if (hasPermission(role, PERMISSIONS.TICKET_VIEW_OWN) && ticket.created_by === userId) return true;
    return false;
};

/**
 * Check if user can edit ticket
 */
export const canEditTicket = (role, ticket, userId) => {
    if (hasPermission(role, PERMISSIONS.TICKET_EDIT_ALL)) return true;
    if (hasPermission(role, PERMISSIONS.TICKET_EDIT_ASSIGNED) && ticket.assigned_to === userId) return true;
    if (hasPermission(role, PERMISSIONS.TICKET_EDIT_OWN) && ticket.created_by === userId) return true;
    return false;
};

/**
 * Check if user can delete ticket
 */
export const canDeleteTicket = (role) => {
    return hasPermission(role, PERMISSIONS.TICKET_DELETE);
};

/**
 * Check if user can assign tickets
 */
export const canAssignTicket = (role) => {
    return hasPermission(role, PERMISSIONS.TICKET_ASSIGN);
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (role) => {
    return hasPermission(role, PERMISSIONS.USER_CREATE) || 
           hasPermission(role, PERMISSIONS.USER_EDIT);
};

/**
 * Check if user is admin
 */
export const isAdmin = (role) => {
    return role === ROLES.ADMIN;
};

// Export permissions for use in components
export { PERMISSIONS };
