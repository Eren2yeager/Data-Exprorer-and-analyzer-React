import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * NotFoundPage component
 * Displays a 404 error page when a user navigates to an unrecognized route
 * Provides a button to redirect users back to the connection page
 */
const NotFoundPage = () => {
  const navigate = useNavigate();

  // Function to handle navigation back to the connection page
  const handleRedirect = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 px-4">
      <div className="text-center max-w-md w-full p-8 bg-white dark:bg-gray-700 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The page you are looking for is not available. Please connect to the database again to continue.
        </p>
        <button
          onClick={handleRedirect}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Connect to Database
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;