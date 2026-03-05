// =============================================
// Dashboard Component with Charts
// =============================================

import { Icon, ICON_NAMES } from './icons.js';
import { CONFIG } from './config.js';

const { createElement: h, useState, useEffect, useRef } = React;

/**
 * Simple Bar Chart Component
 */
const BarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return h('div', { className: 'bg-white rounded-xl p-4 shadow-sm border' },
        h('h4', { className: 'font-bold text-gray-700 mb-4' }, title),
        h('div', { className: 'space-y-3' },
            data.map((item, i) => 
                h('div', { key: i, className: 'flex items-center gap-3' },
                    h('span', { className: 'w-20 text-sm text-gray-600 text-right' }, item.label),
                    h('div', { className: 'flex-1 h-8 bg-gray-100 rounded-full overflow-hidden' },
                        h('div', { 
                            className: `h-full rounded-full transition-all duration-500 ${item.color}`,
                            style: { width: `${(item.value / maxValue) * 100}%` }
                        })
                    ),
                    h('span', { className: 'w-10 text-sm font-bold text-gray-700' }, item.value)
                )
            )
        )
    );
};

/**
 * Donut Chart Component
 */
const DonutChart = ({ data, title, total }) => {
    let cumulativePercent = 0;
    
    const getCoordinates = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };
    
    const segments = data.map((item, i) => {
        const startPercent = cumulativePercent;
        const percent = total > 0 ? item.value / total : 0;
        cumulativePercent += percent;
        
        const [startX, startY] = getCoordinates(startPercent);
        const [endX, endY] = getCoordinates(cumulativePercent);
        const largeArc = percent > 0.5 ? 1 : 0;
        
        const path = percent > 0 
            ? `M ${startX} ${startY} A 1 1 0 ${largeArc} 1 ${endX} ${endY} L 0 0`
            : '';
        
        return { ...item, path, percent };
    });
    
    return h('div', { className: 'bg-white rounded-xl p-4 shadow-sm border' },
        h('h4', { className: 'font-bold text-gray-700 mb-4 text-center' }, title),
        h('div', { className: 'flex items-center justify-center gap-6' },
            // Chart
            h('div', { className: 'relative w-32 h-32' },
                h('svg', { viewBox: '-1.2 -1.2 2.4 2.4', className: 'w-full h-full transform -rotate-90' },
                    segments.map((seg, i) => 
                        seg.path && h('path', {
                            key: i,
                            d: seg.path,
                            fill: seg.fillColor,
                            className: 'transition-all duration-300 hover:opacity-80'
                        })
                    )
                ),
                // Center text
                h('div', { className: 'absolute inset-0 flex items-center justify-center' },
                    h('span', { className: 'text-2xl font-bold text-gray-700' }, total)
                )
            ),
            // Legend
            h('div', { className: 'space-y-2' },
                data.map((item, i) => 
                    h('div', { key: i, className: 'flex items-center gap-2' },
                        h('div', { className: `w-3 h-3 rounded-full ${item.color}` }),
                        h('span', { className: 'text-sm text-gray-600' }, item.label),
                        h('span', { className: 'text-sm font-bold text-gray-700' }, item.value)
                    )
                )
            )
        )
    );
};

/**
 * Stat Card Component
 */
const StatCard = ({ icon, label, value, color, subtext }) => {
    return h('div', { className: 'bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4' },
        h('div', { className: `w-12 h-12 rounded-xl flex items-center justify-center ${color}` },
            h(Icon, { name: icon, size: 24, className: 'text-white' })
        ),
        h('div', null,
            h('p', { className: 'text-sm text-gray-500' }, label),
            h('p', { className: 'text-2xl font-bold text-gray-800' }, value),
            subtext && h('p', { className: 'text-xs text-gray-400' }, subtext)
        )
    );
};

/**
 * Recent Activity Component
 */
const RecentActivity = ({ tickets }) => {
    const recentTickets = tickets.slice(0, 5);
    
    return h('div', { className: 'bg-white rounded-xl p-4 shadow-sm border' },
        h('h4', { className: 'font-bold text-gray-700 mb-4 flex items-center gap-2' },
            h(Icon, { name: ICON_NAMES.clock, size: 18 }),
            'آخر التذاكر'
        ),
        h('div', { className: 'space-y-3' },
            recentTickets.length === 0
                ? h('p', { className: 'text-gray-400 text-center py-4' }, 'لا توجد تذاكر')
                : recentTickets.map(ticket => 
                    h('div', { key: ticket.id, className: 'flex items-center justify-between py-2 border-b last:border-0' },
                        h('div', null,
                            h('p', { className: 'font-medium text-gray-800 text-sm' }, ticket.name?.substring(0, 30) || 'بدون عنوان'),
                            h('p', { className: 'text-xs text-gray-400' }, ticket.ticketId)
                        ),
                        h('span', { 
                            className: `text-xs px-2 py-1 rounded-full ${
                                ticket.status === 'completed' ? 'bg-green-100 text-green-700' :
                                ticket.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                            }`
                        }, CONFIG.STATUSES.find(s => s.value === ticket.status)?.label || ticket.status)
                    )
                )
        )
    );
};

/**
 * Main Dashboard Component
 */
export const Dashboard = ({ tickets, users, onClose }) => {
    // Calculate stats
    const stats = {
        total: tickets.length,
        pending: tickets.filter(t => t.status === 'pending').length,
        inProgress: tickets.filter(t => t.status === 'in-progress').length,
        completed: tickets.filter(t => t.status === 'completed').length,
        unassigned: tickets.filter(t => !t.assignedTo).length
    };
    
    // Status chart data
    const statusData = [
        { label: 'انتظار', value: stats.pending, color: 'bg-amber-500', fillColor: '#f59e0b' },
        { label: 'قيد التنفيذ', value: stats.inProgress, color: 'bg-blue-500', fillColor: '#3b82f6' },
        { label: 'مكتمل', value: stats.completed, color: 'bg-green-500', fillColor: '#22c55e' }
    ];
    
    // Tickets per day (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const count = tickets.filter(t => t.date === dateStr).length;
        last7Days.push({
            label: date.toLocaleDateString('ar-IQ', { weekday: 'short' }),
            value: count,
            color: 'bg-blue-500'
        });
    }
    
    return h('div', { className: 'space-y-6' },
        // Header
        h('div', { className: 'flex items-center justify-between' },
            h('h2', { className: 'text-xl font-bold text-gray-800 flex items-center gap-2' },
                h(Icon, { name: ICON_NAMES.barChart, size: 24 }),
                'لوحة التحكم'
            ),
            h('button', {
                onClick: onClose,
                className: 'p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all'
            }, h(Icon, { name: ICON_NAMES.x, size: 20 }))
        ),
        
        // Stats Cards
        h('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' },
            h(StatCard, { icon: ICON_NAMES.inbox, label: 'إجمالي التذاكر', value: stats.total, color: 'bg-slate-600' }),
            h(StatCard, { icon: ICON_NAMES.clock, label: 'قيد الانتظار', value: stats.pending, color: 'bg-amber-500' }),
            h(StatCard, { icon: ICON_NAMES.refresh, label: 'قيد التنفيذ', value: stats.inProgress, color: 'bg-blue-500' }),
            h(StatCard, { icon: ICON_NAMES.checkCircle, label: 'مكتملة', value: stats.completed, color: 'bg-green-500' })
        ),
        
        // Charts Row
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            h(DonutChart, { 
                data: statusData, 
                title: 'توزيع الحالات', 
                total: stats.total 
            }),
            h(BarChart, { 
                data: last7Days, 
                title: 'التذاكر خلال الأسبوع' 
            })
        ),
        
        // Bottom Row
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            h(RecentActivity, { tickets }),
            h('div', { className: 'bg-white rounded-xl p-4 shadow-sm border' },
                h('h4', { className: 'font-bold text-gray-700 mb-4 flex items-center gap-2' },
                    h(Icon, { name: ICON_NAMES.users, size: 18 }),
                    'ملخص سريع'
                ),
                h('div', { className: 'space-y-3' },
                    h('div', { className: 'flex justify-between items-center py-2 border-b' },
                        h('span', { className: 'text-gray-600' }, 'تذاكر غير مُعيّنة'),
                        h('span', { className: 'font-bold text-amber-600' }, stats.unassigned)
                    ),
                    h('div', { className: 'flex justify-between items-center py-2 border-b' },
                        h('span', { className: 'text-gray-600' }, 'نسبة الإنجاز'),
                        h('span', { className: 'font-bold text-green-600' }, 
                            stats.total > 0 ? `${Math.round((stats.completed / stats.total) * 100)}%` : '0%'
                        )
                    ),
                    h('div', { className: 'flex justify-between items-center py-2' },
                        h('span', { className: 'text-gray-600' }, 'عدد المستخدمين'),
                        h('span', { className: 'font-bold text-blue-600' }, users.length)
                    )
                )
            )
        )
    );
};
