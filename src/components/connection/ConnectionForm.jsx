/**
 * ConnectionForm Component
 * Form for creating and testing MongoDB connections with enhanced UI
 * Supports both connection string and individual connection parameters
 */
import React, { useState, useEffect } from 'react';
import { connectionAPI } from '../../services/api';
import { motion } from 'framer-motion';

/**
 * Connection form component
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Function called after successful connection
 * @param {Function} props.onError - Function called on connection error
 */
const ConnectionForm = ({ onConnect, onError }) => {
  // Connection mode - string or form
  const [connectionMode, setConnectionMode] = useState('string'); // 'string' or 'form'
  
  // Form state
  const [connectionString, setConnectionString] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Individual connection parameters
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('27017');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [database, setDatabase] = useState('');
  const [authEnabled, setAuthEnabled] = useState(false);
  
  // Sample connection strings
  const sampleConnections = [
    { name: 'Local MongoDB', uri: 'mongodb://127.0.0.1:27017/' },
    { name: 'Atlas Sample', uri: 'mongodb+srv://username:password@cluster.mongodb.net/test' },
    { name: 'Replica Set', uri: 'mongodb://localhost:27017,localhost:27018,localhost:27019/test?replicaSet=rs0' }
  ];
  
  /**
   * Build connection string from individual parameters
   */
  useEffect(() => {
    if (connectionMode === 'form') {
      let uri = 'mongodb://';
      
      // Add authentication if enabled
      if (authEnabled && username) {
        uri += `${encodeURIComponent(username)}`;
        if (password) {
          uri += `:${encodeURIComponent(password)}`;
        }
        uri += '@';
      }
      
      // Add host and port
      uri += `${host}:${port}`;
      
      // Add database if specified
      if (database) {
        uri += `/${database}`;
      }
      
      setConnectionString(uri);
    }
  }, [connectionMode, host, port, username, password, database, authEnabled]);

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connectionString) {
      onError?.('Connection string is required');
      return;
    }
    
    // Validate connection parameters if in form mode
    if (connectionMode === 'form') {
      if (!host) {
        onError?.('Host is required');
        return;
      }
      
      if (!port || isNaN(parseInt(port))) {
        onError?.('Valid port number is required');
        return;
      }
      
      if (authEnabled && !username) {
        onError?.('Username is required when authentication is enabled');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      const response = await connectionAPI.connect(connectionString);
      
      if (response.data.success) {
        // Save connection details for future use
        const connectionDetails = {
          connectionString,
          name: connectionName || 'MongoDB Connection',
          host: connectionMode === 'form' ? host : null,
          port: connectionMode === 'form' ? port : null,
          database: connectionMode === 'form' ? database : null,
          username: connectionMode === 'form' && authEnabled ? username : null,
          isLocal: connectionMode === 'form' || connectionString.includes('localhost') || connectionString.includes('127.0.0.1')
        };
        
        onConnect?.(connectionString, connectionName || 'MongoDB Connection', response.data.data, connectionDetails);
      } else {
        onError?.(response.data.message || 'Failed to connect to MongoDB');
      }
    } catch (error) {
      console.error('Connection error:', error);
      onError?.(error.response?.data?.message || error.message || 'Failed to connect to MongoDB');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Set a sample connection string
   * @param {String} uri - Connection string to set
   * @param {String} name - Connection name
   */
  const setSampleConnection = (uri, name) => {
    setConnectionString(uri);
    setConnectionName(name || 'MongoDB Connection');
  };

  // Animation variants
  const formControlVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.03,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
    },
    tap: { 
      scale: 0.97 
    }
  };

  return (
    <div>
      {/* Connection mode toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-center p-1 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
          <button
            type="button"
            onClick={() => setConnectionMode('string')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              connectionMode === 'string'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            Connection String
          </button>
          <button
            type="button"
            onClick={() => setConnectionMode('form')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              connectionMode === 'form'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            Form Input
          </button>
        </div>
        <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          {connectionMode === 'string' 
            ? 'Enter a MongoDB connection string directly' 
            : 'Connect to any MongoDB instance using individual parameters'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Connection name */}
        <motion.div 
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="group"
        >
          <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Connection Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <input
              type="text"
              id="connectionName"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
              placeholder="My MongoDB Connection"
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Give your connection a descriptive name
          </p>
        </motion.div>
        
        {connectionMode === 'string' ? (
          <>
            {/* Connection string */}
            <motion.div 
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
              className="group"
            >
              <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Connection String <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="connectionString"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
                  placeholder="mongodb://127.0.0.1:27017/"
                  required={connectionMode === 'string'}
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enter your MongoDB connection URI
              </p>
            </motion.div>
            
            {/* Sample connections */}
            <motion.div
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="mb-4"
            >
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Sample connections:
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {sampleConnections.map((conn, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => setSampleConnection(conn.uri, conn.name)}
                    className="text-sm bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-200 py-2 px-3 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm transition-all duration-200 flex items-center"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <svg className="h-4 w-4 mr-1.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    {conn.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          <>
            {/* Form-based connection parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Host */}
              <motion.div 
                variants={formControlVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="group"
              >
                <label htmlFor="host" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Host <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="host"
                    value={host}
                    onChange={(e) => setHost(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
                    placeholder="localhost"
                    required={connectionMode === 'form'}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Hostname or IP address of MongoDB server
                </p>
              </motion.div>
              
              {/* Port */}
              <motion.div 
                variants={formControlVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.2 }}
                className="group"
              >
                <label htmlFor="port" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Port <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="port"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
                    placeholder="27017"
                    required={connectionMode === 'form'}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Default MongoDB port is 27017
                </p>
              </motion.div>
            </div>
            
            {/* Database name */}
            <motion.div 
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="group"
            >
              <label htmlFor="database" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Database Name <span className="text-gray-500">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="database"
                  value={database}
                  onChange={(e) => setDatabase(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
                  placeholder="admin"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Leave empty to connect without selecting a database
              </p>
            </motion.div>
            
            {/* Authentication toggle */}
            <motion.div 
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="flex items-center mb-4"
            >
              <input
                type="checkbox"
                id="authEnabled"
                checked={authEnabled}
                onChange={(e) => setAuthEnabled(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="authEnabled" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Enable Authentication
              </label>
            </motion.div>
            
            {/* Authentication fields */}
            {authEnabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
              >
                {/* Username */}
                <div className="group">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
                      placeholder="admin"
                      required={authEnabled}
                    />
                  </div>
                </div>
                
                {/* Password */}
                <div className="group">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200 shadow-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Connection string preview */}
            <motion.div 
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700"
            >
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Generated Connection String:</p>
              <p className="font-mono text-sm text-gray-800 dark:text-gray-200 break-all">{connectionString}</p>
            </motion.div>
          </>
        )}
        
        
        {/* Advanced options toggle */}
        <motion.div
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="mb-4"
        >
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center transition-colors duration-200 font-medium"
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            <svg
              className={`ml-1.5 w-4 h-4 transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </motion.div>
        
        {/* Advanced options */}
        {showAdvanced && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
          >
            <div className="mb-4">
              <label htmlFor="authSource" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Authentication Source
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="authSource"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="admin"
                />
              </div>
            </div>
            
            <div className="mb-2">
              <label htmlFor="replicaSet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Replica Set
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="replicaSet"
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="rs0"
                />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ssl"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ssl" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Use SSL
              </label>
            </div>
          </div>
        </motion.div>
        )}
        
        {/* Submit button */}
        <motion.div
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <motion.button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-lg shadow-md text-base font-medium text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            variants={buttonVariants}
            whileHover={!isLoading && "hover"}
            whileTap={!isLoading && "tap"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 15 
              }
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <motion.svg 
                  className="mr-2 h-5 w-5" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                  }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </motion.svg>
                <span>Connect to MongoDB</span>
              </>
            )}
          </motion.button>
          <motion.p 
            className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Connection details will be saved locally
          </motion.p>
        </motion.div>
      </form>
    </div>
  );
};

export default ConnectionForm;