/**
 * CollectionsPage Component - Redesigned
 * Modern collection browser with statistics, search, and management features
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collectionAPI } from '../services/api';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Modal,
  Badge,
  CardSkeleton,
  EmptyState,
} from '../components/ui';

const CollectionsPage = () => {
  const { dbName } = useParams();
  const navigate = useNavigate();
  
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [newCollName, setNewCollName] = useState('');
  const [collectionToRename, setCollectionToRename] = useState(null);
  const [newRenameValue, setNewRenameValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (!dbName) {
      navigate('/databases');
      return;
    }
    loadCollections();
  }, [dbName]);

  const loadCollections = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await collectionAPI.listCollections(dbName);
      if (response.data.success) {
        setCollections(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load collections');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollName.trim()) return;
    
    setCreating(true);
    
    try {
      const response = await collectionAPI.createCollection(dbName, newCollName);
      if (response.data.success) {
        setNewCollName('');
        setShowCreateModal(false);
        loadCollections();
      } else {
        setError(response.data.message || 'Failed to create collection');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create collection');
    } finally {
      setCreating(false);
    }
  };

  const handleRenameCollection = async (e) => {
    e.preventDefault();
    if (!newRenameValue.trim() || newRenameValue === collectionToRename) {
      setShowRenameModal(false);
      return;
    }
    
    setRenaming(true);
    
    try {
      const response = await collectionAPI.renameCollection(dbName, collectionToRename, newRenameValue);
      if (response.data.success) {
        setShowRenameModal(false);
        setCollectionToRename(null);
        setNewRenameValue('');
        loadCollections();
      } else {
        setError(response.data.message || 'Failed to rename collection');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to rename collection');
    } finally {
      setRenaming(false);
    }
  };

  const handleDeleteCollection = async (collName) => {
    try {
      const response = await collectionAPI.dropCollection(dbName, collName);
      if (response.data.success) {
        setDeleteModal(null);
        loadCollections();
      } else {
        setError(response.data.message || 'Failed to drop collection');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to drop collection');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredCollections = collections.filter(coll =>
    coll.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gradientColors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <button
                onClick={() => navigate('/databases')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Databases
              </button>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 dark:text-white font-medium">{dbName}</span>
            </nav>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Collections
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {collections.length} {collections.length === 1 ? 'collection' : 'collections'} in this database
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mt-4 md:mt-0"
          >
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Collection
            </Button>
          </motion.div>
        </div>

        {/* Search and View Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="w-full sm:w-96">
            <Input
              type="search"
              placeholder="Search collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 dark:text-red-200">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <CardSkeleton count={6} />}

        {/* Empty State */}
        {!loading && filteredCollections.length === 0 && !error && (
          <EmptyState
            title={searchQuery ? 'No collections found' : 'No collections in this database'}
            description={searchQuery ? 'Try adjusting your search query' : 'Create your first collection to get started'}
            action={
              !searchQuery && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create First Collection
                </Button>
              )
            }
          />
        )}

        {/* Collections Grid View */}
        {!loading && filteredCollections.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection, index) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-lg transition-shadow bg-gradient-to-br ${gradientColors[index % 4]} text-white`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{collection.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/databases/${dbName}/collections/${collection.name}/documents`)}
                          className="text-white hover:bg-white/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setCollectionToRename(collection.name);
                            setNewRenameValue(collection.name);
                            setShowRenameModal(true);
                          }}
                          className="text-white hover:bg-white/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteModal(collection)}
                          className="text-white hover:bg-white/20"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-white/80 text-sm">Documents</p>
                        <p className="text-2xl font-bold">{collection.count?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-white/80 text-sm">Size</p>
                        <p className="text-2xl font-bold">{formatSize(collection.size || 0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Collections List View */}
        {!loading && filteredCollections.length > 0 && viewMode === 'list' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredCollections.map((collection) => (
                    <tr key={collection.name} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/databases/${dbName}/collections/${collection.name}/documents`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {collection.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {collection.count?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {formatSize(collection.size || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCollectionToRename(collection.name);
                              setNewRenameValue(collection.name);
                              setShowRenameModal(true);
                            }}
                          >
                            Rename
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteModal(collection)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Create Collection Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Collection"
      >
        <form onSubmit={handleCreateCollection}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Collection Name
            </label>
            <Input
              value={newCollName}
              onChange={(e) => setNewCollName(e.target.value)}
              placeholder="e.g., users, products, orders"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Collection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Rename Collection Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        title="Rename Collection"
      >
        <form onSubmit={handleRenameCollection}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Name
            </label>
            <Input value={collectionToRename || ''} disabled />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Name
            </label>
            <Input
              value={newRenameValue}
              onChange={(e) => setNewRenameValue(e.target.value)}
              placeholder="Enter new collection name"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowRenameModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={renaming}>
              {renaming ? 'Renaming...' : 'Rename Collection'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Collection"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete the collection <strong>{deleteModal?.name}</strong>? 
          This action cannot be undone and will permanently delete all documents in this collection.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Warning</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                This will delete {deleteModal?.count || 0} documents
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteModal(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteCollection(deleteModal.name)}
          >
            Delete Collection
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CollectionsPage;
