// =============================================
// Configuration - Supabase Settings
// =============================================

const CONFIG = {
    SUPABASE_URL: 'https://dpffflftuydonufluwmx.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_7IaPwDdiUmyD182o3RB7Cw_8Q18zCXu',
    
    // Storage
    STORAGE_BUCKET: 'attachments',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    
    // Allowed file types for images
    IMAGE_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    
    // Available tags
    TAGS: [
        { id: 'faroqat', name: 'فروقات', color: 'bg-amber-500' }
    ],
    
    // Priority levels (used when creating ticket)
    PRIORITIES: [
        { value: 'normal', label: 'عادي', icon: 'minus', bgClass: 'bg-slate-100 text-slate-600', borderClass: 'border-slate-300' },
        { value: 'high', label: 'عالي', icon: 'arrow-up', bgClass: 'bg-orange-100 text-orange-700', borderClass: 'border-orange-400' },
        { value: 'urgent', label: 'عاجل', icon: 'alert-circle', bgClass: 'bg-red-100 text-red-700', borderClass: 'border-red-500' }
    ],
    
    // Workflow statuses (used by processors/reviewers)
    STATUSES: [
        { value: 'new', label: 'جديد', labelFull: 'جديد', bgClass: 'bg-slate-100 text-slate-700', icon: 'inbox' },
        { value: 'in-progress', label: 'قيد المعالجة', labelFull: 'قيد المعالجة', bgClass: 'bg-blue-100 text-blue-700', icon: 'refresh-cw' },
        { value: 'resolved', label: 'تم الحل', labelFull: 'تم الحل', bgClass: 'bg-amber-100 text-amber-700', icon: 'check' },
        { value: 'approved', label: 'معتمد', labelFull: 'معتمد', bgClass: 'bg-emerald-100 text-emerald-700', icon: 'check-circle' },
        { value: 'rejected', label: 'مرفوض', labelFull: 'مرفوض', bgClass: 'bg-red-100 text-red-700', icon: 'x-circle' },
        { value: 'closed', label: 'مغلق', labelFull: 'مغلق', bgClass: 'bg-gray-100 text-gray-600', icon: 'archive' }
    ]
};

// Initialize Supabase client
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export { CONFIG, supabase };
