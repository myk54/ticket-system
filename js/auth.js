// =============================================
// Authentication Module - Simple Username/Password
// =============================================

import { supabase } from './config.js';

// Session storage key
const SESSION_KEY = 'ticket_system_user';

// =============================================
// Auth Functions
// =============================================

/**
 * Sign in with username and password
 */
export const signIn = async (username, password) => {
    const { data, error } = await supabase
        .rpc('login_user', { 
            input_username: username, 
            input_password: password 
        });
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
        throw new Error('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
    
    const user = data[0];
    
    if (!user.is_active) {
        throw new Error('حسابك معطّل. تواصل مع المدير.');
    }
    
    // Save to session
    const sessionData = {
        id: user.user_id,
        username: user.username,
        full_name: user.full_name,
        role: user.role_name,
        role_display: user.role_display
    };
    
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    
    return { user: sessionData };
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    localStorage.removeItem(SESSION_KEY);
};

/**
 * Get current session
 */
export const getSession = async () => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    
    try {
        const user = JSON.parse(stored);
        return { user };
    } catch {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const session = await getSession();
    return session?.user || null;
};

/**
 * Get user profile with role
 */
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Listen to auth state changes (simplified for localStorage)
 */
export const onAuthStateChange = (callback) => {
    // Check session on storage change
    const handleStorage = (e) => {
        if (e.key === SESSION_KEY) {
            const session = e.newValue ? JSON.parse(e.newValue) : null;
            callback(session ? 'SIGNED_IN' : 'SIGNED_OUT', session);
        }
    };
    
    window.addEventListener('storage', handleStorage);
    
    return {
        data: {
            subscription: {
                unsubscribe: () => window.removeEventListener('storage', handleStorage)
            }
        }
    };
};

// =============================================
// User Management (Admin only)
// =============================================

/**
 * Create new user (Admin only)
 */
export const createUser = async (username, password, roleId, fullName) => {
    // First hash the password using the database function
    const { data, error } = await supabase
        .rpc('hash_password', { password });
    
    if (error) throw error;
    
    const passwordHash = data;
    
    // Insert user
    const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert([{
            username,
            password_hash: passwordHash,
            full_name: fullName,
            role_id: roleId,
            is_active: true
        }])
        .select('*, roles(*)')
        .single();
    
    if (insertError) throw insertError;
    return userData;
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('users')
        .select('*, roles(*)')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data.map(u => ({
        ...u,
        user_id: u.id // Map for compatibility
    }));
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('users')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select('*, roles(*)')
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Update user password
 */
export const updateUserPassword = async (userId, newPassword) => {
    // Hash the new password
    const { data: hash, error: hashError } = await supabase
        .rpc('hash_password', { password: newPassword });
    
    if (hashError) throw hashError;
    
    const { error } = await supabase
        .from('users')
        .update({ 
            password_hash: hash,
            updated_at: new Date().toISOString()
        })
        .eq('id', userId);
    
    if (error) throw error;
};

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = async (userId, isActive) => {
    return updateUserProfile(userId, { is_active: isActive });
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (userId) => {
    const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);
    
    if (error) throw error;
};

/**
 * Get all roles
 */
export const getRoles = async () => {
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: false });
    
    if (error) throw error;
    return data;
};
