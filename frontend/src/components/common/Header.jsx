import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = ["Home", "About", "Services", "Careers", "Contact"];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 text-2xl font-bold text-blue-600">
            <img src="/img/ozarx.png" alt="logo" className="w-40 h-30" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-gray-700 font-medium">
            {navItems.map((item) => (
              <Link
                key={item}
                to={`/${item.toLowerCase()}`}
                className="hover:text-blue-600 transition duration-300"
              >
                {item}
              </Link>
            ))}
          </nav>
{/* Call to Action */}
<div className="hidden md:block">
            <p>  +91 8157000553</p>
            
          
          
            
          </div>
          {/* Call to Action */}
          <div className="hidden md:block">
            <a
              href="#contact"
              className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block text-gray-700 hover:text-blue-600 transition"
              >
                {item}
              </a>
            ))}
            <a
              href="#contact"
              className="block mt-2 text-center bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700 transition"
            >
              Get Started
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
