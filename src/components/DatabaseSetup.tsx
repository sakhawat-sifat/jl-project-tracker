import React from 'react';
import { Database, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface DatabaseSetupProps {
  onRetry: () => void;
}

const DatabaseSetup: React.FC<DatabaseSetupProps> = ({ onRetry }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl">
              <img 
                src="/JL Icon.png" 
                alt="JoulesLabs Logo" 
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-12 w-12 text-white flex items-center justify-center text-2xl font-bold">
                JL
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Database Setup Required
          </h1>
          <p className="text-gray-600">Connect to Supabase to get started</p>
        </div>

        {/* Setup Instructions */}
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Supabase Setup Required</h3>
                <p className="text-blue-700 text-sm">
                  This application uses Supabase as its database. Please follow the steps below to set up your free Supabase project.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Setup Instructions
            </h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Quick Database Check</h4>
              <p className="text-yellow-700 text-sm mb-2">
                If you're getting authentication errors, please verify:
              </p>
              <ol className="text-yellow-700 text-sm space-y-1 ml-4">
                <li>1. Your .env file contains the correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY</li>
                <li>2. You've run the SQL migration in your Supabase SQL editor</li>
                <li>3. The admin_users table exists in your database</li>
              </ol>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-800">Create a Supabase Account</p>
                  <p className="text-gray-600 text-sm">
                    Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline inline-flex items-center">
                      supabase.com <ExternalLink className="h-3 w-3 ml-1" />
                    </a> and create a free account
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-800">Create a New Project</p>
                  <p className="text-gray-600 text-sm">
                    Create a new project in your Supabase dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-800">Get Your Project Credentials</p>
                  <p className="text-gray-600 text-sm">
                    Go to Settings → API and copy your Project URL and anon public key
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="font-medium text-gray-800">Set Environment Variables</p>
                  <p className="text-gray-600 text-sm mb-2">
                    Create a <code className="bg-gray-100 px-1 rounded">.env</code> file in your project root with:
                  </p>
                  <div className="bg-gray-100 p-3 rounded-lg text-sm font-mono">
                    <div>VITE_SUPABASE_URL=your_project_url</div>
                    <div>VITE_SUPABASE_ANON_KEY=your_anon_key</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <p className="font-medium text-gray-800">Run Database Migration</p>
                  <p className="text-gray-600 text-sm">
                    Copy and run the SQL from <code className="bg-gray-100 px-1 rounded">supabase/migrations/20250622085217_steep_voice.sql</code> in your Supabase SQL editor
                  </p>
                  <p className="text-gray-600 text-sm">
                    <strong>Important:</strong> Also run the admin users migration from <code className="bg-gray-100 px-1 rounded">supabase/migrations/20250708055510_shrill_scene.sql</code>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 flex items-center space-x-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSetup;