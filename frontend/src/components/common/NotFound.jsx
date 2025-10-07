import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mt-4">Page Not Found</h2>
          <p className="text-gray-500 mt-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Go Home
          </Link>
          
          <div className="text-sm text-gray-500">
            <p>Or try one of these:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <Link to="/about" className="text-blue-600 hover:underline">About</Link>
              <Link to="/services" className="text-blue-600 hover:underline">Services</Link>
              <Link to="/contact" className="text-blue-600 hover:underline">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;







