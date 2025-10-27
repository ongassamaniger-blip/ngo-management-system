# Implementation Guide - Hierarchical Dashboard & RBAC

## Overview
This guide provides step-by-step instructions for implementing the hierarchical dashboard structure and role-based access control (RBAC) system.

## Prerequisites
- ✅ Supabase account and project
- ✅ Access to Supabase SQL Editor
- ✅ Basic knowledge of SQL and JavaScript
- ✅ Admin access to your NGO Management System

## Step 1: Database Setup (15 minutes)

### 1.1 Run the Schema
1. Open your Supabase dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New query**
4. Open the file `database-schema.sql` from this repository
5. Copy ALL the contents
6. Paste into the SQL Editor
7. Click **Run** (or press F5)
8. Wait for confirmation: "Success. No rows returned"

### 1.2 Verify Tables
Run this verification query:
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
**Expected result:** 6 rows (all table names should appear)

### 1.3 Verify RLS is Enabled
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
**Expected result:** All tables should show `rowsecurity = t` (true)

### 1.4 Verify Functions
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'log_audit_event',
    'user_has_facility_access',
    'user_has_project_access'
);
```
**Expected result:** 3 function names should appear

## Step 2: Deploy Frontend Files (5 minutes)

### 2.1 Upload New Files
Upload these NEW files to your web server:
- `js/rbac.js` - RBAC module
- `database-schema.sql` - Database schema (for reference)
- `DATABASE_SETUP.md` - Database setup guide
- `HIERARCHICAL_STRUCTURE.md` - Architecture documentation
- `admin-assignments.html` - Admin interface

### 2.2 Update Existing Files
Replace these EXISTING files with the updated versions:
- `dashboard.html` - Now includes RBAC module
- `facility-detail.html` - Now includes RBAC and access checks
- `project-detail.html` - Now includes RBAC and access checks
- `js/dashboard.js` - Now initializes RBAC and filters data
- `js/facility-detail.js` - Now checks facility access
- `js/project-detail.js` - Now checks project access

### 2.3 Verify Deployment
1. Open your site in a browser
2. Open browser console (F12)
3. Look for any 404 errors for missing files
4. Check that `rbac.js` loads successfully

## Step 3: Create Test Users (10 minutes)

### 3.1 Get Your User IDs
```sql
SELECT id, email, full_name, role FROM users ORDER BY created_at;
```
Copy the IDs - you'll need them for assignments.

### 3.2 Create Test Facility Manager
If you don't have a test user, create one in Supabase Auth:
1. Go to **Authentication > Users**
2. Click **Add user**
3. Email: `facility.manager@test.com`
4. Password: (set a test password)
5. Click **Create user**

Then update their role in the users table:
```sql
UPDATE users 
SET role = 'user', 
    full_name = 'Test Facility Manager'
WHERE email = 'facility.manager@test.com';
```

### 3.3 Create Test Project Manager
Same process as above, but:
- Email: `project.manager@test.com`
- Name: 'Test Project Manager'

## Step 4: Assign Managers to Facilities (5 minutes)

### 4.1 Via Admin Interface (Recommended)
1. Login as **admin** user
2. Navigate to **Yönetici Atamaları** in the sidebar
3. In the **Tesis Yöneticileri** tab:
   - Select a user from dropdown
   - Select a facility from dropdown
   - Choose role: "Tesis Yöneticisi"
   - Click **Ata** button
4. Verify the assignment appears in the list below

### 4.2 Via SQL (Alternative)
```sql
-- Get facility IDs
SELECT id, name, city FROM facilities;

-- Assign user to facility
INSERT INTO user_facility_roles (user_id, facility_id, role)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID
    'FACILITY_ID_HERE',  -- Replace with actual facility ID
    'facility_manager'
);
```

## Step 5: Assign Managers to Projects (5 minutes)

### 5.1 Via Admin Interface (Recommended)
1. Still logged in as admin
2. Click **Proje Yöneticileri** tab
3. Select user, project, and role
4. Click **Ata** button
5. Verify assignment appears

### 5.2 Via SQL (Alternative)
```sql
-- Get project IDs
SELECT id, name, status FROM projects;

-- Assign user to project
INSERT INTO user_project_roles (user_id, project_id, role)
VALUES (
    'USER_ID_HERE',  -- Replace with actual user ID
    'PROJECT_ID_HERE',  -- Replace with actual project ID
    'project_manager'
);
```

## Step 6: Test the System (20 minutes)

### Test 1: Admin Access (Should Pass)
1. **Login** as admin user
2. **Dashboard**: Should see ALL facilities and projects
3. **Tesisler**: Should see ALL facilities
4. **Click** any facility: Should access without error
5. **Projeler**: Should see ALL projects
6. **Click** any project: Should access without error
7. **Result**: ✅ Admin has full access

### Test 2: Facility Manager Access (Should Restrict)
1. **Logout** and login as facility manager test user
2. **Dashboard**: Should see ONLY assigned facility
3. **Tesisler**: Should see ONLY assigned facility
4. **Click** assigned facility: Should access successfully
5. **Manually** navigate to another facility (change URL ID): Should redirect with error "Bu tesise erişim yetkiniz yok!"
6. **Result**: ✅ Facility manager can only access assigned facility

### Test 3: Project Manager Access (Should Restrict)
1. **Logout** and login as project manager test user
2. **Dashboard**: Should see ONLY assigned project
3. **Projeler**: Should see ONLY assigned project
4. **Click** assigned project: Should access successfully
5. **Manually** navigate to another project (change URL ID): Should redirect with error "Bu projeye erişim yetkiniz yok!"
6. **Result**: ✅ Project manager can only access assigned project

### Test 4: Finance Manager Access (Should See All)
1. **Create** or **update** a user with role 'finance_manager'
2. **Login** as finance manager
3. **Dashboard**: Should see ALL facilities and projects
4. **Tesisler**: Should see ALL facilities with access
5. **Projeler**: Should see ALL projects with access
6. **Result**: ✅ Finance manager can view all entities

### Test 5: Data Isolation (Critical!)
1. **Login** as facility manager (assigned to Facility A)
2. **Navigate** to Facility A detail page
3. **Check** Personel tab: Should show ONLY Facility A personnel
4. **Check** Harcamalar tab: Should show ONLY Facility A expenses
5. **Check** Projeler tab: Should show ONLY Facility A projects
6. **Navigate** to dashboard
7. **Check** statistics: Should calculate based on Facility A data only
8. **Result**: ✅ Data is properly isolated

## Step 7: Verify Browser Console (Important!)

### What to Look For:
1. **No errors** in console when loading pages
2. **RBAC initialized** message should appear
3. **No 404** errors for missing files
4. **No RLS policy** errors from Supabase

### Common Console Messages (Normal):
```
RBAC initialized: {userRoles: ["facility_manager"], facilityCount: 1, projectCount: 0}
```

### Error Messages to Fix:
```
❌ "RBAC: No user logged in" - Check auth session
❌ "Bu tesise erişim yetkiniz yok!" - Check user_facility_roles
❌ "row-level security policy" - Check RLS policies in Supabase
```

## Step 8: Monitor & Debug (Ongoing)

### Check Audit Logs
```sql
SELECT 
    u.email,
    al.action,
    al.resource_type,
    al.created_at
FROM audit_log al
JOIN users u ON u.id = al.user_id
ORDER BY al.created_at DESC
LIMIT 20;
```

### Check User Assignments
```sql
-- Facility assignments
SELECT 
    u.full_name,
    f.name as facility,
    ufr.role
FROM user_facility_roles ufr
JOIN users u ON u.id = ufr.user_id
JOIN facilities f ON f.id = ufr.facility_id;

-- Project assignments
SELECT 
    u.full_name,
    p.name as project,
    upr.role
FROM user_project_roles upr
JOIN users u ON u.id = upr.user_id
JOIN projects p ON p.id = upr.project_id;
```

### Debug Permission Issues
```sql
-- Check if user has facility access
SELECT user_has_facility_access('FACILITY_ID_HERE');

-- Check if user has project access
SELECT user_has_project_access('PROJECT_ID_HERE');
```

## Troubleshooting

### Problem: User sees all facilities (should only see assigned)
**Diagnosis:**
```sql
-- Check user role
SELECT role FROM users WHERE id = 'USER_ID';
```
**Solution:** 
- If role is 'admin' or 'finance_manager', this is expected behavior
- If role is 'user' or 'facility_manager', check assignments in `user_facility_roles`

### Problem: "Bu tesise erişim yetkiniz yok!" for assigned facility
**Diagnosis:**
```sql
-- Check assignment exists
SELECT * FROM user_facility_roles 
WHERE user_id = 'USER_ID' AND facility_id = 'FACILITY_ID';
```
**Solution:**
- If no row exists, create assignment
- If row exists, check RLS policies are enabled

### Problem: RLS policy errors in console
**Diagnosis:**
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'user_facility_roles';
```
**Solution:**
- Re-run the schema SQL
- Ensure policies were created
- Check Supabase logs for policy errors

### Problem: Admin assignment link not showing
**Diagnosis:**
- Open browser console
- Check for JavaScript errors
**Solution:**
- Verify user role is 'admin' in database
- Check `dashboard.js` loaded correctly
- Clear browser cache

## Performance Optimization

### Index Verification
```sql
-- Should show indexes on key columns
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('user_facility_roles', 'user_project_roles');
```

### Query Performance
```sql
-- Test query speed
EXPLAIN ANALYZE
SELECT * FROM user_facility_roles 
WHERE user_id = 'USER_ID';
```

## Security Checklist

- [ ] RLS is enabled on all new tables
- [ ] RLS policies are correct and tested
- [ ] Admin interface is only accessible to admins
- [ ] No sensitive data in browser console (production)
- [ ] Audit logging is working
- [ ] Users can only see their assigned entities
- [ ] Data isolation is verified
- [ ] SQL injection prevention (via parameterized queries)

## Rollback Plan

If you need to rollback:

### 1. Disable RLS (Emergency Only!)
```sql
-- DO NOT DO THIS IN PRODUCTION unless emergency
ALTER TABLE user_facility_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_roles DISABLE ROW LEVEL SECURITY;
-- ... repeat for other tables
```

### 2. Remove Tables
```sql
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS project_team;
DROP TABLE IF EXISTS project_finance;
DROP TABLE IF EXISTS facility_finance;
DROP TABLE IF EXISTS user_project_roles;
DROP TABLE IF EXISTS user_facility_roles;
```

### 3. Revert Frontend Files
- Remove `rbac.js` script tags from HTML files
- Revert to previous versions of:
  - dashboard.html
  - dashboard.js
  - facility-detail.html
  - facility-detail.js
  - project-detail.html
  - project-detail.js

## Success Criteria

Your implementation is successful when:

1. ✅ All database tables created without errors
2. ✅ RLS policies are active and working
3. ✅ Admin can see and access everything
4. ✅ Facility manager can only see/access assigned facility
5. ✅ Project manager can only see/access assigned project
6. ✅ Finance manager can see all but with appropriate restrictions
7. ✅ Data is properly isolated (no cross-contamination)
8. ✅ Admin interface works for assigning managers
9. ✅ No JavaScript console errors
10. ✅ No Supabase RLS policy errors

## Next Steps

After successful implementation:

1. **Train users** on the new role-based system
2. **Assign real managers** to facilities and projects
3. **Monitor** audit logs for suspicious activity
4. **Test** edge cases with real data
5. **Document** your specific workflows
6. **Plan** for future enhancements

## Support

If you encounter issues:

1. Check **console logs** (browser F12)
2. Check **Supabase logs** in dashboard
3. Review **DATABASE_SETUP.md** for details
4. Review **HIERARCHICAL_STRUCTURE.md** for architecture
5. Check **audit_log** table for activity
6. Verify **RLS policies** are active

## Conclusion

You have successfully implemented:
- ✅ Hierarchical dashboard structure
- ✅ Role-based access control (RBAC)
- ✅ Data isolation between facilities and projects
- ✅ Secure, scalable architecture
- ✅ Admin tools for user management

The system now supports the requirement: **"a tesisine yönetici atadık bu kişi sadece a tesisine girip o tesisin işlemlerini yapabilmeli"**

🎉 Congratulations! Your NGO Management System is now properly organized with role-based access control!
