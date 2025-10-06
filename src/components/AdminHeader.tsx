import React from 'react';
import { LogOut, User, Eye, Shield, Users } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminHeaderProps {
  user: AdminUser;
  onLogout: () => void;
  sessionTimeRemaining: number;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ user, onLogout }) => {
  const getRoleIcon = () => {
    switch (user.role) {
      case 'super_admin': return <Shield className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'admin': return <Users className="h-4 w-4 sm:h-5 sm:w-5" />;
      case 'member': return <Eye className="h-4 w-4 sm:h-5 sm:w-5" />;
      default: return <User className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user.role) {
      case 'super_admin': return 'bg-red-500';
      case 'admin': return 'bg-blue-500';
      case 'member': return 'bg-green-500';
      default: return 'bg-indigo-500';
    }
  };

  const getRoleLabel = () => {
    switch (user.role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'member': return 'Member';
      default: return 'User';
    }
  };

  const getAccessLevel = () => {
    switch (user.role) {
      case 'super_admin': return 'Full Access';
      case 'admin': return 'Add Data Access';
      case 'member': return 'View Only Access';
      default: return 'Limited Access';
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${getRoleColor()} rounded-full flex items-center justify-center text-white font-medium`}>
              {getRoleIcon()}
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                Welcome, {getRoleLabel()}
              </span>
              <p className="text-xs text-gray-500">{getAccessLevel()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* User Info */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900">{user.username}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;