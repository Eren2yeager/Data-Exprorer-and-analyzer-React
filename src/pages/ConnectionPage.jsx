/**
 * ConnectionPage Component
 * Page for managing MongoDB connections
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ConnectionForm from '../components/connection/ConnectionForm';
import { connectionAPI } from '../services/api';

/**
 * Connection management page
 */
const ConnectionPage = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Load saved connections on component mount
   */
  useEffect(() => {
    loadConnections();
  }, []);

  /**
   * Load active connections from the API
   */
  const loadConnections = async () => {
    setLoading(true);
    try {
      const response = await connectionAPI.getConnections();
      if (response.data.success) {
        setConnections(response.data.data || []);
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
    const existingIndex = savedConnections.findIndex(conn => conn.connStr === connStr);
    
    if (existingIndex >= 0) {
      savedConnections[existingIndex] = { connStr, name, timestamp: Date.now() };
    } else {
      savedConnections.push({ connStr, name, timestamp: Date.now() });
    }
    
    localStorage.setItem('mongoConnections', JSON.stringify(savedConnections));
    
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
    return new Date(timestamp).toLocaleString();
  };

  // Load saved connections from local storage
  const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">MongoDB Connection</h1>
      
      {/* Error/Success messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection form */}
        <div>
          <ConnectionForm 
            onConnect={handleConnect} 
            onError={handleError} 
          />
        </div>
        
        {/* Saved connections */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Saved Connections</h2>
            
            {savedConnections.length === 0 ? (
              <p className="text-gray-500">No saved connections</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {savedConnections.map((conn, index) => (
                  <li key={index} className="py-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{conn.name}</h3>
                        <p className="text-sm w-full flex flex-wrap text-gray-500 truncate">{conn.connStr}</p>
                        <p className="text-xs text-gray-400">
                          Last connected: {formatDate(conn.timestamp)}
                        </p>
                      </div>
                      <button
                        onClick={() => connectToSaved(conn)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Connect
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Active connections */}
            {connections.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Active Connections</h3>
                <ul className="divide-y divide-gray-200">
                  {connections.map((conn, index) => (
                    <li key={index} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm truncate">{conn.connStr}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-500">Active</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionPage;