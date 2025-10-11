/**
 * Header Component
 * Main application header with logo and navigation
 */
import React from 'react';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {/* Logo */}
          <svg 
            className="w-8 h-8 text-green-500" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          <h1 className="text-xl font-bold">MongoDB Data Explorer</h1>
        </div>
        
        {/* Navigation */}
        <nav>
          <ul className="flex space-x-4">
            <li>
              <button className="hover:text-green-400 transition-colors">
                Connections
              </button>
            </li>
            <li>
              <button className="hover:text-green-400 transition-colors">
                Settings
              </button>
            </li>
            <li>
              <button className="hover:text-green-400 transition-colors">
                Help
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;