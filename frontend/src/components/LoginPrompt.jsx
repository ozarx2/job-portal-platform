import React from 'react';
import { User, LogIn } from 'lucide-react';

const LoginPrompt = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Sign Up Required
          </h2>
          
          <p className="text-gray-600 text-center mb-6">
            You need to create an account to apply for jobs. Please sign up to continue.
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                window.location.href = '/signup';
              }}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
            >
              <User className="w-4 h-4 mr-2" />
              Go to Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;


















