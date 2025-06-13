import React from "react";
import { Link } from "react-router-dom";
import { Menu, User } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white shadow-md px-4 py-3 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-600">
        JobPortal
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex gap-6">
        <Link to="/jobs" className="text-gray-700 hover:text-blue-600">Jobs</Link>
        <Link to="/about" className="text-gray-700 hover:text-blue-600">About</Link>
        <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
      </nav>

      {/* User Menu */}
      <div className="flex items-center gap-4">
        <Link to="/login" className="text-gray-700 hover:text-blue-600">
          <User className="inline-block mr-1" size={20} />
          Login
        </Link>
        <button className="md:hidden text-gray-700">
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;
