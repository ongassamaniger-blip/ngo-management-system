// ==================== APPROVAL WORKFLOW MODULE ====================
// This module handles all approval workflows for transactions and other entities
// Author: NGO Management System
// Version: 1.0.0

const ApprovalWorkflow = (function() {
    'use strict';

    // ==================== TRANSACTION APPROVAL ====================
    
    /**
     * Approve a transaction
     * @param {string} transactionId - UUID of the transaction
     * @param {string} approverNotes - Optional notes from approver
     * @returns {Promise<Object>} - Success/error response
     */
    async function approveTransaction(transactionId, approverNotes = '') {
        try {
            if (!window.ValidationUtils.isValidUUID(transactionId)) {
                throw new Error('Invalid transaction ID');
            }

            // Get current user for approval
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Update transaction status
            const { data, error } = await supabase
                .from('transactions')
                .update({
                    status: 'approved',
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    approval_notes: approverNotes
                })
                .eq('id', transactionId)
                .select();

            if (error) throw error;

            // Log audit event
            await logAuditEvent('APPROVE_TRANSACTION', 'transaction', transactionId, {
                approver_id: user.id,
                notes: approverNotes
            });

            window.ToastManager?.show('İşlem başarıyla onaylandı', 'success');
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('Transaction approval error:', error);
            window.ErrorHandler?.handleAPIError(error, 'approveTransaction');
            return { success: false, error };
        }
    }

    /**
     * Reject a transaction
     * @param {string} transactionId - UUID of the transaction
     * @param {string} rejectionReason - Reason for rejection
     * @returns {Promise<Object>} - Success/error response
     */
    async function rejectTransaction(transactionId, rejectionReason = '') {
        try {
            if (!window.ValidationUtils.isValidUUID(transactionId)) {
                throw new Error('Invalid transaction ID');
            }

            if (!rejectionReason || rejectionReason.trim() === '') {
                throw new Error('Rejection reason is required');
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            // Update transaction status
            const { data, error } = await supabase
                .from('transactions')
                .update({
                    status: 'rejected',
                    approved_by: user.id,
                    approved_at: new Date().toISOString(),
                    approval_notes: rejectionReason
                })
                .eq('id', transactionId)
                .select();

            if (error) throw error;

            // Log audit event
            await logAuditEvent('REJECT_TRANSACTION', 'transaction', transactionId, {
                approver_id: user.id,
                reason: rejectionReason
            });

            window.ToastManager?.show('İşlem reddedildi', 'warning');
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('Transaction rejection error:', error);
            window.ErrorHandler?.handleAPIError(error, 'rejectTransaction');
            return { success: false, error };
        }
    }

    /**
     * Get pending approvals for current user
     * @returns {Promise<Array>} - List of pending transactions
     */
    async function getPendingApprovals() {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*, facilities(name)')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];

        } catch (error) {
            console.error('Get pending approvals error:', error);
            window.ErrorHandler?.handleAPIError(error, 'getPendingApprovals');
            return [];
        }
    }

    /**
     * Get approval history for a transaction
     * @param {string} transactionId - UUID of the transaction
     * @returns {Promise<Array>} - Approval history
     */
    async function getApprovalHistory(transactionId) {
        try {
            if (!window.ValidationUtils.isValidUUID(transactionId)) {
                throw new Error('Invalid transaction ID');
            }

            // Get transaction details
            const { data: transaction, error } = await supabase
                .from('transactions')
                .select('*, approved_by_user:users!approved_by(full_name, email)')
                .eq('id', transactionId)
                .single();

            if (error) throw error;

            return {
                transaction,
                status: transaction.status,
                approved_by: transaction.approved_by,
                approved_at: transaction.approved_at,
                approval_notes: transaction.approval_notes
            };

        } catch (error) {
            console.error('Get approval history error:', error);
            return null;
        }
    }

    // ==================== FACILITY FINANCE APPROVAL ====================

    /**
     * Approve facility finance transaction
     * @param {string} financeId - UUID of the facility finance record
     * @param {string} approverNotes - Optional notes from approver
     * @returns {Promise<Object>} - Success/error response
     */
    async function approveFacilityFinance(financeId, approverNotes = '') {
        try {
            if (!window.ValidationUtils.isValidUUID(financeId)) {
                throw new Error('Invalid finance ID');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('facility_finance')
                .update({
                    status: 'approved',
                    approved_by: user.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', financeId)
                .select();

            if (error) throw error;

            await logAuditEvent('APPROVE_FACILITY_FINANCE', 'facility_finance', financeId, {
                approver_id: user.id,
                notes: approverNotes
            });

            window.ToastManager?.show('Tesis finans işlemi onaylandı', 'success');
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('Facility finance approval error:', error);
            window.ErrorHandler?.handleAPIError(error, 'approveFacilityFinance');
            return { success: false, error };
        }
    }

    /**
     * Approve project finance transaction
     * @param {string} financeId - UUID of the project finance record
     * @param {string} approverNotes - Optional notes from approver
     * @returns {Promise<Object>} - Success/error response
     */
    async function approveProjectFinance(financeId, approverNotes = '') {
        try {
            if (!window.ValidationUtils.isValidUUID(financeId)) {
                throw new Error('Invalid finance ID');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error('User not authenticated');
            }

            const { data, error } = await supabase
                .from('project_finance')
                .update({
                    status: 'approved',
                    approved_by: user.id,
                    updated_at: new Date().toISOString()
                })
                .eq('id', financeId)
                .select();

            if (error) throw error;

            await logAuditEvent('APPROVE_PROJECT_FINANCE', 'project_finance', financeId, {
                approver_id: user.id,
                notes: approverNotes
            });

            window.ToastManager?.show('Proje finans işlemi onaylandı', 'success');
            return { success: true, data: data[0] };

        } catch (error) {
            console.error('Project finance approval error:', error);
            window.ErrorHandler?.handleAPIError(error, 'approveProjectFinance');
            return { success: false, error };
        }
    }

    // ==================== AUDIT LOGGING ====================

    /**
     * Log an audit event
     * @param {string} action - Action performed
     * @param {string} resourceType - Type of resource
     * @param {string} resourceId - UUID of the resource
     * @param {Object} details - Additional details
     * @returns {Promise<void>}
     */
    async function logAuditEvent(action, resourceType, resourceId, details = {}) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase.from('audit_log').insert([{
                user_id: user.id,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                details: details,
                ip_address: null, // Could be captured if needed
                user_agent: navigator.userAgent
            }]);

        } catch (error) {
            console.error('Audit logging error:', error);
            // Don't throw, as this shouldn't break the main flow
        }
    }

    /**
     * Get audit logs for a resource
     * @param {string} resourceType - Type of resource
     * @param {string} resourceId - UUID of the resource
     * @returns {Promise<Array>} - Audit logs
     */
    async function getAuditLogs(resourceType, resourceId) {
        try {
            const { data, error } = await supabase
                .from('audit_log')
                .select('*, users(full_name, email)')
                .eq('resource_type', resourceType)
                .eq('resource_id', resourceId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data || [];

        } catch (error) {
            console.error('Get audit logs error:', error);
            return [];
        }
    }

    // ==================== PUBLIC API ====================

    return {
        // Transaction approvals
        approveTransaction,
        rejectTransaction,
        getPendingApprovals,
        getApprovalHistory,

        // Facility & Project finance approvals
        approveFacilityFinance,
        approveProjectFinance,

        // Audit logging
        logAuditEvent,
        getAuditLogs
    };

})();

// Export to window
window.ApprovalWorkflow = ApprovalWorkflow;

// Log module load
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Approval Workflow Module loaded!');
}
