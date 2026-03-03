// =============================================
// Login Form Component
// =============================================

import { Icon, ICON_NAMES } from './icons.js';

const { createElement: h, useState } = React;

export const LoginForm = ({ onLogin, error, loading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim() && password.trim()) {
            onLogin(email, password);
        }
    };

    return h('div', { className: 'min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900' },
        h('div', { className: 'w-full max-w-md' },
            // Logo & Title
            h('div', { className: 'text-center mb-8' },
                h('div', { className: 'inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl mb-4' },
                    h(Icon, { name: ICON_NAMES.ticket, size: 40, className: 'text-white' })
                ),
                h('h1', { className: 'text-3xl font-bold text-white' }, 'نظام إدارة التذاكر'),
                h('p', { className: 'text-blue-200 mt-2' }, 'سجّل دخولك للمتابعة')
            ),

            // Login Card
            h('div', { className: 'bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20' },
                h('form', { onSubmit: handleSubmit, className: 'space-y-5' },
                    // Email
                    h('div', null,
                        h('label', { className: 'block text-sm font-medium text-blue-100 mb-2' }, 'البريد الإلكتروني'),
                        h('div', { className: 'relative' },
                            h('span', { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' },
                                h(Icon, { name: 'user', size: 18 })
                            ),
                            h('input', {
                                type: 'email',
                                value: email,
                                onChange: e => setEmail(e.target.value),
                                placeholder: 'example@company.com',
                                className: 'w-full pr-10 pl-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all',
                                dir: 'ltr',
                                required: true
                            })
                        )
                    ),

                    // Password
                    h('div', null,
                        h('label', { className: 'block text-sm font-medium text-blue-100 mb-2' }, 'كلمة المرور'),
                        h('div', { className: 'relative' },
                            h('span', { className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400' },
                                h(Icon, { name: 'lock', size: 18 })
                            ),
                            h('input', {
                                type: showPassword ? 'text' : 'password',
                                value: password,
                                onChange: e => setPassword(e.target.value),
                                placeholder: '••••••••',
                                className: 'w-full pr-10 pl-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all',
                                dir: 'ltr',
                                required: true
                            }),
                            h('button', {
                                type: 'button',
                                onClick: () => setShowPassword(!showPassword),
                                className: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                            },
                                h(Icon, { name: showPassword ? 'eye-off' : 'eye', size: 18 })
                            )
                        )
                    ),

                    // Error Message
                    error && h('div', { className: 'bg-red-500/20 border border-red-500/50 rounded-xl p-3 flex items-center gap-2' },
                        h(Icon, { name: 'alert-circle', size: 18, className: 'text-red-400' }),
                        h('p', { className: 'text-red-200 text-sm' }, error)
                    ),

                    // Submit Button
                    h('button', {
                        type: 'submit',
                        disabled: loading,
                        className: 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2'
                    },
                        loading 
                            ? h(Icon, { name: ICON_NAMES.loader, size: 20, className: 'animate-spin' })
                            : h(Icon, { name: 'log-in', size: 20 }),
                        loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'
                    )
                )
            ),

            // Footer
            h('p', { className: 'text-center text-blue-200/50 text-sm mt-6' },
                '© 2025 نظام إدارة التذاكر'
            )
        )
    );
};
