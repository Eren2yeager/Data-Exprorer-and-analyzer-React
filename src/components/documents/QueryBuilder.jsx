/**
 * QueryBuilder Component
 * Provides an interface for building MongoDB queries with syntax highlighting
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * QueryBuilder component for building MongoDB queries
 * @param {Object} props - Component props
 * @param {string} props.query - Initial query string
 * @param {string} props.sort - Initial sort string
 * @param {Function} props.onQueryChange - Query change handler
 * @param {Function} props.onSortChange - Sort change handler
 * @param {Function} props.onSubmit - Form submit handler
 * @returns {JSX.Element} QueryBuilder component
 */
const QueryBuilder = ({ query, sort, onQueryChange, onSortChange, onSubmit }) => {
  const [expanded, setExpanded] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Validate JSON input
   * @param {string} jsonStr - JSON string to validate
   * @returns {boolean} Is valid JSON
   */
  const validateJson = (jsonStr) => {
    try {
      if (jsonStr) {
        JSON.parse(jsonStr);
      }
      setError(null);
      return true;
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      return false;
    }
  };

  /**
   * Handle query change
   * @param {Event} e - Change event
   */
  const handleQueryChange = (e) => {
    const value = e.target.value;
    onQueryChange(value);
    validateJson(value);
  };

  /**
   * Handle sort change
   * @param {Event} e - Change event
   */
  const handleSortChange = (e) => {
    const value = e.target.value;
    onSortChange(value);
    validateJson(value);
  };

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate both query and sort
    const isQueryValid = validateJson(query);
    const isSortValid = validateJson(sort);
    
    if (isQueryValid && isSortValid) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4"
    >
      <div 
        className="flex justify-between items-center px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center">
          <svg
            className={`h-5 w-5 text-gray-500 mr-2 transform transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
          <h3 className="text-sm font-medium text-gray-700">Query Documents</h3>
        </div>
        <button
          type="button"
          className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          <span className="sr-only">{expanded ? 'Collapse' : 'Expand'}</span>
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {expanded ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            )}
          </svg>
        </button>
      </div>
      
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4"
        >
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter (JSON)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{'{'}</span>
                  </div>
                  <textarea
                    className="w-full pl-7 pr-7 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows="3"
                    value={query}
                    onChange={handleQueryChange}
                    placeholder='"field": "value"'
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{'}'}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {`Example: "name": "John", "age": {"$gt": 25}`}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort (JSON)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{'{'}</span>
                  </div>
                  <textarea
                    className="w-full pl-7 pr-7 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows="3"
                    value={sort}
                    onChange={handleSortChange}
                    placeholder='"field": 1'
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{'}'}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Example: "name": 1 (ascending), "age": -1 (descending)
                </p>
              </div>
            </div>
            
            {error && (
              <div className="mt-2 text-sm text-red-600">{error}</div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Build your query using MongoDB query syntax
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Run Query
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
};

export default QueryBuilder;