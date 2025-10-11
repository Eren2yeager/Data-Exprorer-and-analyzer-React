/**
 * DocumentsPage Component
 * Page for displaying and managing documents within a MongoDB collection
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentAPI } from '../services/api';

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

  /**
   * Load documents on component mount and when query params change
   */
  useEffect(() => {
    if (!dbName || !collName) {
      navigate('/databases');
      return;
    }
    
    loadDocuments();
  }, [dbName, collName, page, pageSize, navigate]);

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
        setDocuments(response.data.data.documents || []);
        setTotalDocs(response.data.data.totalCount || 0);
        setTotalPages(Math.ceil((response.data.data.totalCount || 0) / pageSize));
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
   * Handle query submission
   * @param {Event} e - Form submit event
   */
  const handleQuerySubmit = (e) => {
    e.preventDefault();
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
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
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
        // Update existing document
        const response = await documentAPI.updateDocument(
          dbName,
          collName,
          editingDocId,
          docData
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

  return (
    <div className="container mx-auto">
      {/* Header with collection info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {collName} <span className="text-gray-500 text-lg">Documents</span>
        </h1>
        <div className="text-sm text-gray-500">
          Database: {dbName} • Collection: {collName} • {totalDocs} documents
        </div>
      </div>

      {/* Query and controls */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <form onSubmit={handleQuerySubmit} className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Query Filter (JSON)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='{"field": "value"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort (JSON)
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                placeholder='{"field": 1}'
              />
            </div>
          </div>
          
          {queryError && (
            <div className="mt-2 text-sm text-red-600">{queryError}</div>
          )}
          
          <div className="mt-3 flex justify-between items-center">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Run Query
            </button>
            
            <button
              type="button"
              onClick={handleNewDocument}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              New Document
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
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
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Documents table */}
      {!loading && documents.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                      {doc._id}
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-xs text-gray-800 overflow-hidden max-h-24">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditDocument(doc)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                  page === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(page * pageSize, totalDocs)}
                  </span>{' '}
                  of <span className="font-medium">{totalDocs}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No documents message */}
      {!loading && documents.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new document.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleNewDocument}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Document
            </button>
          </div>
        </div>
      )}

      {/* Document editor modal */}
      {showEditor && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div> */}

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSaveDocument}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {editingDocId ? 'Edit Document' : 'New Document'}
                      </h3>
                      <div className="mt-2">
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono"
                          rows="15"
                          value={editingDocJson}
                          onChange={(e) => setEditingDocJson(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditor(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;