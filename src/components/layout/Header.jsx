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
    <header className="bg-gray-800 text-white p-4 shadow-md z-20 relative">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {/* Hamburger Menu Button (visible on mobile) */}
          <motion.button
            className="mr-3 flex flex-col justify-center items-center w-8 h-8 rounded hover:bg-gray-700 focus:outline-none"
            onClick={handleToggleSidebar}
            animate={isSidebarOpen ? "open" : "closed"}
            variants={hamburgerVariants}
            aria-label="Toggle sidebar"
          >
            {[1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-6 h-0.5 bg-white my-0.5 block"
                variants={barVariants}
                custom={i}
                initial="closed"
              />
            ))}
          </motion.button>

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <svg 
              className="w-8 h-8 text-green-500" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z" />
            </svg>
            <h1 className="text-xl font-bold">MongoDB Data Explorer</h1>
          </div>
        </div>
        
        {/* Right side of header - can be used for user profile, etc. */}
        <div className="hidden md:flex items-center">
          {/* You can add user profile, theme toggle, etc. here */}
        </div>

   
      </div>
    </header>
  );
};

export default Header;