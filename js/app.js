// =============================================
// Main Application
// =============================================

import { CONFIG } from './config.js';
import { formatDate, parseTelegramMessage, extractTelegramText, detectDirection, getFileIcon, isImage, getTagById } from './utils.js';
import * as API from './api.js';
import { TicketForm, TicketCard, Statistics, SearchFilter, Modal, Lightbox, Loading, EmptyState } from './components.js';
import * as Icons from './icons.js';

const { useState, useEffect, useRef, createElement: h } = React;

// Helper to render icon
const icon = (IconComponent, props = {}) => h(IconComponent, { size: 18, ...props });

// =============================================
// Main App Component
// =============================================
function App() {
    // State
    const [tickets, setTickets] = useState([]);
    const [editId, setEditId] = useState(null);
    const [viewTicket, setViewTicket] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterTag, setFilterTag] = useState('all');
    const [showImport, setShowImport] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [lightbox, setLightbox] = useState(null);
    const [form, setForm] = useState(getEmptyForm());
    const editRef = useRef(null);

    // =============================================
    // Effects
    // =============================================
    useEffect(() => {
        loadTickets();
    }, []);

    useEffect(() => {
        if (editId && editRef.current) {
            editRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [editId]);

    // =============================================
    // Helper Functions
    // =============================================
    function getEmptyForm() {
        return {
            name: '',
            link: '',
            details: '',
            attachments: [],
            status: 'pending',
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
            pending: tickets.filter(t => t.status === 'pending').length,
            inProgress: tickets.filter(t => t.status === 'in-progress').length,
            completed: tickets.filter(t => t.status === 'completed').length
        };
    }

    function getFilteredTickets() {
        return tickets.filter(t => {
            const matchSearch = (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
                               (t.details || '').toLowerCase().includes(search.toLowerCase());
            const matchStatus = filterStatus === 'all' || t.status === filterStatus;
            const matchTag = filterTag === 'all' || (t.tags && t.tags.includes(filterTag));
            return matchSearch && matchStatus && matchTag;
        });
    }

    function getNextTicketNumber() {
        return tickets.length > 0 ? Math.max(...tickets.map(t => t.ticketNumber || 0)) + 1 : 1;
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
                await API.createTicket(form, getNextTicketNumber());
            }
            await loadTickets();
            resetForm();
            setShowAdd(false);
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
    }

    function cancelEdit() {
        resetForm();
        setEditId(null);
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
    // Render
    // =============================================
    const stats = calculateStats();
    const filtered = getFilteredTickets();

    return h('div', { className: 'min-h-screen p-4 md:p-6' },
        h('div', { className: 'max-w-7xl mx-auto' },
            
            // Header
            h('div', { className: 'glass rounded-2xl p-6 mb-6 shadow-lg' },
                h('div', { className: 'flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6' },
                    h('div', { className: 'flex items-center gap-3' },
                        h('div', { className: 'w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center' },
                            icon(Icons.TicketIcon, { size: 24, className: 'text-white' })
                        ),
                        h('div', null,
                            h('h1', { className: 'text-2xl font-bold text-gray-900' }, 'نظام إدارة التذاكر'),
                            h('p', { className: 'text-gray-500 text-sm' }, 'إدارة ومتابعة تذاكر العمل')
                        )
                    ),
                    h('div', { className: 'flex flex-wrap gap-2' },
                        h('button', {
                            onClick: () => { resetForm(); setShowAdd(true); },
                            className: 'btn-primary text-white px-4 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2'
                        }, icon(Icons.PlusIcon, { size: 18 }), 'تذكرة جديدة'),
                        h('button', {
                            onClick: () => setShowImport(true),
                            className: 'bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2'
                        }, icon(Icons.DownloadIcon, { size: 18 }), 'استيراد'),
                        h('button', {
                            onClick: handleExport,
                            className: 'bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2'
                        }, icon(Icons.UploadIcon, { size: 18 }), 'تصدير'),
                        tickets.length > 0 && h('button', {
                            onClick: handleDeleteAll,
                            className: 'bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-semibold hover:bg-red-100 transition-all flex items-center gap-2'
                        }, icon(Icons.TrashIcon, { size: 18 }), 'حذف الكل')
                    )
                ),
                h(Statistics, { stats })
            ),

            // Search & Filter
            h(SearchFilter, { search, setSearch, filterStatus, setFilterStatus, filterTag, setFilterTag }),

            // Loading
            loading && h(Loading),

            // Tickets Grid
            !loading && filtered.length > 0 && h('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
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

            // View Modal
            viewTicket && h(Modal, {
                show: true,
                onClose: () => setViewTicket(null),
                title: `تذكرة #${viewTicket.ticketNumber}`,
                size: 'lg'
            },
                h('div', { className: 'space-y-5' },
                    h('div', null,
                        h('label', { className: 'text-sm font-bold text-gray-400 uppercase' }, '🏢 الشركة'),
                        h('p', { className: 'text-xl font-bold text-gray-900 mt-1', dir: detectDirection(viewTicket.name) }, viewTicket.name)
                    ),
                    viewTicket.link && h('div', null,
                        h('label', { className: 'text-sm font-bold text-gray-400 uppercase' }, '🔗 الرابط'),
                        h('a', { href: viewTicket.link, target: '_blank', className: 'text-blue-600 hover:underline block mt-1 break-all', dir: 'ltr' }, viewTicket.link)
                    ),
                    h('div', null,
                        h('label', { className: 'text-sm font-bold text-gray-400 uppercase' }, '📝 التفاصيل'),
                        h('div', { className: 'bg-gray-50 rounded-xl p-5 mt-2 border' },
                            h('p', { className: 'text-gray-700 whitespace-pre-wrap leading-relaxed', dir: detectDirection(viewTicket.details) }, viewTicket.details || 'لا توجد')
                        )
                    ),
                    viewTicket.attachments?.length > 0 && h('div', null,
                        h('label', { className: 'text-sm font-bold text-gray-400 uppercase' }, `📎 المرفقات (${viewTicket.attachments.length})`),
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
                                            h('span', { className: 'text-4xl' }, getFileIcon(a.name)),
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
                            h('label', { className: 'text-sm font-bold text-gray-400 uppercase' }, '📊 الحالة'),
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
                )
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
