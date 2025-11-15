/**
 * ConnectionPage Component - Redesigned
 * Modern MongoDB connection management with beautiful UI
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useConnection } from '../../Contexts/connection-context';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  EmptyState,
  Modal,
} from '../components/ui';

const ConnectionPage = () => {
  const navigate = useNavigate();
  const { connect } = useConnection();
  
  // State
  const [connectionString, setConnectionString] = useState('');
  const [connectionName, setConnectionName] = useState('');
  const [loading, setLoading] = useState(false);

  const [loadingSaved, setLoadingSaved] = useState(null); // Track which saved connection is loading
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [savedConnections, setSavedConnections] = useState([]);

  const [deleteModal, setDeleteModal] = useState(null);
  const [editingConnection, setEditingConnection] = useState(null);

  // Load saved connections and check local MongoDB
  useEffect(() => {
    loadSavedConnections();
  }, []);

  // Auto-dismiss notifications
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadSavedConnections = () => {
    const saved = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
    setSavedConnections(saved);
  };



  const handleConnect = async (e) => {
    e.preventDefault();
    if (!connectionString.trim()) {
      setError('Connection string is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await connect(
        connectionString,
        connectionName || 'MongoDB Connection'
      );

      if (result.success) {
        // Save to localStorage
        const saved = JSON.parse(localStorage.getItem('mongoConnections') || '[]');
        const newConnection = {
          connStr: connectionString,
          name: connectionName || 'MongoDB Connection',
          timestamp: Date.now(),
        };

        const existingIndex = saved.findIndex(c => c.connStr === connectionString);
        if (existingIndex >= 0) {
          saved[existingIndex] = newConnection;
        } else {
          saved.unshift(newConnection);
        }

        localStorage.setItem('mongoConnections', JSON.stringify(saved));
        
        setSuccess('Connected successfully!');
        setTimeout(() => navigate('/databases'), 1000);
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSaved = async (connection, index) => {
    setLoadingSaved(index);
    setError(null);

    try {
      const result = await connect(connection.connStr, connection.name);
      
      if (result.success) {
        setSuccess(`Connected to ${connection.name}!`);
        setTimeout(() => navigate('/databases'), 1000);
      } else {
        setError(result.error || 'Connection failed');
      }
    } catch (err) {
      setError(err.message || 'Connection failed');
    } finally {
      setLoadingSaved(null);
    }
  };

  const handleDeleteConnection = (index) => {
    const saved = [...savedConnections];
    saved.splice(index, 1);
    localStorage.setItem('mongoConnections', JSON.stringify(saved));
    setSavedConnections(saved);
    setDeleteModal(null);
    setSuccess('Connection deleted');
  };

  const handleEditConnection = (index) => {
    setEditingConnection({ ...savedConnections[index], index });
  };

  const handleSaveEdit = () => {
    const saved = [...savedConnections];
    saved[editingConnection.index] = {
      connStr: editingConnection.connStr,
      name: editingConnection.name,
      timestamp: editingConnection.timestamp,
    };
    localStorage.setItem('mongoConnections', JSON.stringify(saved));
    setSavedConnections(saved);
    setEditingConnection(null);
    setSuccess('Connection updated');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              MongoDB Connection
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Connect to your MongoDB instances and explore your data
          </p>
        </motion.div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 max-w-2xl mx-auto"
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 max-w-2xl mx-auto"
            >
              <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start">
                <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <p className="font-medium text-green-800 dark:text-green-200">{success}</p>
                </div>
                <button onClick={() => setSuccess(null)} className="text-green-500 hover:text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Connection Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card gradient="blue" padding="lg" shadow="xl">
              <CardHeader>
                <div className="flex items-center mb-2">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div>
                    <CardTitle>New Connection</CardTitle>
                    <CardDescription>Connect to a MongoDB instance</CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleConnect} className="space-y-4">
                  <Input
                    label="Connection Name"
                    placeholder="My MongoDB"
                    value={connectionName}
                    onChange={(e) => setConnectionName(e.target.value)}
                  />

                  <Input
                    label="Connection String"
                    placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                    value={connectionString}
                    onChange={(e) => setConnectionString(e.target.value)}
                    required
                    helperText="Enter your MongoDB connection string"
                  />

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      gradient
                      loading={loading}
                      fullWidth
                      icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      }
                    >
                      Connect
                    </Button>
                  </div>
                </form>


              </CardContent>
            </Card>
          </motion.div>

          {/* Saved Connections */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card gradient="purple" padding="lg" shadow="xl">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <CardTitle>Saved Connections</CardTitle>
                      <CardDescription>
                        {savedConnections.length} saved connection{savedConnections.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="max-h-[500px] overflow-y-auto space-y-3">
                  {savedConnections.length === 0 ? (
                    <EmptyState
                      icon={
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      }
                      title="No saved connections"
                      description="Connect to a database to save it here for quick access"
                    />
                  ) : (
                    savedConnections.map((conn, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              <svg className="w-4 h-4 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                                <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                                <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                              </svg>
                              {conn.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                              {conn.connStr}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {formatDate(conn.timestamp)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleConnectSaved(conn, index)}
                            variant="primary"
                            size="sm"
                            gradient
                            loading={loadingSaved === index}
                            className="flex-1"
                          >
                            Connect
                          </Button>
                          <Button
                            onClick={() => handleEditConnection(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Button>
                          <Button
                            onClick={() => setDeleteModal(index)}
                            variant="ghost"
                            size="sm"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal !== null}
        onClose={() => setDeleteModal(null)}
        title="Delete Connection"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              gradient
              onClick={() => handleDeleteConnection(deleteModal)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 dark:text-gray-400">
          Are you sure you want to delete this connection? This action cannot be undone.
        </p>
      </Modal>

      {/* Edit Connection Modal */}
      <Modal
        isOpen={editingConnection !== null}
        onClose={() => setEditingConnection(null)}
        title="Edit Connection"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditingConnection(null)}>
              Cancel
            </Button>
            <Button variant="primary" gradient onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </div>
        }
      >
        {editingConnection && (
          <div className="space-y-4">
            <Input
              label="Connection Name"
              value={editingConnection.name}
              onChange={(e) =>
                setEditingConnection({ ...editingConnection, name: e.target.value })
              }
            />
            <Input
              label="Connection String"
              value={editingConnection.connStr}
              onChange={(e) =>
                setEditingConnection({ ...editingConnection, connStr: e.target.value })
              }
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ConnectionPage;
