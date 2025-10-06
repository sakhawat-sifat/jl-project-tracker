import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationMessageProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const NotificationMessage: React.FC<NotificationMessageProps> = ({ 
  message, 
  type = 'info',
  onClose 
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getBgColor()} flex items-center justify-between animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-center">
        {getIcon()}
        <p className="ml-3 font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 p-1 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default NotificationMessage;