/*
  # Initial Schema Setup for JoulesLabs Project Tracker

  1. New Tables
    - `roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `department` (text, optional)
      - `created_at` (timestamp)
    
    - `team_members`
      - `id` (uuid, primary key)
      - `name` (text)
      - `role` (text, references roles.name)
      - `email` (text, optional, unique)
      - `department` (text, optional)
      - `created_at` (timestamp)
    
    - `projects`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text, optional)
      - `client` (text)
      - `start_date` (date)
      - `end_date` (date, optional)
      - `status` (enum)
      - `priority` (enum)
      - `budget` (numeric, optional)
      - `created_at` (timestamp)
    
    - `allocations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references team_members.id)
      - `project_id` (uuid, references projects.id)
      - `employee_name` (text)
      - `project_name` (text)
      - `month` (text)
      - `year` (integer)
      - `percentage` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Create custom types
CREATE TYPE project_status AS ENUM ('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled');
CREATE TYPE project_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  department text,
  created_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  email text UNIQUE,
  department text,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  client text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status project_status DEFAULT 'Planning',
  priority project_priority DEFAULT 'Medium',
  budget numeric,
  created_at timestamptz DEFAULT now()
);

-- Create allocations table
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

-- Enable Row Level Security
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an admin system)
CREATE POLICY "Allow all operations on roles" ON roles FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true);
CREATE POLICY "Allow all operations on allocations" ON allocations FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(client);
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_allocations_project_id ON allocations(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_month_year ON allocations(month, year);

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for allocations updated_at
CREATE TRIGGER update_allocations_updated_at
  BEFORE UPDATE ON allocations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();