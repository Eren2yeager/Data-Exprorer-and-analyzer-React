/**
 * ResponsiveUtils.jsx
 * Reusable responsive components and styles for consistent UI across the application
 */
import React from 'react';
import { motion } from 'framer-motion';
import { FiDatabase, FiServer, FiAlertCircle, FiCheckCircle, FiX, 
         FiTrash2, FiPlus, FiClock, FiRefreshCw, FiList, FiGrid, 
         FiSearch, FiFilter, FiEdit, FiInfo, FiSettings } from 'react-icons/fi';

/**
 * Page container with responsive padding and animations
 */
export const ResponsivePageContainer = ({ children, className = '' }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ type: "tween", ease: "anticipate", duration: 0.5 }}
    className={`min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-6 px-4 sm:px-6 md:py-8 ${className}`}
  >
    <div className="max-w-7xl mx-auto">
      {children}
    </div>
  </motion.div>
);

/**
 * Responsive page header with gradient text
 */
export const PageHeader = ({ title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7 }}
    className="text-center mb-8 md:mb-10"
  >
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 md:mb-4">
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
        {title}
      </span>
    </h1>
    {subtitle && (
      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {subtitle}
      </p>
    )}
  </motion.div>
);

/**
 * Responsive card component with hover effects
 */
export const ResponsiveCard = ({ children, className = '', onClick, animate = true }) => {
  const cardComponent = (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {cardComponent}
      </motion.div>
    );
  }

  return cardComponent;
};

/**
 * Responsive grid layout that adapts to screen size
 */
export const ResponsiveGrid = ({ children, className = '', columns = { sm: 1, md: 2, lg: 3 } }) => {
  const getGridCols = () => {
    return `grid-cols-1 sm:grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg}`;
  };

  return (
    <div className={`grid gap-4 sm:gap-6 ${getGridCols()} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Notification component with animations and accessibility features
 */
export const Notification = ({ type = 'info', message, onDismiss }) => {
  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <FiAlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />;
      case 'success':
        return <FiCheckCircle className="h-5 w-5 text-green-500" aria-hidden="true" />;
      case 'warning':
        return <FiAlertCircle className="h-5 w-5 text-yellow-500" aria-hidden="true" />;
      default:
        return <FiInfo className="h-5 w-5 text-blue-500" aria-hidden="true" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-800/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/40 dark:to-yellow-800/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <motion.div 
      variants={notificationVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`mb-4 p-4 border rounded-lg shadow-lg backdrop-blur-sm ${getStyles()}`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="ml-auto flex-shrink-0 hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-1"
            aria-label="Dismiss"
          >
            <FiX className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Responsive button with gradient hover effect
 */
export const GradientButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  size = 'md',
  icon = null,
  disabled = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gradient-to-r hover:from-gray-200 hover:to-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600';
      case 'danger':
        return 'bg-red-600 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-gradient-to-r hover:from-green-600 hover:to-green-700 text-white';
      case 'outline':
        return 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20';
      default:
        return 'bg-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-1 px-3 text-sm';
      case 'lg':
        return 'py-3 px-6 text-lg';
      default:
        return 'py-2 px-4 text-base';
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
        ${getVariantClasses()} ${getSizeClasses()} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'transform hover:translate-y-[-1px]'} 
        ${className}`}
    >
      {icon && (
        <span className={`inline-block ${children ? 'mr-2' : ''}`}>
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

// Export icons for easy access
export const Icons = {
  Database: FiDatabase,
  Server: FiServer,
  Alert: FiAlertCircle,
  Check: FiCheckCircle,
  Close: FiX,
  Delete: FiTrash2,
  Add: FiPlus,
  Clock: FiClock,
  Refresh: FiRefreshCw,
  List: FiList,
  Grid: FiGrid,
  Search: FiSearch,
  Filter: FiFilter,
  Edit: FiEdit,
  Info: FiInfo,
  Settings: FiSettings
};

// Export animation variants for consistency
export const animationVariants = {
  pageTransition: {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  },
  pageVariants: {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  },
  containerVariants: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  },
  itemVariants: {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }
};