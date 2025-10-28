// ==================== AUTHENTICATION MODULE ====================
// Handles user authentication and session management
// Author: NGO Management System
// Version: 1.0.0

const AuthModule = (function() {
    'use strict';

    /**
     * Supabase client'ı al
     * @returns {Object|null} Supabase client
     */
    function getSupabase() {
        if (typeof getSupabaseClient === 'function') {
            return getSupabaseClient();
        }
        if (typeof supabase !== 'undefined' && supabase !== null) {
            return supabase;
        }
        console.error('❌ Supabase client kullanılamıyor');
        return null;
    }

    /**
     * Check if user is authenticated
     * @returns {Promise<Object|null>} - User object or null
     */
    async function getCurrentUser() {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            const { data: { user }, error } = await client.auth.getUser();
            
            if (error) throw error;
            
            return user;

        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Check if user is authenticated and redirect if not
     * @param {string} redirectUrl - URL to redirect to if not authenticated
     * @returns {Promise<Object|null>} - User object or null
     */
    async function requireAuth(redirectUrl = 'login.html') {
        const user = await getCurrentUser();
        
        if (!user) {
            window.location.href = redirectUrl;
            return null;
        }
        
        return user;
    }

    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} - Login result
     */
    async function login(email, password) {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            window.ToastManager?.show('Giriş başarılı', 'success');
            return { success: true, user: data.user };

        } catch (error) {
            console.error('Login error:', error);
            window.ErrorHandler?.handleAPIError(error, 'login');
            return { success: false, error };
        }
    }

    /**
     * Logout current user
     * @returns {Promise<Object>} - Logout result
     */
    async function logout() {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            const { error } = await client.auth.signOut();

            if (error) throw error;

            window.ToastManager?.show('Çıkış yapıldı', 'success');
            window.location.href = 'login.html';
            return { success: true };

        } catch (error) {
            console.error('Logout error:', error);
            window.ErrorHandler?.handleAPIError(error, 'logout');
            return { success: false, error };
        }
    }

    /**
     * Get user profile with role information
     * @returns {Promise<Object|null>} - User profile or null
     */
    async function getUserProfile() {
        try {
            const user = await getCurrentUser();
            if (!user) return null;

            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }

            // Get user details from users table
            const { data, error } = await client
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            return data;

        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    }

    /**
     * Check if user has specific role
     * @param {string} role - Role to check
     * @returns {Promise<boolean>} - True if user has role
     */
    async function hasRole(role) {
        try {
            const profile = await getUserProfile();
            if (!profile) return false;

            return profile.role === role;

        } catch (error) {
            console.error('Check role error:', error);
            return false;
        }
    }

    /**
     * Check if user has any of the specified roles
     * @param {Array<string>} roles - Roles to check
     * @returns {Promise<boolean>} - True if user has any of the roles
     */
    async function hasAnyRole(roles) {
        try {
            const profile = await getUserProfile();
            if (!profile) return false;

            return roles.includes(profile.role);

        } catch (error) {
            console.error('Check roles error:', error);
            return false;
        }
    }

    /**
     * Initialize auth state listener
     * @param {Function} callback - Callback function for auth state changes
     */
    function onAuthStateChange(callback) {
        const client = getSupabase();
        if (client && client.auth) {
            client.auth.onAuthStateChange((event, session) => {
                callback(event, session);
            });
        } else {
            console.warn('⚠️ Auth state listener başlatılamadı - Supabase client mevcut değil');
        }
    }

    // ==================== PUBLIC API ====================

    return {
        getCurrentUser,
        requireAuth,
        login,
        logout,
        getUserProfile,
        hasRole,
        hasAnyRole,
        onAuthStateChange
    };

})();

// Export to window
window.AuthModule = AuthModule;

// Log module load
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Authentication Module loaded!');
}
