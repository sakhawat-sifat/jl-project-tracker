import React, { useState, useMemo } from 'react';
import { Calendar, Search, Filter, ArrowUpDown, Download, List, LayoutGrid, Edit, Trash2, AlertTriangle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Allocation, TeamMember, Project, FilterOptions, SortOptions } from '../types';
import { appConfig } from '../config/app.config';
import { sortMonthsChronologically } from '../utils/dateFormat';

interface MonthlyAllocationViewProps {
  allocations: Allocation[];
  teamMembers: TeamMember[];
  projects: Project[];
  onEdit: (allocation: Allocation) => void;
  onDelete: (id: string) => void;
  isGuest?: boolean;
}

const ITEMS_PER_PAGE = appConfig.pagination.itemsPerPage;

const MonthlyAllocationView: React.FC<MonthlyAllocationViewProps> = ({
  allocations,
  teamMembers,
  projects,
  onEdit,
  onDelete,
  isGuest = false
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    selectedMonth: '',
    selectedYear: '',
    selectedEmployee: '',
    selectedProject: '',
    selectedClient: '',
    selectedRole: '',
    selectedStatus: ''
  });

  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'year',
    direction: 'desc'
  });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique values for filters - months in chronological order, everything else alphabetically ascending
  const uniqueMonths = sortMonthsChronologically(Array.from(new Set(allocations.map(a => a.month))));
  const uniqueYears = Array.from(new Set(allocations.map(a => a.year))).sort((a, b) => a - b);
  const uniqueEmployees = Array.from(new Set(allocations.map(a => a.employeeName))).sort((a, b) => a.localeCompare(b));
  const uniqueProjects = Array.from(new Set(allocations.map(a => a.projectName))).sort((a, b) => a.localeCompare(b));
  const uniqueClients = Array.from(new Set(projects.map(p => p.client).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const uniqueRoles = Array.from(new Set(teamMembers.map(m => m.role))).sort((a, b) => a.localeCompare(b));

  // Calculate over-allocated employees
  const overAllocatedEmployees = useMemo(() => {
    const employeeAllocations = allocations.reduce((acc, allocation) => {
      const key = `${allocation.employeeName}-${allocation.month}-${allocation.year}`;
      if (!acc[key]) {
        acc[key] = {
          employeeName: allocation.employeeName,
          month: allocation.month,
          year: allocation.year,
          totalPercentage: 0
        };
      }
      // Convert percentage to number before adding (fix for string concatenation issue)
      const percentageNum = typeof allocation.percentage === 'string' 
        ? parseFloat(allocation.percentage) 
        : allocation.percentage;
      acc[key].totalPercentage += percentageNum;
      return acc;
    }, {} as Record<string, any>);

    // Round to 2 decimal places and check if > 100
    // This handles floating-point arithmetic issues (e.g., 33.33 + 33.33 + 33.34 = 100.00000000001)
    return Object.values(employeeAllocations).filter((emp: any) => {
      const rounded = Math.round(emp.totalPercentage * 100) / 100;
      return rounded > 100;
    });
  }, [allocations]);

  // Enhanced filtering and sorting
  const filteredAndSortedAllocations = useMemo(() => {
    // Filter allocations
    const filtered = allocations.filter(allocation => {
      const member = teamMembers.find(m => m.id === allocation.userId);
      const project = projects.find(p => p.id === allocation.projectId);
      
      const matchesSearch = !filters.searchTerm || 
        allocation.employeeName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        allocation.projectName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        project?.client.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesMonth = !filters.selectedMonth || allocation.month === filters.selectedMonth;
      const matchesYear = !filters.selectedYear || allocation.year.toString() === filters.selectedYear;
      const matchesEmployee = !filters.selectedEmployee || allocation.employeeName === filters.selectedEmployee;
      const matchesProject = !filters.selectedProject || allocation.projectName === filters.selectedProject;
      const matchesClient = !filters.selectedClient || project?.client === filters.selectedClient;
      const matchesRole = !filters.selectedRole || member?.role === filters.selectedRole;
      const matchesStatus = !filters.selectedStatus || project?.status === filters.selectedStatus;

      return matchesSearch && matchesMonth && matchesYear && matchesEmployee && 
             matchesProject && matchesClient && matchesRole && matchesStatus;
    });

    // Sort the filtered results - create a new sorted array
    return [...filtered].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortOptions.field) {
        case 'employeeName':
          aValue = a.employeeName;
          bValue = b.employeeName;
          break;
        case 'projectName':
          aValue = a.projectName;
          bValue = b.projectName;
          break;
        case 'percentage':
          // Convert to number for proper numeric sorting
          aValue = typeof a.percentage === 'string' ? parseFloat(a.percentage) : a.percentage;
          bValue = typeof b.percentage === 'string' ? parseFloat(b.percentage) : b.percentage;
          break;
        case 'month':
          const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          aValue = monthOrder.indexOf(a.month);
          bValue = monthOrder.indexOf(b.month);
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        default:
          aValue = a.year;
          bValue = b.year;
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [allocations, teamMembers, projects, filters, sortOptions]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedAllocations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedAllocations = filteredAndSortedAllocations.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortOptions]);

  const handleSort = (field: string) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedMonth: '',
      selectedYear: '',
      selectedEmployee: '',
      selectedProject: '',
      selectedClient: '',
      selectedRole: '',
      selectedStatus: ''
    });
  };

  const exportData = () => {
    const csvContent = [
      ['Employee', 'Role', 'Project', 'Client', 'Month', 'Year', 'Allocation %', 'Start Date', 'End Date'].join(','),
      ...filteredAndSortedAllocations.map(allocation => {
        const member = teamMembers.find(m => m.id === allocation.userId);
        const project = projects.find(p => p.id === allocation.projectId);
        return [
          allocation.employeeName,
          member?.role || '',
          allocation.projectName,
          project?.client || '',
          allocation.month,
          allocation.year,
          allocation.percentage,
          allocation.projectStartDate || '',
          allocation.projectEndDate || ''
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'allocations.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const SortButton = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-indigo-600 transition-colors font-bold"
    >
      <span>{children}</span>
      <ArrowUpDown className="h-3 w-3" />
    </button>
  );

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedAllocations.length)} of{' '}
          {filteredAndSortedAllocations.length} results
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
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3 text-indigo-600" />
            Monthly Allocations ({filteredAndSortedAllocations.length})
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              title={viewMode === 'table' ? 'Switch to Grid View' : 'Switch to List View'}
            >
              {viewMode === 'table' ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </button>
            <button
              onClick={exportData}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-1"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Over-allocation Warning */}
        {overAllocatedEmployees.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Over-allocation Warning</h3>
                <p className="text-red-700 text-sm mb-2">
                  The following employees have total allocations exceeding 100%:
                </p>
                <div className="space-y-1">
                  {overAllocatedEmployees.map((emp: any, index) => {
                    const rounded = Math.round(emp.totalPercentage * 100) / 100;
                    return (
                      <div key={index} className="text-red-700 text-sm">
                        <strong>{emp.employeeName}</strong> - {emp.month} {emp.year}: {rounded.toFixed(1)}%
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search allocations..."
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
              value={filters.selectedEmployee}
              onChange={(e) => setFilters({ ...filters, selectedEmployee: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Employees</option>
              {uniqueEmployees.map(employee => (
                <option key={employee} value={employee}>{employee}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.selectedProject}
              onChange={(e) => setFilters({ ...filters, selectedProject: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Projects</option>
              {uniqueProjects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.selectedClient}
              onChange={(e) => setFilters({ ...filters, selectedClient: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Clients</option>
              {uniqueClients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={filters.selectedRole}
              onChange={(e) => setFilters({ ...filters, selectedRole: e.target.value })}
              className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1 text-sm"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Data Display */}
      <div className="overflow-hidden">
        {filteredAndSortedAllocations.length === 0 ? (
          <div className="text-center py-12 text-gray-500 p-6">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No allocations found</p>
            <p className="text-sm mt-2">Try adjusting your filters or add some allocations!</p>
          </div>
        ) : viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <SortButton field="employeeName">Employee</SortButton>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <SortButton field="projectName">Project</SortButton>
                    </th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <SortButton field="month">Period</SortButton>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      <SortButton field="percentage">Allocation</SortButton>
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedAllocations.map((allocation, index) => {
                    const member = teamMembers.find(m => m.id === allocation.userId);
                    const project = projects.find(p => p.id === allocation.projectId);
                    
                    // Check if this employee is over-allocated for this period
                    const isOverAllocated = overAllocatedEmployees.some((emp: any) => 
                      emp.employeeName === allocation.employeeName && 
                      emp.month === allocation.month && 
                      emp.year === allocation.year
                    );
                    
                    return (
                      <tr key={allocation.id} className={`hover:bg-gray-50 transition-colors duration-150 ${
                        isOverAllocated ? 'bg-red-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${isOverAllocated ? 'bg-red-500' : 'bg-indigo-500'} rounded-full flex items-center justify-center text-white font-medium mr-2 sm:mr-3 text-xs sm:text-sm`}>
                              {allocation.employeeName ? allocation.employeeName.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-medium text-gray-900">{allocation.employeeName || 'Unknown'}</div>
                              {isOverAllocated && (
                                <div className="flex items-center text-xs text-red-600">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Over-allocated
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {member?.role || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                          {allocation.projectName}
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-600">
                          {project?.client || 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {allocation.month} {allocation.year}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2 mr-2 sm:mr-3">
                              <div 
                                className={`${isOverAllocated ? 'bg-red-600' : 'bg-indigo-600'} h-2 rounded-full transition-all duration-300`}
                                style={{ width: `${Math.min(allocation.percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-xs sm:text-sm font-medium ${isOverAllocated ? 'text-red-600' : 'text-gray-900'}`}>
                              {allocation.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <div className="flex items-center justify-start space-x-1 sm:space-x-2">
                            {!isGuest && (
                              <>
                                <button
                                  onClick={() => onEdit(allocation)}
                                  className="p-1 sm:p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                                  title="Edit allocation"
                                >
                                  <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                                <button
                                  onClick={() => onDelete(allocation.id)}
                                  className="p-1 sm:p-2 text-red-600 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all duration-200"
                                  title="Delete allocation"
                                >
                                  <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <PaginationControls />
          </>
        ) : (
          <>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedAllocations.map((allocation) => {
                  const member = teamMembers.find(m => m.id === allocation.userId);
                  const project = projects.find(p => p.id === allocation.projectId);
                  
                  // Check if this employee is over-allocated for this period
                  const isOverAllocated = overAllocatedEmployees.some((emp: any) => 
                    emp.employeeName === allocation.employeeName && 
                    emp.month === allocation.month && 
                    emp.year === allocation.year
                  );
                  
                  return (
                    <div key={allocation.id} className={`${isOverAllocated ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'} p-4 rounded-lg border hover:shadow-md transition-shadow`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 ${isOverAllocated ? 'bg-red-500' : 'bg-indigo-500'} rounded-full flex items-center justify-center text-white font-medium mr-3`}>
                            {allocation.employeeName ? allocation.employeeName.charAt(0).toUpperCase() : '?'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">{allocation.employeeName || 'Unknown'}</h3>
                            <p className="text-xs text-gray-600">{member?.role || 'N/A'}</p>
                            {isOverAllocated && (
                              <div className="flex items-center text-xs text-red-600 mt-1">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Over-allocated
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {!isGuest && (
                            <>
                              <button
                                onClick={() => onEdit(allocation)}
                                className="p-1 text-gray-600 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => onDelete(allocation.id)}
                                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{allocation.projectName}</p>
                          <p className="text-xs text-gray-600">{project?.client || 'N/A'}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">{allocation.month} {allocation.year}</span>
                          <span className={`text-sm font-bold ${isOverAllocated ? 'text-red-600' : 'text-indigo-600'}`}>
                            {allocation.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${isOverAllocated ? 'bg-red-600' : 'bg-indigo-600'} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${Math.min(allocation.percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <PaginationControls />
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyAllocationView;