// =============================================
// Authentication Module
// =============================================

import { supabase } from './config.js';

// =============================================
// Auth Functions
// =============================================

/**
 * Sign in with email and password
 */
export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

/**
 * Get current session
 */
export const getSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
};

/**
 * Get user profile with role
 */
export const getUserProfile = async (userId) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*, roles(*)')
        .eq('user_id', userId)
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback) => {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
};

// =============================================
// User Management (Admin only)
// =============================================

/**
 * Create new user (Admin only)
 */
export const createUser = async (email, password, roleId, fullName) => {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });
    
    if (authError) throw authError;
    
    // Create user profile
    const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
            user_id: authData.user.id,
            email,
            full_name: fullName,
            role_id: roleId,
            is_active: true
        }])
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*, roles(*)')
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
    
    if (error) throw error;
    return data;
};

/**
 * Toggle user active status (Admin only)
 */
export const toggleUserStatus = async (userId, isActive) => {
    return updateUserProfile(userId, { is_active: isActive });
};

/**
 * Get all roles
 */
export const getRoles = async () => {
    const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('level', { ascending: true });
    
    if (error) throw error;
    return data;
};
