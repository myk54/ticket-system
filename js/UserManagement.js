// =============================================
// User Management Component (Admin Only)
// =============================================

import { Icon, ICON_NAMES } from './icons.js';
import { ROLES, ROLE_NAMES, ROLE_COLORS } from './permissions.js';

const { createElement: h, useState } = React;

// =============================================
// User List Component
// =============================================
export const UserList = ({ users, currentUserId, onEdit, onToggleStatus, onDelete }) => {
    return h('div', { className: 'space-y-3' },
        users.map(user => 
            h('div', { 
                key: user.user_id, 
                className: `glass rounded-xl p-4 border ${user.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50/50'}` 
            },
                h('div', { className: 'flex items-center justify-between' },
                    h('div', { className: 'flex items-center gap-3' },
                        // Avatar
                        h('div', { 
                            className: `w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${ROLE_COLORS[user.roles?.name] || 'bg-gray-500'}` 
                        }, 
                            (user.full_name || user.email || '?').charAt(0).toUpperCase()
                        ),
                        // Info
                        h('div', null,
                            h('div', { className: 'flex items-center gap-2' },
                                h('span', { className: 'font-bold text-gray-900' }, user.full_name || 'بدون اسم'),
                                !user.is_active && h('span', { className: 'text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full' }, 'معطّل'),
                                user.user_id === currentUserId && h('span', { className: 'text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full' }, 'أنت')
                            ),
                            h('p', { className: 'text-sm text-gray-500', dir: 'ltr' }, user.email),
                            h('span', { 
                                className: `inline-block mt-1 text-xs px-2 py-0.5 rounded-full text-white ${ROLE_COLORS[user.roles?.name] || 'bg-gray-500'}` 
                            }, ROLE_NAMES[user.roles?.name] || user.roles?.name)
                        )
                    ),
                    // Actions
                    user.user_id !== currentUserId && h('div', { className: 'flex items-center gap-1' },
                        h('button', {
                            onClick: () => onEdit(user),
                            className: 'p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all',
                            title: 'تعديل'
                        }, h(Icon, { name: ICON_NAMES.edit, size: 18 })),
                        h('button', {
                            onClick: () => onToggleStatus(user),
                            className: `p-2 rounded-lg transition-all ${user.is_active ? 'text-gray-500 hover:text-amber-500 hover:bg-amber-50' : 'text-gray-500 hover:text-green-500 hover:bg-green-50'}`,
                            title: user.is_active ? 'تعطيل' : 'تفعيل'
                        }, h(Icon, { name: user.is_active ? ICON_NAMES.userX : ICON_NAMES.check, size: 18 })),
                        h('button', {
                            onClick: () => onDelete(user),
                            className: 'p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all',
                            title: 'حذف'
                        }, h(Icon, { name: ICON_NAMES.trash, size: 18 }))
                    )
                )
            )
        )
    );
};

// =============================================
// Add/Edit User Form
// =============================================
export const UserForm = ({ user, roles, onSave, onCancel, saving }) => {
    const [form, setForm] = useState({
        email: user?.email || '',
        full_name: user?.full_name || '',
        role_id: user?.role_id || '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const isEdit = !!user;

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!form.email.trim()) {
            return setError('البريد الإلكتروني مطلوب');
        }
        if (!form.full_name.trim()) {
            return setError('الاسم الكامل مطلوب');
        }
        if (!form.role_id) {
            return setError('الدور مطلوب');
        }
        if (!isEdit && !form.password) {
            return setError('كلمة المرور مطلوبة');
        }
        if (form.password && form.password.length < 6) {
            return setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
        }
        if (form.password && form.password !== form.confirmPassword) {
            return setError('كلمات المرور غير متطابقة');
        }

        onSave(form);
    };

    return h('form', { onSubmit: handleSubmit, className: 'space-y-4' },
        // Full Name
        h('div', null,
            h('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'الاسم الكامل'),
            h('input', {
                type: 'text',
                value: form.full_name,
                onChange: e => setForm(p => ({ ...p, full_name: e.target.value })),
                placeholder: 'أدخل الاسم الكامل',
                className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none'
            })
        ),

        // Email
        h('div', null,
            h('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'البريد الإلكتروني'),
            h('input', {
                type: 'email',
                value: form.email,
                onChange: e => setForm(p => ({ ...p, email: e.target.value })),
                placeholder: 'example@company.com',
                className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none',
                dir: 'ltr',
                disabled: isEdit
            })
        ),

        // Role
        h('div', null,
            h('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'الدور'),
            h('select', {
                value: form.role_id,
                onChange: e => setForm(p => ({ ...p, role_id: e.target.value })),
                className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none bg-white'
            },
                h('option', { value: '' }, 'اختر الدور...'),
                roles.map(role => 
                    h('option', { key: role.id, value: role.id }, ROLE_NAMES[role.name] || role.name)
                )
            )
        ),

        // Password (only for new users or optional for edit)
        h('div', { className: 'grid grid-cols-2 gap-4' },
            h('div', null,
                h('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 
                    isEdit ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور'
                ),
                h('input', {
                    type: 'password',
                    value: form.password,
                    onChange: e => setForm(p => ({ ...p, password: e.target.value })),
                    placeholder: '••••••••',
                    className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none',
                    dir: 'ltr'
                })
            ),
            h('div', null,
                h('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'تأكيد كلمة المرور'),
                h('input', {
                    type: 'password',
                    value: form.confirmPassword,
                    onChange: e => setForm(p => ({ ...p, confirmPassword: e.target.value })),
                    placeholder: '••••••••',
                    className: 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 outline-none',
                    dir: 'ltr'
                })
            )
        ),

        // Error
        error && h('div', { className: 'bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2' },
            h(Icon, { name: ICON_NAMES.alertCircle, size: 18, className: 'text-red-500' }),
            h('p', { className: 'text-red-600 text-sm' }, error)
        ),

        // Buttons
        h('div', { className: 'flex gap-3 pt-4' },
            h('button', {
                type: 'submit',
                disabled: saving,
                className: 'flex-1 btn-primary text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2'
            },
                saving ? h(Icon, { name: ICON_NAMES.loader, size: 18, className: 'animate-spin' }) : h(Icon, { name: ICON_NAMES.save, size: 18 }),
                saving ? 'جاري الحفظ...' : (isEdit ? 'حفظ التعديلات' : 'إضافة المستخدم')
            ),
            h('button', {
                type: 'button',
                onClick: onCancel,
                disabled: saving,
                className: 'flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 flex items-center justify-center gap-2'
            },
                h(Icon, { name: ICON_NAMES.x, size: 18 }),
                'إلغاء'
            )
        )
    );
};

// =============================================
// User Management Panel
// =============================================
export const UserManagementPanel = ({ users, roles, currentUserId, onAddUser, onEditUser, onToggleStatus, onDeleteUser, loading }) => {
    const [showForm, setShowForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleAdd = () => {
        setEditingUser(null);
        setShowForm(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowForm(true);
    };

    const handleSave = async (formData) => {
        setSaving(true);
        try {
            if (editingUser) {
                await onEditUser(editingUser.user_id, formData);
            } else {
                await onAddUser(formData);
            }
            setShowForm(false);
            setEditingUser(null);
        } catch (e) {
            alert('خطأ: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (user) => {
        if (!confirm(user.is_active ? 'تعطيل هذا المستخدم؟' : 'تفعيل هذا المستخدم؟')) return;
        await onToggleStatus(user.user_id, !user.is_active);
    };

    const handleDelete = async (user) => {
        if (!confirm(`حذف المستخدم "${user.full_name || user.email}"؟\nهذا الإجراء لا يمكن التراجع عنه.`)) return;
        await onDeleteUser(user.user_id);
    };

    if (loading) {
        return h('div', { className: 'text-center py-10' },
            h(Icon, { name: ICON_NAMES.loader, size: 32, className: 'text-blue-500 animate-spin mx-auto' }),
            h('p', { className: 'text-gray-500 mt-2' }, 'جاري تحميل المستخدمين...')
        );
    }

    return h('div', { className: 'space-y-4' },
        // Header
        h('div', { className: 'flex items-center justify-between' },
            h('div', null,
                h('h3', { className: 'text-lg font-bold text-gray-900' }, 'إدارة المستخدمين'),
                h('p', { className: 'text-sm text-gray-500' }, `${users.length} مستخدم`)
            ),
            !showForm && h('button', {
                onClick: handleAdd,
                className: 'btn-primary text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2'
            },
                h(Icon, { name: ICON_NAMES.userPlus, size: 18 }),
                'إضافة مستخدم'
            )
        ),

        // Form or List
        showForm
            ? h(UserForm, {
                user: editingUser,
                roles,
                onSave: handleSave,
                onCancel: () => { setShowForm(false); setEditingUser(null); },
                saving
            })
            : h(UserList, {
                users,
                currentUserId,
                onEdit: handleEdit,
                onToggleStatus: handleToggleStatus,
                onDelete: handleDelete
            })
    );
};
