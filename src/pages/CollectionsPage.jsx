/**
 * CollectionsPage Component
 * Page for displaying and managing collections within a MongoDB database
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collectionAPI } from '../services/api';
import useConfirmDialog from '../hooks/useConfirmDialog';
/**
 * Collections page component
 */
const CollectionsPage = () => {
  const { dbName } = useParams();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCollName, setNewCollName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  // State for rename collection functionality
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [collectionToRename, setCollectionToRename] = useState(null);
  const [newRenameValue, setNewRenameValue] = useState('');
 
  const {
    confirmDeleteCollection
  } = useConfirmDialog();
  /**
   * Load collections on component mount
   */
  useEffect(() => {
    if (!dbName) {
      navigate('/databases');
      return;
    }
    
    loadCollections();
  }, [dbName, navigate]);

  /**
   * Load collections from API
   */
  const loadCollections = async () => {
    setLoading(true);
    try {
      const response = await collectionAPI.listCollections(dbName);
      if (response.data.success) {
        setCollections(response.data.data || []);
        console.log("Collections:",collections);
      } else {
        setError(response.data.message || 'Failed to load collections');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle collection selection
   * @param {String} collName - Collection name
   */
  const handleSelectCollection = (collName) => {
    setSelectedCollection(collName);
    navigate(`/databases/${dbName}/collections/${collName}/documents`);
  };

  /**
   * Handle collection creation
   * @param {Event} e - Form submit event
   */
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollName.trim()) return;
    
    setLoading(true);
    try {
      const response = await collectionAPI.createCollection(dbName, newCollName);
      if (response.data.success) {
        setNewCollName('');
        setShowCreateForm(false);
        loadCollections();
      } else {
        setError(response.data.message || 'Failed to create collection');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle collection deletion
   * @param {String} collName - Collection name
   */
  const handleDeleteCollection = async (collName) => {

    confirmDeleteCollection({
      collectionName: collName,
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await collectionAPI.dropCollection(dbName, collName);
          if (response.data.success) {
            loadCollections();
          } else {
            setError(response.data.message || 'Failed to drop collection');
          }
        } catch (error) {
          setError(error.response?.data?.message || error.message || 'Failed to drop collection');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => console.log('Delete cancelled')
    });
  };
  
  /**
   * Handle initiating collection rename
   * @param {String} collName - Collection name to rename
   */
  const handleInitiateRename = (collName) => {
    setCollectionToRename(collName);
    setNewRenameValue(collName);
    setShowRenameForm(true);
  };
  
  /**
   * Handle collection rename submission
   * @param {Event} e - Form submit event
   */
  const handleRenameCollection = async (e) => {
    e.preventDefault();
    if (!newRenameValue.trim() || newRenameValue === collectionToRename) {
      setShowRenameForm(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await collectionAPI.renameCollection(dbName, collectionToRename, newRenameValue);
      if (response.data.success) {
        setShowRenameForm(false);
        setCollectionToRename(null);
        setNewRenameValue('');
        loadCollections();
      } else {
        setError(response.data.message || 'Failed to rename collection');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to rename collection');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Cancel rename operation
   */
  const handleCancelRename = () => {
    setShowRenameForm(false);
    setCollectionToRename(null);
    setNewRenameValue('');
  };

  /**
   * Navigate back to databases page
   */
  const handleBackToDatabases = () => {
    navigate('/databases');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackToDatabases}
          className="mr-3 p-2 rounded hover:bg-gray-200"
          title="Back to Databases"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">
          <span className="text-gray-500">Database:</span> {dbName}
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Collections ({collections.length})</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'Cancel' : 'Create Collection'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create collection form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Create New Collection</h3>
          <form onSubmit={handleCreateCollection}>
            <div className="flex">
              <input
                type="text"
                value={newCollName}
                onChange={(e) => setNewCollName(e.target.value)}
                placeholder="Collection name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-blue-400"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Rename collection form */}
      {showRenameForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-3">Rename Collection: {collectionToRename}</h3>
          <form onSubmit={handleRenameCollection}>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0">
              <input
                type="text"
                value={newRenameValue}
                onChange={(e) => setNewRenameValue(e.target.value)}
                placeholder="New collection name"
                className="w-full sm:flex-1 px-3 py-2 border border-gray-300 rounded sm:rounded-l sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex sm:flex-none">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded sm:rounded-l-none sm:rounded-r hover:bg-blue-700 disabled:bg-blue-400"
                >
                  Rename
                </button>
                <button
                  type="button"
                  onClick={handleCancelRename}
                  className="ml-2 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Collections list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : collections.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No collections found in this database</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div
              key={collection.name}
              className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
                selectedCollection === collection.name ? 'border-blue-500' : 'border-transparent'
              } hover:border-blue-300 transition-colors`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 
                    className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSelectCollection(collection.name)}
                  >
                    {collection.name}
                  </h3>
                  <div className="text-sm text-gray-500">
                    <p>Documents: {collection.count || 0}</p>
                    <p>Size: {formatSize(collection.size || 0)}</p>
                  </div>
                </div>
                <div className="flex">
                  <button
                    onClick={() => handleSelectCollection(collection.name)}
                    className="mr-2 p-2 text-blue-600 hover:bg-blue-100 rounded"
                    title="View Documents"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleInitiateRename(collection.name)}
                    className="mr-2 p-2 text-green-600 hover:bg-green-100 rounded flex items-center justify-center"
                    title="Rename Collection"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-5 md:w-5 sm:h-4 sm:w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                   
                  </button>
                  <button
                    onClick={() => handleDeleteCollection(collection.name)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                    title="Drop Collection"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Format byte size to human-readable format
 * @param {Number} bytes - Size in bytes
 * @returns {String} Formatted size string
 */
const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default CollectionsPage;