/**
 * MainLayout Component
 * Main application layout with header, sidebar, and content area
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { databaseAPI, collectionAPI } from '../../services/api';

/**
 * MainLayout component that provides the application structure
 * Fetches databases and collections from API and handles navigation
 */
const MainLayout = () => {
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // Application state
  const [databases, setDatabases] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedColl, setSelectedColl] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // State for sidebar visibility on mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /**
   * Extract database and collection from URL path
   */
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const dbIndex = pathParts.indexOf('databases');
    
    if (dbIndex !== -1 && pathParts.length > dbIndex + 1) {
      const dbName = pathParts[dbIndex + 1];
      setSelectedDb(dbName);
      
      const collIndex = pathParts.indexOf('collections');
      if (collIndex !== -1 && pathParts.length > collIndex + 1) {
        const collName = pathParts[collIndex + 1];
        setSelectedColl(collName);
      } else {
        setSelectedColl(null);
      }
    } else {
      setSelectedDb(null);
      setSelectedColl(null);
    }
  }, [location.pathname]);

  /**
   * Load databases when component mounts
   */
  useEffect(() => {
    loadDatabases();
  }, []);

  /**
   * Load collections when database is selected
   */
  useEffect(() => {
    if (selectedDb) {
      loadCollections(selectedDb);
    } else {
      setCollections([]);
    }
  }, [selectedDb]);

  /**
   * Load databases from API
   */
  const loadDatabases = async () => {
    setLoading(true);
    try {
      const response = await databaseAPI.listDatabases();
      if (response.data.success) {
        setDatabases(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to load databases:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load collections for a database
   * @param {String} dbName - Database name
   */
  const loadCollections = async (dbName) => {
    setLoading(true);
    try {
      const response = await collectionAPI.listCollections(dbName);
      if (response.data.success) {
        setCollections(response.data.data || []);
      }
    } catch (error) {
      console.error(`Failed to load collections for ${dbName}:`, error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle database selection
   * @param {String} dbName - Database name
   */
  const handleSelectDatabase = (dbName) => {
    setSelectedDb(dbName);
    navigate(`/databases/${dbName}/collections`);
  };

  /**
   * Handle collection selection
   * @param {String} collName - Collection name
   */
  const handleSelectCollection = (collName) => {
    setSelectedColl(collName);
    navigate(`/databases/${selectedDb}/collections/${collName}/documents`);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless toggled */}
        <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block w-64 border-r`}>
          <Sidebar
            databases={databases}
            selectedDb={selectedDb}
            collections={collections}
            selectedColl={selectedColl}
            onSelectDatabase={handleSelectDatabase}
            onSelectCollection={handleSelectCollection}
            loading={loading}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;