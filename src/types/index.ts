export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email?: string;
  department?: string;
  status?: 'active' | 'inactive';
  userId?: string;
  createdAt?: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client: string;
  startDate: string;
  endDate?: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  userId?: string;
  createdAt?: Date;
}

export interface Role {
  id: string;
  name: string;
  department?: string;
  createdAt?: Date;
}

export interface Allocation {
  id: string;
  userId: string;
  projectId: string;
  employeeName: string;
  projectName: string;
  month: string;
  year: number;
  percentage: number;
  projectStartDate?: string;
  projectEndDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FilterOptions {
  searchTerm: string;
  selectedMonth: string;
  selectedYear: string;
  selectedEmployee: string;
  selectedProject: string;
  selectedClient: string;
  selectedRole: string;
  selectedStatus: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface SummaryFilterOptions {
  viewType: 'monthly' | 'project' | 'member' | 'team';
  selectedMonth: string;
  selectedYear: string;
  selectedProject: string;
  selectedMember: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'member';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  createdBy?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  loading: boolean;
}