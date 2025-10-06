import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, Search, ChevronDown } from 'lucide-react';
import { Role, TeamMember } from '../types';
import MembersListModal from './MembersListModal';

interface RoleManagementProps {
  roles: Role[];
  teamMembers: TeamMember[];
  onAddRole: (roleData: Omit<Role, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateRole: (id: string, roleData: Omit<Role, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteRole: (id: string) => void;
  isGuest?: boolean;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  roles,
  teamMembers,
  onAddRole,
  onUpdateRole,
  onDeleteRole,
  isGuest = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedRoleMembers, setSelectedRoleMembers] = useState<TeamMember[]>([]);
  const [selectedRoleName, setSelectedRoleName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    department: ''
  });

  const departments = ['Engineering', 'Design', 'Product', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance'];
  const uniqueDepartments = Array.from(new Set(roles.map(r => r.department).filter(Boolean))).sort();

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || role.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingRole) {
        await onUpdateRole(editingRole.id, formData);
      } else {
        await onAddRole(formData);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving role:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', department: '' });
    setEditingRole(null);
    setIsFormOpen(false);
  };

  const handleEdit = (role: Role) => {
    setFormData({
      name: role.name,
      department: role.department || ''
    });
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleShowMembers = (role: Role) => {
    // Find all team members with this role
    const members = teamMembers.filter(member => member.role === role.name);
    
    setSelectedRoleMembers(members);
    setSelectedRoleName(role.name);
    setShowMembersModal(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Settings className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-purple-600" />
            Role Management ({roles.length})
          </h2>
          {!isGuest && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Role</span>
            </button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm appearance-none bg-white"
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

      {/* Roles List */}
      <div className="p-4 sm:p-6">
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Settings className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No roles found</p>
            <p className="text-sm mt-2">Add roles to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRoles.map((role) => (
              <div key={role.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center cursor-pointer" onClick={() => handleShowMembers(role)} title="Click to view team members">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm hover:text-purple-600 transition-colors">{role.name}</h3>
                      {role.department && (
                        <p className="text-xs text-purple-600">{role.department}</p>
                      )}
                    </div>
                  </div>
                  {!isGuest && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(role)}
                        className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteRole(role.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && !isGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              {editingRole ? 'Edit Role' : 'Add Role'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <div className="relative">
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm appearance-none bg-white"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
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
                  className="px-3 sm:px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors text-sm"
                >
                  {editingRole ? 'Update' : 'Add'} Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members List Modal */}
      <MembersListModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={`Team Members - ${selectedRoleName}`}
        members={selectedRoleMembers}
        emptyMessage="No team members with this role yet"
      />
    </div>
  );
};

export default RoleManagement;