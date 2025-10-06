import React, { useState } from 'react';
import { Database, Save, Eye, EyeOff, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface DatabaseConfigProps {
  onConfigSave: (config: { url: string; key: string }) => void;
}

const DatabaseConfig: React.FC<DatabaseConfigProps> = ({ onConfigSave }) => {
  const [config, setConfig] = useState({
    url: '',
    key: ''
  });
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const handleTest = async () => {
    if (!config.url || !config.key) return;
    
    setTesting(true);
    setTestResult(null);
    
    try {
      // Test the connection by trying to create a Supabase client
      const { createClient } = await import('@supabase/supabase-js');
      const testClient = createClient(config.url, config.key);
      
      // Try a simple query to test the connection
      const { error } = await testClient.from('roles').select('count').limit(1);
      
      if (error) {
        throw error;
      }
      
      setTestResult('success');
    } catch (error) {
      console.error('Database test failed:', error);
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    if (config.url && config.key) {
      onConfigSave(config);
    }
  };

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
            Configure Database
          </h1>
          <p className="text-gray-600">Enter your Supabase project credentials</p>
        </div>

        {/* Quick Setup Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Database className="h-4 w-4 mr-2" />
            Quick Setup Guide
          </h3>
          <div className="space-y-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <span>1.</span>
              <span>Go to</span>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:underline"
              >
                Supabase Dashboard <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
            <div>2. Create a new project or select existing one</div>
            <div>3. Go to Settings → API</div>
            <div>4. Copy your Project URL and anon public key</div>
            <div>5. Paste them below and test the connection</div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project URL
            </label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              placeholder="https://your-project.supabase.co"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Anon Public Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={config.key}
                onChange={(e) => setConfig({ ...config, key: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg flex items-center space-x-2 ${
              testResult === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {testResult === 'success' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Connection successful! Database is ready.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5" />
                  <span>Connection failed. Please check your credentials and ensure the database schema is set up.</span>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleTest}
              disabled={!config.url || !config.key || testing}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Database className="h-5 w-5" />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={!config.url || !config.key || testResult !== 'success'}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <Save className="h-5 w-5" />
              <span>Save & Continue</span>
            </button>
          </div>
        </div>

        {/* Migration Instructions */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Database Schema Setup Required</h3>
          <p className="text-yellow-700 text-sm mb-2">
            After testing the connection, you need to set up the database schema:
          </p>
          <ol className="text-yellow-700 text-sm space-y-1 ml-4">
            <li>1. Go to your Supabase project dashboard</li>
            <li>2. Navigate to the SQL Editor</li>
            <li>3. Copy and run the SQL from: <code className="bg-yellow-100 px-1 rounded">supabase/migrations/20250622085217_steep_voice.sql</code></li>
            <li>4. This will create all necessary tables and default data</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConfig;