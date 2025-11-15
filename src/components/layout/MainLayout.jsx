/**
 * MainLayout Component
 * Main application layout with header, sidebar, and content area
 */
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { databaseAPI, collectionAPI } from '../../services/api';
import { useSidebar } from '../../../Contexts/sidebar-context';

/**
 * MainLayout component that provides the application structure
 * Fetches databases and collections from API and handles navigation
 */
const MainLayout = () => {
  // Router hooks
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get sidebar state from context
  const { isSidebarOpen } = useSidebar();
  
  // Application state
  const [databases, setDatabases] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedDb, setSelectedDb] = useState(null);
  const [selectedColl, setSelectedColl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connectionName, setConnectionName] = useState("");

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
   * Load connection info when component mounts
   */
  useEffect(() => {
    // Get connection info from localStorage (set by connection-context)
    const connectionInfo = localStorage.getItem('connectionInfo');
    
    if (connectionInfo) {
      try {
        const connInfo = JSON.parse(connectionInfo);
        setConnectionName(connInfo.name || 'MongoDB Connection');
      } catch (error) {
        console.error('Failed to parse connection info:', error);
        setConnectionName('MongoDB Connection');
      }
    } else {
      // Fallback: try to get from saved connections
      const savedConnections = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
      if (savedConnections.length > 0) {
        const mostRecent = savedConnections[0];
        setConnectionName(mostRecent.name || 'MongoDB Connection');
      } else {
        setConnectionName('MongoDB Connection');
      }
    }
    
    // Load databases
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
   * @param {String} dbName - Optional database name, used when selecting from a different database
   */
  const handleSelectCollection = (collName, dbName) => {
    // If dbName is provided and different from selectedDb, use it instead
    const targetDb = dbName && dbName !== selectedDb ? dbName : selectedDb;
    setSelectedColl(collName);
    navigate(`/databases/${targetDb}/collections/${collName}/documents`);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <Header />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - controlled by sidebar context */}
        <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block z-20`}>
          <Sidebar
            databases={databases}
            selectedDb={selectedDb}
            collections={collections}
            selectedColl={selectedColl}
            onSelectDatabase={handleSelectDatabase}
            onSelectCollection={handleSelectCollection}
            onGetCollections={loadCollections}
            loading={loading}
            connectionName={connectionName}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;