import React, { useState, useMemo } from 'react';
import { User, Calendar, AlertTriangle, TrendingUp, Filter, Search, ArrowUpDown, Clock, Briefcase, Target, X, Eye, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Allocation, TeamMember, Project } from '../types';
import { formatDate, sortMonthsChronologically } from '../utils/dateFormat';

interface TeamAllocationSummaryProps {
  allocations: Allocation[];
  teamMembers: TeamMember[];
  projects: Project[];
}

interface MemberAllocation extends Allocation {
  project?: Project;
}

interface MemberSummary {
  member: TeamMember;
  allocations: MemberAllocation[];
  activeProjects: string[];
  completedProjects: number;
}

interface FilterState {
  searchTerm: string;
  selectedMonth: string;
  selectedYear: string;
  projectStatus: string;
  role: string;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberSummary | null;
  defaultMonthYear: string;
}

const ITEMS_PER_PAGE = 10;

// Get current date and calculate default filter values
const getCurrentDate = () => {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-based
  const currentYear = now.getFullYear();
  
  // Get previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return {
    lastMonth: months[prevMonth],
    currentYear: currentYear.toString()
  };
};

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, member, defaultMonthYear }) => {
  const [monthYearFilter, setMonthYearFilter] = useState(defaultMonthYear);

  // Reset filter when modal opens with new member
  React.useEffect(() => {
    if (isOpen && member) {
      setMonthYearFilter(defaultMonthYear);
    }
  }, [isOpen, member, defaultMonthYear]);

  // Generate month-year options from allocations
  const monthYearOptions = useMemo(() => {
    if (!member) return ['All Time'];
    
    const options = Array.from(new Set(
      member.allocations.map(a => `${a.month} ${a.year}`)
    )).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      
      if (yearA !== yearB) return parseInt(yearB) - parseInt(yearA);
      return months.indexOf(monthB) - months.indexOf(monthA);
    });
    
    return ['All Time', ...options];
  }, [member?.allocations]);

  // Filter allocations based on selected month-year
  const filteredAllocations = useMemo(() => {
    if (!member) return [];
    if (monthYearFilter === 'All Time') return member.allocations;
    
    const [selectedMonth, selectedYear] = monthYearFilter.split(' ');
    return member.allocations.filter(a => 
      a.month === selectedMonth && a.year.toString() === selectedYear
    );
  }, [member?.allocations, monthYearFilter]);

  if (!isOpen || !member) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-4">
                  {member.member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{member.member.name}</h3>
                  <p className="text-gray-600 font-medium">{member.member.role} • {member.member.department}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Active Projects</p>
                  <p className="text-lg font-bold text-blue-800">{member.activeProjects.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Allocations</p>
                  <p className="text-lg font-bold text-green-800">{member.allocations.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <Target className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Completed Projects</p>
                  <p className="text-lg font-bold text-purple-800">{member.completedProjects}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Projects with Progress */}
          {member.activeProjects.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3">Active Projects</h4>
              <div className="space-y-2">
                {member.activeProjects.map((projectName, index) => {
                  const projectAllocation = member.allocations
                    .filter(a => a.projectName === projectName)
                    .reduce((sum, a) => sum + a.percentage, 0) / member.allocations.filter(a => a.projectName === projectName).length;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="font-medium text-gray-900">{projectName}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(projectAllocation, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600 min-w-[45px]">
                          {projectAllocation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Allocations Section with Filter */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-800">Allocations</h4>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Date:</label>
                <div className="relative">
                  <select
                    value={monthYearFilter}
                    onChange={(e) => setMonthYearFilter(e.target.value)}
                    className="px-3 py-1 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
                  >
                    {monthYearOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              {filteredAllocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-lg">No allocations found</p>
                  <p className="text-sm">Try selecting a different time period</p>
                </div>
              ) : (
                filteredAllocations
                  .sort((a, b) => {
                    if (a.year !== b.year) return b.year - a.year;
                    const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                    return monthOrder.indexOf(b.month) - monthOrder.indexOf(a.month);
                  })
                  .map((allocation) => (
                    <div
                      key={allocation.id}
                      className="p-4 rounded-lg border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h5 className="font-bold text-gray-900">{allocation.projectName}</h5>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              {allocation.percentage}%
                            </span>
                            {allocation.project?.status && (
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(allocation.project.status)}`}>
                                {allocation.project.status}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {allocation.month} {allocation.year}
                            </div>
                            {allocation.project?.client && (
                              <div className="font-bold text-gray-800">
                                Client: {allocation.project.client}
                              </div>
                            )}
                            <div className="text-gray-500">
                              {formatDate(allocation.project?.startDate)} - 
                              {allocation.project?.endDate ? formatDate(allocation.project.endDate) : 'Ongoing'}
                            </div>
                          </div>

                          {/* Progress Bar for Individual Allocation */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">Project Allocation</span>
                              <span className="text-gray-600">{allocation.percentage}% of 100%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(allocation.percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TeamAllocationSummary: React.FC<TeamAllocationSummaryProps> = ({
  allocations,
  teamMembers,
  projects
}) => {
  const { lastMonth, currentYear } = getCurrentDate();
  
  const [sortBy, setSortBy] = useState<'name' | 'projects'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedMonth: lastMonth,
    selectedYear: currentYear,
    projectStatus: '',
    role: ''
  });

  const [selectedMember, setSelectedMember] = useState<MemberSummary | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to check if allocation is current, upcoming, or past
  const getAllocationTimeframe = (allocation: Allocation) => {
    const allocDate = new Date(allocation.year, getMonthIndex(allocation.month));
    const current = new Date(parseInt(currentYear), getMonthIndex(lastMonth));
    
    if (allocDate.getTime() === current.getTime()) return 'current';
    if (allocDate > current) return 'upcoming';
    return 'past';
  };

  const getMonthIndex = (monthName: string) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.indexOf(monthName);
  };

  // Calculate member summaries
  const memberSummaries = useMemo(() => {
    return teamMembers.map(member => {
      const memberAllocations = allocations.filter(a => a.userId === member.id);
      
      const enrichedAllocations: MemberAllocation[] = memberAllocations.map(allocation => ({
        ...allocation,
        project: projects.find(p => p.id === allocation.projectId)
      }));

      // Get active projects (unique project names)
      const activeProjects = Array.from(new Set(enrichedAllocations.map(a => a.projectName)));

      // Count completed projects
      const uniqueProjects = Array.from(new Set(enrichedAllocations.map(a => a.projectId)));
      const completedProjects = uniqueProjects.filter(pid => {
        const project = projects.find(p => p.id === pid);
        return project && project.status === 'Completed';
      }).length;

      return {
        member,
        allocations: enrichedAllocations,
        activeProjects,
        completedProjects
      };
    });
  }, [teamMembers, allocations, projects]);

  // Apply filters
  const filteredSummaries = useMemo(() => {
    return memberSummaries.filter(summary => {
      const matchesSearch = summary.member.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           summary.member.role.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesRole = !filters.role || summary.member.role === filters.role;
      
      // Filter allocations based on criteria
      const relevantAllocations = summary.allocations.filter(allocation => {
        const matchesMonth = !filters.selectedMonth || allocation.month === filters.selectedMonth;
        const matchesYear = !filters.selectedYear || allocation.year.toString() === filters.selectedYear;
        const matchesStatus = !filters.projectStatus || allocation.project?.status === filters.projectStatus;
        
        return matchesMonth && matchesYear && matchesStatus;
      });

      return matchesSearch && matchesRole && relevantAllocations.length > 0;
    });
  }, [memberSummaries, filters]);

  // Sort summaries
  const sortedSummaries = useMemo(() => {
    return [...filteredSummaries].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.member.name.toLowerCase();
          bValue = b.member.name.toLowerCase();
          break;
        case 'projects':
          aValue = a.activeProjects.length;
          bValue = b.activeProjects.length;
          break;
        default:
          aValue = a.member.name.toLowerCase();
          bValue = b.member.name.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredSummaries, sortBy, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(sortedSummaries.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSummaries = sortedSummaries.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy, sortDirection]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (member: MemberSummary) => {
    console.log('handleViewDetails called with member:', member);
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const uniqueRoles = Array.from(new Set(teamMembers.map(m => m.role))).sort();
  const uniqueStatuses = Array.from(new Set(projects.map(p => p.status))).sort();
  const uniqueMonths = sortMonthsChronologically(Array.from(new Set(allocations.map(a => a.month))));
  const uniqueYears = Array.from(new Set(allocations.map(a => a.year))).sort((a, b) => b - a);

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, sortedSummaries.length)} of{' '}
          {sortedSummaries.length} results
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            if (totalPages <= 7 || page === 1 || page === totalPages || (page >= currentPage - 2 && page <= currentPage + 2)) {
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 3 || page === currentPage + 3) {
              return <span key={page} className="px-2 text-gray-500">...</span>;
            }
            return null;
          })}
        </div>
        
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters & Search
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="relative">
            <select
              value={filters.selectedMonth}
              onChange={(e) => setFilters({ ...filters, selectedMonth: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Months</option>
              {uniqueMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.selectedYear}
              onChange={(e) => setFilters({ ...filters, selectedYear: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.projectStatus}
              onChange={(e) => setFilters({ ...filters, projectStatus: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              {uniqueStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Team Members Overview */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <User className="h-6 w-6 mr-2" />
            Team Members Overview ({sortedSummaries.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center space-x-1 hover:text-gray-900"
                  >
                    <span>Member</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('projects')}
                    className="flex items-center space-x-1 hover:text-gray-900"
                  >
                    <span>Active Projects</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSummaries.map((summary, index) => (
                <tr key={summary.member.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                        {summary.member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">{summary.member.name}</div>
                        <div className="text-sm text-gray-500">{summary.member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                    {summary.member.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {summary.activeProjects.slice(0, 3).map((projectName, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                        >
                          {projectName}
                        </span>
                      ))}
                      {summary.activeProjects.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          +{summary.activeProjects.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(summary)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center space-x-1 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedSummaries.length > ITEMS_PER_PAGE && <PaginationControls />}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={showDetailModal}
        onClose={() => {
          console.log('Closing detail modal');
          setShowDetailModal(false);
          setSelectedMember(null);
        }}
        member={selectedMember}
        defaultMonthYear={`${lastMonth} ${currentYear}`}
      />
    </div>
  );
};

export default TeamAllocationSummary;