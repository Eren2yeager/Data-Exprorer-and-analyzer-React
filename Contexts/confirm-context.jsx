import React, { createContext, useState, useContext } from 'react';
import { AnimatePresence } from 'framer-motion';

/**
 * ConfirmContext - A context for managing confirmation dialogs throughout the application
 * 
 * This context provides a beautiful, animated confirmation dialog that requires users to
 * type the name of the item they want to delete, similar to MongoDB Compass, to ensure
 * they understand the consequences of their action.
 */
const ConfirmContext = createContext();

/**
 * ConfirmProvider - Provider component for the ConfirmContext
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const ConfirmProvider = ({ children }) => {
  // State to track if the dialog is open
  const [isOpen, setIsOpen] = useState(false);
  
  // State to store the confirmation details
  const [confirmConfig, setConfirmConfig] = useState({
    title: '',
    message: '',
    itemName: '',
    itemType: '',
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    confirmButtonColor: 'red',
    dangerLevel: 'high', // 'low', 'medium', 'high'
  });
  
  // State to track user input for confirmation
  const [userInput, setUserInput] = useState('');
  
  // State to track if the dialog is shaking (for animation when input is incorrect)
  const [isShaking, setIsShaking] = useState(false);

  /**
   * Opens the confirmation dialog with the provided configuration
   * 
   * @param {Object} config - Configuration for the confirmation dialog
   */
  const openConfirmDialog = (config) => {
    setConfirmConfig({
      ...confirmConfig,
      ...config,
    });
    setUserInput('');
    setIsOpen(true);
  };

  /**
   * Closes the confirmation dialog
   */
  const closeConfirmDialog = () => {
    setIsOpen(false);
    setUserInput('');
  };

  /**
   * Handles the confirmation action
   */
  const handleConfirm = () => {
    // Check if user input matches the item name
    if (userInput === confirmConfig.itemName) {
      confirmConfig.onConfirm();
      closeConfirmDialog();
    } else {
      // Shake the dialog to indicate error
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  /**
   * Handles the cancel action
   */
  const handleCancel = () => {
    confirmConfig.onCancel();
    closeConfirmDialog();
  };

  /**
   * Handles input change for the confirmation text field
   * 
   * @param {Event} e - Input change event
   */
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // Context value to be provided
  const contextValue = {
    openConfirmDialog,
    closeConfirmDialog,
  };

  // Determine if the confirm button should be enabled
  const isConfirmEnabled = userInput === confirmConfig.itemName;

  // Get the appropriate background color based on danger level
  const getDangerColor = () => {
    switch (confirmConfig.dangerLevel) {
      case 'low':
        return 'bg-yellow-50 dark:bg-yellow-900/20';
      case 'medium':
        return 'bg-orange-50 dark:bg-orange-900/20';
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-red-50 dark:bg-red-900/20';
    }
  };

  // Get the appropriate border color based on danger level
  const getDangerBorderColor = () => {
    switch (confirmConfig.dangerLevel) {
      case 'low':
        return 'border-yellow-200 dark:border-yellow-800';
      case 'medium':
        return 'border-orange-200 dark:border-orange-800';
      case 'high':
        return 'border-red-200 dark:border-red-800';
      default:
        return 'border-red-200 dark:border-red-800';
    }
  };

  // Get the appropriate text color for the title based on danger level
  const getTitleColor = () => {
    switch (confirmConfig.dangerLevel) {
      case 'low':
        return 'text-yellow-700 dark:text-yellow-400';
      case 'medium':
        return 'text-orange-700 dark:text-orange-400';
      case 'high':
        return 'text-red-700 dark:text-red-400';
      default:
        return 'text-red-700 dark:text-red-400';
    }
  };

  // Get the appropriate button color based on the confirmButtonColor
  const getButtonColor = () => {
    switch (confirmConfig.confirmButtonColor) {
      case 'red':
        return isConfirmEnabled 
          ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800' 
          : 'bg-red-400 cursor-not-allowed dark:bg-red-800 dark:text-red-300';
      case 'blue':
        return isConfirmEnabled 
          ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800' 
          : 'bg-blue-400 cursor-not-allowed dark:bg-blue-800 dark:text-blue-300';
      case 'green':
        return isConfirmEnabled 
          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800' 
          : 'bg-green-400 cursor-not-allowed dark:bg-green-800 dark:text-green-300';
      default:
        return isConfirmEnabled 
          ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800' 
          : 'bg-red-400 cursor-not-allowed dark:bg-red-800 dark:text-red-300';
    }
  };

  // Animation variants for the dialog
  const dialogVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 500,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Animation variants for the backdrop
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  // Animation variants for shaking effect
  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
  };

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      
      {/* Confirmation Dialog */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
              onClick={handleCancel}
            />
            
            {/* Dialog */}
            <motion.div
              className={`relative w-full max-w-md rounded-lg border-2 ${getDangerBorderColor()} ${getDangerColor()} p-6 shadow-xl dark:shadow-2xl`}
              initial="hidden"
              animate={isShaking ? "shake" : "visible"}
              exit="exit"
              variants={isShaking ? shakeVariants : dialogVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="mb-4 flex justify-center">
                <motion.div
                  initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80"
                >
                  <svg 
                    className={`h-10 w-10 ${getTitleColor()}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                    />
                  </svg>
                </motion.div>
              </div>
              
              {/* Title */}
              <motion.h3 
                className={`mb-2 text-center text-xl font-bold ${getTitleColor()}`}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {confirmConfig.title}
              </motion.h3>
              
              {/* Message */}
              <motion.p 
                className="mb-4 text-center text-gray-700 dark:text-gray-300"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {confirmConfig.message}
              </motion.p>
              
              {/* Input Field */}
              <motion.div 
                className="mb-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <label 
                  htmlFor="confirm-input" 
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Type <span className="font-bold">{confirmConfig.itemName}</span> to confirm:
                </label>
                <input
                  id="confirm-input"
                  type="text"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  value={userInput}
                  onChange={handleInputChange}
                  placeholder={`Type ${confirmConfig.itemName} to confirm`}
                  autoFocus
                />
              </motion.div>
              
              {/* Buttons */}
              <motion.div 
                className="flex justify-end space-x-3"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={handleCancel}
                >
                  {confirmConfig.cancelButtonText}
                </button>
                <button
                  className={`rounded-md px-4 py-2 text-white transition-colors ${getButtonColor()}`}
                  onClick={handleConfirm}
                  disabled={!isConfirmEnabled}
                >
                  {confirmConfig.confirmButtonText}
                </button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
};

/**
 * useConfirm - Custom hook to use the confirm dialog
 * 
 * @returns {Object} The confirm dialog methods
 */
export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  
  return context;
};

export default ConfirmContext;