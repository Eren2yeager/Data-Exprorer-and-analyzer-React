/**
 * ProtectedRoute Component
 * Protects routes that require an active database connection
 * Redirects to connection page if no active connection exists
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useConnection } from '../../../Contexts/connection-context';

/**
 * ProtectedRoute component
 * Checks if database is connected before rendering child routes
 */
const ProtectedRoute = () => {
  const { isConnected, loading } = useConnection();
  
  // Show loading state while checking connection
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg">Verifying connection...</p>
      </div>
    );
  }
  
  // Redirect to connection page if not connected
  if (!isConnected) {
    return <Navigate to="/" replace />;
  }
  
  // Render child routes if connected
  return <Outlet />;
};

export default ProtectedRoute;