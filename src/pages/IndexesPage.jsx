/**
 * IndexesPage Component - Redesigned
 * Modern index management with visual property badges and creation wizard
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { schemaAPI } from '../services/api';
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
  EmptyState,
} from '../components/ui';
import CollectionNav from '../components/navigation/CollectionNav';

const IndexesPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  
  const [indexes, setIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newIndex, setNewIndex] = useState({
    name: '',
    fields: [{ field: '', order: 1 }],
    options: {
      unique: false,
      sparse: false,
      background: true
    }
  });

  useEffect(() => {
    if (!dbName || !collName) {
      navigate('/databases');
      return;
    }
    loadIndexes();
  }, [dbName, collName]);

  const loadIndexes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schemaAPI.listIndexes(dbName, collName);
      
      if (response.data.success) {
        setIndexes(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load indexes');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load indexes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIndex = async (e) => {
    e.preventDefault();
    
    if (!newIndex.name.trim()) {
      setError('Index name is required');
      return;
    }
    
    if (newIndex.fields.some(f => !f.field.trim())) {
      setError('All field names are required');
      return;
    }
    
    setCreating(true);
    
    try {
      const indexFields = {};
      newIndex.fields.forEach(field => {
        indexFields[field.field] = field.order;
      });
      
      // Add name to options as per MongoDB createIndex API
      const indexOptions = {
        ...newIndex.options,
        name: newIndex.name
      };
      
      const response = await schemaAPI.createIndex(dbName, collName, indexFields, indexOptions);
      
      if (response.data.success) {
        setShowCreateModal(false);
        setNewIndex({
          name: '',
          fields: [{ field: '', order: 1 }],
          options: {
            unique: false,
            sparse: false,
            background: true
          }
        });
        loadIndexes();
      } else {
        setError(response.data.message || 'Failed to create index');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create index');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteIndex = async (indexName) => {
    try {
      const response = await schemaAPI.dropIndex(dbName, collName, indexName);
      
      if (response.data.success) {
        setDeleteModal(null);
        loadIndexes();
      } else {
        setError(response.data.message || 'Failed to delete index');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete index');
    }
  };

  const handleAddField = () => {
    setNewIndex({
      ...newIndex,
      fields: [...newIndex.fields, { field: '', order: 1 }]
    });
  };

  const handleRemoveField = (index) => {
    if (newIndex.fields.length <= 1) return;
    
    const updatedFields = [...newIndex.fields];
    updatedFields.splice(index, 1);
    
    setNewIndex({
      ...newIndex,
      fields: updatedFields
    });
  };

  const handleUpdateField = (index, key, value) => {
    const updatedFields = [...newIndex.fields];
    updatedFields[index] = {
      ...updatedFields[index],
      [key]: value
    };
    
    setNewIndex({
      ...newIndex,
      fields: updatedFields
    });
  };

  const handleUpdateOption = (key, value) => {
    setNewIndex({
      ...newIndex,
      options: {
        ...newIndex.options,
        [key]: value
      }
    });
  };

  const renderIndexKey = (key) => {
    return Object.entries(key)
      .map(([field, order]) => `${field}: ${order === 1 ? 'ASC' : 'DESC'}`)
      .join(', ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-yellow-50 to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
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
              <button
                onClick={() => navigate(`/databases/${dbName}/collections`)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {dbName}
              </button>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 dark:text-white font-medium">{collName}</span>
            </nav>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
              Indexes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage collection indexes for better query performance
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-4 md:mt-0"
          >
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Index
            </Button>
          </motion.div>
        </div>

        {/* Collection Navigation */}
        <CollectionNav />

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
        {loading && <LoadingSkeleton count={3} />}

        {/* Empty State */}
        {!loading && indexes.length === 0 && !error && (
          <EmptyState
            title="No indexes found"
            description="Create indexes to improve query performance and enforce constraints"
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create First Index
              </Button>
            }
          />
        )}

        {/* Indexes List */}
        {!loading && indexes.length > 0 && (
          <div className="space-y-4">
            {indexes.map((index, idx) => (
              <motion.div
                key={index.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">
                          {index.name}
                        </CardTitle>
                        {index.name === '_id_' && (
                          <Badge variant="default" size="sm">Default</Badge>
                        )}
                      </div>
                      {index.name !== '_id_' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteModal(index)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </div>
                    <CardDescription className="font-mono text-sm">
                      {renderIndexKey(index.key)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {index.unique && (
                        <Badge variant="primary" size="sm">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Unique
                        </Badge>
                      )}
                      {index.sparse && (
                        <Badge variant="success" size="sm">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          Sparse
                        </Badge>
                      )}
                      {index.background && (
                        <Badge variant="default" size="sm">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Background
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Index Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Index"
      >
        <form onSubmit={handleCreateIndex}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Index Name
            </label>
            <Input
              value={newIndex.name}
              onChange={(e) => setNewIndex({ ...newIndex, name: e.target.value })}
              placeholder="e.g., email_index"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fields
            </label>
            <AnimatePresence>
              {newIndex.fields.map((field, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 mb-2"
                >
                  <Input
                    value={field.field}
                    onChange={(e) => handleUpdateField(index, 'field', e.target.value)}
                    placeholder="Field name"
                    required
                    className="flex-1"
                  />
                  <select
                    value={field.order}
                    onChange={(e) => handleUpdateField(index, 'order', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>ASC</option>
                    <option value={-1}>DESC</option>
                  </select>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveField(index)}
                    disabled={newIndex.fields.length <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="mt-2"
            >
              + Add Field
            </Button>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIndex.options.unique}
                  onChange={(e) => handleUpdateOption('unique', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Unique (No duplicate values)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIndex.options.sparse}
                  onChange={(e) => handleUpdateOption('sparse', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Sparse (Skip documents without field)
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newIndex.options.background}
                  onChange={(e) => handleUpdateOption('background', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Background (Create in background)
                </span>
              </label>
            </div>
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
              {creating ? 'Creating...' : 'Create Index'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Index"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this index? This action cannot be undone and may affect query performance.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
            Index: {deleteModal?.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
            {deleteModal && renderIndexKey(deleteModal.key)}
          </p>
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
            onClick={() => handleDeleteIndex(deleteModal.name)}
          >
            Delete Index
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default IndexesPage;
