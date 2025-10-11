// toast-Contex.jsx
// This context provides toast notification functionality throughout the application
// It allows displaying success, error, info, and warning messages from anywhere in the app
import React, { createContext, useContext, useState } from 'react';

// Create the toast context
const ToastContext = createContext();

// Toast types for different message styles
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

/**
 * ToastProvider component that wraps the application and provides toast functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function ToastProvider({ children }) {
  // State to manage multiple toast messages
  const [toasts, setToasts] = useState([]);

  /**
   * Add a new toast message to the stack
   * @param {string} message - The message to display
   * @param {string} type - The type of toast (success, error, info, warning)
   * @param {number} duration - How long the toast should display in milliseconds
   */
  const addToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    // Create a unique ID for this toast
    const id = Date.now().toString();
    
    // Add the new toast to the stack
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    
    // Remove the toast after the specified duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  /**
   * Remove a toast by its ID
   * @param {string} id - The ID of the toast to remove
   */
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  /**
   * Convenience method for success toasts
   * @param {string} message - The success message
   * @param {number} duration - How long the toast should display
   */
  const showSuccess = (message, duration) => {
    addToast(message, TOAST_TYPES.SUCCESS, duration);
  };

  /**
   * Convenience method for error toasts
   * @param {string} message - The error message
   * @param {number} duration - How long the toast should display
   */
  const showError = (message, duration) => {
    addToast(message, TOAST_TYPES.ERROR, duration);
  };

  /**
   * Convenience method for info toasts
   * @param {string} message - The info message
   * @param {number} duration - How long the toast should display
   */
  const showInfo = (message, duration) => {
    addToast(message, TOAST_TYPES.INFO, duration);
  };

  /**
   * Convenience method for warning toasts
   * @param {string} message - The warning message
   * @param {number} duration - How long the toast should display
   */
  const showWarning = (message, duration) => {
    addToast(message, TOAST_TYPES.WARNING, duration);
  };

  // The value to be provided to consumers of this context
  const contextValue = {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toast container that displays all active toasts */}
      <div className="toast-container fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast p-4 rounded shadow-lg flex justify-between items-center min-w-[300px] animate-fade-in ${
              toast.type === TOAST_TYPES.SUCCESS
                ? 'bg-green-100 border-l-4 border-green-500 text-green-700'
                : toast.type === TOAST_TYPES.ERROR
                ? 'bg-red-100 border-l-4 border-red-500 text-red-700'
                : toast.type === TOAST_TYPES.WARNING
                ? 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700'
                : 'bg-blue-100 border-l-4 border-blue-500 text-blue-700'
            }`}
          >
            <div>{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to use the toast context
 * @returns {Object} Toast context methods and state
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Export toast types for external use
export { TOAST_TYPES };