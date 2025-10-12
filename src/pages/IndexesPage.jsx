/**
 * IndexesPage Component
 * Page for managing MongoDB collection indexes
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { schemaAPI } from '../services/api';
import TabNavigation from '../components/navigation/TabNavigation';
import useConfirmDialog from '../hooks/useConfirmDialog';
import { useNavigate } from 'react-router-dom';


/**
 * Indexes page component
 * @returns {JSX.Element} IndexesPage component
 */
const IndexesPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  
  // State for indexes data
  const [indexes, setIndexes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    confirmDropIndex,
  } = useConfirmDialog();
  
  // State for new index form
  const [showNewIndexForm, setShowNewIndexForm] = useState(false);
  const [newIndex, setNewIndex] = useState({
    name: '',
    fields: [{ field: '', order: 1 }],
    options: {
      unique: false,
      sparse: false,
      background: true
    }
  });
  
  /**
   * Load indexes on component mount
   */
  useEffect(() => {
    if (!dbName || !collName) {
      navigate('/databases');
      return;
    }
    
    loadIndexes();
  }, [dbName, collName, navigate]);

  /**
   * Load indexes from API
   */
  const loadIndexes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schemaAPI.listIndexes(dbName, collName);
      
      if (response.data.success) {
        // Add animation-friendly state update
        setIndexes(response.data.data);
      } else {
        setError(response.data.message || 'Failed to load indexes');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load indexes');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete an index
   * @param {String} indexName - Name of the index to delete
   */
  const handleDropIndex = async (indexName) => {
    confirmDropIndex({
      indexName: indexName,
      collectionName: collName,
      onConfirm: async () => {
        try {
          const response = await schemaAPI.dropIndex(dbName, collName, indexName);
          
          if (response.data.success) {
            // Reload indexes after deletion
            loadIndexes();
          } else {
            setError(response.data.message || 'Failed to delete index');
          }
        } catch (error) {
          setError(error.response?.data?.message || error.message || 'Failed to delete index');
        }
      },
      onCancel: () => console.log('Drop cancelled')
    });
  };

  /**
   * Handle new index form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmitNewIndex = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newIndex.name.trim()) {
      setError('Index name is required');
      return;
    }
    
    if (newIndex.fields.some(f => !f.field.trim())) {
      setError('All field names are required');
      return;
    }
    
    // Format index fields for API
    const indexFields = {};
    newIndex.fields.forEach(field => {
      indexFields[field.field] = field.order;
    });
    
    try {
      setLoading(true);
      const response = await schemaAPI.createIndex(
        dbName, 
        collName, 
        {
          name: newIndex.name,
          key: indexFields,
          options: newIndex.options
        }
      );
      
      if (response.data.success) {
        // Reset form and reload indexes
        setNewIndex({
          name: '',
          fields: [{ field: '', order: 1 }],
          options: {
            unique: false,
            sparse: false,
            background: true
          }
        });
        setShowNewIndexForm(false);
        loadIndexes();
        // Show success animation or notification
        setError(null);
      } else {
        setError(response.data.message || 'Failed to create index');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to create index');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add a new field to the index
   */
  const handleAddField = () => {
    setNewIndex({
      ...newIndex,
      fields: [...newIndex.fields, { field: '', order: 1 }]
    });
  };

  /**
   * Remove a field from the index
   * @param {Number} index - Field index to remove
   */
  const handleRemoveField = (index) => {
    if (newIndex.fields.length <= 1) {
      return; // Keep at least one field
    }
    
    const updatedFields = [...newIndex.fields];
    updatedFields.splice(index, 1);
    
    setNewIndex({
      ...newIndex,
      fields: updatedFields
    });
  };

  /**
   * Update a field in the index
   * @param {Number} index - Field index to update
   * @param {String} key - Field property to update
   * @param {*} value - New value
   */
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

  /**
   * Update an option in the index
   * @param {String} key - Option key
   * @param {*} value - New value
   */
  const handleUpdateOption = (key, value) => {
    setNewIndex({
      ...newIndex,
      options: {
        ...newIndex.options,
        [key]: value
      }
    });
  };

  /**
   * Navigate back to documents page
   */
  const handleBackToDocuments = () => {
    navigate(`/databases/${dbName}/collections/${collName}/documents`);
  };

  /**
   * Render index key fields
   * @param {Object} key - Index key object
   * @returns {String} Formatted key fields
   */
  const renderIndexKey = (key) => {
    return Object.entries(key)
      .map(([field, order]) => `${field}: ${order === 1 ? 'ASC' : 'DESC'}`)
      .join(', ');
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Navigation and Header */}
      <div className="mb-6">
        <TabNavigation dbName={dbName} collName={collName} />
      </div>

      {/* Header with collection info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {collName} <span className="text-gray-500 text-lg">Indexes</span>
        </h1>
        <div className="text-sm text-gray-500">
          Database: {dbName} • Collection: {collName}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDocuments}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Documents
            </button>
          </div>
          
          <motion.button
            onClick={() => setShowNewIndexForm(!showNewIndexForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {showNewIndexForm ? 'Cancel' : 'Create New Index'}
          </motion.button>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4 mb-6"
            role="alert"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Index Form */}
      <AnimatePresence>
        {showNewIndexForm && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
            className="bg-white rounded-lg shadow mb-6 p-6"
          >
            <h2 className="text-lg font-semibold mb-4">Create New Index</h2>
            
            <form onSubmit={handleSubmitNewIndex}>
              <div className="mb-4">
                <label htmlFor="indexName" className="block text-sm font-medium text-gray-700 mb-1">
                  Index Name
                </label>
                <input
                  id="indexName"
                  type="text"
                  value={newIndex.name}
                  onChange={(e) => setNewIndex({ ...newIndex, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., name_index"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fields
                </label>
                
                <AnimatePresence>
                  {newIndex.fields.map((field, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex-grow mr-2">
                        <input
                          type="text"
                          value={field.field}
                          onChange={(e) => handleUpdateField(index, 'field', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Field name"
                          required
                        />
                      </div>
                      
                      <div className="w-24 mr-2">
                        <select
                          value={field.order}
                          onChange={(e) => handleUpdateField(index, 'order', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={1}>ASC</option>
                          <option value={-1}>DESC</option>
                        </select>
                      </div>
                      
                      <motion.button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                        disabled={newIndex.fields.length <= 1}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </motion.button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <motion.button
                  type="button"
                  onClick={handleAddField}
                  className="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + Add Field
                </motion.button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="uniqueOption"
                      type="checkbox"
                      checked={newIndex.options.unique}
                      onChange={(e) => handleUpdateOption('unique', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="uniqueOption" className="ml-2 text-sm text-gray-700">
                      Unique (No duplicate values)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="sparseOption"
                      type="checkbox"
                      checked={newIndex.options.sparse}
                      onChange={(e) => handleUpdateOption('sparse', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sparseOption" className="ml-2 text-sm text-gray-700">
                      Sparse (Skip documents that don't have the indexed field)
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="backgroundOption"
                      type="checkbox"
                      checked={newIndex.options.background}
                      onChange={(e) => handleUpdateOption('background', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="backgroundOption" className="ml-2 text-sm text-gray-700">
                      Background (Create index in the background)
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <motion.button
                  type="button"
                  onClick={() => setShowNewIndexForm(false)}
                  className="mr-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </span>
                  ) : 'Create Index'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indexes List */}
      <motion.div 
        className="bg-white shadow-md rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Indexes</h3>
          {!loading && indexes.length > 0 && (
            <span className="text-sm text-gray-500">
              {indexes.length} {indexes.length === 1 ? 'index' : 'indexes'} found
            </span>
          )}
        </div>
        
        {loading ? (
          <motion.div 
            className="px-6 py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading indexes...</p>
          </motion.div>
        ) : indexes.length === 0 ? (
          <motion.div 
            className="px-6 py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-600 font-medium">No indexes found for this collection</p>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Indexes improve query performance and enforce constraints like uniqueness.
              Click the "Create Index" button above to add one.
            </p>
            <div className="mt-6">
              <motion.button
                onClick={() => setShowNewIndexForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Create New Index
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fields
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Properties
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {indexes.map((index, idx) => (
                    <motion.tr 
                      key={index.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {index.name === '_id_' ? (
                            <div className="flex items-center">
                              <span>{index.name}</span>
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                Default
                              </span>
                            </div>
                          ) : (
                            index.name
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {renderIndexKey(index.key)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {index.unique && (
                            <motion.span 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              whileHover={{ scale: 1.05 }}
                            >
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                              Unique
                            </motion.span>
                          )}
                          {index.sparse && (
                            <motion.span 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
                              whileHover={{ scale: 1.05 }}
                            >
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              Sparse
                            </motion.span>
                          )}
                          {index.background && (
                            <motion.span 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                              whileHover={{ scale: 1.05 }}
                            >
                              <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Background
                            </motion.span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {index.name !== '_id_' && (
                          <motion.button
                            onClick={() => handleDropIndex(index.name)}
                            className="text-red-600 hover:text-red-900 inline-flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Delete
                          </motion.button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default IndexesPage;