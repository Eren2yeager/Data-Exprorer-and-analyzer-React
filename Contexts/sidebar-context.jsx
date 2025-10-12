import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * SidebarContext - Context for managing sidebar state across the application
 * 
 * This context provides state and functions to control the sidebar visibility
 * and handle responsive behavior with animations.
 */
const SidebarContext = createContext();

/**
 * SidebarProvider - Provider component for the SidebarContext
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const SidebarProvider = ({ children }) => {
  // State to track if the sidebar is open
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // State to track if we're in mobile view
  const [isMobileView, setIsMobileView] = useState(false);

  /**
   * Toggle sidebar visibility
   */
  const toggleSidebar = () => {
    // Add a class to track that we're toggling the sidebar
    document.documentElement.classList.add('sidebar-toggling');
    
    // Toggle sidebar state
    setIsSidebarOpen(prev => !prev);
    
    // Remove the class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('sidebar-toggling');
    }, 500);
  };

  /**
   * Open the sidebar
   */
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  /**
   * Close the sidebar
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Effect to handle responsive behavior based on screen size
  useEffect(() => {
    const handleResize = () => {
      // Consider mobile view when width is less than 768px (tailwind md breakpoint)
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      
      // Only auto-close sidebar on initial mobile view detection, not during toggle
      if (mobile && isSidebarOpen && !document.documentElement.classList.contains('sidebar-toggling')) {
        setIsSidebarOpen(false);
      }
      
      // Auto-open sidebar on desktop view
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSidebarOpen]);

  // Context value to be provided
  const contextValue = {
    isSidebarOpen,
    isMobileView,
    toggleSidebar,
    openSidebar,
    closeSidebar
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
};

/**
 * useSidebar - Custom hook to use the sidebar context
 * 
 * @returns {Object} The sidebar context value
 */
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
};

export default SidebarContext;