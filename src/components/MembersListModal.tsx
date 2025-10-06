import React from 'react';
import { X, Users, Mail, Briefcase, Building } from 'lucide-react';
import { TeamMember } from '../types';

interface MembersListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  members: TeamMember[];
  emptyMessage?: string;
}

const MembersListModal: React.FC<MembersListModalProps> = ({
  isOpen,
  onClose,
  title,
  members,
  emptyMessage = 'No members found'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-white" />
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-800 rounded-lg p-2 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">{emptyMessage}</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                {members.length} {members.length === 1 ? 'member' : 'members'} associated
              </p>
              
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">
                        {index + 1}. {member.name}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        {member.role && (
                          <div className="flex items-center text-gray-600">
                            <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                            <span>{member.role}</span>
                          </div>
                        )}
                        
                        {member.department && (
                          <div className="flex items-center text-gray-600">
                            <Building className="h-4 w-4 mr-2 text-purple-500" />
                            <span>{member.department}</span>
                          </div>
                        )}
                        
                        {member.email && (
                          <div className="flex items-center text-gray-600 sm:col-span-2">
                            <Mail className="h-4 w-4 mr-2 text-green-500" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                      </div>
                      
                      {member.status && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status === 'active' ? '● Active' : '○ Inactive'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersListModal;
