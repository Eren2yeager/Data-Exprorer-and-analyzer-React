/**
 * ConnectionPage Component
 * Page for managing MongoDB connections
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionForm from '../components/connection/ConnectionForm';
import { connectionAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Connection management page
 */
const ConnectionPage = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'saved'

  /**
   * Load saved connections on component mount
   */
  useEffect(() => {
    loadConnections();
    
    // Auto-dismiss notifications after 5 seconds
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  /**
   * Load active connections from the API and localStorage
   */
  const loadConnections = async () => {
    setLoading(true);
    try {
      // Get active connections from API
      const response = await connectionAPI.getConnections();
      if (response.data.success) {
        setConnections(response.data.data || []);
      }
      
      // Also check localStorage for active connections
      const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
      const activeConn = savedConnections.find(conn => conn.active === true);
      if (activeConn && !connections.some(conn => conn.connStr === activeConn.connStr)) {
        setConnections(prev => [...prev, { 
          connStr: activeConn.connStr,
          name: activeConn.name
        }]);
      }
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle successful connection
   * @param {String} connStr - Connection string
   * @param {String} name - Connection name
   * @param {Object} data - Connection data
   */
  const handleConnect = (connStr, name, data) => {
    setSuccess(`Connected successfully to ${name}`);
    setError(null);
    
    // Store connection in local storage for persistence
    const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
    
    // Set all connections to inactive first
    savedConnections.forEach(conn => conn.active = false);
    
    const existingIndex = savedConnections.findIndex(conn => conn.connStr === connStr);
    
    if (existingIndex >= 0) {
      savedConnections[existingIndex] = { 
        connStr, 
        name, 
        timestamp: Date.now(),
        active: true 
      };
    } else {
      savedConnections.push({ 
        connStr, 
        name, 
        timestamp: Date.now(),
        active: true 
      });
    }
    
    localStorage.setItem('mongoConnections', JSON.stringify(savedConnections));
    forceUpdate();
    loadConnections(); // Reload connections to update active connections list
    
    // Navigate to database list
    setTimeout(() => {
      navigate('/databases', { state: { connStr } });
    }, 1000);
  };

  /**
   * Handle connection error
   * @param {String} message - Error message
   */
  const handleError = (message) => {
    setError(message);
    setSuccess(null);
  };

  /**
   * Connect to a saved connection
   * @param {Object} connection - Connection object
   */
  const connectToSaved = async (connection) => {
    setLoading(true);
    try {
      const response = await connectionAPI.connect(connection.connStr);
      
      if (response.data.success) {
        handleConnect(connection.connStr, connection.name, response.data.data);
      } else {
        handleError(response.data.message || 'Failed to connect');
      }
    } catch (error) {
      handleError(error.response?.data?.message || error.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format timestamp to readable date
   * @param {Number} timestamp - Timestamp in milliseconds
   * @returns {String} Formatted date string
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show full date
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Delete a saved connection
   * @param {Number} index - Connection index
   */
  const deleteConnection = (index) => {
    const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
    savedConnections.splice(index, 1);
    localStorage.setItem('mongoConnections', JSON.stringify(savedConnections));
    setDeleteConfirm(null);
    // Force re-render
    forceUpdate();
  };

  /**
   * Force component update
   */
  const forceUpdate = () => {
    setSavedConnectionsList(JSON.parse(localStorage.getItem('mongoConnections') || '[]'));
  };

  // Load saved connections from local storage
  const [savedConnectionsList, setSavedConnectionsList] = useState(
    JSON.parse(localStorage.getItem('mongoConnections') || '[]')
  );

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const notificationVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header with animated gradient text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              MongoDB Connection
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect to your MongoDB instances and explore your data with ease
          </p>
        </motion.div>
        
        {/* Error/Success messages */}
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <AnimatePresence>
            {error && (
              <motion.div 
                key="error"
                variants={notificationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg shadow-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="ml-auto flex-shrink-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5 }}
                  className="h-1 bg-red-300 dark:bg-red-700 mt-2 rounded-full"
                />
              </motion.div>
            )}
            
            {success && (
              <motion.div 
                key="success"
                variants={notificationVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
                  </div>
                  <button 
                    onClick={() => setSuccess(null)}
                    className="ml-auto flex-shrink-0 text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5 }}
                  className="h-1 bg-green-300 dark:bg-green-700 mt-2 rounded-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Mobile tab switcher */}
        <div className="lg:hidden mb-6">
          <div className="flex rounded-lg bg-white dark:bg-gray-800 p-1 shadow-md">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'new'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              New Connection
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Saved Connections {savedConnectionsList.length > 0 && `(${savedConnectionsList.length})`}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Connection form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: activeTab === 'new' || window.innerWidth >= 1024 ? 1 : 0,
              x: activeTab === 'new' || window.innerWidth >= 1024 ? 0 : -20,
              height: activeTab === 'new' || window.innerWidth >= 1024 ? 'auto' : 0
            }}
            transition={{ duration: 0.5 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 ${
              activeTab !== 'new' && window.innerWidth < 1024 ? 'hidden' : ''
            }`}
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-white">New Connection</h2>
                  <p className="text-blue-100 text-sm">Connect to a MongoDB instance</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <ConnectionForm 
                onConnect={handleConnect} 
                onError={handleError} 
              />
            </div>
          </motion.div>
          
          {/* Saved connections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: activeTab === 'saved' || window.innerWidth >= 1024 ? 1 : 0,
              x: activeTab === 'saved' || window.innerWidth >= 1024 ? 0 : 20,
              height: activeTab === 'saved' || window.innerWidth >= 1024 ? 'auto' : 0
            }}
            transition={{ duration: 0.5 }}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 ${
              activeTab !== 'saved' && window.innerWidth < 1024 ? 'hidden' : ''
            }`}
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-lg">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h2 className="text-xl font-bold text-white">Saved Connections</h2>
                  <p className="text-purple-100 text-sm">Quick access to your MongoDB instances</p>
                </div>
              </div>
            </div>
            <div className="p-6 max-h-[600px] overflow-y-auto">
              {savedConnectionsList.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-center py-12"
                >
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-full p-4 inline-flex mx-auto mb-4">
                    <svg className="h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No saved connections</h3>
                  <p className="text-gray-500 dark:text-gray-400">Connect to a database to save it here</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('new')}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 lg:hidden"
                  >
                    Create New Connection
                  </motion.button>
                </motion.div>
              ) : (
                <motion.ul 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {savedConnectionsList.map((conn, index) => (
                    <motion.li 
                      key={index} 
                      variants={itemVariants}
                      className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-700"
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                      }}
                    >
                      <div className="flex flex-col  justify-between items-start">
                        <div className=" w-full mb-3 sm:mb-0">
                          {conn.isEditing ? (
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Connection Name</label>
                              <input 
                                type="text" 
                                value={conn.editName || conn.name} 
                                onChange={(e) => {
                                  const updatedConnections = [...savedConnectionsList];
                                  updatedConnections[index] = { ...conn, editName: e.target.value };
                                  setSavedConnectionsList(updatedConnections);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                              />
                            </div>
                          ) : (
                            <h3 className="font-medium text-gray-900 dark:text-white text-lg flex items-center">
                              <svg className="h-5 w-5 text-indigo-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                              </svg>
                              {conn.name}
                            </h3>
                          )}
                          
                          {conn.isEditing ? (
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Connection String</label>
                              <input 
                                type="text" 
                                value={conn.editConnStr || conn.connStr} 
                                onChange={(e) => {
                                  const updatedConnections = [...savedConnectionsList];
                                  updatedConnections[index] = { ...conn, editConnStr: e.target.value };
                                  setSavedConnectionsList(updatedConnections);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white text-sm"
                              />
                            </div>
                          ) : (
                            <div className="mt-2 flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-1.5">
                              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px] sm:max-w-xs">{conn.connStr}</p>
                            </div>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                            <svg className="h-3.5 w-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDate(conn.timestamp)}
                          </p>
                        </div>
                        <div className="flex space-x-2 w-full sm:w-auto mt-3 ">
                          {conn.isEditing ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const updatedConnections = [...savedConnectionsList];
                                  updatedConnections[index] = { 
                                    ...conn, 
                                    name: conn.editName || conn.name,
                                    connStr: conn.editConnStr || conn.connStr,
                                    isEditing: false 
                                  };
                                  setSavedConnectionsList(updatedConnections);
                                  localStorage.setItem('mongoConnections', JSON.stringify(updatedConnections));
                                }}
                                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm font-medium shadow-sm transition-all duration-200 flex items-center justify-center"
                              >
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span>Save</span>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const updatedConnections = [...savedConnectionsList];
                                  updatedConnections[index] = { ...conn, isEditing: false };
                                  setSavedConnectionsList(updatedConnections);
                                }}
                                className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => connectToSaved(conn)}
                                disabled={loading}
                                className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium shadow-sm transition-all duration-200 flex items-center justify-center"
                              >
                                {loading ? (
                                  <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <>
                                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>Connect</span>
                                  </>
                                )}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  const updatedConnections = [...savedConnectionsList];
                                  updatedConnections[index] = { 
                                    ...conn, 
                                    isEditing: true,
                                    editName: conn.name,
                                    editConnStr: conn.connStr
                                  };
                                  setSavedConnectionsList(updatedConnections);
                                }}
                                className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200 flex items-center justify-center"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDeleteConfirm(index)}
                                className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium transition-all duration-200"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Delete confirmation */}
                      <AnimatePresence>
                        {deleteConfirm === index && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-100 dark:border-red-800"
                          >
                            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Are you sure you want to delete this connection?</p>
                            <div className="mt-3 flex space-x-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => deleteConnection(index)}
                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 shadow-sm hover:shadow transition-all duration-200 flex-1"
                              >
                                Delete
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex-1"
                              >
                                Cancel
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
              
              {/* Active connections */}
              {connections.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <span className="relative flex h-3 w-3 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Active Connections
                  </h3>
                  <ul className="bg-gray-50 dark:bg-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-600 overflow-hidden">
                    {connections.map((conn, index) => (
                      <li key={index} className="py-3 px-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-150">
                        <div className="flex items-center">
                          <div className="bg-green-100 dark:bg-green-900/30 p-1.5 rounded-full mr-3">
                            <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs">{conn.connStr}</p>
                        </div>
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300">
                            Active
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>MongoDB Data Explorer and Analyzer</p>
          <p className="mt-1">Connect, explore, and analyze your MongoDB data with ease</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ConnectionPage;