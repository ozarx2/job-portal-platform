// src/components/auth/LoginForm.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function LoginForm() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <form className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-blue-700">Login to Your Account</h2>
        <input
          className="block w-full mb-4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          type="text"
          placeholder="Username"
        />
        <input
          className="block w-full mb-6 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          type="password"
          placeholder="Password"
        />
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition mb-3 shadow"
          type="submit"
        >
          Login
        </button>
        <div className="flex items-center justify-center mt-2">
          <span className="text-gray-600 mr-2">Don't have an account?</span>
          <Link
            to="/signup"
            className="text-blue-600 hover:underline font-semibold"
          >
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;

