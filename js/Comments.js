// =============================================
// Comments Component
// =============================================

import { Icon, ICON_NAMES } from './icons.js';
import { ROLE_COLORS, ROLE_NAMES } from './permissions.js';

const { createElement: h, useState, useEffect } = React;

/**
 * Format relative time in Arabic
 */
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    
    return date.toLocaleDateString('ar-IQ');
};

/**
 * Single Comment Component
 */
const Comment = ({ comment, currentUserId, onDelete, isAdmin }) => {
    const isOwn = comment.user?.id === currentUserId;
    const canDelete = isOwn || isAdmin;
    
    return h('div', { className: `flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}` },
        // Avatar
        h('div', { 
            className: `w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${ROLE_COLORS[comment.user?.role] || 'bg-gray-500'}` 
        }, 
            (comment.user?.fullName || comment.user?.username || '?').charAt(0).toUpperCase()
        ),
        
        // Content
        h('div', { className: `flex-1 max-w-[80%] ${isOwn ? 'text-right' : ''}` },
            // Header
            h('div', { className: `flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}` },
                h('span', { className: 'font-semibold text-gray-900 text-sm' }, 
                    comment.user?.fullName || comment.user?.username || 'مستخدم'
                ),
                h('span', { className: `text-xs px-1.5 py-0.5 rounded text-white ${ROLE_COLORS[comment.user?.role] || 'bg-gray-500'}` },
                    ROLE_NAMES[comment.user?.role] || comment.user?.role
                ),
                h('span', { className: 'text-xs text-gray-400' }, formatRelativeTime(comment.createdAt))
            ),
            
            // Message bubble
            h('div', { 
                className: `relative group rounded-2xl px-4 py-2.5 ${isOwn ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}` 
            },
                h('p', { className: 'text-sm whitespace-pre-wrap break-words' }, comment.content),
                
                // Delete button
                canDelete && h('button', {
                    onClick: () => onDelete(comment.id),
                    className: `absolute -top-2 ${isOwn ? '-left-2' : '-right-2'} opacity-0 group-hover:opacity-100 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all`
                }, h(Icon, { name: ICON_NAMES.x, size: 12 }))
            )
        )
    );
};

/**
 * Comments List Component
 */
export const CommentsList = ({ 
    comments, 
    loading, 
    currentUserId, 
    isAdmin,
    onAddComment, 
    onDeleteComment,
    saving
}) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    return h('div', { className: 'flex flex-col h-full' },
        // Comments list
        h('div', { className: 'flex-1 overflow-y-auto space-y-4 mb-4 max-h-80 scrollbar' },
            loading 
                ? h('div', { className: 'text-center py-8' },
                    h(Icon, { name: ICON_NAMES.loader, size: 24, className: 'text-blue-500 animate-spin mx-auto' }),
                    h('p', { className: 'text-gray-500 text-sm mt-2' }, 'جاري تحميل التعليقات...')
                )
                : comments.length === 0
                    ? h('div', { className: 'text-center py-8' },
                        h(Icon, { name: ICON_NAMES.messageSquare, size: 32, className: 'text-gray-300 mx-auto' }),
                        h('p', { className: 'text-gray-400 text-sm mt-2' }, 'لا توجد تعليقات بعد')
                    )
                    : comments.map(comment => 
                        h(Comment, {
                            key: comment.id,
                            comment,
                            currentUserId,
                            isAdmin,
                            onDelete: onDeleteComment
                        })
                    )
        ),
        
        // New comment form
        h('form', { onSubmit: handleSubmit, className: 'flex gap-2 border-t pt-4' },
            h('input', {
                type: 'text',
                value: newComment,
                onChange: e => setNewComment(e.target.value),
                placeholder: 'اكتب تعليقاً...',
                className: 'flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none text-sm',
                disabled: saving
            }),
            h('button', {
                type: 'submit',
                disabled: !newComment.trim() || saving,
                className: 'px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2'
            },
                saving 
                    ? h(Icon, { name: ICON_NAMES.loader, size: 18, className: 'animate-spin' })
                    : h(Icon, { name: 'send', size: 18 }),
                'إرسال'
            )
        )
    );
};
