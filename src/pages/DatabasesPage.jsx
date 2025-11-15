/**
 * DatabasesPage Component - Redesigned
 * Modern database explorer with grid view, search, and statistics
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { databaseAPI } from '../services/api';
import { useConnection } from '../../Contexts/connection-context';
import { useRefresh } from '../../Contexts/refresh-context';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Modal,
  Badge,
  LoadingSkeleton,
  CardSkeleton,
  EmptyState,
  NoDataEmptyState,
} from '../components/ui';

const DatabasesPage = () => {
  const navigate = useNavigate();
  const { connectionInfo, disconnect } = useConnection();
  const { refreshDatabases } = useRefresh();
  
  // State
  const [databases, setDatabases] = useState([]);
  const [filteredDatabases, setFilteredDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDbName, setNewDbName] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadDatabases();
  }, []);

  useEffect(() => {
    // Filter databases based on search query
    if (searchQuery.trim()) {
      const filtered = databases.filter(db =>
        db.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDatabases(filtered);
    } else {
      setFilteredDatabases(databases);
    }
  }, [searchQuery, databases]);

  const loadDatabases = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await databaseAPI.listDatabases();
      
      if (response.data.success) {
        setDatabases(response.data.data || []);
        setFilteredDatabases(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load databases');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load databases');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    setCreating(true);
    
    try {
      const response = await databaseAPI.createDatabase(newDbName);
      
      if (response.data.success) {
        setShowCreateModal(false);
        setNewDbName('');
        loadDatabases();
        refreshDatabases(); // Refresh sidebar
      } else {
        setError(response.data.message || 'Failed to create database');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create database');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDatabase = async (dbName) => {
    try {
      const response = await databaseAPI.dropDatabase(dbName);
      
      if (response.data.success) {
        setDeleteModal(null);
        loadDatabases();
        refreshDatabases(); // Refresh sidebar
      } else {
        setError(response.data.message || 'Failed to delete database');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete database');
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    navigate('/');
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTotalStats = () => {
    const total = databases.reduce((acc, db) => ({
      collections: acc.collections + (db.collectionCount || 0),
      size: acc.size + (db.sizeOnDisk || 0),
    }), { collections: 0, size: 0 });
    
    return total;
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Databases
              </span>
            </h1>
            {connectionInfo && (
              <p className="text-gray-600 dark:text-gray-400 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                  <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                  <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                </svg>
                Connected to {connectionInfo.name}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-3 mt-4 md:mt-0"
          >
            <Button
              variant="outline"
              onClick={handleDisconnect}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
            >
              Disconnect
            </Button>
            <Button
              variant="primary"
              gradient
              onClick={() => setShowCreateModal(true)}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              New Database
            </Button>
          </motion.div>
        </div>

        {/* Statistics Cards */}
        {!loading && databases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <Card gradient="blue" hover={false}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Databases</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{databases.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card gradient="purple" hover={false}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Collections</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.collections}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                </div>
              </CardContent>
            </Card>

            <Card gradient="green" hover={false}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Size</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatSize(stats.size)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path fillRule="evenodd" d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" clipRule="evenodd" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search and View Toggle */}
        {!loading && databases.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 mb-6"
          >
            <div className="flex-1">
              <Input
                placeholder="Search databases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                onClick={() => setViewMode('grid')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                }
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                onClick={() => setViewMode('list')}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                }
              >
                List
              </Button>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <CardSkeleton count={6} />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredDatabases.length === 0 && !searchQuery && (
          <Card>
            <NoDataEmptyState
              onAction={() => setShowCreateModal(true)}
              actionLabel="Create Database"
            />
          </Card>
        )}

        {/* No Search Results */}
        {!loading && filteredDatabases.length === 0 && searchQuery && (
          <Card>
            <EmptyState
              icon={
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              title="No databases found"
              description={`No databases match "${searchQuery}"`}
              action={
                <Button onClick={() => setSearchQuery('')} variant="outline">
                  Clear Search
                </Button>
              }
            />
          </Card>
        )}

        {/* Databases Grid/List */}
        {!loading && filteredDatabases.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
          >
            {filteredDatabases.map((db, index) => (
              <motion.div
                key={db.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  gradient={index % 3 === 0 ? 'blue' : index % 3 === 1 ? 'purple' : 'green'}
                  hover
                  onClick={() => navigate(`/databases/${db.name}/collections`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center">
                          <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                            <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                            <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                          </svg>
                          {db.name}
                        </CardTitle>
                        {db.empty && (
                          <Badge variant="warning" size="sm" className="mt-2">
                            Empty
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                        </svg>
                        {db.collectionCount || 0} collection{db.collectionCount !== 1 ? 's' : ''}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {formatSize(db.sizeOnDisk || 0)}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="primary"
                        size="sm"
                        gradient
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/databases/${db.name}/collections`);
                        }}
                      >
                        Open
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModal(db.name);
                        }}
                        disabled={['admin', 'config', 'local'].includes(db.name)}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Database Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewDbName('');
        }}
        title="Create New Database"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowCreateModal(false);
                setNewDbName('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              gradient
              onClick={handleCreateDatabase}
              loading={creating}
              disabled={!newDbName.trim()}
            >
              Create Database
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateDatabase}>
          <Input
            label="Database Name"
            placeholder="my-database"
            value={newDbName}
            onChange={(e) => setNewDbName(e.target.value)}
            required
            helperText="Enter a name for your new database"
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        title="Delete Database"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              gradient
              onClick={() => handleDeleteDatabase(deleteModal)}
            >
              Delete Database
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete the database <strong>{deleteModal}</strong>?
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-200">
              ⚠️ This action cannot be undone. All collections and documents in this database will be permanently deleted.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatabasesPage;
