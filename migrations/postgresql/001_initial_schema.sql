-- =====================================================
-- JoulesLabs Project Tracker - PostgreSQL Migration
-- Complete Database Schema
-- =====================================================

-- Drop existing types if they exist
DROP TYPE IF EXISTS project_status CASCADE;
DROP TYPE IF EXISTS project_priority CASCADE;
DROP TYPE IF EXISTS admin_role CASCADE;

-- Create custom types
CREATE TYPE project_status AS ENUM ('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled');
CREATE TYPE project_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin', 'member');

-- =====================================================
-- Table: roles
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  department text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- Table: team_members
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  email text,
  department text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- Table: projects
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  client text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status project_status DEFAULT 'Planning',
  priority project_priority DEFAULT 'Medium',
  created_at timestamptz DEFAULT now()
);

-- Note: budget and logo columns removed as per latest schema

-- =====================================================
-- Table: allocations
-- =====================================================
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES team_members(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  employee_name text NOT NULL,
  project_name text NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  percentage numeric NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- Table: admin_users
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  role text DEFAULT 'member',
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Team Members indexes
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);

-- Allocations indexes
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project_id ON allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_month_year ON allocations(month, year);

-- Admin Users indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- =====================================================
-- Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for allocations updated_at
DROP TRIGGER IF EXISTS update_allocations_updated_at ON allocations;
CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Default Data
-- =====================================================

-- Insert default roles
INSERT INTO roles (name, department) VALUES
  ('Frontend Developer', 'Engineering'),
  ('Backend Developer', 'Engineering'),
  ('Full Stack Developer', 'Engineering'),
  ('UI/UX Designer', 'Design'),
  ('Project Manager', 'Product'),
  ('DevOps Engineer', 'Engineering'),
  ('QA Engineer', 'Engineering'),
  ('Data Analyst', 'Engineering'),
  ('Product Manager', 'Product'),
  ('Business Analyst', 'Product')
ON CONFLICT (name) DO NOTHING;

-- Insert default admin users
-- Note: In production, passwords should be properly hashed
INSERT INTO admin_users (username, password, role) VALUES
  ('superadmin', 'super123', 'super_admin'),
  ('admin', 'admin123', 'admin'),
  ('member', 'member123', 'member')
ON CONFLICT (username) DO NOTHING;

-- =====================================================
-- Grant Permissions (adjust based on your PostgreSQL user)
-- =====================================================

-- Grant all privileges to the database user
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jl_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO jl_user;
-- GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO jl_user;

-- =====================================================
-- Completion Message
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Database schema created successfully!';
  RAISE NOTICE '✅ Default roles inserted';
  RAISE NOTICE '✅ Default admin users created';
  RAISE NOTICE '📝 Next step: Run data migration from Supabase';
END $$;
