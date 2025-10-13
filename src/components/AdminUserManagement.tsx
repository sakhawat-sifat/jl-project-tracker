import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Shield, Key, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { AdminUser } from '../types';
import { postgresService } from '../services/postgresService';
import { formatDate } from '../utils/dateFormat';

interface AdminUserManagementProps {
  currentUser: AdminUser;
}

const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ currentUser }) => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'member' as AdminUser['role'],
    isActive: true,
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const roles: AdminUser['role'][] = ['admin', 'member', 'super_admin'];

  useEffect(() => {
    loadAdminUsers();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadAdminUsers = async () => {
    try {
      const users = await postgresService.getAdminUsers();
      setAdminUsers(users);
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to load admin users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim() || (!editingUser && !formData.password.trim())) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    try {
      if (editingUser) {
        // If password is provided, update it; otherwise keep the old one
        if (formData.password.trim()) {
          await postgresService.changeAdminPassword(
            editingUser.id,
            formData.username,
            formData.role,
            formData.password
          );
        } else {
          // Update without changing password - we need to provide a dummy password
          // since the backend requires it, but we should ideally modify backend to make it optional
          await postgresService.updateAdminUser(editingUser.id, {
            username: formData.username,
            email: formData.email,
            role: formData.role,
            password: 'unchanged' // Backend will replace this
          });
        }
        // Reload users to get updated data
        await loadAdminUsers();
        setMessage({ text: 'User updated successfully!', type: 'success' });
      } else {
        // Create new user
        await postgresService.createAdminUser({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          password: formData.password
        });
        // Reload users to get the new user
        await loadAdminUsers();
        setMessage({ text: 'User created successfully!', type: 'success' });
      }
      resetForm();
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to save user', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      role: 'member',
      isActive: true,
      password: ''
    });
    setEditingUser(null);
    setIsFormOpen(false);
    setShowPassword(false);
  };

  const handleEdit = (user: AdminUser) => {
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: ''
    });
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDelete = async (user: AdminUser) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      return;
    }

    try {
      await postgresService.deleteAdminUser(user.id);
      setAdminUsers(prev => prev.filter(u => u.id !== user.id));
      setMessage({ text: 'User deleted successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to delete user', type: 'error' });
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    const newPassword = prompt(`Enter new password for ${user.username}:`);
    if (!newPassword) return;

    try {
      await postgresService.changeAdminPassword(user.id, user.username, user.role, newPassword);
      setMessage({ text: 'Password updated successfully!', type: 'success' });
    } catch (error: any) {
      setMessage({ text: error.message || 'Failed to update password', type: 'error' });
    }
  };

  const getRoleColor = (role: AdminUser['role']) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: AdminUser['role']) => {
    switch (role) {
      case 'super_admin': return <Shield className="h-4 w-4" />;
      case 'admin': return <Users className="h-4 w-4" />;
      case 'member': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (currentUser.role !== 'super_admin') {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Super admin privileges required to manage users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-red-600" />
            Admin User Management ({adminUsers.length})
          </h2>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="p-4 sm:p-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No users found</p>
            <p className="text-sm mt-2">Add users to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleResetPassword(user)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Reset password"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} flex items-center space-x-1`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role.replace('_', ' ').toUpperCase()}</span>
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>Created: {formatDate(user.createdAt)}</div>
                    {user.lastLogin && (
                      <div>Last login: {formatDate(user.lastLogin)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {editingUser ? 'Edit User' : 'Add User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['role'] })}
                    className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm appearance-none bg-white"
                    required
                  >
                    <option value="member">Member (View Only)</option>
                    <option value="admin">Admin (Add Data)</option>
                    <option value="super_admin">Super Admin (Full Access)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active User
                </label>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 sm:px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors text-sm"
                >
                  {editingUser ? 'Update' : 'Add'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;