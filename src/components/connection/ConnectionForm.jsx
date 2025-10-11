/**
 * ConnectionForm Component
 * Form for creating and testing MongoDB connections
 */
import React, { useState } from 'react';
import { connectionAPI } from '../../services/api';

/**
 * Connection form component
 * @param {Object} props - Component props
 * @param {Function} props.onConnect - Function called after successful connection
 * @param {Function} props.onError - Function called on connection error
 */
const ConnectionForm = ({ onConnect, onError }) => {
  // Form state
  const [connectionString, setConnectionString] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Sample connection strings
  const sampleConnections = [
    { name: 'Local MongoDB', uri: 'mongodb://127.0.0.1:27017/' },
    { name: 'Atlas Sample', uri: 'mongodb+srv://username:password@cluster.mongodb.net/test' }
  ];

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
    
    setIsLoading(true);
    
    try {
      const response = await connectionAPI.connect(connectionString);
      
      if (response.data.success) {
        onConnect?.(connectionString, connectionName || 'MongoDB Connection', response.data.data);
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
   */
  const setSampleConnection = (uri) => {
    setConnectionString(uri);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Connect to MongoDB</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Connection name */}
        <div className="mb-4">
          <label htmlFor="connectionName" className="block text-sm font-medium text-gray-700 mb-1">
            Connection Name (Optional)
          </label>
          <input
            type="text"
            id="connectionName"
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="My MongoDB Connection"
          />
        </div>
        
        {/* Connection string */}
        <div className="mb-4">
          <label htmlFor="connectionString" className="block text-sm font-medium text-gray-700 mb-1">
            Connection String
          </label>
          <input
            type="text"
            id="connectionString"
            value={connectionString}
            onChange={(e) => setConnectionString(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="mongodb://127.0.0.1:27017/"
            required
          />
        </div>
        
        {/* Sample connections */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Sample connections:</p>
          <div className="flex flex-wrap gap-2">
            {sampleConnections.map((conn, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSampleConnection(conn.uri)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded"
              >
                {conn.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Advanced options toggle */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            <svg
              className={`ml-1 w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        {/* Advanced options */}
        {showAdvanced && (
          <div className="mb-4 p-3 bg-gray-50 rounded border border-gray-200">
            <div className="mb-3">
              <label htmlFor="authSource" className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Source
              </label>
              <input
                type="text"
                id="authSource"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="replicaSet" className="block text-sm font-medium text-gray-700 mb-1">
                Replica Set
              </label>
              <input
                type="text"
                id="replicaSet"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="rs0"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="ssl"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="ssl" className="ml-2 block text-sm text-gray-700">
                Use SSL
              </label>
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </span>
            ) : (
              'Connect'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConnectionForm;