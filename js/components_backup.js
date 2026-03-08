// =============================================
// UI Components - Using Lucide Icons
// =============================================

import { CONFIG } from './config.js';
import { isImage, detectDirection, getStatusInfo, getTagById, truncateText } from './utils.js';
import { Icon, ICON_NAMES } from './icons.js';

const { createElement: h } = React;

// =============================================
// Priority Badge Component
// =============================================
export const PriorityBadge = ({ priority, size = 'md' }) => {
    const config = CONFIG.PRIORITIES.find(p => p.value === priority) || CONFIG.PRIORITIES[0];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    
    return h('span', { 
        className: `inline-flex items-center gap-1 rounded-full font-semibold ${config.bgClass} ${sizeClasses}` 
    },
        h(Icon, { name: config.icon, size: size === 'sm' ? 12 : 14 }),
        config.label
    );
};

// =============================================
// Status Badge Component
// =============================================
export const StatusBadge = ({ status, size = 'md' }) => {
    const config = CONFIG.STATUSES.find(s => s.value === status) || CONFIG.STATUSES[0];
    const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
    
    return h('span', { 
        className: `inline-flex items-center gap-1 rounded-full font-semibold ${config.bgClass} ${sizeClasses}` 
    },
        h(Icon, { name: config.icon, size: size === 'sm' ? 12 : 14 }),
        config.label
    );
};

// =============================================
// Form Component (for Support - uses Priority)
// =============================================
export const TicketForm = ({ 
    form, setForm, onSave, onCancel, saving, uploading, 
    onFileUpload, onRemoveAttachment, onToggleTag, setLightbox,
    isEdit = false, isModal = false 
}) => {
    const nameDir = detectDirection(form.name);
    const detailsDir = detectDirection(form.details);
    
    return h('div', { className: 'space-y-5 animate-in' },
        // Name Field
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.building, size: 16, className: 'text-blue-500' }),
                'اسم الشركة / المشروع'
            ),
            h('input', { 
                type: 'text', 
                value: form.name, 
                onChange: e => setForm(p => ({ ...p, name: e.target.value })), 
                placeholder: 'أدخل اسم الشركة أو المشروع...', 
                className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all', 
                dir: nameDir 
            })
        ),
        
        // Link Field
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.link, size: 16, className: 'text-blue-500' }),
                'الرابط (اختياري)'
            ),
            h('input', { 
                type: 'url', 
                value: form.link, 
                onChange: e => setForm(p => ({ ...p, link: e.target.value })), 
                placeholder: 'https://example.com', 
                className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-mono text-sm', 
                dir: 'ltr' 
            })
        ),
        
        // Details Field
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.fileText, size: 16, className: 'text-blue-500' }),
                'تفاصيل المشكلة'
            ),
            h('textarea', { 
                value: form.details, 
                onChange: e => setForm(p => ({ ...p, details: e.target.value })), 
                placeholder: 'اشرح المشكلة بالتفصيل...', 
                rows: 6, 
                className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none scrollbar', 
                dir: detailsDir 
            })
        ),
        
        // Priority & Date Row
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            // Priority Selection
            h('div', null,
                h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                    h(Icon, { name: ICON_NAMES.zap, size: 16, className: 'text-blue-500' }),
                    'الأولوية'
                ),
                h('div', { className: 'flex gap-2' },
                    CONFIG.PRIORITIES.map(p => 
                        h('button', { 
                            key: p.value, 
                            type: 'button', 
                            onClick: () => setForm(prev => ({ ...prev, priority: p.value })), 
                            className: `flex-1 px-3 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                                form.priority === p.value 
                                    ? `${p.bgClass} ${p.borderClass} shadow-md` 
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }` 
                        },
                            h(Icon, { name: p.icon, size: 16 }),
                            p.label
                        )
                    )
                )
            ),
            // Date
            h('div', null,
                h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                    h(Icon, { name: ICON_NAMES.calendar, size: 16, className: 'text-blue-500' }),
                    'التاريخ'
                ),
                h('input', { 
                    type: 'date', 
                    value: form.date, 
                    onChange: e => setForm(p => ({ ...p, date: e.target.value })), 
                    className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all' 
                })
            )
        ),
        
        // Tags
        CONFIG.TAGS.length > 0 && h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.tag, size: 16, className: 'text-blue-500' }),
                'التصنيف'
            ),
            h('div', { className: 'flex gap-2 flex-wrap' },
                CONFIG.TAGS.map(tag => 
                    h('button', { 
                        key: tag.id, 
                        type: 'button', 
                        onClick: () => onToggleTag(tag.id), 
                        className: `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            form.tags.includes(tag.id) 
                                ? `${tag.color} text-white shadow-lg scale-105` 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }` 
                    }, tag.name)
                )
            )
        ),
        
        // File Upload
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.paperclip, size: 16, className: 'text-blue-500' }),
                'المرفقات'
            ),
            h('div', { 
                className: 'border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer' 
            },
                h('input', { 
                    type: 'file', 
                    multiple: true, 
                    onChange: onFileUpload, 
                    disabled: uploading, 
                    className: 'hidden', 
                    id: isModal ? 'files-modal' : 'files-inline' 
                }),
                h('label', { htmlFor: isModal ? 'files-modal' : 'files-inline', className: 'cursor-pointer flex flex-col items-center' },
                    h('div', { className: 'w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3' },
                        h(Icon, { 
                            name: uploading ? ICON_NAMES.loader : ICON_NAMES.folderOpen, 
                            size: 26, 
                            className: uploading ? 'text-blue-500 animate-spin' : 'text-blue-500' 
                        })
                    ),
                    h('p', { className: 'text-gray-700 font-semibold' }, uploading ? 'جاري الرفع...' : 'اختر الملفات'),
                    h('p', { className: 'text-gray-400 text-sm mt-1' }, 'أو اسحب الملفات هنا')
                )
            ),
            // Uploaded files preview
            form.attachments.length > 0 && h('div', { className: 'grid grid-cols-4 md:grid-cols-6 gap-3 mt-4' },
                form.attachments.map((a, i) => 
                    h('div', { key: i, className: 'relative group' },
                        isImage(a.name)
                            ? h('img', { 
                                src: a.url, 
                                className: 'w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all', 
                                onClick: () => setLightbox(a.url) 
                            })
                            : h('div', { 
                                className: 'w-full h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-all', 
                                onClick: () => window.open(a.url, '_blank') 
                            },
                                h(Icon, { name: ICON_NAMES.file, size: 24, className: 'text-gray-400' }),
                                h('span', { className: 'text-xs text-gray-500 truncate w-full text-center px-1 mt-1' }, truncateText(a.name, 8))
                            ),
                        h('button', { 
                            onClick: () => onRemoveAttachment(i), 
                            className: 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg' 
                        },
                            h(Icon, { name: ICON_NAMES.x, size: 14 })
                        )
                    )
                )
            )
        ),
        
        // Action Buttons
        h('div', { className: 'flex gap-3 pt-4' },
            h('button', { 
                onClick: onSave, 
                disabled: saving || uploading, 
                className: 'flex-1 btn-primary text-white px-6 py-3.5 rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl' 
            },
                h(Icon, { name: saving ? ICON_NAMES.loader : (isEdit ? ICON_NAMES.save : ICON_NAMES.plus), size: 18, className: saving ? 'animate-spin' : '' }),
                saving ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'رفع التذكرة')
            ),
            h('button', { 
                onClick: onCancel, 
                disabled: saving, 
                className: 'flex-1 bg-gray-100 text-gray-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2' 
            },
                h(Icon, { name: ICON_NAMES.x, size: 18 }),
                'إلغاء'
            )
        )
    );
};

// =============================================
// Ticket Card Component
// =============================================
export const TicketCard = ({
    ticket, isEditing, editRef, onView, onEdit, onCancelEdit, onDelete, setLightbox,
    form, setForm, onSave, saving, uploading, onFileUpload, onRemoveAttachment, onToggleTag
}) => {
    const nameDir = detectDirection(ticket.name);
    const detailsDir = detectDirection(ticket.details);
    const statusInfo = getStatusInfo(ticket.status);
    
    return h('div', { ref: isEditing ? editRef : null, className: 'glass rounded-2xl shadow-lg border border-gray-100 overflow-hidden card-hover' },
        // Header
        h('div', { className: 'bg-gradient-to-r from-slate-800 to-slate-900 p-4 flex justify-between items-center' },
            h('div', { className: 'flex items-center gap-3' },
                h('div', { 
                    className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-xl font-mono text-xs font-bold shadow-lg cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all',
                    onClick: onView,
                    title: ticket.ticketId || `#${ticket.ticketNumber}`
                }, ticket.ticketId || `#${ticket.ticketNumber}`),
                ticket.tags?.length > 0 && h('div', { className: 'flex gap-1' },
                    ticket.tags.map(tagId => {
                        const tag = getTagById(tagId);
                        return tag && h('span', { key: tagId, className: `${tag.color} text-white text-xs px-2.5 py-1 rounded-full font-semibold` }, tag.name);
                    })
                )
            ),
            h('div', { className: 'flex gap-1' },
                h('button', { onClick: onView, className: 'p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all', title: 'معاينة' },
                    h(Icon, { name: ICON_NAMES.eye, size: 18 })
                ),
                h('button', { onClick: isEditing ? onCancelEdit : onEdit, className: `p-2 rounded-lg transition-all ${isEditing ? 'bg-amber-500 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'}`, title: isEditing ? 'إلغاء' : 'تعديل' },
                    h(Icon, { name: isEditing ? ICON_NAMES.x : ICON_NAMES.edit, size: 18 })
                ),
                h('button', { onClick: onDelete, className: 'p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all', title: 'حذف' },
                    h(Icon, { name: ICON_NAMES.trash, size: 18 })
                )
            )
        ),
        
        // Body
        h('div', { className: 'p-5' },
            isEditing
                ? h(TicketForm, { form, setForm, onSave, onCancel: onCancelEdit, saving, uploading, onFileUpload, onRemoveAttachment, onToggleTag, setLightbox, isEdit: true, isModal: false })
                : h('div', { className: 'space-y-4' },
                    // Name
                    h('div', null,
                        h('label', { className: 'flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide' },
                            h(Icon, { name: ICON_NAMES.building, size: 12 }), 'الشركة'
                        ),
                        h('h3', { className: 'font-bold text-xl text-gray-900 mt-1', dir: nameDir }, ticket.name || 'بدون عنوان')
                    ),
                    // Link
                    ticket.link && h('div', { className: 'pt-3 border-t border-gray-100' },
                        h('label', { className: 'flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide' },
                            h(Icon, { name: ICON_NAMES.link, size: 12 }), 'الرابط'
                        ),
                        h('a', { href: ticket.link, target: '_blank', rel: 'noopener', className: 'text-blue-600 text-sm hover:underline block truncate mt-1', dir: 'ltr' }, ticket.link)
                    ),
                    // Details
                    h('div', { className: 'pt-3 border-t border-gray-100' },
                        h('label', { className: 'flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide' },
                            h(Icon, { name: ICON_NAMES.fileText, size: 12 }), 'التفاصيل'
                        ),
                        h('div', { className: 'bg-gray-50 rounded-xl p-4 mt-2 border border-gray-200' },
                            h('p', { className: 'text-sm text-gray-700 leading-relaxed whitespace-pre-wrap scrollbar', style: { maxHeight: '200px', overflowY: 'auto' }, dir: detailsDir }, ticket.details || 'لا توجد تفاصيل')
                        )
                    ),
                    // Attachments
                    ticket.attachments?.length > 0 && h('div', { className: 'pt-3 border-t border-gray-100' },
                        h('label', { className: 'flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide' },
                            h(Icon, { name: ICON_NAMES.paperclip, size: 12 }), `المرفقات (${ticket.attachments.length})`
                        ),
                        h('div', { className: 'grid grid-cols-4 gap-2 mt-2' },
                            ticket.attachments.slice(0, 8).map((a, i) =>
                                h('div', { key: i, className: 'cursor-pointer', onClick: () => isImage(a.name) ? setLightbox(a.url) : window.open(a.url, '_blank') },
                                    isImage(a.name)
                                        ? h('img', { src: a.url, className: 'w-full h-16 object-cover rounded-lg hover:opacity-80 transition-all border border-gray-200' })
                                        : h('div', { className: 'w-full h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center hover:bg-gray-200 transition-all' },
                                            h(Icon, { name: ICON_NAMES.file, size: 18, className: 'text-gray-400' }),
                                            h('span', { className: 'text-xs text-gray-500 truncate w-full text-center' }, truncateText(a.name, 6))
                                        )
                                )
                            ),
                            ticket.attachments.length > 8 && h('div', { onClick: onView, className: 'w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 font-bold text-gray-600' }, `+${ticket.attachments.length - 8}`)
                        )
                    ),
                    // Footer
                    h('div', { className: 'pt-3 border-t border-gray-100 flex justify-between items-center' },
                        h('span', { className: `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${statusInfo.bgClass}` },
                            h(Icon, { name: statusInfo.icon, size: 14 }),
                            statusInfo.labelFull
                        ),
                        h('span', { className: 'flex items-center gap-1.5 text-sm text-gray-500' },
                            h(Icon, { name: ICON_NAMES.calendar, size: 14 }),
                            ticket.date || ''
                        )
                    )
                )
        )
    );
};

// =============================================
// Statistics Component
// =============================================
export const Statistics = ({ stats }) => {
    return h('div', { className: 'grid grid-cols-2 md:grid-cols-5 gap-3' },
        h('div', { className: 'bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm' },
            h('div', { className: 'flex items-center gap-2 text-slate-500 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.inbox, size: 16 }), 'الإجمالي'
            ),
            h('p', { className: 'text-3xl font-bold text-slate-800' }, stats.total)
        ),
        h('div', { className: 'bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 shadow-sm' },
            h('div', { className: 'flex items-center gap-2 text-slate-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.inbox, size: 16 }), 'جديد'
            ),
            h('p', { className: 'text-3xl font-bold text-slate-700' }, stats.new || 0)
        ),
        h('div', { className: 'bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm' },
            h('div', { className: 'flex items-center gap-2 text-blue-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.refresh, size: 16 }), 'قيد المعالجة'
            ),
            h('p', { className: 'text-3xl font-bold text-blue-600' }, stats.inProgress || 0)
        ),
        h('div', { className: 'bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200 shadow-sm' },
            h('div', { className: 'flex items-center gap-2 text-emerald-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.checkCircle, size: 16 }), 'معتمد'
            ),
            h('p', { className: 'text-3xl font-bold text-emerald-600' }, stats.approved || 0)
        ),
        h('div', { className: 'bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 shadow-sm' },
            h('div', { className: 'flex items-center gap-2 text-red-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.alertCircle, size: 16 }), 'عاجل'
            ),
            h('p', { className: 'text-3xl font-bold text-red-600' }, stats.urgent || 0)
        )
    );
};

// =============================================
// Search & Filter Component
// =============================================
export const SearchFilter = ({ search, setSearch, filterStatus, setFilterStatus, filterTag, setFilterTag }) => {
    return h('div', { className: 'glass rounded-xl p-4 mb-6 shadow' },
        h('div', { className: 'flex flex-col md:flex-row gap-3' },
            h('div', { className: 'flex-1 relative' },
                h('span', { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' },
                    h(Icon, { name: ICON_NAMES.search, size: 18 })
                ),
                h('input', { type: 'text', value: search, onChange: e => setSearch(e.target.value), placeholder: 'بحث...', className: 'w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none' })
            ),
            h('select', { value: filterStatus, onChange: e => setFilterStatus(e.target.value), className: 'px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none bg-white' },
                h('option', { value: 'all' }, 'كل الحالات'),
                CONFIG.STATUSES.map(s => h('option', { key: s.value, value: s.value }, s.label))
            ),
            h('select', { value: filterTag, onChange: e => setFilterTag(e.target.value), className: 'px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none bg-white' },
                h('option', { value: 'all' }, 'كل التصنيفات'),
                CONFIG.TAGS.map(tag => h('option', { key: tag.id, value: tag.id }, tag.name))
            )
        )
    );
};

// =============================================
// Modal Components
// =============================================
export const Modal = ({ show, onClose, title, children, size = 'md' }) => {
    if (!show) return null;
    const sizeClasses = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-4xl', full: 'max-w-7xl' };
    
    return h('div', { className: 'fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4', onClick: onClose },
        h('div', { className: `bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto scrollbar animate-in`, onClick: e => e.stopPropagation() },
            h('div', { className: 'sticky top-0 bg-white p-5 border-b border-gray-100 z-10 flex justify-between items-center' },
                h('h3', { className: 'text-xl font-bold' }, title),
                h('button', { onClick: onClose, className: 'p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all' },
                    h(Icon, { name: ICON_NAMES.x, size: 20 })
                )
            ),
            h('div', { className: 'p-5' }, children)
        )
    );
};

export const Lightbox = ({ image, onClose }) => {
    if (!image) return null;
    return h('div', { className: 'lightbox fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4', onClick: onClose },
        h('button', { onClick: onClose, className: 'absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all' },
            h(Icon, { name: ICON_NAMES.x, size: 28 })
        ),
        h('img', { src: image, className: 'max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl', onClick: e => e.stopPropagation() })
    );
};

// =============================================
// Loading & Empty State
// =============================================
export const Loading = () => h('div', { className: 'text-center py-20' },
    h('div', { className: 'inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4' },
        h(Icon, { name: ICON_NAMES.loader, size: 32, className: 'text-blue-500 animate-spin' })
    ),
    h('p', { className: 'text-gray-500' }, 'جاري التحميل...')
);

export const EmptyState = () => h('div', { className: 'text-center py-20' },
    h('div', { className: 'inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4' },
        h(Icon, { name: ICON_NAMES.inbox, size: 40, className: 'text-gray-400' })
    ),
    h('p', { className: 'text-xl text-gray-500 font-medium' }, 'لا توجد تذاكر'),
    h('p', { className: 'text-gray-400 mt-1' }, 'أضف تذكرة جديدة للبدء')
);

// =============================================
// Table View Component
// =============================================
export const TicketTableView = ({
    tickets,
    selectedIds,
    onSelectOne,
    onSelectAll,
    onView,
    onEdit,
    onDelete,
    onBulkDelete,
    onBulkStatusChange,
    sortField,
    sortDirection,
    onSort,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    userRole,
    canChangeStatus = true,
    canDelete = true
}) => {
    const totalPages = Math.ceil(tickets.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTickets = tickets.slice(startIndex, endIndex);
    const allSelected = paginatedTickets.length > 0 && paginatedTickets.every(t => selectedIds.includes(t.id));
    const someSelected = selectedIds.length > 0 && !allSelected;
    
    // Sort header component
    const SortHeader = ({ field, label }) => h('th', {
        className: 'px-4 py-3 text-right font-semibold text-gray-600 cursor-pointer hover:bg-gray-100 transition-all select-none',
        onClick: () => onSort(field)
    },
        h('div', { className: 'flex items-center gap-1' },
            label,
            h(Icon, { 
                name: sortField === field 
                    ? (sortDirection === 'asc' ? ICON_NAMES.chevronUp : ICON_NAMES.chevronDown) 
                    : ICON_NAMES.arrowUpDown, 
                size: 14, 
                className: sortField === field ? 'text-blue-500' : 'text-gray-400' 
            })
        )
    );
    
    return h('div', { className: 'glass rounded-2xl shadow-lg overflow-hidden' },
        // Bulk Actions Bar (only show if user can change status or delete)
        selectedIds.length > 0 && (canChangeStatus || canDelete) && h('div', { className: 'bg-blue-50 border-b border-blue-100 px-4 py-3 flex items-center justify-between' },
            h('span', { className: 'text-blue-700 font-medium' }, `تم تحديد ${selectedIds.length} تذكرة`),
            h('div', { className: 'flex gap-2' },
                // Status change dropdown - only for processors/reviewers/admins
                canChangeStatus && h('select', {
                    onChange: e => e.target.value && onBulkStatusChange(e.target.value),
                    className: 'px-3 py-1.5 rounded-lg border border-blue-200 bg-white text-sm focus:outline-none focus:border-blue-400',
                    defaultValue: ''
                },
                    h('option', { value: '', disabled: true }, 'تغيير الحالة'),
                    CONFIG.STATUSES.map(s => h('option', { key: s.value, value: s.value }, s.label))
                ),
                // Delete button - only for admins
                canDelete && h('button', {
                    onClick: onBulkDelete,
                    className: 'px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all flex items-center gap-1'
                }, h(Icon, { name: ICON_NAMES.trash, size: 14 }), 'حذف المحدد')
            )
        ),
        
        // Table
        h('div', { className: 'overflow-x-auto' },
            h('table', { className: 'w-full' },
                // Header
                h('thead', { className: 'bg-gray-50 border-b border-gray-200' },
                    h('tr', null,
                        // Checkbox column - only show if user has bulk actions
                        (canChangeStatus || canDelete) && h('th', { className: 'px-4 py-3 w-12' },
                            h('button', {
                                onClick: () => onSelectAll(paginatedTickets),
                                className: 'p-1 rounded hover:bg-gray-200 transition-all'
                            },
                                h(Icon, { 
                                    name: allSelected ? ICON_NAMES.checkSquare : (someSelected ? ICON_NAMES.minusSquare : ICON_NAMES.square), 
                                    size: 18, 
                                    className: allSelected || someSelected ? 'text-blue-500' : 'text-gray-400' 
                                })
                            )
                        ),
                        h(SortHeader, { field: 'ticketId', label: 'رقم التذكرة' }),
                        h(SortHeader, { field: 'name', label: 'الشركة' }),
                        h(SortHeader, { field: 'status', label: 'الحالة' }),
                        h(SortHeader, { field: 'date', label: 'التاريخ' }),
                        h('th', { className: 'px-4 py-3 text-right font-semibold text-gray-600' }, 'التصنيف'),
                        h('th', { className: 'px-4 py-3 text-center font-semibold text-gray-600 w-32' }, 'الإجراءات')
                    )
                ),
                // Body
                h('tbody', { className: 'divide-y divide-gray-100' },
                    paginatedTickets.map(ticket => {
                        const statusInfo = getStatusInfo(ticket.status);
                        const isSelected = selectedIds.includes(ticket.id);
                        return h('tr', { 
                            key: ticket.id, 
                            className: `hover:bg-gray-50 transition-all ${isSelected ? 'bg-blue-50' : ''}`
                        },
                            // Checkbox - only show if user has bulk actions
                            (canChangeStatus || canDelete) && h('td', { className: 'px-4 py-3' },
                                h('button', {
                                    onClick: () => onSelectOne(ticket.id),
                                    className: 'p-1 rounded hover:bg-gray-200 transition-all'
                                },
                                    h(Icon, { 
                                        name: isSelected ? ICON_NAMES.checkSquare : ICON_NAMES.square, 
                                        size: 18, 
                                        className: isSelected ? 'text-blue-500' : 'text-gray-400' 
                                    })
                                )
                            ),
                            // Ticket ID
                            h('td', { className: 'px-4 py-3' },
                                h('div', { className: 'flex flex-col' },
                                    h('span', { 
                                        className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2.5 py-1 rounded-lg font-mono text-xs font-bold shadow-sm cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all',
                                        onClick: () => onView(ticket),
                                        title: ticket.ticketId || `#${ticket.ticketNumber}`
                                    }, ticket.ticketId || `#${ticket.ticketNumber}`)
                                )
                            ),
                            // Name
                            h('td', { className: 'px-4 py-3' },
                                h('div', { className: 'font-medium text-gray-900', dir: detectDirection(ticket.name) }, truncateText(ticket.name, 40)),
                                ticket.link && h('a', { 
                                    href: ticket.link, 
                                    target: '_blank', 
                                    rel: 'noopener',
                                    className: 'text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5',
                                    onClick: e => e.stopPropagation()
                                }, 
                                    h(Icon, { name: ICON_NAMES.externalLink, size: 10 }),
                                    truncateText(ticket.link, 30)
                                )
                            ),
                            // Status
                            h('td', { className: 'px-4 py-3' },
                                h('span', { className: `inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusInfo.bgClass}` },
                                    h(Icon, { name: statusInfo.icon, size: 12 }),
                                    statusInfo.label
                                )
                            ),
                            // Date
                            h('td', { className: 'px-4 py-3 text-sm text-gray-600' }, ticket.date || '-'),
                            // Tags
                            h('td', { className: 'px-4 py-3' },
                                ticket.tags?.length > 0 
                                    ? h('div', { className: 'flex gap-1 flex-wrap' },
                                        ticket.tags.map(tagId => {
                                            const tag = getTagById(tagId);
                                            return tag && h('span', { key: tagId, className: `${tag.color} text-white text-xs px-2 py-0.5 rounded-full` }, tag.name);
                                        })
                                    )
                                    : h('span', { className: 'text-gray-400 text-sm' }, '-')
                            ),
                            // Actions
                            h('td', { className: 'px-4 py-3' },
                                h('div', { className: 'flex items-center justify-center gap-1' },
                                    h('button', { onClick: () => onView(ticket), className: 'p-1.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all', title: 'معاينة' },
                                        h(Icon, { name: ICON_NAMES.eye, size: 16 })
                                    ),
                                    h('button', { onClick: () => onEdit(ticket), className: 'p-1.5 text-gray-500 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all', title: 'تعديل' },
                                        h(Icon, { name: ICON_NAMES.edit, size: 16 })
                                    ),
                                    canDelete && h('button', { onClick: () => onDelete(ticket.id), className: 'p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all', title: 'حذف' },
                                        h(Icon, { name: ICON_NAMES.trash, size: 16 })
                                    )
                                )
                            )
                        );
                    })
                )
            )
        ),
        
        // Pagination
        h('div', { className: 'bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-between' },
            // Page size selector
            h('div', { className: 'flex items-center gap-2' },
                h('span', { className: 'text-sm text-gray-600' }, 'عرض'),
                h('select', {
                    value: pageSize,
                    onChange: e => onPageSizeChange(Number(e.target.value)),
                    className: 'px-2 py-1 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400'
                },
                    [10, 25, 50, 100].map(size => h('option', { key: size, value: size }, size))
                ),
                h('span', { className: 'text-sm text-gray-600' }, `من ${tickets.length} تذكرة`)
            ),
            
            // Page info
            h('div', { className: 'text-sm text-gray-600' },
                `صفحة ${currentPage} من ${totalPages || 1}`
            ),
            
            // Navigation buttons
            h('div', { className: 'flex items-center gap-1' },
                h('button', {
                    onClick: () => onPageChange(1),
                    disabled: currentPage === 1,
                    className: 'p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                }, h(Icon, { name: ICON_NAMES.chevronsRight, size: 16 })),
                h('button', {
                    onClick: () => onPageChange(currentPage - 1),
                    disabled: currentPage === 1,
                    className: 'p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                }, h(Icon, { name: ICON_NAMES.chevronRight, size: 16 })),
                h('button', {
                    onClick: () => onPageChange(currentPage + 1),
                    disabled: currentPage >= totalPages,
                    className: 'p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                }, h(Icon, { name: ICON_NAMES.chevronLeft, size: 16 })),
                h('button', {
                    onClick: () => onPageChange(totalPages),
                    disabled: currentPage >= totalPages,
                    className: 'p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                }, h(Icon, { name: ICON_NAMES.chevronsLeft, size: 16 }))
            )
        )
    );
};

// =============================================
// View Mode Toggle Component
// =============================================
export const ViewModeToggle = ({ viewMode, onViewModeChange }) => {
    return h('div', { className: 'flex items-center gap-1 bg-gray-100 p-1 rounded-xl' },
        h('button', {
            onClick: () => onViewModeChange('cards'),
            className: `p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-white shadow text-blue-500' : 'text-gray-500 hover:text-gray-700'}`
        }, h(Icon, { name: ICON_NAMES.layoutGrid, size: 18 })),
        h('button', {
            onClick: () => onViewModeChange('table'),
            className: `p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow text-blue-500' : 'text-gray-500 hover:text-gray-700'}`
        }, h(Icon, { name: ICON_NAMES.table, size: 18 }))
    );
};
