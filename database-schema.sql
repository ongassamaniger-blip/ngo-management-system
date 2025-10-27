-- ==================== DATABASE SCHEMA FOR ROLE-BASED ACCESS CONTROL ====================
-- This file contains SQL schema for hierarchical organization and role-based access

-- Table: user_facility_roles
-- Purpose: Assign facility managers to specific facilities
CREATE TABLE IF NOT EXISTS user_facility_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'facility_manager' CHECK (role IN ('facility_manager', 'facility_viewer')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, facility_id)
);

-- Table: user_project_roles
-- Purpose: Assign project managers to specific projects
CREATE TABLE IF NOT EXISTS user_project_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'project_manager' CHECK (role IN ('project_manager', 'project_viewer', 'project_team_member')),
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, project_id)
);

-- Table: facility_finance
-- Purpose: Track facility-specific finance (isolated from global finance)
CREATE TABLE IF NOT EXISTS facility_finance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    approved_by UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: project_finance
-- Purpose: Track project-specific finance (isolated from global finance)
CREATE TABLE IF NOT EXISTS project_finance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    approved_by UUID REFERENCES auth.users(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: project_team
-- Purpose: Track project team members (isolated from global personnel)
CREATE TABLE IF NOT EXISTS project_team (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    personnel_id UUID REFERENCES personnel(id),
    role TEXT NOT NULL,
    responsibilities TEXT,
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id),
    UNIQUE(project_id, personnel_id)
);

-- Table: audit_log
-- Purpose: Track all role-based actions for security and compliance
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    facility_id UUID REFERENCES facilities(id),
    project_id UUID REFERENCES projects(id),
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_facility_roles_user ON user_facility_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_facility_roles_facility ON user_facility_roles(facility_id);
CREATE INDEX IF NOT EXISTS idx_user_project_roles_user ON user_project_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_project_roles_project ON user_project_roles(project_id);
CREATE INDEX IF NOT EXISTS idx_facility_finance_facility ON facility_finance(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_finance_date ON facility_finance(transaction_date);
CREATE INDEX IF NOT EXISTS idx_project_finance_project ON project_finance(project_id);
CREATE INDEX IF NOT EXISTS idx_project_finance_date ON project_finance(transaction_date);
CREATE INDEX IF NOT EXISTS idx_project_team_project ON project_team(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_resource ON audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE user_facility_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_project_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_finance ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_facility_roles
CREATE POLICY "Users can view their own facility assignments" ON user_facility_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all facility assignments" ON user_facility_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for user_project_roles
CREATE POLICY "Users can view their own project assignments" ON user_project_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all project assignments" ON user_project_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for facility_finance
CREATE POLICY "Users can view facility finance if they have access" ON facility_finance
    FOR SELECT USING (
        -- Admin or finance manager can see all
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_manager')
        )
        OR
        -- Facility manager can see their facility's finance
        EXISTS (
            SELECT 1 FROM user_facility_roles 
            WHERE user_id = auth.uid() AND facility_id = facility_finance.facility_id
        )
    );

CREATE POLICY "Users can create facility finance if they have access" ON facility_finance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_manager')
        )
        OR
        EXISTS (
            SELECT 1 FROM user_facility_roles 
            WHERE user_id = auth.uid() AND facility_id = facility_finance.facility_id
        )
    );

-- RLS Policies for project_finance
CREATE POLICY "Users can view project finance if they have access" ON project_finance
    FOR SELECT USING (
        -- Admin or finance manager can see all
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_manager')
        )
        OR
        -- Project manager can see their project's finance
        EXISTS (
            SELECT 1 FROM user_project_roles 
            WHERE user_id = auth.uid() AND project_id = project_finance.project_id
        )
    );

CREATE POLICY "Users can create project finance if they have access" ON project_finance
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_manager')
        )
        OR
        EXISTS (
            SELECT 1 FROM user_project_roles 
            WHERE user_id = auth.uid() AND project_id = project_finance.project_id
        )
    );

-- RLS Policies for project_team
CREATE POLICY "Users can view project team if they have access" ON project_team
    FOR SELECT USING (
        -- Admin can see all
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
        OR
        -- Project manager can see their project's team
        EXISTS (
            SELECT 1 FROM user_project_roles 
            WHERE user_id = auth.uid() AND project_id = project_team.project_id
        )
        OR
        -- Team members can see their own project team
        auth.uid() = user_id
    );

-- RLS Policies for audit_log
CREATE POLICY "Users can view their own audit logs" ON audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all audit logs" ON audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Functions

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action TEXT,
    p_resource_type TEXT,
    p_resource_id UUID DEFAULT NULL,
    p_facility_id UUID DEFAULT NULL,
    p_project_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO audit_log (
        user_id,
        action,
        resource_type,
        resource_id,
        facility_id,
        project_id,
        details
    ) VALUES (
        auth.uid(),
        p_action,
        p_resource_type,
        p_resource_id,
        p_facility_id,
        p_project_id,
        p_details
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to facility
CREATE OR REPLACE FUNCTION user_has_facility_access(p_facility_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_manager')
    ) OR EXISTS (
        SELECT 1 FROM user_facility_roles 
        WHERE user_id = auth.uid() AND facility_id = p_facility_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has access to project
CREATE OR REPLACE FUNCTION user_has_project_access(p_project_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'finance_manager')
    ) OR EXISTS (
        SELECT 1 FROM user_project_roles 
        WHERE user_id = auth.uid() AND project_id = p_project_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_facility_finance_updated_at BEFORE UPDATE ON facility_finance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_finance_updated_at BEFORE UPDATE ON project_finance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Note: Replace UUIDs with actual values from your database

-- Example: Assign a facility manager to a facility
-- INSERT INTO user_facility_roles (user_id, facility_id, role, assigned_by)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001', -- user_id
--     '00000000-0000-0000-0000-000000000002', -- facility_id
--     'facility_manager',
--     auth.uid()
-- );

-- Example: Assign a project manager to a project
-- INSERT INTO user_project_roles (user_id, project_id, role, assigned_by)
-- VALUES (
--     '00000000-0000-0000-0000-000000000001', -- user_id
--     '00000000-0000-0000-0000-000000000003', -- project_id
--     'project_manager',
--     auth.uid()
-- );
