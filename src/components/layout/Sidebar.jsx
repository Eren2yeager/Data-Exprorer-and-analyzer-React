/**
 * Sidebar Component
 * Navigation sidebar for database and collection selection with folder structure
 * Includes responsive behavior and animations
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../../Contexts/sidebar-context';
import { motion, AnimatePresence } from 'framer-motion';
import { collectionAPI } from '../../services/api';

/**
 * Sidebar component for database navigation
 * @param {Object} props - Component props
 * @param {Array} props.databases - List of databases
 * @param {String} props.selectedDb - Currently selected database
 * @param {Array} props.collections - List of collections in selected database
 * @param {String} props.selectedColl - Currently selected collection
 * @param {Function} props.onSelectDatabase - Database selection handler
 * @param {Function} props.onSelectCollection - Collection selection handler
 * @param {Function} props.onGetCollections - Function to get collections for a database
 * @param {String} props.connectionName - Name of the current MongoDB connection
 */
const Sidebar = ({ 
  databases = [], 
  selectedDb, 
  collections = [], 
  selectedColl,
  onSelectDatabase,
  onSelectCollection,
  onGetCollections,
  connectionName
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get sidebar state from context
  const { isSidebarOpen, closeSidebar, isMobileView } = useSidebar();
  
  // State to track expanded databases
  const [expandedDbs, setExpandedDbs] = useState({});
  
  // State to track collections for each database
  const [dbCollections, setDbCollections] = useState({});
  
  // Initialize expanded state when databases change or when a database is selected
  useEffect(() => {
    if (selectedDb) {
      setExpandedDbs(prev => ({
        ...prev,
        [selectedDb]: true
      }));
      
      // Store collections for the selected database
      if (collections.length > 0) {
        setDbCollections(prev => ({
          ...prev,
          [selectedDb]: collections
        }));
      }
    }
  }, [selectedDb, databases, collections]);

  /**
   * Toggle database expansion and load collections if needed
   * @param {String} dbName - Database name
   * @param {Event} e - Click event
   */
  const toggleDbExpand = async (dbName, e) => {
    e.stopPropagation();
    
    // Toggle expansion state
    const willExpand = !expandedDbs[dbName];
    setExpandedDbs(prev => ({
      ...prev,
      [dbName]: willExpand
    }));
    
    // If expanding and we don't have collections for this database yet, fetch them
    if (willExpand && !dbCollections[dbName] && onGetCollections) {
      try {
        // Set a loading state for this database
        setDbCollections(prev => ({
          ...prev,
          [dbName]: [] // Empty array indicates loading
        }));
        
        const response = await collectionAPI.listCollections(dbName);
        if (response && response.data && response.data.success) {
          setDbCollections(prev => ({
            ...prev,
            [dbName]: response.data.data || []
          }));
        } else {
          // If API call fails, set empty array to avoid infinite loading
          setDbCollections(prev => ({
            ...prev,
            [dbName]: []
          }));
        }
      } catch (error) {
        console.error(`Failed to load collections for ${dbName}:`, error);
        // Set empty array on error to avoid infinite loading
        setDbCollections(prev => ({
          ...prev,
          [dbName]: []
        }));
      }
    }
  };

  /**
   * Handle database selection
   * @param {String} dbName - Database name
   */
  const handleDbSelect = (dbName) => {
    if (onSelectDatabase) {
      onSelectDatabase(dbName);
    }
    
    // Close sidebar on mobile after selection
    if (isMobileView) {
      closeSidebar();
    }
  };

  /**
   * Handle collection selection
   * @param {String} dbName - Database name
   * @param {String} collName - Collection name
   */
  const handleCollSelect = (dbName, collName) => {
    // First select the database if it's not already selected
    if (selectedDb !== dbName && onSelectDatabase) {
      onSelectDatabase(dbName);
      
      // We need to wait for the database selection to be processed
      // before selecting the collection to ensure proper state updates
      setTimeout(() => {
        if (onSelectCollection) {
          onSelectCollection(collName, dbName);
        }
      }, 100);
    } else {
      // If the database is already selected, just select the collection
      if (onSelectCollection) {
        onSelectCollection(collName, dbName);
      }
    }
    
    // Close sidebar on mobile after selection
    if (isMobileView) {
      closeSidebar();
    }
  };

  /**
   * Render chevron icon based on expanded state
   * @param {Boolean} isExpanded - Whether the item is expanded
   * @returns {JSX.Element} - Chevron icon
   */
  const renderChevron = (isExpanded) => (
    <svg 
      className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-90' : ''}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
  );

  // Animation variants for the sidebar
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    closed: {
      x: isMobileView ? "-100%" : 0,
      opacity: isMobileView ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2
      }
    }
  };

  // Animation variants for the overlay
  const overlayVariants = {
    open: { opacity: 1, transition: { duration: 0.3 } },
    closed: { opacity: 0, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Mobile overlay - only visible when sidebar is open on mobile */}
      <AnimatePresence>
        {isMobileView && isSidebarOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial="closed"
            animate="open"
            exit="closed"
            variants={overlayVariants}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`bg-gray-100 w-64 h-full overflow-y-auto border-r border-gray-200 ${
          isMobileView ? 'fixed left-0 top-0 bottom-0 shadow-xl z-50' : 'relative z-20'
        }`}
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        variants={sidebarVariants}
      >
        {/* Connection info */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-600">CONNECTED TO</h2>
          <div className="mt-1 text-sm text-gray-800 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="truncate">{connectionName || "MongoDB Connection"}</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 border-b border-gray-200">
          <ul className="space-y-2">
            <li>
              <button 
                className="w-full text-left flex items-center px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => { 
                  navigate('/');
                  if (isMobileView) closeSidebar();
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path>
                </svg>
                Connections
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left flex items-center px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => { 
                  navigate('/settings');
                  if (isMobileView) closeSidebar();
                }}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Settings
              </button>
            </li>
            <li>
              <button 
                className="w-full text-left flex items-center px-2 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-200"
                onClick={() => window.open('https://portfolio-samar-gautam.netlify.app/', '_blank')}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Help
              </button>
            </li>
          </ul>
        </div>

        {/* Databases section with folder structure */}
        <div className="p-4">
          <h2 
            className="text-sm font-semibold text-gray-600 mb-2 hover:text-blue-800 cursor-pointer" 
            onClick={() => { 
              setExpandedDbs({});
              navigate("/databases");
              if (isMobileView) closeSidebar();
            }}
          >
            DATABASES
          </h2>
          
          {databases.length === 0 ? (
            <div className="text-sm text-gray-500 italic">No databases found</div>
          ) : (
            <ul className="space-y-1">
              {databases.map((db) => (
                <li key={db.name} className="mb-1">
                  {/* Database item with expand/collapse functionality */}
                  <div className="flex flex-col">
                    <button
                      className={`w-full text-left px-2 py-1 rounded text-sm ${
                        selectedDb === db.name
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => handleDbSelect(db.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
                          </svg>
                          <span className="truncate">{db.name}</span>
                        </div>
                        <div 
                          className="cursor-pointer hover:bg-gray-300 rounded p-1"
                          onClick={(e) => toggleDbExpand(db.name, e)}
                        >
                          {renderChevron(expandedDbs[db.name])}
                        </div>
                      </div>
                    </button>
                    
                    {/* Collections as nested items under database */}
                    <AnimatePresence>
                      {expandedDbs[db.name] && (
                        <motion.ul 
                          className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Show loading indicator while fetching collections */}
                          {dbCollections[db.name] === undefined ? (
                            <motion.li 
                              className="text-xs text-gray-500 italic flex items-center"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                            >
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading collections...
                            </motion.li>
                          ) : dbCollections[db.name].length === 0 ? (
                            <li className="text-xs text-gray-500 italic">No collections found</li>
                          ) : (
                            dbCollections[db.name].map((coll) => (
                              <motion.li 
                                key={coll.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <button
                                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                                    selectedDb === db.name && selectedColl === coll.name
                                      ? 'bg-blue-100 text-blue-700 font-medium'
                                      : 'text-gray-700 hover:bg-gray-200'
                                  }`}
                                  onClick={() => handleCollSelect(db.name, coll.name)}
                                >
                                  <div className="flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                    </svg>
                                    <span className="truncate">{coll.name}</span>
                                  </div>
                                </button>
                              </motion.li>
                            ))
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Close button - only visible on mobile */}
        {isMobileView && (
          <motion.button
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
            onClick={closeSidebar}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            aria-label="Close sidebar"
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M6 18L18 6M6 6l12 12" 
              />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </>
  );
};

export default Sidebar;