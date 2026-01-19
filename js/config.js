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
    
    // Available tags - Add more tags here
    TAGS: [
        { id: 'faroqat', name: 'فروقات', color: 'bg-amber-500' }
        // { id: 'urgent', name: 'عاجل', color: 'bg-red-500' },
        // { id: 'review', name: 'مراجعة', color: 'bg-purple-500' },
    ],
    
    // Status options
    STATUSES: [
        { value: 'pending', label: 'انتظار', labelFull: 'قيد الانتظار', bgClass: 'bg-amber-100 text-amber-700', icon: 'Clock' },
        { value: 'in-progress', label: 'تنفيذ', labelFull: 'قيد التنفيذ', bgClass: 'bg-blue-100 text-blue-700', icon: 'Refresh' },
        { value: 'completed', label: 'مكتمل', labelFull: 'مكتمل', bgClass: 'bg-green-100 text-green-700', icon: 'CheckCircle' }
    ]
};

// Initialize Supabase client
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export { CONFIG, supabase };
