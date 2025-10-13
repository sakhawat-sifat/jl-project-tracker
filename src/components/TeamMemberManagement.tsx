import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Search, Filter, ChevronDown } from 'lucide-react';
import { TeamMember, Role } from '../types';

interface TeamMemberManagementProps {
  teamMembers: TeamMember[];
  roles: Role[];
  onAddMember: (memberData: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateMember: (id: string, memberData: Omit<TeamMember, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteMember: (id: string) => void;
  isGuest?: boolean;
}

const TeamMemberManagement: React.FC<TeamMemberManagementProps> = ({
  teamMembers,
  roles,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
  isGuest = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    status: 'active' as 'active' | 'inactive'
  });

  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'].sort((a, b) => a.localeCompare(b));
  const uniqueRoles = Array.from(new Set(roles.map(r => r.name))).sort((a, b) => a.localeCompare(b));
  const uniqueDepartments = Array.from(new Set(teamMembers.map(m => m.department).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || member.role === roleFilter;
    const matchesDepartment = !departmentFilter || member.department === departmentFilter;
    
    return matchesSearch && matchesRole && matchesDepartment;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) return;

    try {
      if (editingMember) {
        await onUpdateMember(editingMember.id, formData);
      } else {
        await onAddMember(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving team member:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', role: '', email: '', department: '', status: 'active' });
    setEditingMember(null);
    setIsFormOpen(false);
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email || '',
      department: member.department || '',
      status: member.status || 'active'
    });
    setEditingMember(member);
    setIsFormOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-indigo-600" />
            Team Management ({teamMembers.length})
          </h2>
          {!isGuest && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-indigo-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Team Members List */}
      <div className="p-4 sm:p-6">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No team members found</p>
            <p className="text-sm mt-2">Add team members to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className={`bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow ${member.status === 'inactive' ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center flex-1">
                    <div className={`w-10 h-10 ${member.status === 'inactive' ? 'bg-gray-400' : 'bg-indigo-500'} rounded-full flex items-center justify-center text-white font-medium mr-3`}>
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                        {member.status === 'inactive' && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-xs text-indigo-600">{member.role}</p>
                    </div>
                  </div>
                  {!isGuest && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(member)}
                        className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteMember(member.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                {member.email && (
                  <p className="text-xs text-gray-600 mb-1">{member.email}</p>
                )}
                {member.department && (
                  <p className="text-xs text-gray-500">{member.department}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && !isGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {editingMember ? 'Edit Team Member' : 'Add Team Member'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <div className="relative">
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
                    required
                  >
                    <option value="">Select Role</option>
                    {uniqueRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {editingMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
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
                  className="px-3 sm:px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors text-sm"
                >
                  {editingMember ? 'Update' : 'Add'} Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberManagement;