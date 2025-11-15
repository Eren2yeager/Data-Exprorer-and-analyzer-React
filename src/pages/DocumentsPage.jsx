/**
 * DocumentsPage Component - Redesigned
 * Advanced document explorer with query builder, JSON/Table views, and inline editing
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { documentAPI, collectionAPI } from '../services/api';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Textarea,
  Modal,
  Badge,
  TableSkeleton,
  NoDataEmptyState,
  JsonViewer,
  EditableJsonViewer,
} from '../components/ui';
import CollectionNav from '../components/navigation/CollectionNav';

const DocumentsPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('json');
  const [queryFilter, setQueryFilter] = useState({});
  const [sortQuery, setSortQuery] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showQueryBuilder, setShowQueryBuilder] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteSelectedModal, setDeleteSelectedModal] = useState(false);
  const [newDocument, setNewDocument] = useState({});
  const [editDocument, setEditDocument] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [collectionStats, setCollectionStats] = useState(null);
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());

  useEffect(() => {
    loadDocuments();
    loadCollectionStats();
    // Clear selected documents when collection changes
    setSelectedDocuments(new Set());
  }, [dbName, collName, currentPage, pageSize]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // queryFilter and sortQuery are already objects from EditableJsonViewer
      const filter = queryFilter;
      const sort = sortQuery;
      
      const response = await documentAPI.queryDocuments(dbName, collName, {
        filter,
        sort,
        page: currentPage,
        pageSize
      });
      
      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
        setTotalDocuments(response.data.data.pagination.total);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        setError(response.data.message || 'Failed to load documents');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionStats = async () => {
    try {
      const response = await collectionAPI.getCollectionStats(dbName, collName);
      if (response.data.success) {
        setCollectionStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load collection stats:', err);
    }
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      // newDocument is already an object from EditableJsonViewer
      const response = await documentAPI.insertDocuments(dbName, collName, newDocument);
      
      if (response.data.success) {
        setShowCreateModal(false);
        setNewDocument({});
        loadDocuments();
        loadCollectionStats();
      } else {
        setError(response.data.message || 'Failed to create document');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    if (!showEditModal) return;
    
    setUpdating(true);
    
    try {
      // editDocument is already an object from EditableJsonViewer
      // Remove _id before sending (MongoDB doesn't allow modifying _id)
      const { _id, ...dataWithoutId } = editDocument;
      
      const response = await documentAPI.updateDocument(dbName, collName, showEditModal._id, dataWithoutId);
      
      if (response.data.success) {
        setShowEditModal(null);
        setEditDocument(null);
        loadDocuments();
      } else {
        setError(response.data.message || 'Failed to update document');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update document');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      const response = await documentAPI.deleteDocument(dbName, collName, docId);
      
      if (response.data.success) {
        setDeleteModal(null);
        loadDocuments();
        loadCollectionStats();
      } else {
        setError(response.data.message || 'Failed to delete document');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete document');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDocuments.size === 0) return;
    
    try {
      const deletePromises = Array.from(selectedDocuments).map(docId =>
        documentAPI.deleteDocument(dbName, collName, docId)
      );
      
      await Promise.all(deletePromises);
      setSelectedDocuments(new Set());
      setDeleteSelectedModal(false);
      loadDocuments();
      loadCollectionStats();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete selected documents');
      setDeleteSelectedModal(false);
    }
  };

  const handleSelectDocument = (docId) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(docId)) {
      newSelected.delete(docId);
    } else {
      newSelected.add(docId);
    }
    setSelectedDocuments(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedDocuments.size === documents.length) {
      setSelectedDocuments(new Set());
    } else {
      setSelectedDocuments(new Set(documents.map(doc => doc._id)));
    }
  };

  const formatJSON = (obj) => {
    return JSON.stringify(obj, null, 2);
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getTableColumns = () => {
    if (documents.length === 0) return [];
    
    const allKeys = new Set();
    documents.forEach(doc => {
      Object.keys(doc).forEach(key => allKeys.add(key));
    });
    
    return Array.from(allKeys);
  };

  const renderTableValue = (value) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }
    if (typeof value === 'object') {
      return <span className="text-blue-600 dark:text-blue-400 text-xs">{JSON.stringify(value)}</span>;
    }
    if (typeof value === 'boolean') {
      return <Badge variant={value ? 'success' : 'danger'} size="sm">{String(value)}</Badge>;
    }
    if (typeof value === 'number') {
      return <span className="text-purple-600 dark:text-purple-400">{value}</span>;
    }
    return <span className="text-gray-900 dark:text-gray-100">{String(value)}</span>;
  };

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

            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Documents
            </h1>
            {collectionStats && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {totalDocuments.toLocaleString()} documents • {formatSize(collectionStats.size)}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mt-4 md:mt-0"
          >
            <Button
              variant="outline"
              onClick={() => setShowQueryBuilder(!showQueryBuilder)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Query
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Document
            </Button>
          </motion.div>
        </div>

        {/* Collection Navigation */}
        <CollectionNav />

        {/* Query Builder */}
        <AnimatePresence>
          {showQueryBuilder && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Query Builder</CardTitle>
                  <CardDescription>Filter and sort documents using MongoDB query syntax</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filter (Click to edit)
                      </label>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 min-h-[100px] max-h-[300px] overflow-auto">
                        <EditableJsonViewer
                          data={queryFilter}
                          onChange={setQueryFilter}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Example: Add field "status" with value "active"
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Sort (Click to edit)
                      </label>
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 min-h-[80px] max-h-[200px] overflow-auto">
                        <EditableJsonViewer
                          data={sortQuery}
                          onChange={setSortQuery}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Example: Add field "createdAt" with value -1 (descending) or 1 (ascending)
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={loadDocuments} className="mr-2">
                    Apply Query
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQueryFilter({});
                      setSortQuery({});
                    }}
                  >
                    Reset
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* View Mode Toggle */}
        <div className="flex sm:flex-row flex-col sm:items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'json' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('json')}
            >
              JSON View
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table View
            </Button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {documents.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDocuments.size === documents.length && documents.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Select All
                </span>
              </label>
            )}

            {selectedDocuments.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedDocuments.size} selected
                </span>
                <Button variant="danger" size="sm" onClick={() => setDeleteSelectedModal(true)}>
                  Delete Selected
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && <TableSkeleton count={5} />}

        {/* Empty State */}
        {!loading && documents.length === 0 && !error && (
          <NoDataEmptyState
            title="No documents found"
            description="This collection is empty or no documents match your query"
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                Create First Document
              </Button>
            }
          />
        )}

        {/* Documents List - JSON View */}
        {!loading && documents.length > 0 && viewMode === 'json' && (
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center ">
                      <div className="flex items-center gap-3 truncate w-full">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(doc._id)}
                          onChange={() => handleSelectDocument(doc._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <CardTitle className="text-sm font-mono truncate w-full">
                            {typeof doc._id === 'object' ? JSON.stringify(doc._id) : String(doc._id)}
                          </CardTitle>
                          <CardDescription className="text-xs">Document ID</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
                              // Show success feedback (you can add a toast notification here)
                              const btn = event.currentTarget;
                              const originalTitle = btn.title;
                              btn.title = 'Copied!';
                              setTimeout(() => { btn.title = originalTitle; }, 2000);
                            } catch (err) {
                              console.error('Failed to copy:', err);
                            }
                          }}
                          title="Copy document to clipboard"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setShowEditModal(doc);
                            setEditDocument(doc);
                          }}
                          title="Edit document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleteModal(doc)}
                          title="Delete document"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-200 dark:border-gray-700">
                      <JsonViewer data={doc} />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Documents List - Table View */}
        {!loading && documents.length > 0 && viewMode === 'table' && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.size === documents.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    {getTableColumns().map(col => (
                      <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {col}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {documents.map((doc) => (
                    <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.has(doc._id)}
                          onChange={() => handleSelectDocument(doc._id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {getTableColumns().map(col => (
                        <td key={col} className="px-4 py-3 text-sm">
                          {renderTableValue(doc[col])}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async (event) => {
                              try {
                                await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
                                const btn = event.currentTarget;
                                const originalText = btn.textContent;
                                btn.textContent = 'Copied!';
                                setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                              } catch (err) {
                                console.error('Failed to copy:', err);
                              }
                            }}
                            title="Copy document to clipboard"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowEditModal(doc);
                              setEditDocument(doc);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteModal(doc)}
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

        {/* Pagination */}
        {!loading && documents.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-white bg-white dark:bg-gray-800 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Document Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewDocument({});
        }}
        title="Create New Document"
        size="full"
      >
        <form onSubmit={handleCreateDocument}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Editor (Click to add fields and values)
            </label>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-[calc(100vh-300px)] overflow-auto">
              <EditableJsonViewer 
                data={newDocument} 
                onChange={setNewDocument}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Click "+ Add field" to start building your document. Click values to edit them. Use Tab/Enter to save, Escape to cancel.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setNewDocument({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Document Modal */}
      <Modal
        isOpen={!!showEditModal}
        onClose={() => {
          setShowEditModal(null);
          setEditDocument(null);
        }}
        title="Edit Document"
        size="full"
      >
        <form onSubmit={handleUpdateDocument}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document Editor (Click values to edit)
            </label>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 h-[calc(100vh-300px)] overflow-auto">
              {editDocument && (
                <EditableJsonViewer 
                  data={editDocument} 
                  onChange={setEditDocument}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              💡 Click on any value to edit it. Hover over fields to see delete option (except _id). Use Tab/Enter to save, Escape to cancel.
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowEditModal(null);
                setEditDocument(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? 'Updating...' : 'Update Document'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Document"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete this document? This action cannot be undone.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <p className="text-sm font-mono text-gray-800 dark:text-gray-200">
            ID: {deleteModal?._id}
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
            onClick={() => handleDeleteDocument(deleteModal._id)}
          >
            Delete Document
          </Button>
        </div>
      </Modal>

      {/* Delete Selected Confirmation Modal */}
      <Modal
        isOpen={deleteSelectedModal}
        onClose={() => setDeleteSelectedModal(false)}
        title="Delete Multiple Documents"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''}? This action cannot be undone.
        </p>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Warning: This will permanently delete {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setDeleteSelectedModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteSelected}
          >
            Delete {selectedDocuments.size} Document{selectedDocuments.size !== 1 ? 's' : ''}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default DocumentsPage;
