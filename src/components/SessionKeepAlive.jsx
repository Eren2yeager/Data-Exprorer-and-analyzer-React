/**
 * SessionKeepAlive Component
 * Periodically validates session to prevent expiration
 * Automatically reconnects if session is lost in serverless environments
 */
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { connectionAPI } from '../services/api';

const SessionKeepAlive = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const intervalRef = useRef(null);
  const isValidatingRef = useRef(false);

  useEffect(() => {
    const sessionId = localStorage.getItem('mongoSessionId');
    const connStr = localStorage.getItem('currentConnStr');

    // Only run on protected pages (not on connection page)
    if (!sessionId || location.pathname === '/') {
      return;
    }

    const validateSession = async () => {
      // Prevent concurrent validations
      if (isValidatingRef.current) return;
      
      isValidatingRef.current = true;

      try {
        await connectionAPI.validateSession();
        console.log('[SessionKeepAlive] Session validated successfully');
      } catch (error) {
        console.warn('[SessionKeepAlive] Session validation failed:', error.message);
        
        // If session is invalid and we have the connection string, try to reconnect
        if (connStr && error.response?.status === 401) {
          console.log('[SessionKeepAlive] Attempting to reconnect...');
          
          try {
            const response = await connectionAPI.connect(connStr);
            if (response.data.success && response.data.data.sessionId) {
              // Update session ID
              localStorage.setItem('mongoSessionId', response.data.data.sessionId);
              console.log('[SessionKeepAlive] Reconnected successfully');
            }
          } catch (reconnectError) {
            console.error('[SessionKeepAlive] Reconnection failed:', reconnectError.message);
            // Clear session and redirect to connection page
            localStorage.removeItem('mongoSessionId');
            localStorage.removeItem('currentConnStr');
            navigate('/', { 
              state: { 
                error: 'Session expired. Please reconnect to MongoDB.',
                reconnectFailed: true
              } 
            });
          }
        } else {
          // No connection string or other error - redirect to connection page
          localStorage.removeItem('mongoSessionId');
          localStorage.removeItem('currentConnStr');
          navigate('/', { 
            state: { 
              error: 'Session expired. Please reconnect to MongoDB.' 
            } 
          });
        }
      } finally {
        isValidatingRef.current = false;
      }
    };

    // Validate immediately on mount
    validateSession();

    // Then validate every 5 minutes
    intervalRef.current = setInterval(validateSession, 5 * 60 * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [location.pathname, navigate]);

  return null; // This component doesn't render anything
};

export default SessionKeepAlive;
