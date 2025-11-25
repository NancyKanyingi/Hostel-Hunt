import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext'; // Import to access favorites count

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { favorites } = useBooking(); // Get favorites array

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-primary">
              Hostel Hunt
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                {/* Landlord Link */}
                {user.role === 'landlord' && (
                  <Link 
                    to="/dashboard/hostels/create"
                    className="text-sm font-semibold text-gray-600 hover:text-primary transition-colors border border-gray-300 px-4 py-2 rounded-full hover:border-primary"
                  >
                    + List Property
                  </Link>
                )}

                {/* Favorites Button - Only for students or general users */}
                <Link 
                  to="/dashboard/favorites"
                  className="relative p-2 text-gray-600 hover:text-primary transition-colors group"
                  title="View Favorites"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {/* Badge Count */}
                  {favorites.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                <span className="text-text-body font-medium">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-50 text-red-600 border border-red-100 px-5 py-2 rounded-full font-semibold hover:bg-red-100 transition-all duration-300 text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-body hover:text-hover font-medium transition-colors"
                >
                  Login
                </Link>
                <button
                  onClick={() => navigate('/signup')}
                  className="bg-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-hover transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Register
                </button>
              </>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 flex flex-col gap-1.5">
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-gray-800 rounded-full transition-all"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-gray-800 rounded-full transition-all"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-gray-800 rounded-full transition-all"
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-100 py-4 space-y-1 overflow-hidden"
            >
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-text-body hover:bg-highlight hover:text-primary rounded-lg transition-colors font-medium"
              >
                Home
              </Link>

              {user ? (
                <>
                  {/* Mobile Favorites Link */}
                  <Link
                    to="/dashboard/favorites"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-text-body hover:bg-highlight hover:text-primary rounded-lg transition-colors font-medium"
                  >
                    Favorites ({favorites.length})
                  </Link>

                  {user.role === 'landlord' && (
                    <Link
                      to="/dashboard/hostels/create"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 text-text-body hover:bg-highlight hover:text-primary rounded-lg transition-colors font-medium"
                    >
                      List Property
                    </Link>
                  )}

                  <div className="border-t border-gray-100 my-2"></div>
                  
                  <span className="block px-4 py-2 text-sm text-gray-500">
                    Signed in as {user.name}
                  </span>
                  <button
                    onClick={() => {
                      logout();
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 font-semibold hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-text-body hover:bg-highlight hover:text-primary rounded-lg transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      navigate('/signup');
                    }}
                    className="w-full text-left px-4 py-3 bg-primary text-white rounded-lg font-semibold mt-2 hover:bg-hover"
                  >
                    Register
                  </button>
                </>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}