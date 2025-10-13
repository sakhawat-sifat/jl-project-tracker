import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Filter, Calendar, User, FolderOpen, Download, FileText, FileSpreadsheet, Users, X, Eye, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Allocation, SummaryFilterOptions } from '../types';
import TeamAllocationSummary from './TeamAllocationSummary';
import { sortMonthsChronologically } from '../utils/dateFormat';

// Utility function to round percentage and avoid floating-point precision issues
const roundPercentage = (value: number): number => {
  return Math.round(value * 100) / 100;
};

interface MonthlySummaryProps {
  allocations: Allocation[];
  teamMembers?: any[];
  projects?: any[];
}

interface SummaryItem {
  employeeName: string;
  month: string;
  year: number;
  totalPercentage: number;
  projects: Record<string, number>;
}

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any[];
  type: 'members' | 'projects' | 'member-projects' | 'member-details';
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

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, title, data, type }) => {
  if (!isOpen) return null;

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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-auto max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {type === 'members' && (
            <div className="space-y-3">
              {data.map((member, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {member.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-gray-900 text-lg">{member}</span>
                </div>
              ))}
            </div>
          )}
          
          {type === 'projects' && (
            <div className="space-y-3">
              {data.map((project, index) => (
                <div key={index} className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center text-white mr-4">
                    <FolderOpen className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-gray-900 text-lg">{project}</span>
                </div>
              ))}
            </div>
          )}
          
          {type === 'member-projects' && (
            <div className="space-y-4">
              {data.map((item: any, index) => (
                <div key={index} className="p-5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {item.member.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{item.member}</h4>
                      <p className="text-sm font-medium text-purple-600">{item.allocation}% allocation</p>
                    </div>
                  </div>
                  <div className="ml-16">
                    <div className="flex items-center text-gray-700">
                      <FolderOpen className="h-5 w-5 mr-2 text-emerald-600" />
                      <span className="font-medium">{item.project}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {type === 'member-details' && (
            <div className="space-y-4">
              {data.map((member: any, index) => (
                <div key={index} className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {member.employeeName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{member.employeeName}</h4>
                      <p className="text-sm text-gray-600">{member.month} {member.year}</p>
                    </div>
                  </div>
                  
                  <div className="ml-16 space-y-4">
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-700 mr-2">Total Allocation:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        roundPercentage(member.totalPercentage) > 100 ? 'bg-red-100 text-red-800' : 
                        roundPercentage(member.totalPercentage) === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {roundPercentage(member.totalPercentage).toFixed(1)}%
                      </span>
                      {roundPercentage(member.totalPercentage) > 100 && (
                        <span className="ml-2 flex items-center text-red-600">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">Over-allocated</span>
                        </span>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">Allocation Progress</span>
                        <span className="text-gray-600">{roundPercentage(member.totalPercentage).toFixed(1)}% of 100%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            roundPercentage(member.totalPercentage) > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                            roundPercentage(member.totalPercentage) === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                            'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`}
                          style={{ width: `${Math.min(roundPercentage(member.totalPercentage), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-3">Projects & Allocations:</h5>
                      <div className="space-y-2">
                        {Object.entries(member.projects).map(([projectName, percentage]: [string, any]) => (
                          <div key={projectName} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <span className="font-medium text-gray-900">{projectName}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium min-w-[50px] text-center">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MonthlySummary: React.FC<MonthlySummaryProps> = ({ allocations, teamMembers = [], projects = [] }) => {
  const { lastMonth, currentYear } = getCurrentDate();
  
  const [filters, setFilters] = useState<SummaryFilterOptions>({
    viewType: 'project',
    selectedMonth: lastMonth,
    selectedYear: currentYear,
    selectedProject: '',
    selectedMember: ''
  });

  const [detailModal, setDetailModal] = useState<{
    isOpen: boolean;
    title: string;
    data: any[];
    type: 'members' | 'projects' | 'member-projects' | 'member-details';
  }>({
    isOpen: false,
    title: '',
    data: [],
    type: 'members'
  });

  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique values for filters
  const uniqueMonths = sortMonthsChronologically(Array.from(new Set(allocations.map(a => a.month))));
  const uniqueYears = Array.from(new Set(allocations.map(a => a.year))).sort((a, b) => b - a);
  const uniqueProjects = Array.from(new Set(allocations.map(a => a.projectName))).sort();
  const uniqueMembers = Array.from(new Set(allocations.map(a => a.employeeName))).sort();

  // Filter allocations based on selected filters
  const filteredAllocations = allocations.filter(allocation => {
    const matchesMonth = !filters.selectedMonth || allocation.month === filters.selectedMonth;
    const matchesYear = !filters.selectedYear || allocation.year.toString() === filters.selectedYear;
    const matchesProject = !filters.selectedProject || allocation.projectName === filters.selectedProject;
    const matchesMember = !filters.selectedMember || allocation.employeeName === filters.selectedMember;
    
    return matchesMonth && matchesYear && matchesProject && matchesMember;
  });

  // Generate summary based on view type
  const generateSummary = () => {
    if (filters.viewType === 'project') {
      // Project-specific view: show allocations per project
      const projectSummary = filteredAllocations.reduce((acc, alloc) => {
        const key = `${alloc.projectName}-${alloc.year}-${alloc.month}`;
        if (!acc[key]) {
          acc[key] = {
            projectName: alloc.projectName,
            month: alloc.month,
            year: alloc.year,
            totalPercentage: 0,
            members: {}
          };
        }
        acc[key].totalPercentage += alloc.percentage;
        acc[key].members[alloc.employeeName] = (acc[key].members[alloc.employeeName] || 0) + alloc.percentage;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(projectSummary).sort((a: any, b: any) => {
        const projectCompare = a.projectName.localeCompare(b.projectName);
        if (projectCompare !== 0) return projectCompare;
        if (a.year !== b.year) return a.year - b.year;
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
    } else if (filters.viewType === 'member') {
      // Member-specific view: show allocations per member
      const memberSummary = filteredAllocations.reduce((acc, alloc) => {
        const key = `${alloc.employeeName}-${alloc.year}-${alloc.month}`;
        if (!acc[key]) {
          acc[key] = {
            employeeName: alloc.employeeName,
            month: alloc.month,
            year: alloc.year,
            totalPercentage: 0,
            projects: {}
          };
        }
        acc[key].totalPercentage += alloc.percentage;
        acc[key].projects[alloc.projectName] = (acc[key].projects[alloc.projectName] || 0) + alloc.percentage;
        return acc;
      }, {} as Record<string, SummaryItem>);

      return Object.values(memberSummary).sort((a, b) => {
        const employeeCompare = a.employeeName.localeCompare(b.employeeName);
        if (employeeCompare !== 0) return employeeCompare;
        if (a.year !== b.year) return a.year - b.year;
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
    } else if (filters.viewType === 'team') {
      // Team allocation view - this will be handled by the TeamAllocationSummary component
      return [];
    } else {
      // Monthly view: show allocations by month
      const monthlySummary = filteredAllocations.reduce((acc, alloc) => {
        const key = `${alloc.year}-${alloc.month}`;
        if (!acc[key]) {
          acc[key] = {
            month: alloc.month,
            year: alloc.year,
            members: {},
            projects: {}
          };
        }
        acc[key].members[alloc.employeeName] = (acc[key].members[alloc.employeeName] || 0) + alloc.percentage;
        acc[key].projects[alloc.projectName] = (acc[key].projects[alloc.projectName] || 0) + alloc.percentage;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(monthlySummary).sort((a: any, b: any) => {
        if (a.year !== b.year) return a.year - b.year;
        const monthOrder = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
    }
  };

  const summaryData = generateSummary();

  // Pagination calculations
  const totalPages = Math.ceil(summaryData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = summaryData.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Enhanced export functions
  const exportToCSV = () => {
    let csvContent = '';
    let filename = '';
    const currentDate = new Date();
    const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });

    if (filters.viewType === 'monthly') {
      csvContent = [
        ['Period', 'Active Members', 'Active Projects'].join(','),
        ...summaryData.map((item: any) => [
          `${item.month} ${item.year}`,
          Object.keys(item.members).length,
          Object.keys(item.projects).length
        ].join(','))
      ].join('\n');
      filename = 'monthly-summary.csv';
    } else if (filters.viewType === 'project') {
      csvContent = [
        ['Project Name', 'Team Members with Allocation'].join(','),
        ...summaryData.map((item: any) => [
          item.projectName,
          Object.entries(item.members).map(([name, pct]: [string, any]) => `${name}: ${pct}%`).join('; ')
        ].join(','))
      ].join('\n');
      filename = `Project Summary - ${currentMonthName}.csv`;
    } else if (filters.viewType === 'member') {
      csvContent = [
        ['Employee', 'Period', 'Status', 'Projects'].join(','),
        ...summaryData.map((item: any) => [
          item.employeeName,
          `${item.month} ${item.year}`,
          roundPercentage(item.totalPercentage) > 100 ? 'Over-allocated' : roundPercentage(item.totalPercentage) === 100 ? 'Fully allocated' : 'Under-allocated',
          Object.keys(item.projects).join('; ')
        ].join(','))
      ].join('\n');
      filename = 'member-summary.csv';
    } else {
      // Team view export
      csvContent = [
        ['Team Member', 'Role', 'Department', 'Active Projects'].join(','),
        ...teamMembers.map((member: any) => {
          const memberAllocations = allocations.filter(a => a.userId === member.id);
          const activeProjects = Array.from(new Set(memberAllocations.map(a => a.projectName)));
          
          return [
            member.name,
            member.role,
            member.department || '',
            activeProjects.join('; ')
          ].join(',');
        })
      ].join('\n');
      filename = 'team-summary.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      viewType: filters.viewType,
      filters: filters,
      summary: filters.viewType === 'team' ? teamMembers : summaryData,
      totalRecords: filters.viewType === 'team' ? teamMembers.length : summaryData.length
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filters.viewType}-summary.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    const { lastMonth, currentYear } = getCurrentDate();
    setFilters({
      viewType: 'project',
      selectedMonth: lastMonth,
      selectedYear: currentYear,
      selectedProject: '',
      selectedMember: ''
    });
  };

  const handleMembersClick = (members: string[], title: string) => {
    setDetailModal({
      isOpen: true,
      title,
      data: members,
      type: 'members'
    });
  };

  const handleProjectsClick = (projects: string[], title: string) => {
    setDetailModal({
      isOpen: true,
      title,
      data: projects,
      type: 'projects'
    });
  };

  const handleMemberClick = (memberName: string, projectName: string, allocation: number) => {
    const memberData = [{
      member: memberName,
      project: projectName,
      allocation: allocation
    }];
    
    setDetailModal({
      isOpen: true,
      title: `${memberName} - ${projectName}`,
      data: memberData,
      type: 'member-projects'
    });
  };

  const handleMemberDetails = (member: any) => {
    setDetailModal({
      isOpen: true,
      title: `${member.employeeName} - Detailed Allocation`,
      data: [member],
      type: 'member-details'
    });
  };

  const toggleMemberExpansion = (key: string) => {
    setExpandedMembers(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderMembersList = (members: Record<string, any>, projectName: string) => {
    const memberEntries = Object.entries(members);
    const visibleMembers = memberEntries.slice(0, 3);
    const hiddenMembers = memberEntries.slice(3);
    const key = `${projectName}-members`;
    const isExpanded = expandedMembers[key];

    return (
      <div className="flex flex-wrap items-center gap-1">
        {visibleMembers.map(([memberName, allocation]: [string, any], index) => (
          <React.Fragment key={memberName}>
            <button
              onClick={() => handleMemberClick(memberName, projectName, allocation)}
              className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium"
            >
              {memberName}
            </button>
            {index < visibleMembers.length - 1 && <span className="text-gray-400">,</span>}
          </React.Fragment>
        ))}
        
        {hiddenMembers.length > 0 && (
          <>
            {!isExpanded && (
              <>
                <span className="text-gray-400">,</span>
                <button
                  onClick={() => toggleMemberExpansion(key)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                >
                  +{hiddenMembers.length} more
                  <ChevronDown className="h-3 w-3 ml-1" />
                </button>
              </>
            )}
            
            {isExpanded && (
              <>
                {hiddenMembers.map(([memberName, allocation]: [string, any], index) => (
                  <React.Fragment key={memberName}>
                    <span className="text-gray-400">,</span>
                    <button
                      onClick={() => handleMemberClick(memberName, projectName, allocation)}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-medium"
                    >
                      {memberName}
                    </button>
                  </React.Fragment>
                ))}
                <button
                  onClick={() => toggleMemberExpansion(key)}
                  className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors ml-1"
                >
                  Show less
                  <ChevronUp className="h-3 w-3 ml-1" />
                </button>
              </>
            )}
          </>
        )}
      </div>
    );
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div className="flex items-center text-sm text-gray-700">
        <span>
          Showing {startIndex + 1} to {Math.min(endIndex, summaryData.length)} of{' '}
          {summaryData.length} results
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

  if (allocations.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="h-8 w-8 mr-3 text-indigo-600" />
          Summary Dashboard
        </h2>
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl">No summary data available</p>
          <p className="text-sm mt-2">Add some allocations to see the summary breakdown!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-indigo-600" />
            Summary Dashboard
          </h2>

          {/* Enhanced Export Options */}
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={exportToJSON}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
            >
              <FileText className="h-4 w-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* View Type Selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilters({ ...filters, viewType: 'monthly' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              filters.viewType === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Monthly View</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, viewType: 'project' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              filters.viewType === 'project'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Project View</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, viewType: 'member' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              filters.viewType === 'member'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Member View</span>
          </button>
          <button
            onClick={() => setFilters({ ...filters, viewType: 'team' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              filters.viewType === 'team'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Team Allocation View</span>
          </button>
        </div>

        {/* Filters - Only show for non-team views */}
        {filters.viewType !== 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <select
                value={filters.selectedMonth}
                onChange={(e) => setFilters({ ...filters, selectedMonth: e.target.value })}
                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
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
                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
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
                value={filters.selectedProject}
                onChange={(e) => setFilters({ ...filters, selectedProject: e.target.value })}
                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
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
                value={filters.selectedMember}
                onChange={(e) => setFilters({ ...filters, selectedMember: e.target.value })}
                className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="">All Members</option>
                {uniqueMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        )}

        {filters.viewType !== 'team' && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        )}
      </div>
      
      <div className="overflow-hidden">
        {filters.viewType === 'team' ? (
          <TeamAllocationSummary
            allocations={allocations}
            teamMembers={teamMembers}
            projects={projects}
          />
        ) : summaryData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 p-6">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No data matches your filters</p>
            <p className="text-sm mt-2">Try adjusting your filter criteria!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              {filters.viewType === 'monthly' ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Active Members
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Active Projects
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item: any, index) => (
                      <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.month} {item.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleMembersClick(Object.keys(item.members), `Active Members - ${item.month} ${item.year}`)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                            >
                              {Object.keys(item.members).length} persons
                            </button>
                            <button
                              onClick={() => handleMembersClick(Object.keys(item.members), `Active Members - ${item.month} ${item.year}`)}
                              className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-1 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleProjectsClick(Object.keys(item.projects), `Active Projects - ${item.month} ${item.year}`)}
                              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                            >
                              {Object.keys(item.projects).length} projects
                            </button>
                            <button
                              onClick={() => handleProjectsClick(Object.keys(item.projects), `Active Projects - ${item.month} ${item.year}`)}
                              className="px-2 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-1 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Details</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : filters.viewType === 'project' ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Team Members
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item: any, index) => (
                      <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.projectName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.month} {item.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(item.members).map(([memberName, allocation]: [string, any]) => {
                              const member = teamMembers.find(m => m.name === memberName);
                              const allocationValue = typeof allocation === 'number' ? allocation : parseFloat(allocation);
                              return (
                                <span key={memberName} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-800">
                                  {memberName}: {allocationValue.toFixed(1)}%
                                </span>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Projects
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.map((item: any, index) => (
                      <tr key={index} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
                              {item.employeeName.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-gray-900">{item.employeeName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.month} {item.year}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(item.projects).map(([projectName, percentage]: [string, any]) => (
                              <span
                                key={projectName}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
                              >
                                {projectName}: {percentage.toFixed(1)}%
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                          <button
                            onClick={() => handleMemberDetails(item)}
                            className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors flex items-center space-x-1 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            {summaryData.length > ITEMS_PER_PAGE && <PaginationControls />}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal
        isOpen={detailModal.isOpen}
        onClose={() => setDetailModal({ ...detailModal, isOpen: false })}
        title={detailModal.title}
        data={detailModal.data}
        type={detailModal.type}
      />
    </div>
  );
};

export default MonthlySummary;