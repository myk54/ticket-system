// =============================================
// UI Components - Using Lucide Icons
// =============================================

import { CONFIG } from './config.js';
import { isImage, detectDirection, getStatusInfo, getTagById, truncateText } from './utils.js';
import { Icon, ICON_NAMES } from './icons.js';

const { createElement: h } = React;

// =============================================
// Form Component
// =============================================
export const TicketForm = ({ 
    form, setForm, onSave, onCancel, saving, uploading, 
    onFileUpload, onRemoveAttachment, onToggleTag, setLightbox,
    isEdit = false, isModal = false 
}) => {
    const nameDir = detectDirection(form.name);
    const detailsDir = detectDirection(form.details);
    
    return h('div', { className: 'space-y-4 animate-in' },
        // Name
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.building, size: 16, className: 'text-gray-400' }),
                'اسم الشركة'
            ),
            h('input', { type: 'text', value: form.name, onChange: e => setForm(p => ({ ...p, name: e.target.value })), placeholder: 'اسم الشركة أو المشروع...', className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all', dir: nameDir })
        ),
        
        // Link
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.link, size: 16, className: 'text-gray-400' }),
                'الرابط'
            ),
            h('input', { type: 'url', value: form.link, onChange: e => setForm(p => ({ ...p, link: e.target.value })), placeholder: 'https://...', className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all', dir: 'ltr' })
        ),
        
        // Details
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.fileText, size: 16, className: 'text-gray-400' }),
                'التفاصيل'
            ),
            h('textarea', { value: form.details, onChange: e => setForm(p => ({ ...p, details: e.target.value })), placeholder: 'تفاصيل التذكرة...', rows: 8, className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none scrollbar', dir: detailsDir })
        ),
        
        // Status, Date, Tags
        h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
            h('div', null,
                h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                    h(Icon, { name: ICON_NAMES.barChart, size: 16, className: 'text-gray-400' }),
                    'الحالة'
                ),
                h('select', { value: form.status, onChange: e => setForm(p => ({ ...p, status: e.target.value })), className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none bg-white' },
                    CONFIG.STATUSES.map(s => h('option', { key: s.value, value: s.value }, s.label))
                )
            ),
            h('div', null,
                h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                    h(Icon, { name: ICON_NAMES.calendar, size: 16, className: 'text-gray-400' }),
                    'التاريخ'
                ),
                h('input', { type: 'date', value: form.date, onChange: e => setForm(p => ({ ...p, date: e.target.value })), className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none' })
            ),
            h('div', null,
                h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                    h(Icon, { name: ICON_NAMES.tag, size: 16, className: 'text-gray-400' }),
                    'التصنيف'
                ),
                h('div', { className: 'flex gap-2 flex-wrap' },
                    CONFIG.TAGS.map(tag => h('button', { key: tag.id, type: 'button', onClick: () => onToggleTag(tag.id), className: `px-4 py-2 rounded-lg text-sm font-semibold transition-all ${form.tags.includes(tag.id) ? `${tag.color} text-white shadow-lg` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}` }, tag.name))
                )
            )
        ),
        
        // Files
        h('div', null,
            h('label', { className: 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2' },
                h(Icon, { name: ICON_NAMES.paperclip, size: 16, className: 'text-gray-400' }),
                'المرفقات'
            ),
            h('div', { className: 'border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-all cursor-pointer' },
                h('input', { type: 'file', multiple: true, onChange: onFileUpload, disabled: uploading, className: 'hidden', id: isModal ? 'files-modal' : 'files-inline' }),
                h('label', { htmlFor: isModal ? 'files-modal' : 'files-inline', className: 'cursor-pointer flex flex-col items-center' },
                    h('div', { className: 'w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-3' },
                        h(Icon, { name: uploading ? ICON_NAMES.loader : ICON_NAMES.folderOpen, size: 26, className: uploading ? 'text-blue-500 animate-spin' : 'text-blue-500' })
                    ),
                    h('p', { className: 'text-gray-600 font-medium' }, uploading ? 'جاري الرفع...' : 'اختر الملفات'),
                    h('p', { className: 'text-gray-400 text-sm mt-1' }, 'أو اسحب الملفات هنا')
                )
            ),
            form.attachments.length > 0 && h('div', { className: 'grid grid-cols-4 md:grid-cols-6 gap-3 mt-4' },
                form.attachments.map((a, i) => h('div', { key: i, className: 'relative group' },
                    isImage(a.name)
                        ? h('img', { src: a.url, className: 'w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80', onClick: () => setLightbox(a.url) })
                        : h('div', { className: 'w-full h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200', onClick: () => window.open(a.url, '_blank') },
                            h(Icon, { name: ICON_NAMES.file, size: 24, className: 'text-gray-400' }),
                            h('span', { className: 'text-xs text-gray-500 truncate w-full text-center px-1 mt-1' }, truncateText(a.name, 8))
                        ),
                    h('button', { onClick: () => onRemoveAttachment(i), className: 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600' },
                        h(Icon, { name: ICON_NAMES.x, size: 14 })
                    )
                ))
            )
        ),
        
        // Buttons
        h('div', { className: 'flex gap-3 pt-4' },
            h('button', { onClick: onSave, disabled: saving || uploading, className: 'flex-1 btn-primary text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2' },
                h(Icon, { name: saving ? ICON_NAMES.loader : (isEdit ? ICON_NAMES.save : ICON_NAMES.plus), size: 18, className: saving ? 'animate-spin' : '' }),
                saving ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إضافة')
            ),
            h('button', { onClick: onCancel, disabled: saving, className: 'flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2' },
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
                h('div', { className: 'bg-white text-slate-900 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg' }, ticket.ticketNumber),
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
    return h('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
        h('div', { className: 'bg-slate-50 rounded-xl p-4 border border-slate-200' },
            h('div', { className: 'flex items-center gap-2 text-slate-500 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.barChart, size: 16 }), 'الإجمالي'
            ),
            h('p', { className: 'text-3xl font-bold text-slate-900' }, stats.total)
        ),
        h('div', { className: 'bg-amber-50 rounded-xl p-4 border border-amber-200' },
            h('div', { className: 'flex items-center gap-2 text-amber-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.clock, size: 16 }), 'انتظار'
            ),
            h('p', { className: 'text-3xl font-bold text-amber-600' }, stats.pending)
        ),
        h('div', { className: 'bg-blue-50 rounded-xl p-4 border border-blue-200' },
            h('div', { className: 'flex items-center gap-2 text-blue-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.refresh, size: 16 }), 'تنفيذ'
            ),
            h('p', { className: 'text-3xl font-bold text-blue-600' }, stats.inProgress)
        ),
        h('div', { className: 'bg-emerald-50 rounded-xl p-4 border border-emerald-200' },
            h('div', { className: 'flex items-center gap-2 text-emerald-600 text-sm mb-1' },
                h(Icon, { name: ICON_NAMES.checkCircle, size: 16 }), 'مكتمل'
            ),
            h('p', { className: 'text-3xl font-bold text-emerald-600' }, stats.completed)
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
    const sizeClasses = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-4xl' };
    
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
