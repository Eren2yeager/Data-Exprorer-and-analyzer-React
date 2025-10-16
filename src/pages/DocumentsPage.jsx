/**
 * DocumentsPage Component
 * Page for displaying and managing documents within a MongoDB collection
 * Enhanced with responsive design and visual improvements
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';
import useConfirmDialog from '../hooks/useConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsivePageContainer, 
  PageHeader, 
  ResponsiveCard, 
  ResponsiveGrid,
  Notification,
  GradientButton,
  Icons,
  animationVariants
} from '../components/common/ResponsiveUtils';

// Import custom components
import TabNavigation from '../components/navigation/TabNavigation';
import QueryBuilder from '../components/documents/QueryBuilder';
import DocumentList from '../components/documents/DocumentList';
import DocumentViewer from '../components/documents/DocumentViewer';

/**
 * Documents page component
 */
const DocumentsPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  
  // State for documents and pagination
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // State for query and sort
  const [query, setQuery] = useState('{}');
  const [sort, setSort] = useState('{}');
  const [queryError, setQueryError] = useState(null);
  
  // State for document editing
  const [showEditor, setShowEditor] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editingDocId, setEditingDocId] = useState(null);
  const [editingDocJson, setEditingDocJson] = useState('');
  const {
    confirmDeleteDocument,
  } = useConfirmDialog();
  /**
   * Load documents on component mount and when query params change
   */
  useEffect(() => {
    if (!dbName || !collName) {
      navigate('/databases');
      return;
    }
    
    loadDocuments();
  }, [dbName, collName, page, pageSize, navigate, query, sort]);

  /**
   * Load documents from API
   */
  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse query and sort JSON
      let queryObj = {};
      let sortObj = {};
      
      try {
        queryObj = query ? JSON.parse(query) : {};
        sortObj = sort ? JSON.parse(sort) : {};
        setQueryError(null);
      } catch (err) {
        setQueryError('Invalid JSON in query or sort');
        queryObj = {};
        sortObj = {};
      }
      
      const response = await documentAPI.queryDocuments(
        dbName,
        collName,
        {
          filter: queryObj,
          sort: sortObj,
          page,
          pageSize
        }
      );
      
      if (response.data.success) {
        // Check if the response has the expected structure
        const documents = response.data.data.documents || [];
        setDocuments(documents);
        
        // Handle pagination data correctly based on API response
        const pagination = response.data.data.pagination || {};
        setTotalDocs(pagination.total || 0);
        setTotalPages(pagination.totalPages || Math.ceil((pagination.total || 0) / pageSize));
      } else {
        setError(response.data.message || 'Failed to load documents');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle query submission from QueryBuilder
   * @param {String} newQuery - New query JSON string
   * @param {String} newSort - New sort JSON string
   */
  const handleQuerySubmit = (newQuery, newSort) => {
    setQuery(newQuery);
    setSort(newSort);
    setPage(1); // Reset to first page when query changes
    loadDocuments();
  };

  /**
   * Handle page change
   * @param {Number} newPage - New page number
   */
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  /**
   * Open document editor for creating a new document
   */
  const handleNewDocument = () => {
    setEditingDoc({});
    setEditingDocId(null);
    setEditingDocJson('{}');
    setShowEditor(true);
  };

  /**
   * Open document editor for editing an existing document
   * @param {Object} doc - Document to edit
   */
  const handleEditDocument = (doc) => {
    setEditingDoc(doc);
    setEditingDocId(doc._id);
    setEditingDocJson(JSON.stringify(doc, null, 2));
    setShowEditor(true);
  };

  /**
   * Handle document deletion
   * @param {String} id - Document ID
   */
  const handleDeleteDocument = async (id) => {
    confirmDeleteDocument({
      documentId: id,
      collectionName: collName,
      onConfirm: async () => {
        try {
          const response = await documentAPI.deleteDocument(dbName, collName, id);
          
          if (response.data.success) {
            // Reload documents after deletion
            loadDocuments();
          } else {
            setError(response.data.message || 'Failed to delete document');
          }
        } catch (error) {
          setError(error.response?.data?.message || error.message || 'Failed to delete document');
        }
      },
      onCancel: () => console.log('Delete cancelled')
    });
  };

  /**
   * Handle document save (create or update)
   * @param {Event} e - Form submit event
   */
  const handleSaveDocument = async (e) => {
    e.preventDefault();
    
    try {
      const docData = JSON.parse(editingDocJson);
      
      if (editingDocId) {
        // Update existing document - remove _id to prevent immutable field error
        const { _id, ...updateData } = docData;
        
        // Update existing document
        const response = await documentAPI.updateDocument(
          dbName,
          collName,
          editingDocId,
          updateData
        );
        
        if (response.data.success) {
          setShowEditor(false);
          loadDocuments();
        } else {
          setError(response.data.message || 'Failed to update document');
        }
      } else {
        // Create new document
        const response = await documentAPI.insertDocument(
          dbName,
          collName,
          docData
        );
        
        if (response.data.success) {
          setShowEditor(false);
          loadDocuments();
        } else {
          setError(response.data.message || 'Failed to create document');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Invalid JSON');
    }
  };

  // Render the document editor modal
  const renderDocumentEditor = () => {
    // Function to format JSON with proper indentation
    const formatJson = () => {
      try {
        const parsed = JSON.parse(editingDocJson);
        setEditingDocJson(JSON.stringify(parsed, null, 2));
      } catch (err) {
        // If JSON is invalid, don't change anything
      }
    };

    // Function to validate JSON
    const validateJson = () => {
      try {
        JSON.parse(editingDocJson);
        return true;
      } catch (err) {
        return false;
      }
    };

    const isValidJson = validateJson();

    return (
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingDocId ? 'Edit Document' : 'New Document'}
                  {editingDocId && <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">ID: {editingDocId}</span>}
                </h3>
                <button
                  onClick={() => setShowEditor(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSaveDocument} className="p-4">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="documentJson" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Document JSON
                    </label>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={formatJson}
                        className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Format JSON
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      id="documentJson"
                      name="documentJson"
                      rows="15"
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md font-mono ${!isValidJson && editingDocJson ? 'border-red-500 dark:border-red-500' : ''}`}
                      value={editingDocJson}
                      onChange={(e) => setEditingDocJson(e.target.value)}
                      spellCheck="false"
                    />
                    {!isValidJson && editingDocJson && (
                      <div className="absolute top-0 right-0 mt-2 mr-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Invalid JSON
                        </span>
                      </div>
                    )}
                  </div>
                  {editingDocId && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Note: The _id field will be automatically excluded when updating the document.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowEditor(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!isValidJson}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isValidJson ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    Save
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Navigation and Header */}
      <div className="mb-6">
        <TabNavigation dbName={dbName} collName={collName} />
      </div>

      {/* Error message */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 mb-6"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Query Builder */}
      <QueryBuilder 
        query={query}
        sort={sort}
        onQueryChange={setQuery}
        onSortChange={setSort}
        onSubmit={handleQuerySubmit}
      />

      {/* Action buttons */}
      <div className="mb-6 flex flex-col sm:justify-start sm:flex-row ">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            onClick={handleNewDocument}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Document
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDocuments}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </motion.button>
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          {totalDocs > 0 ? `${totalDocs} document${totalDocs !== 1 ? 's' : ''}` : 'No documents'}
        </div>
      </div>

      {/* Document List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-8 w-8 border-2 border-blue-500 rounded-full border-t-transparent"
          />
        </div>
      ) : (
        <DocumentList
          documents={documents}
          pagination={{ page, pageSize, totalDocs, totalPages }}
          onPageChange={handlePageChange}
          onEditDocument={handleEditDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      )}

      {/* Document Editor Modal */}
      {renderDocumentEditor()}
    </div>
  );
};

export default DocumentsPage;