// ==================== API MODULE ====================
// Centralized API module for all Supabase interactions
// Author: NGO Management System
// Version: 1.0.0

const APIModule = (function() {
    'use strict';

    // ==================== HELPER FUNCTIONS ====================
    
    /**
     * Supabase client'ı al ve başlatılmış olduğundan emin ol
     * @returns {Object|null} Supabase client
     */
    function getSupabase() {
        // Global getSupabaseClient fonksiyonunu kullan (config.js'den)
        if (typeof getSupabaseClient === 'function') {
            return getSupabaseClient();
        }
        
        // Geriye dönük uyumluluk - direkt supabase nesnesini kontrol et
        if (typeof supabase !== 'undefined' && supabase !== null) {
            return supabase;
        }
        
        console.error('❌ Supabase client kullanılamıyor');
        return null;
    }

    // ==================== GENERIC CRUD OPERATIONS ====================

    /**
     * Generic GET operation for any table
     * @param {string} table - Table name
     * @param {Object} filters - Query filters
     * @param {Array} select - Columns to select
     * @returns {Promise<Array>} - Query results
     */
    async function get(table, filters = {}, select = '*') {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            let query = client.from(table).select(select);

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    query = query.eq(key, value);
                }
            });

            const { data, error } = await query;

            if (error) throw error;

            return data || [];

        } catch (error) {
            console.error(`API GET error (${table}):`, error);
            window.ErrorHandler?.handleAPIError(error, `get ${table}`);
            return [];
        }
    }

    /**
     * Generic INSERT operation for any table
     * @param {string} table - Table name
     * @param {Object|Array} data - Data to insert
     * @returns {Promise<Object>} - Result with success status
     */
    async function insert(table, data) {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            const { data: result, error } = await client
                .from(table)
                .insert(Array.isArray(data) ? data : [data])
                .select();

            if (error) throw error;

            window.ToastManager?.show('Kayıt başarıyla oluşturuldu', 'success');
            return { success: true, data: result };

        } catch (error) {
            console.error(`API INSERT error (${table}):`, error);
            window.ErrorHandler?.handleAPIError(error, `insert ${table}`);
            return { success: false, error };
        }
    }

    /**
     * Generic UPDATE operation for any table
     * @param {string} table - Table name
     * @param {string} id - Record ID
     * @param {Object} data - Data to update
     * @returns {Promise<Object>} - Result with success status
     */
    async function update(table, id, data) {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            const { data: result, error } = await client
                .from(table)
                .update(data)
                .eq('id', id)
                .select();

            if (error) throw error;

            window.ToastManager?.show('Kayıt başarıyla güncellendi', 'success');
            return { success: true, data: result };

        } catch (error) {
            console.error(`API UPDATE error (${table}):`, error);
            window.ErrorHandler?.handleAPIError(error, `update ${table}`);
            return { success: false, error };
        }
    }

    /**
     * Generic DELETE operation for any table
     * @param {string} table - Table name
     * @param {string} id - Record ID
     * @returns {Promise<Object>} - Result with success status
     */
    async function remove(table, id) {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            const { error } = await client
                .from(table)
                .delete()
                .eq('id', id);

            if (error) throw error;

            window.ToastManager?.show('Kayıt başarıyla silindi', 'success');
            return { success: true };

        } catch (error) {
            console.error(`API DELETE error (${table}):`, error);
            window.ErrorHandler?.handleAPIError(error, `delete ${table}`);
            return { success: false, error };
        }
    }

    /**
     * Get single record by ID
     * @param {string} table - Table name
     * @param {string} id - Record ID
     * @param {string} select - Columns to select
     * @returns {Promise<Object|null>} - Single record or null
     */
    async function getById(table, id, select = '*') {
        try {
            if (!window.ValidationUtils?.isValidUUID(id)) {
                throw new Error('Invalid ID format');
            }

            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }

            const { data, error } = await client
                .from(table)
                .select(select)
                .eq('id', id)
                .single();

            if (error) throw error;

            return data;

        } catch (error) {
            console.error(`API GET BY ID error (${table}):`, error);
            window.ErrorHandler?.handleAPIError(error, `getById ${table}`);
            return null;
        }
    }

    /**
     * Count records in a table
     * @param {string} table - Table name
     * @param {Object} filters - Query filters
     * @returns {Promise<number>} - Record count
     */
    async function count(table, filters = {}) {
        try {
            const client = getSupabase();
            if (!client) {
                throw new Error('Veritabanı bağlantısı mevcut değil');
            }
            
            let query = client
                .from(table)
                .select('*', { count: 'exact', head: true });

            // Apply filters
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    query = query.eq(key, value);
                }
            });

            const { count, error } = await query;

            if (error) throw error;

            return count || 0;

        } catch (error) {
            console.error(`API COUNT error (${table}):`, error);
            return 0;
        }
    }

    // ==================== HEALTH CHECK ====================

    /**
     * Check API connection status
     * @returns {Promise<boolean>} - True if connected
     */
    async function healthCheck() {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id')
                .limit(1);

            return !error;

        } catch (error) {
            console.error('API health check failed:', error);
            return false;
        }
    }

    // ==================== PUBLIC API ====================

    return {
        get,
        insert,
        update,
        remove,
        getById,
        count,
        healthCheck
    };

})();

// Export to window
window.APIModule = APIModule;

// Log module load
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ API Module loaded!');
}
