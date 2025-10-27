# Database Setup Instructions

## Overview
This document explains how to set up the role-based access control (RBAC) system for the NGO Management System.

## Prerequisites
- Supabase account and project
- Access to Supabase SQL Editor
- Basic understanding of PostgreSQL

## Step 1: Run Database Schema

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a new query
4. Copy and paste the contents of `database-schema.sql`
5. Click **Run** to execute the schema

This will create the following tables:
- `user_facility_roles` - Assigns users to facilities
- `user_project_roles` - Assigns users to projects
- `facility_finance` - Facility-specific financial transactions
- `project_finance` - Project-specific financial transactions
- `project_team` - Project team members
- `audit_log` - Security audit trail

## Step 2: Verify Tables Creation

Run this query to verify all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_facility_roles',
    'user_project_roles',
    'facility_finance',
    'project_finance',
    'project_team',
    'audit_log'
);
```

You should see 6 rows returned.

## Step 3: Enable Row Level Security (RLS)

The schema automatically enables RLS and creates policies. Verify by running:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'user_facility_roles',
    'user_project_roles',
    'facility_finance',
    'project_finance',
    'project_team',
    'audit_log'
);
```

All tables should show `rowsecurity = true`.

## Step 4: Assign Users to Facilities

To assign a facility manager to a facility, use this SQL:

```sql
-- Get user ID
SELECT id, email, full_name FROM users;

-- Get facility ID
SELECT id, name FROM facilities;

-- Assign user to facility
INSERT INTO user_facility_roles (user_id, facility_id, role)
VALUES (
    'USER_ID_FROM_STEP_1',  -- Replace with actual user ID
    'FACILITY_ID_FROM_STEP_2',  -- Replace with actual facility ID
    'facility_manager'
);
```

## Step 5: Assign Users to Projects

To assign a project manager to a project, use this SQL:

```sql
-- Get project ID
SELECT id, name FROM projects;

-- Assign user to project
INSERT INTO user_project_roles (user_id, project_id, role)
VALUES (
    'USER_ID',  -- Replace with actual user ID
    'PROJECT_ID',  -- Replace with actual project ID
    'project_manager'
);
```

## Testing the RBAC System

### Test Scenario 1: Facility Manager Access

1. Create a test user with role 'user' (not admin)
2. Assign them to a specific facility using `user_facility_roles`
3. Login as that user
4. Navigate to dashboard - they should only see their assigned facility
5. Navigate to facility detail - they should only access their assigned facility
6. Try accessing another facility - they should be redirected with an error

### Test Scenario 2: Project Manager Access

1. Create a test user with role 'user'
2. Assign them to a specific project using `user_project_roles`
3. Login as that user
4. Navigate to projects page - they should only see their assigned project
5. Navigate to project detail - they should only access their assigned project
6. Try accessing another project - they should be redirected with an error

### Test Scenario 3: Admin Access

1. Login as admin user
2. Navigate to all pages
3. Admin should see ALL facilities and projects regardless of assignments

### Test Scenario 4: Finance Manager Access

1. Create a user with role 'finance_manager'
2. Login as finance manager
3. They should see ALL facilities and projects
4. They should be able to view all financial data

## Role Hierarchy

The system supports these roles (from highest to lowest privilege):

1. **admin** - Full access to everything
2. **finance_manager** - View all facilities, projects, and finance
3. **facility_manager** - Manage assigned facilities only
4. **project_manager** - Manage assigned projects only
5. **personnel_manager** - Manage personnel across organization
6. **user** - Basic view access

## Common SQL Queries

### View all facility assignments
```sql
SELECT 
    u.email,
    u.full_name,
    f.name as facility_name,
    ufr.role,
    ufr.assigned_at
FROM user_facility_roles ufr
JOIN users u ON u.id = ufr.user_id
JOIN facilities f ON f.id = ufr.facility_id
ORDER BY ufr.assigned_at DESC;
```

### View all project assignments
```sql
SELECT 
    u.email,
    u.full_name,
    p.name as project_name,
    upr.role,
    upr.assigned_at
FROM user_project_roles upr
JOIN users u ON u.id = upr.user_id
JOIN projects p ON p.id = upr.project_id
ORDER BY upr.assigned_at DESC;
```

### View audit log
```sql
SELECT 
    u.email,
    al.action,
    al.resource_type,
    al.created_at
FROM audit_log al
JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 50;
```

### Remove a user's facility assignment
```sql
DELETE FROM user_facility_roles
WHERE user_id = 'USER_ID' AND facility_id = 'FACILITY_ID';
```

### Remove a user's project assignment
```sql
DELETE FROM user_project_roles
WHERE user_id = 'USER_ID' AND project_id = 'PROJECT_ID';
```

## Troubleshooting

### Issue: User can't see any facilities
**Solution:** Check if user is assigned to facilities:
```sql
SELECT * FROM user_facility_roles WHERE user_id = 'USER_ID';
```

### Issue: RLS blocking queries
**Solution:** Check RLS policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'user_facility_roles';
```

### Issue: Functions not working
**Solution:** Ensure functions are created with SECURITY DEFINER:
```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname IN ('user_has_facility_access', 'user_has_project_access');
```

## Security Best Practices

1. **Never disable RLS** - Always keep Row Level Security enabled
2. **Use audit logging** - Call `log_audit_event()` for sensitive operations
3. **Regular reviews** - Periodically review user assignments
4. **Principle of least privilege** - Only assign minimum necessary permissions
5. **Monitor audit logs** - Check for suspicious activity regularly

## Migration from Old System

If you have an existing system:

1. **Backup your data** before running any migrations
2. Run the schema creation SQL
3. Assign existing users to their facilities/projects
4. Test thoroughly with different user roles
5. Deploy to production only after testing

## Support

For issues or questions:
1. Check Supabase logs in dashboard
2. Review browser console for JavaScript errors
3. Check Network tab for failed API calls
4. Verify RLS policies are correctly configured

## Additional Resources

- [Supabase Row Level Security Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Functions](https://supabase.com/docs/guides/database/functions)
