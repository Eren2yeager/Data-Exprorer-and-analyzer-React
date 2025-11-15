/**
 * ConnectionContext
 * Provides global state for MongoDB connection status using session-based authentication
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectionAPI } from '../src/services/api';

const ConnectionContext = createContext();

export const ConnectionProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    setLoading(true);
    try {
      const storedSessionId = localStorage.getItem('mongoSessionId');
      const storedConnInfo = localStorage.getItem('connectionInfo');
      
      if (storedSessionId && storedConnInfo) {
        try {
          const response = await connectionAPI.getSessions();
          if (response.data.success) {
            setIsConnected(true);
            setSessionId(storedSessionId);
            setConnectionInfo(JSON.parse(storedConnInfo));
          } else {
            clearConnection();
          }
        } catch (error) {
          console.log('Session validation failed:', error.message);
          clearConnection();
        }
      } else {
        setIsConnected(false);
        setSessionId(null);
        setConnectionInfo(null);
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setIsConnected(false);
      setSessionId(null);
      setConnectionInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const connect = async (connStr, name = 'MongoDB Connection') => {
    try {
      const response = await connectionAPI.connect(connStr);
      
      if (response.data.success) {
        const newSessionId = response.data.data.sessionId;
        const connInfo = {
          name,
          connStr,
          serverInfo: response.data.data.serverInfo,
          connectedAt: new Date().toISOString()
        };

        localStorage.setItem('mongoSessionId', newSessionId);
        localStorage.setItem('connectionInfo', JSON.stringify(connInfo));

        setSessionId(newSessionId);
        setConnectionInfo(connInfo);
        setIsConnected(true);

        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Connection failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Connection failed' 
      };
    }
  };

  const connectLocal = async () => {
    try {
      const response = await connectionAPI.connectLocal();
      
      if (response.data.success) {
        const newSessionId = response.data.data.sessionId;
        const connInfo = {
          name: 'Local MongoDB',
          connStr: 'mongodb://localhost:27017',
          serverInfo: response.data.data.serverInfo,
          isLocal: true,
          connectedAt: new Date().toISOString()
        };

        localStorage.setItem('mongoSessionId', newSessionId);
        localStorage.setItem('connectionInfo', JSON.stringify(connInfo));

        setSessionId(newSessionId);
        setConnectionInfo(connInfo);
        setIsConnected(true);

        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message };
      }
    } catch (error) {
      console.error('Local connection failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Local MongoDB not available' 
      };
    }
  };

  const checkLocalAvailability = async () => {
    try {
      const response = await connectionAPI.checkLocal();
      return response.data.data.available;
    } catch (error) {
      console.error('Failed to check local MongoDB:', error);
      return false;
    }
  };

  const disconnect = async () => {
    try {
      if (sessionId) {
        await connectionAPI.disconnect();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      clearConnection();
    }
  };

  const clearConnection = () => {
    setIsConnected(false);
    setSessionId(null);
    setConnectionInfo(null);
    
    localStorage.removeItem('mongoSessionId');
    localStorage.removeItem('connectionInfo');
  };

  const value = {
    isConnected,
    connectionInfo,
    sessionId,
    loading,
    connect,
    connectLocal,
    checkLocalAvailability,
    disconnect,
    clearConnection,
    checkConnectionStatus
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export default ConnectionContext;
