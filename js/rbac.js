// ==================== ROLE-BASED ACCESS CONTROL (RBAC) MODULE ====================
// This module handles all permission checks and role-based access control

const RBACModule = (function() {
    'use strict';

    // Role hierarchy and permissions
    const ROLES = {
        ADMIN: 'admin',
        FINANCE_MANAGER: 'finance_manager',
        FACILITY_MANAGER: 'facility_manager',
        PROJECT_MANAGER: 'project_manager',
        PERSONNEL_MANAGER: 'personnel_manager',
        USER: 'user'
    };

    // Permission definitions
    const PERMISSIONS = {
        // Global permissions
        VIEW_ALL_FACILITIES: 'view_all_facilities',
        VIEW_ALL_PROJECTS: 'view_all_projects',
        VIEW_ALL_FINANCE: 'view_all_finance',
        VIEW_ALL_PERSONNEL: 'view_all_personnel',
        
        // Facility permissions
        VIEW_FACILITY: 'view_facility',
        EDIT_FACILITY: 'edit_facility',
        DELETE_FACILITY: 'delete_facility',
        MANAGE_FACILITY_FINANCE: 'manage_facility_finance',
        MANAGE_FACILITY_PERSONNEL: 'manage_facility_personnel',
        
        // Project permissions
        VIEW_PROJECT: 'view_project',
        EDIT_PROJECT: 'edit_project',
        DELETE_PROJECT: 'delete_project',
        MANAGE_PROJECT_FINANCE: 'manage_project_finance',
        MANAGE_PROJECT_TEAM: 'manage_project_team',
        
        // Finance permissions
        VIEW_FINANCE: 'view_finance',
        CREATE_TRANSACTION: 'create_transaction',
        APPROVE_TRANSACTION: 'approve_transaction',
        
        // Personnel permissions
        VIEW_PERSONNEL: 'view_personnel',
        CREATE_PERSONNEL: 'create_personnel',
        EDIT_PERSONNEL: 'edit_personnel',
        DELETE_PERSONNEL: 'delete_personnel'
    };

    // Role-Permission mapping
    const ROLE_PERMISSIONS = {
        [ROLES.ADMIN]: Object.values(PERMISSIONS), // Admin has all permissions
        
        [ROLES.FINANCE_MANAGER]: [
            PERMISSIONS.VIEW_ALL_FINANCE,
            PERMISSIONS.VIEW_FINANCE,
            PERMISSIONS.CREATE_TRANSACTION,
            PERMISSIONS.APPROVE_TRANSACTION,
            PERMISSIONS.VIEW_ALL_FACILITIES,
            PERMISSIONS.VIEW_ALL_PROJECTS
        ],
        
        [ROLES.FACILITY_MANAGER]: [
            PERMISSIONS.VIEW_FACILITY,
            PERMISSIONS.EDIT_FACILITY,
            PERMISSIONS.MANAGE_FACILITY_FINANCE,
            PERMISSIONS.MANAGE_FACILITY_PERSONNEL,
            PERMISSIONS.VIEW_FINANCE,
            PERMISSIONS.CREATE_TRANSACTION,
            PERMISSIONS.VIEW_PERSONNEL,
            PERMISSIONS.CREATE_PERSONNEL,
            PERMISSIONS.EDIT_PERSONNEL
        ],
        
        [ROLES.PROJECT_MANAGER]: [
            PERMISSIONS.VIEW_PROJECT,
            PERMISSIONS.EDIT_PROJECT,
            PERMISSIONS.MANAGE_PROJECT_FINANCE,
            PERMISSIONS.MANAGE_PROJECT_TEAM,
            PERMISSIONS.VIEW_FINANCE,
            PERMISSIONS.CREATE_TRANSACTION,
            PERMISSIONS.VIEW_PERSONNEL
        ],
        
        [ROLES.PERSONNEL_MANAGER]: [
            PERMISSIONS.VIEW_ALL_PERSONNEL,
            PERMISSIONS.VIEW_PERSONNEL,
            PERMISSIONS.CREATE_PERSONNEL,
            PERMISSIONS.EDIT_PERSONNEL,
            PERMISSIONS.DELETE_PERSONNEL
        ],
        
        [ROLES.USER]: [
            PERMISSIONS.VIEW_FINANCE,
            PERMISSIONS.VIEW_PERSONNEL
        ]
    };

    // Current user context
    let currentUser = null;
    let userRoles = [];
    let userFacilities = [];
    let userProjects = [];

    /**
     * Initialize RBAC module with current user
     * @param {Object} user - Current user object
     */
    async function init(user) {
        if (!user) {
            console.error('RBAC: No user provided');
            return false;
        }

        try {
            currentUser = user;
            
            // Get user's global role
            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userData) {
                userRoles = [userData.role];
            }

            // Get user's facility assignments
            const { data: facilityRoles } = await supabase
                .from('user_facility_roles')
                .select('facility_id, role')
                .eq('user_id', user.id);

            if (facilityRoles) {
                userFacilities = facilityRoles;
            }

            // Get user's project assignments
            const { data: projectRoles } = await supabase
                .from('user_project_roles')
                .select('project_id, role')
                .eq('user_id', user.id);

            if (projectRoles) {
                userProjects = projectRoles;
            }

            console.log('RBAC initialized:', { userRoles, facilityCount: userFacilities.length, projectCount: userProjects.length });
            return true;
        } catch (error) {
            console.error('RBAC initialization error:', error);
            return false;
        }
    }

    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission to check
     * @param {Object} context - Optional context (facilityId or projectId)
     * @returns {boolean}
     */
    function hasPermission(permission, context = {}) {
        if (!currentUser) {
            console.warn('RBAC: No user logged in');
            return false;
        }

        // Admin always has all permissions
        if (userRoles.includes(ROLES.ADMIN)) {
            return true;
        }

        // Check global role permissions
        for (const role of userRoles) {
            const rolePerms = ROLE_PERMISSIONS[role] || [];
            if (rolePerms.includes(permission)) {
                // For facility-specific permissions
                if (context.facilityId && permission.includes('facility')) {
                    return hasAccessToFacility(context.facilityId);
                }
                // For project-specific permissions
                if (context.projectId && permission.includes('project')) {
                    return hasAccessToProject(context.projectId);
                }
                return true;
            }
        }

        // Check facility-specific roles
        if (context.facilityId) {
            const facilityRole = userFacilities.find(f => f.facility_id === context.facilityId);
            if (facilityRole) {
                const rolePerms = ROLE_PERMISSIONS[facilityRole.role] || [];
                return rolePerms.includes(permission);
            }
        }

        // Check project-specific roles
        if (context.projectId) {
            const projectRole = userProjects.find(p => p.project_id === context.projectId);
            if (projectRole) {
                const rolePerms = ROLE_PERMISSIONS[projectRole.role] || [];
                return rolePerms.includes(permission);
            }
        }

        return false;
    }

    /**
     * Check if user has access to a specific facility
     * @param {string} facilityId
     * @returns {boolean}
     */
    function hasAccessToFacility(facilityId) {
        if (!currentUser) return false;
        
        // Admin has access to all facilities
        if (userRoles.includes(ROLES.ADMIN)) return true;
        
        // Finance manager has access to all facilities
        if (userRoles.includes(ROLES.FINANCE_MANAGER)) return true;
        
        // Check if user is assigned to this facility
        return userFacilities.some(f => f.facility_id === facilityId);
    }

    /**
     * Check if user has access to a specific project
     * @param {string} projectId
     * @returns {boolean}
     */
    function hasAccessToProject(projectId) {
        if (!currentUser) return false;
        
        // Admin has access to all projects
        if (userRoles.includes(ROLES.ADMIN)) return true;
        
        // Finance manager has access to all projects
        if (userRoles.includes(ROLES.FINANCE_MANAGER)) return true;
        
        // Check if user is assigned to this project
        return userProjects.some(p => p.project_id === projectId);
    }

    /**
     * Get list of facilities user has access to
     * @returns {Array} Array of facility IDs
     */
    function getAccessibleFacilities() {
        if (!currentUser) return [];
        
        // Admin and finance manager have access to all
        if (userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.FINANCE_MANAGER)) {
            return 'all';
        }
        
        return userFacilities.map(f => f.facility_id);
    }

    /**
     * Get list of projects user has access to
     * @returns {Array} Array of project IDs
     */
    function getAccessibleProjects() {
        if (!currentUser) return [];
        
        // Admin and finance manager have access to all
        if (userRoles.includes(ROLES.ADMIN) || userRoles.includes(ROLES.FINANCE_MANAGER)) {
            return 'all';
        }
        
        return userProjects.map(p => p.project_id);
    }

    /**
     * Check if user can view all facilities
     * @returns {boolean}
     */
    function canViewAllFacilities() {
        return hasPermission(PERMISSIONS.VIEW_ALL_FACILITIES);
    }

    /**
     * Check if user can view all projects
     * @returns {boolean}
     */
    function canViewAllProjects() {
        return hasPermission(PERMISSIONS.VIEW_ALL_PROJECTS);
    }

    /**
     * Check if user can view all finance
     * @returns {boolean}
     */
    function canViewAllFinance() {
        return hasPermission(PERMISSIONS.VIEW_ALL_FINANCE);
    }

    /**
     * Get user's primary role
     * @returns {string}
     */
    function getUserRole() {
        return userRoles[0] || ROLES.USER;
    }

    /**
     * Check if user is admin
     * @returns {boolean}
     */
    function isAdmin() {
        return userRoles.includes(ROLES.ADMIN);
    }

    /**
     * Filter data based on user access
     * @param {Array} data - Data array to filter
     * @param {string} type - Type of data (facility, project, etc.)
     * @returns {Array} Filtered data
     */
    function filterByAccess(data, type) {
        if (!data || !Array.isArray(data)) return [];
        
        if (isAdmin() || userRoles.includes(ROLES.FINANCE_MANAGER)) {
            return data;
        }

        if (type === 'facility') {
            const accessibleIds = getAccessibleFacilities();
            if (accessibleIds === 'all') return data;
            return data.filter(item => accessibleIds.includes(item.id));
        }

        if (type === 'project') {
            const accessibleIds = getAccessibleProjects();
            if (accessibleIds === 'all') return data;
            return data.filter(item => accessibleIds.includes(item.id));
        }

        return data;
    }

    /**
     * Show unauthorized message
     */
    function showUnauthorized() {
        if (typeof ToastManager !== 'undefined') {
            ToastManager.error('Bu işlem için yetkiniz yok!');
        } else {
            alert('Bu işlem için yetkiniz yok!');
        }
    }

    /**
     * Redirect to unauthorized page
     */
    function redirectUnauthorized() {
        showUnauthorized();
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Public API
    return {
        ROLES,
        PERMISSIONS,
        init,
        hasPermission,
        hasAccessToFacility,
        hasAccessToProject,
        getAccessibleFacilities,
        getAccessibleProjects,
        canViewAllFacilities,
        canViewAllProjects,
        canViewAllFinance,
        getUserRole,
        isAdmin,
        filterByAccess,
        showUnauthorized,
        redirectUnauthorized
    };
})();

// Make module globally available
window.RBACModule = RBACModule;
