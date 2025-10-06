import React, { useState } from 'react';
import { FolderOpen, Plus, Edit, Trash2, Search, Calendar, AlertCircle, X, ChevronDown } from 'lucide-react';
import { Project, TeamMember, Allocation } from '../types';
import { formatDate } from '../utils/dateFormat';
import MembersListModal from './MembersListModal';

interface ProjectManagementProps {
  projects: Project[];
  teamMembers: TeamMember[];
  allocations: Allocation[];
  onAddProject: (projectData: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateProject: (id: string, projectData: Omit<Project, 'id' | 'createdAt'>) => Promise<void>;
  onDeleteProject: (id: string) => void;
  isGuest?: boolean;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  projects,
  teamMembers,
  allocations,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  isGuest = false
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedProjectMembers, setSelectedProjectMembers] = useState<TeamMember[]>([]);
  const [selectedProjectName, setSelectedProjectName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    startDate: '',
    endDate: '',
    status: 'Planning' as Project['status'],
    priority: 'Medium' as Project['priority']
  });

  const statuses: Project['status'][] = ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'];
  const priorities: Project['priority'][] = ['Low', 'Medium', 'High', 'Critical'];
  const clients = Array.from(new Set(projects.map(p => p.client).filter(Boolean))).sort();

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || project.status === statusFilter;
    const matchesClient = !clientFilter || project.client === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.client.trim() || !formData.startDate) return;

    try {
      const projectData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        client: formData.client.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        status: formData.status,
        priority: formData.priority
      };

      if (editingProject) {
        await onUpdateProject(editingProject.id, projectData);
      } else {
        await onAddProject(projectData);
      }
      resetForm();
      setMessage({ text: 'Project saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving project:', error);
      setMessage({ text: 'Failed to save project. Please try again.', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      client: '',
      startDate: '',
      endDate: '',
      status: 'Planning',
      priority: 'Medium'
    });
    setEditingProject(null);
    setIsFormOpen(false);
  };

  const handleEdit = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      client: project.client,
      startDate: project.startDate,
      endDate: project.endDate || '',
      status: project.status,
      priority: project.priority
    });
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleShowMembers = (project: Project) => {
    const projectAllocations = allocations.filter(alloc => alloc.projectId === project.id);
    const memberIds = new Set(projectAllocations.map(alloc => alloc.userId));
    const members = teamMembers.filter(member => memberIds.has(member.id));
    
    setSelectedProjectMembers(members);
    setSelectedProjectName(project.name);
    setShowMembersModal(true);
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Planning': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Active': return 'bg-green-50 text-green-700 border-green-200';
      case 'On Hold': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'Completed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'Low': return 'text-gray-600';
      case 'Medium': return 'text-blue-600';
      case 'High': return 'text-orange-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      resetForm();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-4 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-emerald-600" />
            Project Management ({projects.length})
          </h2>
          {!isGuest && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Add Project</span>
            </button>
          )}
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Clients</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FolderOpen className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No projects found</p>
            <p className="text-sm mt-2">Add projects to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center mb-2">
                      <h3 
                        className="font-semibold text-gray-900 text-base sm:text-lg mr-0 sm:mr-3 mb-2 sm:mb-0 cursor-pointer hover:text-emerald-600 transition-colors"
                        onClick={() => handleShowMembers(project)}
                        title="Click to view team members"
                      >
                        {project.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)} w-fit`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-emerald-600 font-medium mb-2 text-sm">{project.client}</p>
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                    )}
                  </div>
                  {!isGuest && (
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-gray-600 hover:text-emerald-600 hover:bg-emerald-100 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteProject(project.id)}
                        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>Start: {formatDate(project.startDate)}</span>
                  </div>
                  {project.endDate && (
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span>End: {formatDate(project.endDate)}</span>
                    </div>
                  )}
                  <div className={`flex items-center ${getPriorityColor(project.priority)}`}>
                    <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span>{project.priority} Priority</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && !isGuest && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {editingProject ? 'Edit Project' : 'Add Project'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <input
                    type="text"
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  placeholder="Enter project description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    min="2020-01-01"
                    max="2030-12-31"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                    min="2020-01-01"
                    max="2030-12-31"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                      className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <div className="relative">
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Project['priority'] })}
                      className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm appearance-none bg-white"
                    >
                      {priorities.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
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
                  className="px-3 sm:px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors text-sm"
                >
                  {editingProject ? 'Update' : 'Add'} Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MembersListModal
        isOpen={showMembersModal}
        onClose={() => setShowMembersModal(false)}
        title={`Team Members - ${selectedProjectName}`}
        members={selectedProjectMembers}
        emptyMessage="No team members allocated to this project yet"
      />
    </div>
  );
};

export default ProjectManagement;
