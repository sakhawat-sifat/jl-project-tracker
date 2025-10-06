import { supabase } from '../lib/supabase';
import { TeamMember, Project, Allocation, Role } from '../types';

export const supabaseService = {
  // Team Members
  getTeamMembers: async (): Promise<TeamMember[]> => {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      email: member.email,
      department: member.department,
      status: member.status || 'active',
      createdAt: new Date(member.created_at)
    }));
  },

  addTeamMember: async (memberData: Omit<TeamMember, 'id' | 'createdAt'>): Promise<TeamMember> => {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: memberData.name,
        role: memberData.role,
        email: memberData.email,
        department: memberData.department,
        status: memberData.status || 'active'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email,
      department: data.department,
      status: data.status || 'active',
      createdAt: new Date(data.created_at)
    };
  },

  updateTeamMember: async (id: string, memberData: Omit<TeamMember, 'id' | 'createdAt'>): Promise<TeamMember> => {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: memberData.name,
        role: memberData.role,
        email: memberData.email,
        department: memberData.department,
        status: memberData.status || 'active'
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update allocations with new member name
    await supabase
      .from('allocations')
      .update({ employee_name: memberData.name })
      .eq('user_id', id);
    
    return {
      id: data.id,
      name: data.name,
      role: data.role,
      email: data.email,
      department: data.department,
      status: data.status || 'active',
      createdAt: new Date(data.created_at)
    };
  },

  deleteTeamMember: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Projects
  getProjects: async (): Promise<Project[]> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      client: project.client,
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      priority: project.priority,
      createdAt: new Date(project.created_at)
    }));
  },

  addProject: async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    console.log('supabaseService: addProject called with data:', projectData);
    
    // Validate required fields
    if (!projectData.name || !projectData.client || !projectData.startDate) {
      const missingFields = [];
      if (!projectData.name) missingFields.push('name');
      if (!projectData.client) missingFields.push('client');
      if (!projectData.startDate) missingFields.push('startDate');
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Prepare data for database insertion
    const insertData = {
      name: projectData.name,
      description: projectData.description || null,
      client: projectData.client,
      start_date: projectData.startDate,
      end_date: projectData.endDate || null,
      status: projectData.status || 'Planning',
      priority: projectData.priority || 'Medium'
    };
    
    console.log('supabaseService: Prepared insert data:', insertData);
    
    const { data, error } = await supabase
      .from('projects')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      console.error('supabaseService: Supabase insert error:', error);
      console.error('supabaseService: Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw new Error(`Failed to add project: ${error.message}`);
    }
    
    console.log('supabaseService: Project added successfully:', data);
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      client: data.client,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at)
    };
  },

  updateProject: async (id: string, projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const { data, error } = await supabase
      .from('projects')
      .update({
        name: projectData.name,
        description: projectData.description,
        client: projectData.client,
        start_date: projectData.startDate,
        end_date: projectData.endDate,
        status: projectData.status,
        priority: projectData.priority
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update allocations with new project name
    await supabase
      .from('allocations')
      .update({ project_name: projectData.name })
      .eq('project_id', id);
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      client: data.client,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      priority: data.priority,
      createdAt: new Date(data.created_at)
    };
  },

  deleteProject: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Roles
  getRoles: async (): Promise<Role[]> => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return data.map(role => ({
      id: role.id,
      name: role.name,
      department: role.department,
      createdAt: new Date(role.created_at)
    }));
  },

  addRole: async (roleData: Omit<Role, 'id' | 'createdAt'>): Promise<Role> => {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        name: roleData.name,
        department: roleData.department
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      department: data.department,
      createdAt: new Date(data.created_at)
    };
  },

  updateRole: async (id: string, roleData: Omit<Role, 'id' | 'createdAt'>): Promise<Role> => {
    // Get the old role name first
    const { data: oldRole } = await supabase
      .from('roles')
      .select('name')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('roles')
      .update({
        name: roleData.name,
        department: roleData.department
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Update team members with new role name if they had the old role
    if (oldRole) {
      await supabase
        .from('team_members')
        .update({ role: roleData.name })
        .eq('role', oldRole.name);
    }
    
    return {
      id: data.id,
      name: data.name,
      department: data.department,
      createdAt: new Date(data.created_at)
    };
  },

  deleteRole: async (id: string): Promise<void> => {
    // Check if any team members are using this role
    const { data: role } = await supabase
      .from('roles')
      .select('name')
      .eq('id', id)
      .single();
    
    if (role) {
      const { data: membersUsingRole } = await supabase
        .from('team_members')
        .select('id')
        .eq('role', role.name);
      
      if (membersUsingRole && membersUsingRole.length > 0) {
        throw new Error(`Cannot delete role "${role.name}" as it is being used by ${membersUsingRole.length} team member(s)`);
      }
    }
    
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Allocations
  getAllocations: async (): Promise<Allocation[]> => {
    const { data, error } = await supabase
      .from('allocations')
      .select('*')
      .order('year', { ascending: false })
      .order('month');
    
    if (error) throw error;
    
    return data.map(allocation => ({
      id: allocation.id,
      userId: allocation.user_id,
      projectId: allocation.project_id,
      employeeName: allocation.employee_name,
      projectName: allocation.project_name,
      month: allocation.month,
      year: allocation.year,
      percentage: allocation.percentage,
      createdAt: new Date(allocation.created_at),
      updatedAt: new Date(allocation.updated_at)
    }));
  },

  addAllocation: async (allocation: Omit<Allocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allocation> => {
    const { data, error } = await supabase
      .from('allocations')
      .insert({
        user_id: allocation.userId,
        project_id: allocation.projectId,
        employee_name: allocation.employeeName,
        project_name: allocation.projectName,
        month: allocation.month,
        year: allocation.year,
        percentage: allocation.percentage
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      employeeName: data.employee_name,
      projectName: data.project_name,
      month: data.month,
      year: data.year,
      percentage: data.percentage,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  updateAllocation: async (id: string, allocation: Omit<Allocation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allocation> => {
    const { data, error } = await supabase
      .from('allocations')
      .update({
        user_id: allocation.userId,
        project_id: allocation.projectId,
        employee_name: allocation.employeeName,
        project_name: allocation.projectName,
        month: allocation.month,
        year: allocation.year,
        percentage: allocation.percentage
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      employeeName: data.employee_name,
      projectName: data.project_name,
      month: data.month,
      year: data.year,
      percentage: data.percentage,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  deleteAllocation: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('allocations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Admin Users Management
  getAdminUsers: async (): Promise<any[]> => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.is_active,
      lastLogin: user.last_login ? new Date(user.last_login) : undefined,
      createdAt: new Date(user.created_at),
      createdBy: user.created_by
    }));
  },

  loginAdminUser: async (username: string, password: string): Promise<any> => {
    // Fetch user by username
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();
    
    if (error || !data) {
      throw new Error('Invalid username or password');
    }

    // Verify password using btoa encoding
    let passwordValid = false;
    try {
      const storedPassword = atob(data.password_hash);
      passwordValid = storedPassword === password;
    } catch (e) {
      // If decoding fails, password is invalid
      passwordValid = false;
    }
    
    if (!passwordValid) {
      throw new Error('Invalid username or password');
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', data.id);

    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      isActive: data.is_active,
      lastLogin: new Date(),
      createdAt: new Date(data.created_at),
      createdBy: data.created_by
    };
  },

  addAdminUser: async (userData: { username: string; email: string; role: string; isActive: boolean }, password: string): Promise<any> => {
    // For now, we'll store a simple hash (in production, use proper password hashing)
    const passwordHash = btoa(password); // Basic encoding for demo
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username: userData.username,
        email: userData.email,
        password_hash: passwordHash,
        role: userData.role,
        is_active: userData.isActive
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      isActive: data.is_active,
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by
    };
  },

  updateAdminUser: async (userId: string, updates: { username?: string; email?: string; role?: string; isActive?: boolean }): Promise<any> => {
    const updateData: any = {};
    
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    
    const { data, error } = await supabase
      .from('admin_users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      role: data.role,
      isActive: data.is_active,
      lastLogin: data.last_login ? new Date(data.last_login) : undefined,
      createdAt: new Date(data.created_at),
      createdBy: data.created_by
    };
  },

  deleteAdminUser: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  },

  changeAdminPassword: async (userId: string, newPassword: string): Promise<void> => {
    const passwordHash = btoa(newPassword); // Basic encoding for demo
    
    const { error } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);
    
    if (error) throw error;
  }
};