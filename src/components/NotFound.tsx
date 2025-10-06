import React from 'react';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

interface NotFoundProps {
  onNavigateHome: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
            <img 
              src="/JL Icon.png" 
              alt="JoulesLabs Logo" 
              className="h-16 w-16 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* 404 Icon and Text */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <AlertTriangle className="h-24 w-24 text-orange-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-8xl font-extrabold text-gray-800 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 border border-gray-300 shadow-sm font-medium"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Go Back</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg font-medium"
          >
            <Home className="h-5 w-5" />
            <span>Go to Home</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Quick Links</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => { window.location.hash = 'allocations'; onNavigateHome(); }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              Allocations
            </button>
            <button
              onClick={() => { window.location.hash = 'team'; onNavigateHome(); }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              Team
            </button>
            <button
              onClick={() => { window.location.hash = 'projects'; onNavigateHome(); }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              Projects
            </button>
            <button
              onClick={() => { window.location.hash = 'roles'; onNavigateHome(); }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              Roles
            </button>
            <button
              onClick={() => { window.location.hash = 'summary'; onNavigateHome(); }}
              className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
