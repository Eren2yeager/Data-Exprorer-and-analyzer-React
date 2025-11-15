/**
 * API Service
 * Handles all communication with the backend API using session-based authentication
 */
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add session ID to all requests
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('mongoSessionId');
    if (sessionId && !config.url.includes('/connect')) {
      // Add session ID to header for all requests except connect
      config.headers['X-Session-Id'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid
      localStorage.removeItem('mongoSessionId');
      localStorage.removeItem('currentConnStr');
      
      // Redirect to connection page if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Connection API methods
 */
export const connectionAPI = {
  /**
   * Connect to MongoDB and get session ID
   * @param {string} connStr - MongoDB connection string
   * @returns {Promise} - API response with session ID
   */
  connect: (connStr) => {
    return api.post('/connect', { connStr });
  },



  /**
   * Get list of active sessions
   * @returns {Promise} - API response with sessions list
   */
  getSessions: () => {
    return api.get('/sessions');
  },

  /**
   * Disconnect from MongoDB (close session)
   * @returns {Promise} - API response
   */
  disconnect: () => {
    const sessionId = localStorage.getItem('mongoSessionId');
    return api.post('/disconnect', { sessionId });
  }
};

/**
 * Database API methods
 */
export const databaseAPI = {
  /**
   * List all databases
   * @returns {Promise} - API response with databases list
   */
  listDatabases: () => {
    return api.get('/databases');
  },

  /**
   * Get database information
   * @param {string} dbName - Database name
   * @returns {Promise} - API response with database info
   */
  getDatabaseInfo: (dbName) => {
    return api.get(`/databases/${dbName}`);
  },

  /**
   * Create a new database
   * @param {string} dbName - Database name
   * @returns {Promise} - API response
   */
  createDatabase: (dbName) => {
    return api.post(`/databases/${dbName}`);
  },

  /**
   * Drop a database
   * @param {string} dbName - Database name
   * @returns {Promise} - API response
   */
  dropDatabase: (dbName) => {
    return api.delete(`/databases/${dbName}`);
  }
};

/**
 * Collection API methods
 */
export const collectionAPI = {
  /**
   * List all collections in a database
   * @param {string} dbName - Database name
   * @returns {Promise} - API response with collections list
   */
  listCollections: (dbName) => {
    return api.get(`/databases/${dbName}/collections`);
  },

  /**
   * Get collection statistics
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response with collection stats
   */
  getCollectionStats: (dbName, collName) => {
    return api.get(`/databases/${dbName}/collections/${collName}`);
  },

  /**
   * Create a new collection
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} options - Collection options
   * @returns {Promise} - API response
   */
  createCollection: (dbName, collName, options = {}) => {
    return api.post(`/databases/${dbName}/collections`, { collName, options });
  },

  /**
   * Drop a collection
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response
   */
  dropCollection: (dbName, collName) => {
    return api.delete(`/databases/${dbName}/collections/${collName}`);
  },

  /**
   * Rename a collection
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} newName - New collection name
   * @returns {Promise} - API response
   */
  renameCollection: (dbName, collName, newName) => {
    return api.put(`/databases/${dbName}/collections/${collName}/rename`, { newName });
  }
};

/**
 * Document API methods
 */
export const documentAPI = {
  /**
   * Query documents with pagination, sorting, and filtering
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} options - Query options (filter, projection, sort, page, pageSize)
   * @returns {Promise} - API response with documents and pagination info
   */
  queryDocuments: (dbName, collName, options = {}) => {
    return api.post(`/databases/${dbName}/collections/${collName}/documents/query`, options);
  },

  /**
   * Get a specific document by ID
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} id - Document ID
   * @returns {Promise} - API response with document
   */
  getDocumentById: (dbName, collName, id) => {
    return api.get(`/databases/${dbName}/collections/${collName}/documents/${id}`);
  },

  /**
   * Insert one or more documents
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object|Array} documents - Document(s) to insert
   * @returns {Promise} - API response
   */
  insertDocuments: (dbName, collName, documents) => {
    return api.post(`/databases/${dbName}/collections/${collName}/documents`, { documents });
  },

  /**
   * Update a document by ID
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} id - Document ID
   * @param {Object} update - Update data
   * @returns {Promise} - API response
   */
  updateDocument: (dbName, collName, id, update) => {
    return api.put(`/databases/${dbName}/collections/${collName}/documents/${id}`, { update });
  },

  /**
   * Delete a document by ID
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} id - Document ID
   * @returns {Promise} - API response
   */
  deleteDocument: (dbName, collName, id) => {
    return api.delete(`/databases/${dbName}/collections/${collName}/documents/${id}`);
  }
};

/**
 * Schema API methods
 */
export const schemaAPI = {
  /**
   * Analyze collection schema
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {number} sampleSize - Number of documents to sample
   * @returns {Promise} - API response with schema analysis
   */
  analyzeSchema: (dbName, collName, sampleSize = 100) => {
    return api.post(`/databases/${dbName}/collections/${collName}/schema`, { sampleSize });
  },

  /**
   * List indexes for a collection
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response with indexes list
   */
  listIndexes: (dbName, collName) => {
    return api.get(`/databases/${dbName}/collections/${collName}/indexes`);
  },

  /**
   * Create index on a collection
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} key - Index key specification
   * @param {Object} options - Index options
   * @returns {Promise} - API response
   */
  createIndex: (dbName, collName, key, options = {}) => {
    return api.post(`/databases/${dbName}/collections/${collName}/indexes`, { key, options });
  },

  /**
   * Drop index from a collection
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} indexName - Index name
   * @returns {Promise} - API response
   */
  dropIndex: (dbName, collName, indexName) => {
    return api.delete(`/databases/${dbName}/collections/${collName}/indexes/${indexName}`);
  }
};

/**
 * Aggregation API methods (Phase 2)
 */
export const aggregationAPI = {
  /**
   * Execute aggregation pipeline
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Array} pipeline - Aggregation pipeline
   * @param {Object} options - Aggregation options
   * @returns {Promise} - API response with results
   */
  execute: (dbName, collName, pipeline, options = {}) => {
    return api.post(`/databases/${dbName}/collections/${collName}/aggregate`, { pipeline, options });
  },

  /**
   * Get aggregation suggestions
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response with suggestions
   */
  getSuggestions: (dbName, collName) => {
    return api.get(`/databases/${dbName}/collections/${collName}/aggregate/suggestions`);
  },

  /**
   * Validate aggregation pipeline
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise} - API response with validation result
   */
  validate: (pipeline) => {
    return api.post('/aggregate/validate', { pipeline });
  },

  /**
   * Explain aggregation pipeline
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Array} pipeline - Aggregation pipeline
   * @returns {Promise} - API response with execution plan
   */
  explain: (dbName, collName, pipeline) => {
    return api.post(`/databases/${dbName}/collections/${collName}/aggregate/explain`, { pipeline });
  }
};

/**
 * Export/Import API methods (Phase 2)
 */
export const exportImportAPI = {
  /**
   * Export collection to JSON
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} filter - Filter for export
   * @param {number} limit - Maximum documents to export
   * @returns {Promise} - API response with JSON data
   */
  exportJSON: (dbName, collName, filter = {}, limit = 10000) => {
    return api.post(`/databases/${dbName}/collections/${collName}/export/json`, { filter, limit });
  },

  /**
   * Export collection to CSV
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} filter - Filter for export
   * @param {Array} fields - Fields to export
   * @param {number} limit - Maximum documents to export
   * @returns {Promise} - API response with CSV data
   */
  exportCSV: (dbName, collName, filter = {}, fields = [], limit = 10000) => {
    return api.post(`/databases/${dbName}/collections/${collName}/export/csv`, { filter, fields, limit });
  },

  /**
   * Get export information
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} filter - Filter for export
   * @returns {Promise} - API response with export info
   */
  getExportInfo: (dbName, collName, filter = {}) => {
    return api.post(`/databases/${dbName}/collections/${collName}/export/info`, { filter });
  },

  /**
   * Import data from JSON
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Array} data - Documents to import
   * @param {string} mode - Import mode ('insert' or 'upsert')
   * @returns {Promise} - API response
   */
  importJSON: (dbName, collName, data, mode = 'insert') => {
    return api.post(`/databases/${dbName}/collections/${collName}/import/json`, { data, mode });
  },

  /**
   * Import data from CSV
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} csv - CSV data
   * @param {string} mode - Import mode
   * @returns {Promise} - API response
   */
  importCSV: (dbName, collName, csv, mode = 'insert') => {
    return api.post(`/databases/${dbName}/collections/${collName}/import/csv`, { csv, mode });
  }
};

export default {
  connection: connectionAPI,
  database: databaseAPI,
  collection: collectionAPI,
  document: documentAPI,
  schema: schemaAPI,
  aggregation: aggregationAPI,
  exportImport: exportImportAPI
};
