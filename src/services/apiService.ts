// API Service - Makes HTTP requests to the backend API
const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// Auth endpoints
export async function login(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(response);
}

// Team Members endpoints
export async function getTeamMembers() {
  const response = await fetch(`${API_BASE_URL}/team-members`);
  return handleResponse(response);
}

export async function createTeamMember(data: any) {
  const response = await fetch(`${API_BASE_URL}/team-members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateTeamMember(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteTeamMember(id: string) {
  const response = await fetch(`${API_BASE_URL}/team-members/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Projects endpoints
export async function getProjects() {
  const response = await fetch(`${API_BASE_URL}/projects`);
  return handleResponse(response);
}

export async function createProject(data: any) {
  const response = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateProject(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteProject(id: string) {
  const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Roles endpoints
export async function getRoles() {
  const response = await fetch(`${API_BASE_URL}/roles`);
  return handleResponse(response);
}

export async function createRole(data: any) {
  const response = await fetch(`${API_BASE_URL}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateRole(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteRole(id: string) {
  const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Allocations endpoints
export async function getAllocations() {
  const response = await fetch(`${API_BASE_URL}/allocations`);
  return handleResponse(response);
}

export async function createAllocation(data: any) {
  const response = await fetch(`${API_BASE_URL}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateAllocation(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/allocations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteAllocation(id: string) {
  const response = await fetch(`${API_BASE_URL}/allocations/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Admin Users endpoints
export async function getAdminUsers() {
  const response = await fetch(`${API_BASE_URL}/admin-users`);
  return handleResponse(response);
}

export async function createAdminUser(data: any) {
  const response = await fetch(`${API_BASE_URL}/admin-users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateAdminUser(id: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/admin-users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteAdminUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/admin-users/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
}

// Health check
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
}
