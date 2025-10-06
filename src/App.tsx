import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Settings, Users, FolderOpen, BarChart3, Shield } from 'lucide-react';
import TeamMemberManagement from './components/TeamMemberManagement';
import ProjectManagement from './components/ProjectManagement';
import RoleManagement from './components/RoleManagement';
import AllocationForm from './components/AllocationForm';
import MonthlyAllocationView from './components/MonthlyAllocationView';
import MonthlySummary from './components/MonthlySummary';
import AdminUserManagement from './components/AdminUserManagement';
import ConfirmModal from './components/ConfirmModal';
import NotificationMessage from './components/NotificationMessage';
import LoginForm from './components/LoginForm';
import AdminHeader from './components/AdminHeader';
import DatabaseSetup from './components/DatabaseSetup';
import DatabaseConfig from './components/DatabaseConfig';
import NotFound from './components/NotFound';
import { ToastContainer } from './components/Toast';
import { supabaseService } from './services/supabaseService';
import { TeamMember, Project, Allocation, Role } from './types';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { appConfig, validateConfig } from './config/app.config';

function App() {
  const {
    isAuthenticated,
    user,
    loading: authLoading,
    loginError,
    loginLoading,
    sessionTimeRemaining,
    login,
    logout
  } = useAuth();

  const { toasts, removeToast, success, error, warning, info } = useToast();

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [editingAllocation, setEditingAllocation] = useState<Allocation | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  const [showDatabaseConfig, setShowDatabaseConfig] = useState(false);
  const [show404, setShow404] = useState(false);
  
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('Confirm Action');
  const [confirmType, setConfirmType] = useState<'danger' | 'warning' | 'info'>('warning');


  // Check if current hash is valid
  const isValidTab = (hash: string): boolean => {
    const validTabs: Array<'allocations' | 'team' | 'projects' | 'roles' | 'summary' | 'admin'> = 
      ['allocations', 'team', 'projects', 'roles', 'summary', 'admin'];
    return validTabs.includes(hash as any);
  };

  // Get active tab from URL hash or default to 'summary'
  const getActiveTabFromHash = (): 'allocations' | 'team' | 'projects' | 'roles' | 'summary' | 'admin' => {
    const hash = window.location.hash.slice(1); // Remove the # character
    const validTabs: Array<'allocations' | 'team' | 'projects' | 'roles' | 'summary' | 'admin'> = 
      ['allocations', 'team', 'projects', 'roles', 'summary', 'admin'];
    
    if (validTabs.includes(hash as any)) {
      return hash as 'allocations' | 'team' | 'projects' | 'roles' | 'summary' | 'admin';
    }
    return 'summary';
  };

  const [activeTab, setActiveTab] = useState<'allocations' | 'team' | 'projects' | 'roles' | 'summary' | 'admin'>(getActiveTabFromHash());

  // Check for invalid route on mount and hash change
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && !isValidTab(hash)) {
      setShow404(true);
    } else {
      setShow404(false);
    }
  }, []);

  // Listen for hash changes to update active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && !isValidTab(hash)) {
        setShow404(true);
      } else {
        setShow404(false);
        const newTab = getActiveTabFromHash();
        setActiveTab(newTab);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when active tab changes
  const navigateToTab = (tab: 'allocations' | 'team' | 'projects' | 'roles' | 'summary' | 'admin') => {
    window.location.hash = tab;
    setActiveTab(tab);
  };

  // Ref for allocation form to scroll to when editing
  const allocationFormRef = useRef<HTMLDivElement>(null);

  // Check user permissions
  const canModifyData = user?.role === 'super_admin' || user?.role === 'admin';
  const canManageUsers = user?.role === 'super_admin';
  const isViewOnly = user?.role === 'member';

  // Update document title on mount
  useEffect(() => {
    document.title = appConfig.app.name;
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      checkDatabaseConnection();
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Auto-scroll to allocation form when editing
  useEffect(() => {
    if (editingAllocation && allocationFormRef.current) {
      allocationFormRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [editingAllocation]);

  const checkDatabaseConnection = async () => {
    setCheckingConnection(true);
    try {
      // Validate configuration
      const configValidation = validateConfig();
      
      if (!configValidation.isValid) {
        console.warn('Missing environment variables:', configValidation.missing);
        setShowDatabaseConfig(true);
        setDatabaseConnected(false);
        setLoading(false);
        setCheckingConnection(false);
        return;
      }

      // Try to fetch data to test connection
      await supabaseService.getRoles();
      setDatabaseConnected(true);
      setShowDatabaseConfig(false);
      setCheckingConnection(false);
      loadInitialData();
    } catch (error) {
      console.error('Database connection failed:', error);
      setDatabaseConnected(false);
      setShowDatabaseConfig(false);
      setLoading(false);
      setCheckingConnection(false);
    }
  };

  const handleDatabaseConfig = (config: { url: string; key: string }) => {
    // In a real application, you would save these to environment variables
    // For now, we'll show instructions to the user
    setMessage({ 
      text: 'Please add the credentials to your .env file and restart the application', 
      type: 'info' 
    });
    
    // Create .env content for user to copy
    const envContent = `VITE_SUPABASE_URL=${config.url}\nVITE_SUPABASE_ANON_KEY=${config.key}`;
    
    // Try to download .env file
    const blob = new Blob([envContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const loadInitialData = async () => {
    try {
      const [membersData, projectsData, rolesData, allocationsData] = await Promise.all([
        supabaseService.getTeamMembers(),
        supabaseService.getProjects(),
        supabaseService.getRoles(),
        supabaseService.getAllocations()
      ]);
      
      setTeamMembers(membersData);
      setProjects(projectsData);
      setRoles(rolesData);
      setAllocations(allocationsData);
    } catch (error) {
      setMessage({ text: 'Failed to load initial data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Team Member handlers
  const handleAddMember = async (memberData: Omit<TeamMember, 'id' | 'createdAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      const existingMember = teamMembers.find(m => 
        m.name.toLowerCase() === memberData.name.toLowerCase() ||
        (memberData.email && m.email?.toLowerCase() === memberData.email.toLowerCase())
      );
      if (existingMember) {
        warning('Team member with this name or email already exists');
        return;
      }

      const newMember = await supabaseService.addTeamMember(memberData);
      setTeamMembers(prev => [...prev, newMember]);
      success(`Team member "${memberData.name}" added successfully!`);
    } catch (err) {
      error('Failed to add team member. Please try again.');
      console.error('Error adding team member:', err);
    }
  };

  const handleUpdateMember = async (id: string, memberData: Omit<TeamMember, 'id' | 'createdAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      const updatedMember = await supabaseService.updateTeamMember(id, memberData);
      setTeamMembers(prev => prev.map(m => m.id === id ? updatedMember : m));
      // Update allocations with new member name
      setAllocations(prev => prev.map(a => a.userId === id ? { ...a, employeeName: memberData.name } : a));
      success(`Team member "${memberData.name}" updated successfully!`);
    } catch (err) {
      error('Failed to update team member. Please try again.');
      console.error('Error updating team member:', err);
    }
  };

  const handleDeleteMember = (id: string) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    const member = teamMembers.find(m => m.id === id);
    if (!member) return;

    setConfirmTitle('Delete Team Member');
    setConfirmMessage(`Are you sure you want to delete "${member.name}"? This will also remove all their allocations.`);
    setConfirmType('danger');
    setConfirmAction(() => async () => {
      try {
        await supabaseService.deleteTeamMember(id);
        setTeamMembers(prev => prev.filter(m => m.id !== id));
        setAllocations(prev => prev.filter(a => a.userId !== id));
        success(`Team member "${member.name}" deleted successfully!`);
      } catch (err) {
        error('Failed to delete team member. Please try again.');
        console.error('Error deleting team member:', err);
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Project handlers
  const handleAddProject = async (projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      // Validate required fields
      if (!projectData.name || !projectData.client || !projectData.startDate) {
        warning('Missing required fields: name, client, or start date');
        return;
      }
      
      const existingProject = projects.find(p => p.name.toLowerCase() === projectData.name.toLowerCase());
      if (existingProject) {
        warning('Project with this name already exists');
        return;
      }

      const newProject = await supabaseService.addProject(projectData);
      setProjects(prev => [...prev, newProject]);
      success(`Project "${projectData.name}" added successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add project';
      error(errorMessage);
      console.error('Error adding project:', err);
    }
  };

  const handleUpdateProject = async (id: string, projectData: Omit<Project, 'id' | 'createdAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      const updatedProject = await supabaseService.updateProject(id, projectData);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      // Update allocations with new project name
      setAllocations(prev => prev.map(a => a.projectId === id ? { ...a, projectName: projectData.name } : a));
      success(`Project "${projectData.name}" updated successfully!`);
    } catch (err) {
      error('Failed to update project. Please try again.');
      console.error('Error updating project:', err);
    }
  };

  const handleDeleteProject = (id: string) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    const project = projects.find(p => p.id === id);
    if (!project) return;

    setConfirmTitle('Delete Project');
    setConfirmMessage(`Are you sure you want to delete "${project.name}"? This will also remove all related allocations.`);
    setConfirmType('danger');
    setConfirmAction(() => async () => {
      try {
        await supabaseService.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
        setAllocations(prev => prev.filter(a => a.projectId !== id));
        success(`Project "${project.name}" deleted successfully!`);
      } catch (err) {
        error('Failed to delete project. Please try again.');
        console.error('Error deleting project:', err);
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Role handlers
  const handleAddRole = async (roleData: Omit<Role, 'id' | 'createdAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      const existingRole = roles.find(r => r.name.toLowerCase() === roleData.name.toLowerCase());
      if (existingRole) {
        warning('Role with this name already exists');
        return;
      }

      const newRole = await supabaseService.addRole(roleData);
      setRoles(prev => [...prev, newRole]);
      success(`Role "${roleData.name}" added successfully!`);
    } catch (err) {
      error('Failed to add role. Please try again.');
      console.error('Error adding role:', err);
    }
  };

  const handleUpdateRole = async (id: string, roleData: Omit<Role, 'id' | 'createdAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      const updatedRole = await supabaseService.updateRole(id, roleData);
      setRoles(prev => prev.map(r => r.id === id ? updatedRole : r));
      // Refresh team members to reflect role name changes
      const updatedMembers = await supabaseService.getTeamMembers();
      setTeamMembers(updatedMembers);
      success(`Role "${roleData.name}" updated successfully!`);
    } catch (err) {
      error('Failed to update role. Please try again.');
      console.error('Error updating role:', err);
    }
  };

  const handleDeleteRole = (id: string) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    const role = roles.find(r => r.id === id);
    if (!role) return;

    setConfirmTitle('Delete Role');
    setConfirmMessage(`Are you sure you want to delete the role "${role.name}"?`);
    setConfirmType('danger');
    setConfirmAction(() => async () => {
      try {
        await supabaseService.deleteRole(id);
        setRoles(prev => prev.filter(r => r.id !== id));
        success(`Role "${role.name}" deleted successfully!`);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete role';
        error(errorMsg);
        console.error('Error deleting role:', err);
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  // Allocation handlers
  const handleAllocationSubmit = async (allocationData: Omit<Allocation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    try {
      if (editingAllocation) {
        const updatedAllocation = await supabaseService.updateAllocation(editingAllocation.id, allocationData);
        setAllocations(prev => prev.map(a => a.id === editingAllocation.id ? updatedAllocation : a));
        success('Allocation updated successfully!');
        setEditingAllocation(null);
      } else {
        const newAllocation = await supabaseService.addAllocation(allocationData);
        setAllocations(prev => [...prev, newAllocation]);
        success('Allocation created successfully!');
      }
    } catch (err) {
      error('Failed to save allocation. Please try again.');
      console.error('Error saving allocation:', err);
    }
  };

  const handleEditAllocation = (allocation: Allocation) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    setEditingAllocation(allocation);
    navigateToTab('allocations');
    info(`Editing allocation for ${allocation.employeeName}`);
  };

  const handleDeleteAllocation = (id: string) => {
    if (!canModifyData) {
      error('You do not have permission to modify data');
      return;
    }

    const allocation = allocations.find(a => a.id === id);
    if (!allocation) return;

    setConfirmTitle('Delete Allocation');
    setConfirmMessage(`Are you sure you want to delete the allocation for ${allocation.employeeName} on ${allocation.projectName}?`);
    setConfirmType('danger');
    setConfirmAction(() => async () => {
      try {
        await supabaseService.deleteAllocation(id);
        setAllocations(prev => prev.filter(a => a.id !== id));
        success('Allocation deleted successfully!');
      } catch (err) {
        error('Failed to delete allocation. Please try again.');
        console.error('Error deleting allocation:', err);
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleCancelEdit = () => {
    setEditingAllocation(null);
    info('Edit cancelled');
  };

  // Show login form if not authenticated  
  if (!isAuthenticated) {
    return <LoginForm onLogin={login} loading={loginLoading} error={loginError} />;
  }

  // Show initial loading state after authentication
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg sm:text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loader while checking database connection
  if (checkingConnection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Connecting to Database...</p>
        </div>
      </div>
    );
  }

  // Show database configuration if needed
  if (showDatabaseConfig) {
    return <DatabaseConfig onConfigSave={handleDatabaseConfig} />;
  }

  // Show database setup if not connected
  if (!databaseConnected) {
    return <DatabaseSetup onRetry={checkDatabaseConnection} />;
  }

  // Show 404 page for invalid routes
  if (show404) {
    return <NotFound onNavigateHome={() => {
      setShow404(false);
      window.location.hash = '#allocations';
    }} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      {user && (
        <AdminHeader 
          user={user} 
          onLogout={logout} 
          sessionTimeRemaining={sessionTimeRemaining}
        />
      )}

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4">
            <div className="p-3 sm:p-4 bg-white rounded-2xl shadow-md mb-4 sm:mb-0 sm:mr-4">
              <img 
                src="/JL Icon.png" 
                alt="JoulesLabs Logo" 
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                onError={(e) => {
                  // Fallback to Zap icon if image fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden">
                <div className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 flex items-center justify-center">⚡</div>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-2">
                JoulesLabs
                <span className="text-indigo-600"> Project Tracker</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600">Intelligent resource management and project planning</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-center sm:space-x-6 gap-4 sm:gap-0 mt-6">
            <div className="flex items-center text-sm text-gray-600 justify-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{teamMembers.length} Team Members</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 justify-center">
              <FolderOpen className="h-4 w-4 mr-1" />
              <span>{projects.length} Active Projects</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 justify-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{allocations.length} Allocations</span>
            </div>
            <div className="flex items-center text-sm text-gray-600 justify-center">
              <Settings className="h-4 w-4 mr-1" />
              <span>{roles.length} Roles</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-1 sm:p-2 flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => navigateToTab('allocations')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'allocations'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Allocations</span>
            </button>
            <button
              onClick={() => navigateToTab('team')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'team'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Team</span>
            </button>
            <button
              onClick={() => navigateToTab('projects')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Projects</span>
            </button>
            <button
              onClick={() => navigateToTab('roles')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Roles</span>
            </button>
            <button
              onClick={() => navigateToTab('summary')}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${
                activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Summary</span>
            </button>
            {canManageUsers && (
              <button
                onClick={() => navigateToTab('admin')}
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Notification */}
        {message && (
          <div className="mb-6 sm:mb-8">
            <NotificationMessage
              message={message.text}
              type={message.type}
              onClose={() => setMessage(null)}
            />
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'allocations' && (
          <div className="space-y-6 sm:space-y-8">
            {canModifyData && (
              <div ref={allocationFormRef}>
                <AllocationForm
                  teamMembers={teamMembers}
                  projects={projects}
                  onSubmit={handleAllocationSubmit}
                  editingAllocation={editingAllocation}
                  onCancelEdit={handleCancelEdit}
                />
              </div>
            )}
            <MonthlyAllocationView
              allocations={allocations}
              teamMembers={teamMembers}
              projects={projects}
              onEdit={handleEditAllocation}
              onDelete={handleDeleteAllocation}
              isGuest={isViewOnly}
            />
          </div>
        )}

        {activeTab === 'team' && (
          <TeamMemberManagement
            teamMembers={teamMembers}
            roles={roles}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            isGuest={isViewOnly}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectManagement
            projects={projects}
            teamMembers={teamMembers}
            allocations={allocations}
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            isGuest={isViewOnly}
          />
        )}

        {activeTab === 'roles' && (
          <RoleManagement
            roles={roles}
            teamMembers={teamMembers}
            onAddRole={handleAddRole}
            onUpdateRole={handleUpdateRole}
            onDeleteRole={handleDeleteRole}
            isGuest={isViewOnly}
          />
        )}

        {activeTab === 'summary' && (
          <MonthlySummary 
            allocations={allocations} 
            teamMembers={teamMembers}
            projects={projects}
          />
        )}

        {activeTab === 'admin' && canManageUsers && user && (
          <AdminUserManagement currentUser={user} />
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onClose={removeToast} />

        {/* Confirm Modal */}
        {showConfirmModal && (
          <ConfirmModal
            title={confirmTitle}
            message={confirmMessage}
            type={confirmType}
            onConfirm={confirmAction}
            onCancel={() => setShowConfirmModal(false)}
            confirmText="Delete"
            cancelText="Cancel"
          />
        )}
      </div>
    </div>
  );
}

export default App;