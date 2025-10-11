/**
 * API Service
 * Handles all communication with the backend API
 */
import axios from 'axios';

// get the currest connection from localstorage
const connStr = localStorage.getItem('currentConnStr');


// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Connection API methods
 */
export const connectionAPI = {
  /**
   * Test and establish connection to MongoDB
   * @param {string} connStr - MongoDB connection string
   * @returns {Promise} - API response
   */
  connect: (connStr) => {
    return api.post('/connect', { connStr });
  },

  /**
   * Get list of active connections
   * @returns {Promise} - API response with connections list
   */
  getConnections: () => {
    return api.get('/connections');
  },

  /**
   * Disconnect from MongoDB
   * @param {string} connStr - MongoDB connection string
   * @returns {Promise} - API response
   */
  disconnect: (connStr) => {
    return api.post('/disconnect', { connStr });
  }
};

/**
 * Database API methods
 */
export const databaseAPI = {
  /**
   * List all databases
   * @param {string} connStr - MongoDB connection string
   * @returns {Promise} - API response with databases list
   */
  listDatabases: () => {
    return api.post('/databases', { connStr });
  },

  /**
   * Get database information
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @returns {Promise} - API response with database info
   */
  getDatabaseInfo: ( dbName) => {
    return api.post(`/databases/${dbName}`, { connStr });
  },

  /**
   * Create a new database
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @returns {Promise} - API response
   */
  createDatabase: ( dbName) => {
    return api.post(`/databases/${dbName}/create`, { connStr });
  },

  /**
   * Drop a database
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @returns {Promise} - API response
   */
  dropDatabase: ( dbName) => {
    return api.delete(`/databases/${dbName}`, { data: { connStr } });
  }
};

/**
 * Collection API methods
 */
export const collectionAPI = {
  /**
   * List all collections in a database
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @returns {Promise} - API response with collections list
   */
  listCollections: ( dbName) => {
    return api.post(`/databases/${dbName}/collections`, { connStr });
  },

  /**
   * Get collection statistics
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response with collection stats
   */
  getCollectionStats: ( dbName, collName) => {
    return api.post(`/databases/${dbName}/collections/${collName}`, { connStr });
  },

  /**
   * Create a new collection
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response
   */
  createCollection: ( dbName, collName) => {
    return api.post(`/databases/${dbName}/collections/${collName}/create`, { connStr });
  },

  /**
   * Drop a collection
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response
   */
  dropCollection: ( dbName, collName) => {
    return api.delete(`/databases/${dbName}/collections/${collName}`, { data: { connStr } });
  },

  /**
   * Rename a collection
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} newName - New collection name
   * @returns {Promise} - API response
   */
  renameCollection: ( dbName, collName, newName) => {
    return api.put(`/databases/${dbName}/collections/${collName}/rename`, { connStr, newName });
  }
};

/**
 * Document API methods
 */
export const documentAPI = {
  /**
   * Query documents with pagination, sorting, and filtering
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} options - Query options (filter, projection, sort, page, pageSize)
   * @returns {Promise} - API response with documents and pagination info
   */
  queryDocuments: ( dbName, collName, options = {}) => {
    return api.post(`/databases/${dbName}/collections/${collName}/documents`, { 
      connStr,
      ...options
    });
  },

  /**
   * Get a specific document by ID
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} id - Document ID
   * @returns {Promise} - API response with document
   */
  getDocumentById: ( dbName, collName, id) => {
    return api.post(`/databases/${dbName}/collections/${collName}/documents/${id}`, { connStr });
  },

  /**
   * Insert one or more documents
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object|Array} documents - Document(s) to insert
   * @returns {Promise} - API response
   */
  insertDocuments: ( dbName, collName, documents) => {
    return api.post(`/databases/${dbName}/collections/${collName}/documents/insert`, { 
      connStr, 
      documents 
    });
  },

  /**
   * Update a document by ID
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} id - Document ID
   * @param {Object} update - Update data
   * @returns {Promise} - API response
   */
  updateDocument: ( dbName, collName, id, update) => {
    return api.put(`/databases/${dbName}/collections/${collName}/documents/${id}`, { 
      connStr, 
      update 
    });
  },

  /**
   * Delete a document by ID
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} id - Document ID
   * @returns {Promise} - API response
   */
  deleteDocument: ( dbName, collName, id) => {
    return api.delete(`/databases/${dbName}/collections/${collName}/documents/${id}`, { 
      data: { connStr } 
    });
  }
};

/**
 * Schema API methods
 */
export const schemaAPI = {
  /**
   * Analyze collection schema
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {number} sampleSize - Number of documents to sample
   * @returns {Promise} - API response with schema analysis
   */
  analyzeSchema: ( dbName, collName, sampleSize = 100) => {
    return api.post(`/databases/${dbName}/collections/${collName}/schema`, { 
      connStr, 
      sampleSize 
    });
  },

  /**
   * Get collection statistics
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response with collection stats
   */
  getCollectionStats: ( dbName, collName) => {
    return api.post(`/databases/${dbName}/collections/${collName}/stats`, { connStr });
  },

  /**
   * List indexes for a collection
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @returns {Promise} - API response with indexes list
   */
  listIndexes: ( dbName, collName) => {
    return api.post(`/databases/${dbName}/collections/${collName}/indexes`, { connStr });
  },

  /**
   * Create index on a collection
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {Object} key - Index key specification
   * @param {Object} options - Index options
   * @returns {Promise} - API response
   */
  createIndex: ( dbName, collName, key, options = {}) => {
    return api.post(`/databases/${dbName}/collections/${collName}/indexes/create`, { 
      connStr, 
      key, 
      options 
    });
  },

  /**
   * Drop index from a collection
   * @param {string} connStr - MongoDB connection string
   * @param {string} dbName - Database name
   * @param {string} collName - Collection name
   * @param {string} indexName - Index name
   * @returns {Promise} - API response
   */
  dropIndex: ( dbName, collName, indexName) => {
    return api.delete(`/databases/${dbName}/collections/${collName}/indexes/${indexName}`, { 
      data: { connStr } 
    });
  }
};

export default {
  connection: connectionAPI,
  database: databaseAPI,
  collection: collectionAPI,
  document: documentAPI,
  schema: schemaAPI
};