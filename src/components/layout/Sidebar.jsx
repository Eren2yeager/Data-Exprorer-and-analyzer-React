/**
 * Sidebar Component
 * Navigation sidebar for database and collection selection with folder structure
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Sidebar component for database navigation
 * @param {Object} props - Component props
 * @param {Array} props.databases - List of databases
 * @param {String} props.selectedDb - Currently selected database
 * @param {Array} props.collections - List of collections in selected database
 * @param {String} props.selectedColl - Currently selected collection
 * @param {Function} props.onSelectDatabase - Database selection handler
 * @param {Function} props.onSelectCollection - Collection selection handler
 */
const Sidebar = ({ 
  databases = [], 
  selectedDb, 
  collections = [], 
  selectedColl,
  onSelectDatabase,
  onSelectCollection
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to track expanded databases
  const [expandedDbs, setExpandedDbs] = useState({});
  
  // Initialize expanded state when databases change or when a database is selected
  useEffect(() => {
    if (selectedDb) {
      setExpandedDbs(prev => ({
        ...prev,
        [selectedDb]: true
      }));
    }
  }, [selectedDb, databases]);

  /**
   * Toggle database expansion
   * @param {String} dbName - Database name
   * @param {Event} e - Click event
   */
  const toggleDbExpand = (dbName, e) => {
    e.stopPropagation();
    setExpandedDbs(prev => ({
      ...prev,
      [dbName]: !prev[dbName]
    }));
  };

  /**
   * Handle database selection
   * @param {String} dbName - Database name
   */
  const handleDbSelect = (dbName) => {
    if (onSelectDatabase) {
      onSelectDatabase(dbName);
    }
    
    // Auto-expand the selected database
    // setExpandedDbs(prev => ({
    //   ...prev,
    //   [dbName]: true
    // }));
  };

  /**
   * Handle collection selection
   * @param {String} collName - Collection name
   */
  const handleCollSelect = (collName) => {
    if (onSelectCollection) {
      onSelectCollection(collName);
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

  return (
    <div className="bg-gray-100 w-64 h-full overflow-y-auto border-r border-gray-200">
      {/* Connection info */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-600">CONNECTED TO</h2>
        <div className="mt-1 text-sm text-gray-800 flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="truncate">MongoDB Connection</span>
        </div>
      </div>

      {/* Databases section with folder structure */}
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-2 hover:text-blue-800 cursor-pointer" onClick={() => { setExpandedDbs({});navigate("/databases")}}>DATABASES</h2>
        
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
                  {expandedDbs[db.name] && db.name === selectedDb && (
                    <ul className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                      {collections.length === 0 ? (
                        <li className="text-xs text-gray-500 italic">No collections found</li>
                      ) : (
                        collections.map((coll) => (
                          <li key={coll.name}>
                            <button
                              className={`w-full text-left px-2 py-1 rounded text-sm ${
                                selectedColl === coll.name
                                  ? 'bg-blue-100 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-200'
                              }`}
                              onClick={() => handleCollSelect(coll.name)}
                            >
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                </svg>
                                <span className="truncate">{coll.name}</span>
                              </div>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;