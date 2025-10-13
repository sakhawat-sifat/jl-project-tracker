import React, { useState, useEffect } from 'react';
import { Calendar, Percent, Save, Edit3, ChevronDown } from 'lucide-react';
import { TeamMember, Project, Allocation } from '../types';

interface AllocationFormProps {
  teamMembers: TeamMember[];
  projects: Project[];
  onSubmit: (allocation: Omit<Allocation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editingAllocation?: Allocation | null;
  onCancelEdit: () => void;
}

const AllocationForm: React.FC<AllocationFormProps> = ({
  teamMembers,
  projects,
  onSubmit,
  editingAllocation,
  onCancelEdit
}) => {
  // Filter active team members and non-completed projects, then sort alphabetically
  const activeTeamMembers = teamMembers
    .filter(member => member.status !== 'inactive')
    .sort((a, b) => a.name.localeCompare(b.name));
  const availableProjects = projects
    .filter(project => project.status !== 'Completed')
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const [formData, setFormData] = useState({
    userId: '',
    projectId: '',
    percentage: '',
    month: '',
    year: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAllocation) {
      setFormData({
        userId: editingAllocation.userId,
        projectId: editingAllocation.projectId,
        percentage: editingAllocation.percentage.toString(),
        month: editingAllocation.month,
        year: editingAllocation.year.toString()
      });
    } else {
      setFormData({
        userId: '',
        projectId: '',
        percentage: '',
        month: '',
        year: ''
      });
    }
  }, [editingAllocation]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years from 6 years ago to 2 years in the future, in ascending order
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => currentYear - 6 + i).sort((a, b) => a - b);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId || !formData.projectId || !formData.percentage || !formData.month || !formData.year) {
      return;
    }

    const percentage = parseFloat(formData.percentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      return;
    }

    setIsSubmitting(true);
    try {
      const memberName = teamMembers.find(m => m.id === formData.userId)?.name || '';
      const projectName = projects.find(p => p.id === formData.projectId)?.name || '';

      await onSubmit({
        userId: formData.userId,
        projectId: formData.projectId,
        employeeName: memberName,
        projectName: projectName,
        month: formData.month,
        year: parseInt(formData.year, 10),
        percentage: percentage
      });

      if (!editingAllocation) {
        setFormData({
          userId: '',
          projectId: '',
          percentage: '',
          month: '',
          year: ''
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center">
          {editingAllocation ? <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 mr-2" /> : <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2" />}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            {editingAllocation ? 'Edit Allocation' : 'Create Allocation'}
          </h2>
        </div>
        {editingAllocation && (
          <button
            onClick={onCancelEdit}
            className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="space-y-2">
          <label htmlFor="member-select" className="block text-sm font-medium text-gray-700">
            Team Member
          </label>
          <div className="relative">
            <select
              id="member-select"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base appearance-none bg-white"
              required
            >
              <option value="">Select Member</option>
              {activeTeamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="project-select" className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <div className="relative">
            <select
              id="project-select"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base appearance-none bg-white"
              required
            >
              <option value="">Select Project</option>
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">
            <div className="flex items-center">
              
              Allocation Percentage ( 
              <Percent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />)
            </div>
          </label>
          <input
            id="percentage"
            type="number"
            min="0"
            max="100"
            step="any"
            placeholder="e.g., 50"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <div className="relative">
            <select
              id="month-select"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base appearance-none bg-white"
              required
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700">
            Year
          </label>
          <div className="relative">
            <select
              id="year-select"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full p-2 sm:p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base appearance-none bg-white"
              required
            >
              <option value="">Select Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="col-span-full mt-4 sm:mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 sm:p-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl"
          >
            <Save className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>{editingAllocation ? 'Update Allocation' :  'Create Allocation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AllocationForm;