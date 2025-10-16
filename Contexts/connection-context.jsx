/**
 * ConnectionContext
 * Provides global state for MongoDB connection status
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectionAPI } from '../src/services/api';

// Create context
const ConnectionContext = createContext();

/**
 * ConnectionProvider component
 * Manages connection state and provides methods to check, set and clear connection status
 */
export const ConnectionProvider = ({ children }) => {
  // State to track if database is connected
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  /**
   * Check if there's an active database connection
   */
  const checkConnectionStatus = async () => {
    setLoading(true);
    try {
      // Check localStorage for active connection
      const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
      const activeConn = savedConnections.find(conn => conn.active === true);
      
      if (activeConn) {
        // Verify connection is still valid with backend
        try {
          const response = await connectionAPI.testConnection(activeConn.connStr);
          if (response.data.success) {
            setIsConnected(true);
            setConnectionInfo(activeConn);
          } else {
            setIsConnected(false);
            setConnectionInfo(null);
          }
        } catch (error) {
          console.error('Connection verification failed:', error);
          setIsConnected(false);
          setConnectionInfo(null);
        }
      } else {
        setIsConnected(false);
        setConnectionInfo(null);
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setIsConnected(false);
      setConnectionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Set active connection
   * @param {Object} connectionData - Connection information
   */
  const setConnection = (connectionData) => {
    setIsConnected(true);
    setConnectionInfo(connectionData);
  };

  /**
   * Clear active connection
   */
  const clearConnection = () => {
    setIsConnected(false);
    setConnectionInfo(null);
    
    // Update localStorage
    const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
    savedConnections.forEach(conn => conn.active = false);
    localStorage.setItem('mongoConnections', JSON.stringify(savedConnections));
  };

  // Context value
  const value = {
    isConnected,
    connectionInfo,
    loading,
    checkConnectionStatus,
    setConnection,
    clearConnection
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

/**
 * Custom hook to use connection context
 */
export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export default ConnectionContext;