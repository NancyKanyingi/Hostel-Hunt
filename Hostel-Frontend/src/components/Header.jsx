// src/components/Header.jsx
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            HostelHunt
          </Link>

          {/* Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/search" className="text-gray-700 hover:text-blue-600">Explore</Link>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
              Sign Up
            </Link>
          </nav>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-2xl"
          >
            {mobileOpen ? 'x' : 'Menu'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <nav className="md:hidden border-t py-4 space-y-2">
            <Link to="/" className="block px-4 py-2 text-gray-700">Home</Link>
            <Link to="/search" className="block px-4 py-2 text-gray-700">Explore</Link>
            <Link to="/login" className="block px-4 py-2 text-gray-700">Login</Link>
            <Link to="/signup" className="block px-4 py-2 text-blue-600 font-medium">Sign Up</Link>
          </nav>
        )}
      </div>
    </header>
  );
}