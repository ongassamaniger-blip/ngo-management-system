# Hierarchical Dashboard Structure

## Overview
This document explains the hierarchical organization of the NGO Management System, implementing a clear separation between global operations and entity-specific operations.

## System Architecture

### Hierarchy Levels

```
┌─────────────────────────────────────────────────────────┐
│              Level 1: Main Dashboard                     │
│  (Global view - All STK summary information)            │
│  - Finans (Global Finance)                              │
│  - Tesisler (All Facilities)                            │
│  - Projeler (All Projects)                              │
│  - Kurban (Sacrifice Management)                        │
│  - Personel (All Personnel)                             │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────┴────────────────┐
       │                                │
       ▼                                ▼
┌──────────────────┐          ┌──────────────────┐
│  Level 2:        │          │  Level 2:        │
│  Facility Detail │          │  Project Detail  │
│  (Isolated)      │          │  (Isolated)      │
├──────────────────┤          ├──────────────────┤
│ • Finans         │          │ • Finans         │
│ • Personel       │          │ • Ekip           │
│ • Harcamalar     │          │ • Bütçe          │
│ • Projeler       │          │ • Görevler       │
│ • Etkinlikler    │          │ • Milestone      │
│ • Raporlar       │          │ • Riskler        │
│ • Ayarlar        │          │ • Dosyalar       │
└──────────────────┘          └──────────────────┘
```

## Level 1: Main Dashboard (Global View)

### Purpose
Provides a comprehensive overview of ALL NGO operations and resources.

### Pages & Sections

#### 1. Dashboard (Home)
- **Purpose**: Global summary and key metrics
- **Shows**:
  - Total income across all facilities and projects
  - Total expenses across all facilities and projects
  - Global balance
  - Total facilities count
  - Active projects count
  - Personnel statistics
- **Access**: 
  - Admin: Full access
  - Finance Manager: Full access
  - Others: Only assigned entities

#### 2. Finans (Global Finance)
- **Purpose**: Manage all financial transactions
- **Shows**:
  - All income transactions (from all sources)
  - All expense transactions (across all entities)
  - Global budget analysis
  - Approval workflows
- **Features**:
  - Filter by facility or project
  - Comprehensive reporting
  - Export capabilities
- **Access**: 
  - Admin: All transactions
  - Finance Manager: All transactions
  - Facility Manager: Only their facility's transactions
  - Project Manager: Only their project's transactions

#### 3. Tesisler (Facilities)
- **Purpose**: Manage all facilities
- **Shows**:
  - List of all facilities (filtered by access)
  - Facility summary cards
  - Quick statistics
- **Actions**:
  - Create new facility
  - View facility details (redirects to Level 2)
  - Edit facility
  - Delete facility (admin only)
- **Access**:
  - Admin: All facilities
  - Finance Manager: All facilities
  - Facility Manager: Only assigned facilities
  - Others: Only assigned facilities

#### 4. Projeler (Projects)
- **Purpose**: Manage all projects
- **Shows**:
  - List of all projects (filtered by access)
  - Project status and progress
  - Budget usage
- **Actions**:
  - Create new project
  - View project details (redirects to Level 2)
  - Edit project
  - Complete/archive project
- **Access**:
  - Admin: All projects
  - Finance Manager: All projects
  - Project Manager: Only assigned projects
  - Others: Only assigned projects

#### 5. Kurban (Sacrifice Management)
- **Purpose**: Manage sacrifice donations and operations
- **Shows**:
  - All sacrifice registrations
  - Payment statuses
  - Cutting schedules
- **Access**:
  - Admin: Full access
  - Finance Manager: Full access
  - Others: View only

#### 6. Personel (Global Personnel)
- **Purpose**: Manage all personnel across organization
- **Shows**:
  - All personnel records
  - Salary information
  - Position tracking
- **Access**:
  - Admin: Full access
  - Personnel Manager: Full access
  - Facility Manager: Only their facility's personnel
  - Project Manager: Only their project team

## Level 2: Facility Detail Page (Isolated View)

### Purpose
Provides complete, isolated management interface for a SINGLE facility.

### URL Pattern
```
facility-detail.html?id={facility_id}
```

### Access Control
- **Allowed**:
  - Admin (all facilities)
  - Finance Manager (all facilities)
  - Assigned Facility Manager (only their facility)
- **Blocked**:
  - Users not assigned to the facility
  - Error message: "Bu tesise erişim yetkiniz yok!"
  - Redirects to main dashboard

### Tabs & Features

#### 1. Genel Bilgiler (General Information)
- Facility details (code, category, date, area, capacity)
- Budget usage for THIS facility only
- Monthly expense trend for THIS facility
- Financial status

#### 2. Personel (Personnel)
- Personnel assigned to THIS facility
- Filter by department
- Add/edit personnel for THIS facility
- Performance indicators

#### 3. Faydalanıcılar (Beneficiaries)
- Beneficiaries served by THIS facility
- Demographics and statistics
- Service types

#### 4. Harcamalar (Expenses)
- Expenses for THIS facility only
- Category distribution
- Advanced filtering
- Export options

#### 5. Projeler (Projects)
- Projects associated with THIS facility
- Project progress
- Budget allocation to projects

#### 6. Etkinlikler (Events & Calendar)
- Events held at THIS facility
- Calendar view
- Event management

#### 7. Raporlar (Reports)
- Reports specific to THIS facility
- Performance metrics
- Budget analysis
- Export to PDF

#### 8. Ayarlar (Settings)
- Facility information editing
- Photo/logo upload
- Notification preferences
- Facility history

### Data Isolation Rules
1. **Finance**: Only show transactions where `facility_id = current_facility`
2. **Personnel**: Only show personnel where `facility_id = current_facility`
3. **Projects**: Only show projects where `facility_id = current_facility`
4. **Statistics**: Calculate based on facility-specific data only

## Level 2: Project Detail Page (Isolated View)

### Purpose
Provides complete, isolated management interface for a SINGLE project.

### URL Pattern
```
project-detail.html?id={project_id}
```

### Access Control
- **Allowed**:
  - Admin (all projects)
  - Finance Manager (all projects)
  - Assigned Project Manager (only their project)
- **Blocked**:
  - Users not assigned to the project
  - Error message: "Bu projeye erişim yetkiniz yok!"
  - Redirects to main dashboard

### Tabs & Features

#### 1. Genel Bakış (Overview)
- Project information
- Timeline and milestones
- Recent activities
- Budget summary for THIS project only

#### 2. Görevler (Tasks)
- Task list for THIS project
- Gantt chart view
- Task assignment
- Progress tracking

#### 3. Ekip (Team)
- Team members for THIS project
- Role assignments
- Contact information
- Workload distribution

#### 4. Bütçe (Budget)
- Budget for THIS project only
- Category distribution
- Expense tracking
- Budget vs actual comparison

#### 5. Milestone
- Project milestones
- Completion status
- Timeline view
- Progress indicators

#### 6. Riskler (Risks)
- Risk assessment for THIS project
- Mitigation plans
- Risk tracking

#### 7. Dosyalar (Files)
- Project documents
- Photos and media
- Reports and presentations
- File upload/download

### Data Isolation Rules
1. **Finance**: Only show transactions where `project_id = current_project`
2. **Team**: Only show team members where `project_id = current_project`
3. **Tasks**: Only show tasks where `project_id = current_project`
4. **Statistics**: Calculate based on project-specific data only

## Role-Based Access Scenarios

### Scenario 1: Admin User
```
Login as Admin
├─ Dashboard → See ALL facilities, projects, finance
├─ Tesisler → See ALL facilities
│   └─ Facility A Detail → Full access
│   └─ Facility B Detail → Full access
├─ Projeler → See ALL projects
│   └─ Project X Detail → Full access
│   └─ Project Y Detail → Full access
└─ Can assign managers to facilities and projects
```

### Scenario 2: Facility Manager
```
Login as Facility Manager (assigned to Facility A)
├─ Dashboard → See only Facility A statistics
├─ Tesisler → See only Facility A
│   └─ Facility A Detail → Full access
│   └─ Facility B Detail → ❌ Access Denied
├─ Projeler → See only projects related to Facility A
│   └─ Project X (Facility A) → View access
│   └─ Project Y (Facility B) → ❌ Access Denied
└─ Can manage Facility A: finance, personnel, events
```

### Scenario 3: Project Manager
```
Login as Project Manager (assigned to Project X)
├─ Dashboard → See only Project X statistics
├─ Tesisler → See only facilities related to Project X
│   └─ Facility A (Project X location) → View access only
├─ Projeler → See only Project X
│   └─ Project X Detail → Full access
│   └─ Project Y Detail → ❌ Access Denied
└─ Can manage Project X: tasks, team, budget, risks
```

### Scenario 4: Finance Manager
```
Login as Finance Manager
├─ Dashboard → See ALL finance statistics
├─ Tesisler → See ALL facilities
│   └─ Any Facility Detail → View finance, approve transactions
├─ Projeler → See ALL projects
│   └─ Any Project Detail → View finance, approve budgets
└─ Can view and approve all financial transactions
```

## Implementation Details

### Database Tables for RBAC

#### user_facility_roles
```sql
- user_id (references users)
- facility_id (references facilities)
- role (facility_manager | facility_viewer)
- assigned_at
```

#### user_project_roles
```sql
- user_id (references users)
- project_id (references projects)
- role (project_manager | project_viewer | team_member)
- assigned_at
```

#### facility_finance
```sql
- facility_id (references facilities)
- type (income | expense)
- amount
- category
- status
- created_by
```

#### project_finance
```sql
- project_id (references projects)
- type (income | expense)
- amount
- category
- status
- created_by
```

### JavaScript RBAC Module

The `rbac.js` module provides:

1. **Permission Checking**
   ```javascript
   RBACModule.hasPermission('view_facility', { facilityId: 'xxx' })
   ```

2. **Access Validation**
   ```javascript
   RBACModule.hasAccessToFacility(facilityId)
   RBACModule.hasAccessToProject(projectId)
   ```

3. **Data Filtering**
   ```javascript
   RBACModule.filterByAccess(facilities, 'facility')
   RBACModule.filterByAccess(projects, 'project')
   ```

4. **Role Checking**
   ```javascript
   RBACModule.isAdmin()
   RBACModule.canViewAllFacilities()
   RBACModule.canViewAllProjects()
   ```

## Benefits of This Structure

### 1. Clear Separation of Concerns
- Global operations vs. entity-specific operations
- No mixing of data between facilities or projects
- Clean data boundaries

### 2. Security
- Users can only see data they have access to
- Database-level RLS policies enforce security
- Audit trail of all actions

### 3. Scalability
- Easy to add new facilities or projects
- Easy to assign managers
- No impact on other entities

### 4. User Experience
- Managers focus on their area of responsibility
- No confusion about which data belongs where
- Clear navigation hierarchy

### 5. Maintainability
- Changes to one facility don't affect others
- Changes to one project don't affect others
- Easier to debug and test

## Migration Guide

### From Old System to New System

1. **Database Setup**
   - Run `database-schema.sql` in Supabase SQL Editor
   - Verify all tables created successfully
   - Check RLS policies are active

2. **Assign Managers**
   - Identify facility managers
   - Insert records into `user_facility_roles`
   - Identify project managers
   - Insert records into `user_project_roles`

3. **Test Access**
   - Login as different users
   - Verify each user sees only their assigned entities
   - Check admin sees everything
   - Verify redirects work for unauthorized access

4. **Deploy**
   - Deploy updated HTML files
   - Deploy updated JavaScript files
   - Monitor for errors
   - Check audit logs

## Troubleshooting

### Issue: User sees no facilities
**Cause**: User not assigned to any facility
**Solution**: Add record to `user_facility_roles`

### Issue: User sees all facilities (should only see assigned)
**Cause**: User has admin or finance_manager role
**Solution**: Verify this is intentional, or change user role

### Issue: Access denied when user should have access
**Cause**: Missing role assignment or RLS policy issue
**Solution**: Check `user_facility_roles` or `user_project_roles` tables

### Issue: Data showing from multiple facilities in detail page
**Cause**: Queries not filtering by facility_id
**Solution**: Verify all queries include `facility_id = current_facility.id`

## Future Enhancements

1. **Multi-role support**: Allow users to have multiple roles
2. **Temporary access**: Grant time-limited access to entities
3. **Delegation**: Allow managers to temporarily delegate access
4. **Advanced permissions**: More granular permission levels
5. **Activity dashboard**: Show real-time activity across accessible entities

## Conclusion

This hierarchical structure ensures:
- ✅ Clear data boundaries between facilities and projects
- ✅ Secure, role-based access control
- ✅ Isolated management interfaces
- ✅ No accidental cross-contamination of data
- ✅ Scalable architecture for growth
- ✅ Better user experience for managers

The system now properly supports the requirement:
> "a tesisine yönetici atadık bu kişi sadece a tesisine girip o tesisin işlemlerini yapabilmeli yada nijer su kuyusuna bir yönetici atadığımız zaman bu kişi sadece bu projeyi yöenetbilmeli"

(Translation: "We assigned a manager to facility A, this person should only be able to enter facility A and perform operations for that facility, or when we assign a manager to the Niger water well project, this person should only be able to manage this project")
