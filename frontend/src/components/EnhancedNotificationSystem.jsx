/**
 * Enhanced notification system with better UX and animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X, 
  AlertCircle 
} from 'lucide-react';

const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

const NotificationItem = ({ notification, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-dismiss after duration
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [notification.id, onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case NOTIFICATION_TYPES.ERROR:
        return <XCircle className="w-5 h-5 text-red-500" />;
      case NOTIFICATION_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case NOTIFICATION_TYPES.INFO:
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200';
      case NOTIFICATION_TYPES.ERROR:
        return 'bg-red-50 border-red-200';
      case NOTIFICATION_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      case NOTIFICATION_TYPES.INFO:
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (notification.type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'text-green-800';
      case NOTIFICATION_TYPES.ERROR:
        return 'text-red-800';
      case NOTIFICATION_TYPES.WARNING:
        return 'text-yellow-800';
      case NOTIFICATION_TYPES.INFO:
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        border rounded-lg p-4 mb-3 shadow-lg max-w-md w-full
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${getTextColor()}`}>
            {notification.title || getDefaultTitle()}
          </div>
          <div className={`text-sm mt-1 ${getTextColor()} opacity-90`}>
            {notification.message}
          </div>
          
          {notification.action && (
            <div className="mt-3">
              <button
                onClick={notification.action.onClick}
                className={`
                  text-sm font-medium underline hover:no-underline
                  ${getTextColor()}
                `}
              >
                {notification.action.label}
              </button>
            </div>
          )}
        </div>
        
        {notification.dismissible !== false && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={handleDismiss}
              className={`
                inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-5
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${getTextColor()} opacity-70 hover:opacity-100
              `}
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      {/* Progress bar for auto-dismiss */}
      {notification.duration > 0 && (
        <div className="mt-3 w-full bg-black bg-opacity-10 rounded-full h-1">
          <div
            className="bg-current h-1 rounded-full transition-all ease-linear"
            style={{
              width: '100%',
              animation: `shrink ${notification.duration}ms linear forwards`
            }}
          />
        </div>
      )}
    </div>
  );
};

const getDefaultTitle = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'Success';
    case NOTIFICATION_TYPES.ERROR:
      return 'Error';
    case NOTIFICATION_TYPES.WARNING:
      return 'Warning';
    case NOTIFICATION_TYPES.INFO:
      return 'Information';
    default:
      return 'Notification';
  }
};

const EnhancedNotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  // Listen for custom notification events
  useEffect(() => {
    const handleNotification = (event) => {
      addNotification(event.detail);
    };

    window.addEventListener('show-notification', handleNotification);
    return () => window.removeEventListener('show-notification', handleNotification);
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, notification]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Expose methods globally for easy access
  useEffect(() => {
    window.notificationSystem = {
      show: addNotification,
      clear: clearAllNotifications,
      remove: removeNotification
    };
  }, [addNotification, clearAllNotifications, removeNotification]);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Clear all button if multiple notifications */}
      {notifications.length > 1 && (
        <button
          onClick={clearAllNotifications}
          className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full hover:bg-gray-700 transition-colors"
          title="Clear all notifications"
        >
          Clear All
        </button>
      )}
      
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={removeNotification}
        />
      ))}
      
      {/* Add CSS for progress bar animation */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Helper functions for easy notification creation
export const showNotification = (notification) => {
  window.dispatchEvent(new CustomEvent('show-notification', { detail: notification }));
};

export const showSuccess = (message, options = {}) => {
  showNotification({
    type: NOTIFICATION_TYPES.SUCCESS,
    message,
    duration: 5000,
    ...options
  });
};

export const showError = (message, options = {}) => {
  showNotification({
    type: NOTIFICATION_TYPES.ERROR,
    message,
    duration: 8000,
    ...options
  });
};

export const showWarning = (message, options = {}) => {
  showNotification({
    type: NOTIFICATION_TYPES.WARNING,
    message,
    duration: 6000,
    ...options
  });
};

export const showInfo = (message, options = {}) => {
  showNotification({
    type: NOTIFICATION_TYPES.INFO,
    message,
    duration: 5000,
    ...options
  });
};

export default EnhancedNotificationSystem;











