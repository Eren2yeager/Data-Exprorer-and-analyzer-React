/**
 * TabNavigation Component
 * Provides navigation tabs for switching between Documents, Schema, and Indexes views
 */
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * TabNavigation component for switching between collection views
 * @param {Object} props - Component props
 * @param {string} props.dbName - Database name
 * @param {string} props.collName - Collection name
 * @returns {JSX.Element} TabNavigation component
 */
const TabNavigation = ({ dbName, collName }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Define tabs with their paths and labels
  const tabs = [
    {
      path: `/databases/${dbName}/collections/${collName}/documents`,
      label: 'Documents',
      count: 1, // This would ideally come from props
    },
    {
      path: `/databases/${dbName}/collections/${collName}/schema`,
      label: 'Schema',
    },
    {
      path: `/databases/${dbName}/collections/${collName}/indexes`,
      label: 'Indexes',
      count: 2, // This would ideally come from props
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default TabNavigation;