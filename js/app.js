// =============================================
// Main Application
// =============================================

import { CONFIG } from './config.js';
import { formatDate, parseTelegramMessage, extractTelegramText, detectDirection, getFileIcon, isImage, getTagById, generateTicketId, getNextTicketNumber } from './utils.js';
import * as API from './api.js';
import * as Auth from './auth.js';
import { TicketForm, TicketCard, Statistics, SearchFilter, Modal, Lightbox, Loading, EmptyState, TicketTableView, ViewModeToggle } from './components.js';
import { LoginForm } from './LoginForm.js';
import { UserManagementPanel } from './UserManagement.js';
import { CommentsList } from './Comments.js';
import { Dashboard } from './Dashboard.js';
import { Icon, ICON_NAMES } from './icons.js';
import { ROLES, ROLE_NAMES, ROLE_COLORS, hasPermission, canViewTicket, canEditTicket, canDeleteTicket, canAssignTicket, canManageUsers, isAdmin, PERMISSIONS, getAllowedTransitions } from './permissions.js';

const { useState, useEffect, useRef, createElement: h } = React;

// =============================================
// Main App Component
// =============================================
function App() {
    // Auth State
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState('');
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [showUserManagement, setShowUserManagement] = useState(false);

    // Tickets State
    const [tickets, setTickets] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewTicket, setViewTicket] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTag, setFilterTag] = useState('all');
    const [showImport, setShowImport] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [lightbox, setLightbox] = useState(null);
    const [form, setForm] = useState(getEmptyForm());
    const editRef = useRef(null);
    
    // Table view state
    const [viewMode, setViewMode] = useState('table'); // 'cards' or 'table'
    const [selectedIds, setSelectedIds] = useState([]);
    const [sortField, setSortField] = useState('ticketNumber');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Comments state
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentSaving, setCommentSaving] = useState(false);

    // Dashboard state
    const [showDashboard, setShowDashboard] = useState(false);

    // Processors (for assignment)
    const [processors, setProcessors] = useState([]);

    // Get current user role
    const userRole = userProfile?.roles?.name || null;

    // =============================================
    // Auth Effects
    // =============================================
    useEffect(() => {
        checkAuth();
        
        // Listen to auth changes
        const { data: { subscription } } = Auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setUserProfile(null);
            }
        });

        return () => subscription?.unsubscribe();
    }, []);

    useEffect(() => {
        if (user && userProfile) {
            loadTickets();
            loadProcessors();
            if (isAdmin(userRole)) {
                loadUsers();
                loadRoles();
            }
        }
    }, [user, userProfile]);

    useEffect(() => {
        if (editId && editRef.current) {
            editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editId]);

    // Load comments when viewing a ticket
    useEffect(() => {
        if (viewTicket?.id) {
            loadComments(viewTicket.id);
        }
    }, [viewTicket?.id]);

    // =============================================
    // Auth Functions
    // =============================================
    async function checkAuth() {
        setAuthLoading(true);
        try {
            const session = await Auth.getSession();
            if (session?.user) {
                setUser(session.user);
                // User profile is already in session for simple auth
                setUserProfile({
                    id: session.user.id,
                    full_name: session.user.full_name,
                    username: session.user.username,
                    roles: { name: session.user.role, display_name: session.user.role_display }
                });
            }
        } catch (e) {
            console.error('Auth check error:', e);
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleLogin(username, password) {
        setAuthLoading(true);
        setAuthError('');
        try {
            const { user: authUser } = await Auth.signIn(username, password);
            setUser(authUser);
            setUserProfile({
                id: authUser.id,
                full_name: authUser.full_name,
                username: authUser.username,
                roles: { name: authUser.role, display_name: authUser.role_display }
            });
        } catch (e) {
            setAuthError(e.message);
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleLogout() {
        if (!confirm('تسجيل الخروج؟')) return;
        try {
            await Auth.signOut();
            setUser(null);
            setUserProfile(null);
            setTickets([]);
        } catch (e) {
            alert('خطأ: ' + e.message);
        }
    }

    async function loadUsers() {
        try {
            const data = await Auth.getAllUsers();
            setUsers(data);
        } catch (e) {
            console.error('Error loading users:', e);
        }
    }

    async function loadRoles() {
        try {
            const data = await Auth.getRoles();
            setRoles(data);
        } catch (e) {
            console.error('Error loading roles:', e);
        }
    }

    async function loadProcessors() {
        try {
            const data = await API.getProcessors();
            setProcessors(data);
        } catch (e) {
            console.error('Error loading processors:', e);
        }
    }

    // =============================================
    // Comments Functions
    // =============================================
    async function loadComments(ticketId) {
        setCommentsLoading(true);
        try {
            const data = await API.fetchComments(ticketId);
            setComments(data);
        } catch (e) {
            console.error('Error loading comments:', e);
        } finally {
            setCommentsLoading(false);
        }
    }

    async function handleAddComment(content) {
        if (!viewTicket || !user) return;
        setCommentSaving(true);
        try {
            const newComment = await API.addComment(viewTicket.id, user.id, content);
            setComments(prev => [...prev, newComment]);
        } catch (e) {
            alert('خطأ في إضافة التعليق: ' + e.message);
        } finally {
            setCommentSaving(false);
        }
    }

    async function handleDeleteComment(commentId) {
        if (!confirm('حذف هذا التعليق؟')) return;
        try {
            await API.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (e) {
            alert('خطأ في حذف التعليق: ' + e.message);
        }
    }

    // =============================================
    // Assignment Functions
    // =============================================
    async function handleAssignTicket(ticketId, userId) {
        try {
            await API.assignTicket(ticketId, userId);
            await loadTickets();
            if (viewTicket?.id === ticketId) {
                const updated = tickets.find(t => t.id === ticketId);
                if (updated) setViewTicket(updated);
            }
        } catch (e) {
            alert('خطأ في تعيين التذكرة: ' + e.message);
        }
    }

    async function handleUnassignTicket(ticketId) {
        try {
            await API.unassignTicket(ticketId);
            await loadTickets();
        } catch (e) {
            alert('خطأ في إلغاء التعيين: ' + e.message);
        }
    }

    // =============================================
    // Helper Functions
    // =============================================
    function getEmptyForm() {
        return {
            name: '',
            link: '',
            details: '',
            attachments: [],
            priority: 'normal',
            date: formatDate(),
            tags: []
        };
    }

    function resetForm() {
        setForm(getEmptyForm());
    }

    function calculateStats() {
        return {
            total: tickets.length,
            new: tickets.filter(t => t.status === 'new').length,
            inProgress: tickets.filter(t => t.status === 'in-progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            approved: tickets.filter(t => t.status === 'approved').length,
            urgent: tickets.filter(t => t.priority === 'urgent').length
        };
    }

    function getFilteredTickets() {
        let filtered = tickets.filter(t => {
            const searchLower = search.toLowerCase().trim();
            
            // Search by ticket ID (exact or partial match)
            const matchTicketId = (t.ticketId || '').toLowerCase().includes(searchLower) ||
                                  String(t.ticketNumber || '').includes(searchLower);
            
            // Search by name and details
            const matchContent = (t.name || '').toLowerCase().includes(searchLower) ||
                                (t.details || '').toLowerCase().includes(searchLower);
            
            const matchSearch = searchLower === '' || matchTicketId || matchContent;
            const matchStatus = filterStatus === 'all' || t.status === filterStatus;
            const matchTag = filterTag === 'all' || (t.tags && t.tags.includes(filterTag));
            
            return matchSearch && matchStatus && matchTag;
        });
        
        // Sort
        filtered.sort((a, b) => {
            let aVal = a[sortField] || '';
            let bVal = b[sortField] || '';
            
            if (sortField === 'ticketNumber' || sortField === 'ticketId') {
                // Sort by sequence number extracted from ticketId
                aVal = a.ticketNumber || 0;
                bVal = b.ticketNumber || 0;
            }
            
            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        return filtered;
    }

    function getNewTicketIdAndNumber() {
        const ticketNumber = getNextTicketNumber(tickets);
        const ticketId = generateTicketId(ticketNumber);
        return { ticketId, ticketNumber };
    }

    // =============================================
    // API Operations
    // =============================================
    async function loadTickets() {
        setLoading(true);
        try {
            const data = await API.fetchTickets();
            setTickets(data);
        } catch (e) {
            alert('خطأ في تحميل التذاكر: ' + e.message);
        } finally {
            setLoading(false);
        }
    }

    async function saveTicket() {
        if (!form.name.trim() || !form.details.trim()) {
            return alert('الرجاء إدخال اسم الشركة والتفاصيل');
        }

        setSaving(true);
        try {
            if (editId) {
                await API.updateTicket(editId, form);
            } else {
                const { ticketId, ticketNumber } = getNewTicketIdAndNumber();
                await API.createTicket(form, ticketId, ticketNumber, user?.id);
            }
            await loadTickets();
            resetForm();
            setShowAdd(false);
            setShowEditModal(false);
            setEditId(null);
        } catch (e) {
            alert('خطأ في الحفظ: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeleteTicket(id) {
        if (!confirm('حذف هذه التذكرة؟')) return;

        try {
            const ticket = tickets.find(t => t.id === id);
            if (ticket?.attachments) {
                await API.deleteMultipleFiles(ticket.attachments);
            }
            await API.deleteTicket(id);
            await loadTickets();
        } catch (e) {
            alert('خطأ في الحذف: ' + e.message);
        }
    }

    async function handleDeleteAll() {
        if (!confirm('حذف جميع التذاكر؟')) return;

        try {
            for (const t of tickets) {
                if (t.attachments) {
                    await API.deleteMultipleFiles(t.attachments);
                }
            }
            await API.deleteAllTickets();
            setTickets([]);
        } catch (e) {
            alert('خطأ في الحذف: ' + e.message);
        }
    }

    // =============================================
    // File Operations
    // =============================================
    async function handleFileUpload(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        setUploading(true);
        try {
            const uploaded = await API.uploadMultipleFiles(files);
            setForm(p => ({ ...p, attachments: [...p.attachments, ...uploaded] }));
        } catch (e) {
            alert('خطأ في رفع الملفات: ' + e.message);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    }

    async function handleRemoveAttachment(index) {
        const att = form.attachments[index];
        if (att?.path) {
            await API.deleteFile(att.path);
        }
        setForm(p => ({ ...p, attachments: p.attachments.filter((_, i) => i !== index) }));
    }

    // =============================================
    // Import/Export Operations
    // =============================================
    async function handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        setSaving(true);
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            let items = [];

            if (data.messages) {
                // Telegram export
                items = data.messages
                    .filter(m => m.type === 'message' && m.text)
                    .map(m => {
                        const txt = extractTelegramText(m.text);
                        const parsed = parseTelegramMessage(txt);
                        return {
                            ...parsed,
                            status: 'pending',
                            date: m.date?.split('T')[0] || formatDate(),
                            attachments: [],
                            tags: []
                        };
                    });
            } else if (Array.isArray(data)) {
                // Backup file
                items = data.map(t => ({
                    name: t.name || 'تذكرة',
                    link: t.link || '',
                    details: t.details || '',
                    status: t.status || 'pending',
                    date: t.date || formatDate(),
                    attachments: t.attachments || [],
                    tags: t.tags || []
                }));
            }

            if (!items.length) {
                alert('لا توجد بيانات للاستيراد');
                return;
            }

            await API.bulkInsertTickets(items, getNextTicketNumber());
            await loadTickets();
            setShowImport(false);
            alert(`✅ تم استيراد ${items.length} تذكرة بنجاح`);
        } catch (e) {
            alert('خطأ في الاستيراد: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    function handleExport() {
        const blob = new Blob([JSON.stringify(tickets, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tickets-backup-${formatDate()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // =============================================
    // Edit Operations
    // =============================================
    function startEdit(ticket) {
        setForm({
            name: ticket.name,
            link: ticket.link,
            details: ticket.details,
            attachments: ticket.attachments || [],
            status: ticket.status,
            date: ticket.date,
            tags: ticket.tags || []
        });
        setEditId(ticket.id);
        if (viewMode === 'table') {
            setShowEditModal(true);
        }
    }

    function cancelEdit() {
        resetForm();
        setEditId(null);
        setShowEditModal(false);
    }

    function toggleTag(tagId) {
        setForm(p => ({
            ...p,
            tags: p.tags.includes(tagId)
                ? p.tags.filter(t => t !== tagId)
                : [...p.tags, tagId]
        }));
    }

    // =============================================
    // Table View Operations
    // =============================================
    function handleSelectOne(id) {
        setSelectedIds(prev => 
            prev.includes(id) 
                ? prev.filter(i => i !== id) 
                : [...prev, id]
        );
    }

    function handleSelectAll(pageTickets) {
        const pageIds = pageTickets.map(t => t.id);
        const allSelected = pageIds.every(id => selectedIds.includes(id));
        
        if (allSelected) {
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        } else {
            setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
        }
    }

    function handleSort(field) {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    }

    async function handleBulkDelete() {
        if (selectedIds.length === 0) return;
        if (!confirm(`هل تريد حذف ${selectedIds.length} تذكرة؟`)) return;
        
        setSaving(true);
        try {
            for (const id of selectedIds) {
                const ticket = tickets.find(t => t.id === id);
                if (ticket?.attachments?.length) {
                    const paths = ticket.attachments.map(a => a.path).filter(Boolean);
                    if (paths.length) await API.deleteMultipleFiles(paths);
                }
                await API.deleteTicket(id);
            }
            setSelectedIds([]);
            await loadTickets();
        } catch (e) {
            alert('خطأ في الحذف: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleBulkStatusChange(newStatus) {
        if (selectedIds.length === 0) return;
        
        setSaving(true);
        try {
            for (const id of selectedIds) {
                await API.updateTicket(id, { status: newStatus });
            }
            setSelectedIds([]);
            await loadTickets();
        } catch (e) {
            alert('خطأ في تحديث الحالة: ' + e.message);
        } finally {
            setSaving(false);
        }
    }

    function handlePageChange(page) {
        setCurrentPage(page);
        setSelectedIds([]); // Clear selection when changing page
    }

    function handlePageSizeChange(size) {
        setPageSize(size);
        setCurrentPage(1);
        setSelectedIds([]);
    }

    // =============================================
    // Render
    // =============================================
    
    // Show loading while checking auth
    if (authLoading) {
        return h('div', { className: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' },
            h('div', { className: 'text-center' },
                h(Icon, { name: ICON_NAMES.loader, size: 48, className: 'text-blue-400 animate-spin mx-auto' }),
                h('p', { className: 'text-blue-200 mt-4' }, 'جاري التحميل...')
            )
        );
    }

    // Show login if not authenticated
    if (!user || !userProfile) {
        return h(LoginForm, { 
            onLogin: handleLogin, 
            error: authError, 
            loading: authLoading 
        });
    }

    const stats = calculateStats();
    const filtered = getFilteredTickets();

    return h('div', { className: 'min-h-screen p-4 md:p-6' },
        h('div', { className: 'max-w-7xl mx-auto' },
            
            // Header
            h('div', { className: 'glass rounded-2xl p-6 mb-6 shadow-lg' },
                h('div', { className: 'flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6' },
                    h('div', { className: 'flex items-center gap-3' },
                        h('div', { className: 'w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg' },
                            h(Icon, { name: ICON_NAMES.headset, size: 24, className: 'text-white' })
                        ),
                        h('div', null,
                            h('h1', { className: 'text-2xl font-bold text-gray-900' }, 'نظام إدارة التذاكر'),
                            h('p', { className: 'text-gray-500 text-sm' }, 'إدارة ومتابعة تذاكر الدعم الفني')
                        )
                    ),
                    // User Info & Actions
                    h('div', { className: 'flex items-center gap-4' },
                        // Action Buttons
                        h('div', { className: 'flex flex-wrap gap-2' },
                            hasPermission(userRole, PERMISSIONS.REPORT_VIEW) && h('button', {
                                onClick: () => setShowDashboard(true),
                                className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 hover:from-purple-600 hover:to-purple-700'
                            }, h(Icon, { name: ICON_NAMES.barChart, size: 18 }), 'لوحة التحكم'),
                            hasPermission(userRole, PERMISSIONS.TICKET_CREATE) && h('button', {
                                onClick: () => { resetForm(); setShowAdd(true); },
                                className: 'btn-primary text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2'
                            }, h(Icon, { name: ICON_NAMES.plus, size: 18 }), 'تذكرة جديدة'),
                            hasPermission(userRole, PERMISSIONS.IMPORT_TICKETS) && h('button', {
                                onClick: () => setShowImport(true),
                                className: 'bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2'
                            }, h(Icon, { name: ICON_NAMES.download, size: 18 }), 'استيراد'),
                            hasPermission(userRole, PERMISSIONS.EXPORT_TICKETS) && h('button', {
                                onClick: handleExport,
                                className: 'bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2'
                            }, h(Icon, { name: ICON_NAMES.upload, size: 18 }), 'تصدير'),
                            canDeleteTicket(userRole) && tickets.length > 0 && h('button', {
                                onClick: handleDeleteAll,
                                className: 'bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center gap-2'
                            }, h(Icon, { name: ICON_NAMES.trash, size: 18 }), 'حذف الكل')
                        ),
                        // User Menu
                        h('div', { className: 'flex items-center gap-2 border-r pr-4 mr-2' },
                            canManageUsers(userRole) && h('button', {
                                onClick: () => setShowUserManagement(true),
                                className: 'p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all',
                                title: 'إدارة المستخدمين'
                            }, h(Icon, { name: ICON_NAMES.users, size: 20 })),
                            h('div', { className: 'flex items-center gap-2' },
                                h('div', { 
                                    className: `w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${ROLE_COLORS[userRole] || 'bg-gray-500'}` 
                                }, (userProfile.full_name || userProfile.username || '?').charAt(0).toUpperCase()),
                                h('div', { className: 'hidden md:block' },
                                    h('p', { className: 'text-sm font-semibold text-gray-900' }, userProfile.full_name || 'مستخدم'),
                                    h('p', { className: 'text-xs text-gray-500' }, ROLE_NAMES[userRole] || userRole)
                                )
                            ),
                            h('button', {
                                onClick: handleLogout,
                                className: 'p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all',
                                title: 'تسجيل الخروج'
                            }, h(Icon, { name: ICON_NAMES.logOut, size: 20 }))
                        )
                    )
                ),
                h(Statistics, { stats })
            ),

            // Search & Filter with View Toggle
            h('div', { className: 'glass rounded-xl p-4 mb-6 shadow' },
                h('div', { className: 'flex flex-col md:flex-row gap-3' },
                    h('div', { className: 'flex-1 relative' },
                        h('span', { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' },
                            h(Icon, { name: ICON_NAMES.search, size: 18 })
                        ),
                        h('input', { 
                            type: 'text', 
                            value: search, 
                            onChange: e => { setSearch(e.target.value); setCurrentPage(1); }, 
                            placeholder: 'بحث فوري...', 
                            className: 'w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none' 
                        })
                    ),
                    h('select', { 
                        value: filterStatus, 
                        onChange: e => { setFilterStatus(e.target.value); setCurrentPage(1); }, 
                        className: 'px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none bg-white' 
                    },
                        h('option', { value: 'all' }, 'كل الحالات'),
                        CONFIG.STATUSES.map(s => h('option', { key: s.value, value: s.value }, s.label))
                    ),
                    h('select', { 
                        value: filterTag, 
                        onChange: e => { setFilterTag(e.target.value); setCurrentPage(1); }, 
                        className: 'px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none bg-white' 
                    },
                        h('option', { value: 'all' }, 'كل التصنيفات'),
                        CONFIG.TAGS.map(tag => h('option', { key: tag.id, value: tag.id }, tag.name))
                    ),
                    h(ViewModeToggle, { viewMode, onViewModeChange: setViewMode })
                )
            ),

            // Loading
            loading && h(Loading),

            // Table View
            !loading && filtered.length > 0 && viewMode === 'table' && h(TicketTableView, {
                tickets: filtered,
                selectedIds,
                onSelectOne: handleSelectOne,
                onSelectAll: handleSelectAll,
                onView: ticket => setViewTicket(ticket),
                onEdit: ticket => startEdit(ticket),
                onDelete: handleDeleteTicket,
                onBulkDelete: handleBulkDelete,
                onBulkStatusChange: handleBulkStatusChange,
                sortField,
                sortDirection,
                onSort: handleSort,
                currentPage,
                pageSize,
                onPageChange: handlePageChange,
                onPageSizeChange: handlePageSizeChange,
                userRole,
                canChangeStatus: hasPermission(userRole, PERMISSIONS.STATUS_ANY) || hasPermission(userRole, PERMISSIONS.STATUS_NEW_TO_PROGRESS),
                canDelete: canDeleteTicket(userRole)
            }),

            // Cards View
            !loading && filtered.length > 0 && viewMode === 'cards' && h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
                filtered.map(ticket =>
                    h(TicketCard, {
                        key: ticket.id,
                        ticket,
                        isEditing: editId === ticket.id,
                        editRef,
                        onView: () => setViewTicket(ticket),
                        onEdit: () => startEdit(ticket),
                        onCancelEdit: cancelEdit,
                        onDelete: () => handleDeleteTicket(ticket.id),
                        setLightbox,
                        form,
                        setForm,
                        onSave: saveTicket,
                        saving,
                        uploading,
                        onFileUpload: handleFileUpload,
                        onRemoveAttachment: handleRemoveAttachment,
                        onToggleTag: toggleTag
                    })
                )
            ),

            // Empty State
            !loading && filtered.length === 0 && h(EmptyState),

            // Add Modal
            h(Modal, {
                show: showAdd,
                onClose: () => !saving && setShowAdd(false),
                title: '➕ تذكرة جديدة',
                size: 'md'
            },
                h(TicketForm, {
                    form,
                    setForm,
                    onSave: saveTicket,
                    onCancel: () => { resetForm(); setShowAdd(false); },
                    saving,
                    uploading,
                    onFileUpload: handleFileUpload,
                    onRemoveAttachment: handleRemoveAttachment,
                    onToggleTag: toggleTag,
                    setLightbox,
                    isEdit: false,
                    isModal: true
                })
            ),

            // Edit Modal (for table view)
            h(Modal, {
                show: showEditModal,
                onClose: () => !saving && cancelEdit(),
                title: '✏️ تعديل التذكرة',
                size: 'md'
            },
                h(TicketForm, {
                    form,
                    setForm,
                    onSave: saveTicket,
                    onCancel: cancelEdit,
                    saving,
                    uploading,
                    onFileUpload: handleFileUpload,
                    onRemoveAttachment: handleRemoveAttachment,
                    onToggleTag: toggleTag,
                    setLightbox,
                    isEdit: true,
                    isModal: true
                })
            ),

            // View Modal with Comments
            viewTicket && h(Modal, {
                show: true,
                onClose: () => { setViewTicket(null); setComments([]); },
                title: viewTicket.ticketId || `تذكرة #${viewTicket.ticketNumber}`,
                size: 'full'
            },
                h('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
                    // Main Content (2 cols)
                    h('div', { className: 'lg:col-span-2 space-y-5' },
                        // Ticket ID Badge & Assignment
                        h('div', { className: 'flex flex-wrap items-center justify-between gap-3' },
                            h('div', { className: 'flex items-center gap-3' },
                                h('span', { 
                                    className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-mono text-sm font-bold shadow-lg'
                                }, viewTicket.ticketId || `#${viewTicket.ticketNumber}`),
                                h('span', { className: 'text-gray-400 text-sm' }, `تاريخ الإنشاء: ${viewTicket.date || '-'}`)
                            ),
                            // Assignment dropdown
                            canAssignTicket(userRole) && h('div', { className: 'flex items-center gap-2' },
                                h('label', { className: 'text-sm text-gray-500' }, 'تعيين إلى:'),
                                h('select', {
                                    value: viewTicket.assignedTo?.id || '',
                                    onChange: e => e.target.value ? handleAssignTicket(viewTicket.id, e.target.value) : handleUnassignTicket(viewTicket.id),
                                    className: 'px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400'
                                },
                                    h('option', { value: '' }, 'غير مُعيّن'),
                                    processors.map(p => 
                                        h('option', { key: p.id, value: p.id }, p.full_name || p.username)
                                    )
                                )
                            )
                        ),
                        
                        // Assigned To Badge
                        viewTicket.assignedTo && h('div', { className: 'flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg' },
                            h(Icon, { name: ICON_NAMES.user, size: 16 }),
                            h('span', { className: 'text-sm' }, 'مُعيّنة إلى: '),
                            h('span', { className: 'font-semibold' }, viewTicket.assignedTo.full_name || viewTicket.assignedTo.username)
                        ),

                        h('div', null,
                            h('label', { className: 'flex items-center gap-2 text-sm font-bold text-gray-400 uppercase' },
                                h(Icon, { name: ICON_NAMES.building, size: 14 }),
                                'الشركة'
                            ),
                            h('p', { className: 'text-xl font-bold text-gray-900 mt-1', dir: detectDirection(viewTicket.name) }, viewTicket.name)
                        ),
                        viewTicket.link && h('div', null,
                            h('label', { className: 'flex items-center gap-2 text-sm font-bold text-gray-400 uppercase' },
                                h(Icon, { name: ICON_NAMES.link, size: 14 }),
                                'الرابط'
                            ),
                            h('a', { href: viewTicket.link, target: '_blank', className: 'text-blue-600 hover:underline block mt-1 break-all', dir: 'ltr' }, viewTicket.link)
                        ),
                        h('div', null,
                            h('label', { className: 'flex items-center gap-2 text-sm font-bold text-gray-400 uppercase' },
                                h(Icon, { name: ICON_NAMES.fileText, size: 14 }),
                                'التفاصيل'
                            ),
                            h('div', { className: 'bg-gray-50 rounded-xl p-5 mt-2 border' },
                                h('p', { className: 'text-gray-700 whitespace-pre-wrap leading-relaxed', dir: detectDirection(viewTicket.details) }, viewTicket.details || 'لا توجد')
                            )
                        ),
                        viewTicket.attachments?.length > 0 && h('div', null,
                            h('label', { className: 'flex items-center gap-2 text-sm font-bold text-gray-400 uppercase' },
                                h(Icon, { name: ICON_NAMES.paperclip, size: 14 }),
                                `المرفقات (${viewTicket.attachments.length})`
                            ),
                            h('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-4 mt-2' },
                                viewTicket.attachments.map((a, i) =>
                                    h('div', {
                                        key: i,
                                        className: 'border rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all',
                                        onClick: () => isImage(a.name) ? setLightbox(a.url) : window.open(a.url, '_blank')
                                    },
                                        isImage(a.name)
                                            ? h('img', { src: a.url, className: 'w-full h-32 object-cover' })
                                            : h('div', { className: 'w-full h-32 bg-gray-100 flex flex-col items-center justify-center' },
                                                h(Icon, { name: ICON_NAMES.file, size: 32, className: 'text-gray-400' }),
                                                h('span', { className: 'text-sm text-gray-600 mt-1' }, a.name)
                                            ),
                                        h('div', { className: 'p-2 bg-gray-50 text-center border-t' },
                                            h('span', { className: 'text-xs text-gray-500' }, a.name?.substring(0, 25))
                                        )
                                    )
                                )
                            )
                        ),
                        h('div', { className: 'grid grid-cols-2 gap-4 pt-4 border-t' },
                            h('div', null,
                                h('label', { className: 'flex items-center gap-2 text-sm font-bold text-gray-400 uppercase' },
                                    h(Icon, { name: ICON_NAMES.barChart, size: 14 }),
                                    'الحالة'
                                ),
                                h('span', {
                                    className: `inline-block mt-1 px-4 py-2 rounded-lg font-semibold ${
                                        viewTicket.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        viewTicket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                        'bg-amber-100 text-amber-700'
                                    }`
                                }, viewTicket.status === 'completed' ? '✅ مكتمل' : viewTicket.status === 'in-progress' ? '🔄 قيد التنفيذ' : '⏳ قيد الانتظار')
                            ),
                            h('div', null,
                                h('label', { className: 'text-sm font-bold text-gray-400 uppercase' }, '📅 التاريخ'),
                                h('p', { className: 'text-xl font-bold text-gray-900 mt-1' }, viewTicket.date)
                            )
                        )
                    ),
                    
                    // Comments Sidebar (1 col)
                    h('div', { className: 'lg:col-span-1 border-t lg:border-t-0 lg:border-r pt-4 lg:pt-0 lg:pr-6' },
                        h('h3', { className: 'font-bold text-gray-700 mb-4 flex items-center gap-2' },
                            h(Icon, { name: ICON_NAMES.messageSquare, size: 18 }),
                            'التعليقات'
                        ),
                        h(CommentsList, {
                            comments,
                            loading: commentsLoading,
                            currentUserId: user?.id,
                            isAdmin: isAdmin(userRole),
                            onAddComment: handleAddComment,
                            onDeleteComment: handleDeleteComment,
                            saving: commentSaving
                        })
                    )
                )
            ),

            // Dashboard Modal
            h(Modal, {
                show: showDashboard,
                onClose: () => setShowDashboard(false),
                title: '',
                size: 'full'
            },
                h(Dashboard, {
                    tickets,
                    users,
                    onClose: () => setShowDashboard(false)
                })
            ),

            // User Management Modal (Admin only)
            h(Modal, {
                show: showUserManagement,
                onClose: () => setShowUserManagement(false),
                title: '👥 إدارة المستخدمين',
                size: 'lg'
            },
                h(UserManagementPanel, {
                    users,
                    roles,
                    currentUserId: user?.id,
                    onAddUser: async (formData) => {
                        await Auth.createUser(formData.email, formData.password, formData.role_id, formData.full_name);
                        await loadUsers();
                    },
                    onEditUser: async (userId, formData) => {
                        await Auth.updateUserProfile(userId, {
                            full_name: formData.full_name,
                            role_id: formData.role_id
                        });
                        await loadUsers();
                    },
                    onToggleStatus: async (userId, isActive) => {
                        await Auth.toggleUserStatus(userId, isActive);
                        await loadUsers();
                    },
                    onDeleteUser: async (userId) => {
                        // Note: Deleting users requires admin API
                        alert('حذف المستخدمين يتطلب صلاحيات خاصة من Supabase Dashboard');
                    },
                    loading: false
                })
            ),

            // Import Modal
            h(Modal, {
                show: showImport,
                onClose: () => !saving && setShowImport(false),
                title: '📥 استيراد التذاكر',
                size: 'sm'
            },
                h('div', null,
                    h('p', { className: 'text-gray-600 mb-4' }, 'اختر ملف JSON (تصدير Telegram أو نسخة احتياطية)'),
                    h('div', { className: 'border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-all' },
                        h('input', {
                            type: 'file',
                            accept: '.json',
                            onChange: handleImport,
                            disabled: saving,
                            className: 'hidden',
                            id: 'import-file'
                        }),
                        h('label', { htmlFor: 'import-file', className: 'cursor-pointer' },
                            h('div', { className: 'text-5xl mb-2' }, '📁'),
                            h('p', { className: 'text-gray-500' }, saving ? '⏳ جاري الاستيراد...' : 'اختر ملف JSON')
                        )
                    )
                )
            ),

            // Lightbox
            h(Lightbox, { image: lightbox, onClose: () => setLightbox(null) })
        )
    );
}

// =============================================
// Initialize App
// =============================================
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(h(App));
