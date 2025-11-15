/**
 * Header Component
 * Main application header with logo, navigation, and responsive hamburger menu
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../../Contexts/sidebar-context';
import { motion } from 'framer-motion';

const Header = () => {
  // Get sidebar state and toggle function from context
  const { isSidebarOpen, toggleSidebar, isMobileView } = useSidebar();
  const navigate = useNavigate();

  /**
   * Handle sidebar toggle with explicit event prevention
   */
  const handleToggleSidebar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSidebar();
  };

  /**
   * Hamburger button animation variants
   */
  const hamburgerVariants = {
    open: { rotate: 90 },
    closed: { rotate: 0 }
  };

  /**
   * Bar animation variants for hamburger icon
   */
  const barVariants = {
    open: (i) => ({
      rotate: i === 1 ? 45 : i === 3 ? -45 : 0,
      y: i === 1 ? 8 : i === 3 ? -8 : 0,
      opacity: i === 2 ? 0 : 1,
      transition: { duration: 0.3 }
    }),
    closed: {
      rotate: 0,
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
      <header className=" px-4 py-3 flex justify-between items-center bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white shadow-lg z-20 relative border-b border-gray-700">
        <div className="flex items-center">
          {/* Hamburger Menu Button (visible on mobile) */}
          <motion.button
            className="mr-3 md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            onClick={handleToggleSidebar}
            animate={isSidebarOpen ? "open" : "closed"}
            variants={hamburgerVariants}
            aria-label="Toggle sidebar"
          >
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-6 h-0.5 bg-white my-0.5 block rounded-full"
                variants={barVariants}
                custom={i}
                initial="closed"
              />
            ))}
          </motion.button>

          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                MongoDB Data Explorer
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Modern Database Management</p>
            </div>
          </motion.div>
        </div>
        
        {/* Right side of header */}
        <div className="flex items-center gap-3">


          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Refresh"
              onClick={() => window.location.reload()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              title="Help"
              onClick={() => window.open('https://portfolio-samar-gautam.netlify.app/', '_blank')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.button>
          </div>
        </div>
    </header>
  );
};

export default Header;