// PostgreSQL Service - Makes API calls to the backend server
const API_URL = 'http://localhost:3001/api';

async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const postgresService = {
  async getTeamMembers() {
    return apiCall('/team-members');
  },

  async createTeamMember(member: any) {
    return apiCall('/team-members', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  },

  async updateTeamMember(id: string, member: any) {
    return apiCall(`/team-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  },

  async deleteTeamMember(id: string) {
    return apiCall(`/team-members/${id}`, {
      method: 'DELETE',
    });
  },

  async getProjects() {
    return apiCall('/projects');
  },

  async createProject(project: any) {
    return apiCall('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  },

  async updateProject(id: string, project: any) {
    return apiCall(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });
  },

  async deleteProject(id: string) {
    return apiCall(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async getRoles() {
    return apiCall('/roles');
  },

  async createRole(role: any) {
    return apiCall('/roles', {
      method: 'POST',
      body: JSON.stringify(role),
    });
  },

  async updateRole(id: string, role: any) {
    return apiCall(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(role),
    });
  },

  async deleteRole(id: string) {
    return apiCall(`/roles/${id}`, {
      method: 'DELETE',
    });
  },

  async getAllocations() {
    return apiCall('/allocations');
  },

  async createAllocation(allocation: any) {
    return apiCall('/allocations', {
      method: 'POST',
      body: JSON.stringify(allocation),
    });
  },

  async updateAllocation(id: string, allocation: any) {
    return apiCall(`/allocations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(allocation),
    });
  },

  async deleteAllocation(id: string) {
    return apiCall(`/allocations/${id}`, {
      method: 'DELETE',
    });
  },

  async getAdminUsers() {
    return apiCall('/admin-users');
  },

  async login(username: string, password: string) {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  async createAdminUser(user: any) {
    return apiCall('/admin-users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  },

  async updateAdminUser(id: string, user: any) {
    return apiCall(`/admin-users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  },

  async deleteAdminUser(id: string) {
    return apiCall(`/admin-users/${id}`, {
      method: 'DELETE',
    });
  },

  async changeAdminPassword(id: string, username: string, role: string, password: string) {
    return apiCall(`/admin-users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ username, password, role }),
    });
  },

  async checkHealth() {
    return apiCall('/health');
  },
};
