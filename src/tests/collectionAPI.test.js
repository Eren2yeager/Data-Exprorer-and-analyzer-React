/**
 * Collection API Tests
 * Tests for the collection API methods
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server, http, HttpResponse } from './setup';
import { collectionAPI } from '../services/api';

describe('collectionAPI', () => {
  const dbName = 'testdb';
  
  describe('listCollections', () => {
    it('should list all collections in a database', async () => {
      const mockCollections = ['users', 'products', 'orders'];
      
      server.use(
        http.get(`/api/databases/${dbName}/collections`, () => {
          return HttpResponse.json(mockCollections);
        })
      );

      const result = await collectionAPI.listCollections(dbName);
      expect(result.data).toEqual(mockCollections);
    });
  });

  describe('getCollectionStats', () => {
    it('should get collection statistics', async () => {
      const collName = 'users';
      const mockStats = { 
        count: 100, 
        size: 1024, 
        avgObjSize: 10.24 
      };
      
      server.use(
        http.get(`/api/databases/${dbName}/collections/${collName}`, () => {
          return HttpResponse.json(mockStats);
        })
      );

      const result = await collectionAPI.getCollectionStats(dbName, collName);
      expect(result.data).toEqual(mockStats);
    });
  });

  describe('createCollection', () => {
    it('should create a collection', async () => {
      const collName = 'newCollection';
      
      server.use(
        http.post(`/api/databases/${dbName}/collections/${collName}/create`, () => {
          return HttpResponse.json({ success: true, message: 'Collection created' });
        })
      );

      const result = await collectionAPI.createCollection(dbName, collName);
      expect(result.data).toEqual({ success: true, message: 'Collection created' });
    });
  });

  describe('dropCollection', () => {
    it('should drop a collection', async () => {
      const collName = 'oldCollection';
      
      server.use(
        http.delete(`/api/databases/${dbName}/collections/${collName}/drop`, () => {
          return HttpResponse.json({ success: true, message: 'Collection dropped' });
        })
      );

      const result = await collectionAPI.dropCollection(dbName, collName);
      expect(result.data).toEqual({ success: true, message: 'Collection dropped' });
    });
  });

  describe('renameCollection', () => {
    it('should rename a collection', async () => {
      const collName = 'oldName';
      const newName = 'newName';
      
      server.use(
        http.put(`/api/databases/${dbName}/collections/${collName}/rename`, () => {
          return HttpResponse.json({ success: true, message: 'Collection renamed' });
        })
      );

      const result = await collectionAPI.renameCollection(dbName, collName, newName);
      expect(result.data).toEqual({ success: true, message: 'Collection renamed' });
    });
  });
});

// Mock axios to prevent actual API calls
vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        get: vi.fn().mockImplementation((url) => {
          if (url.includes('/collections/users/stats')) {
            return Promise.resolve({ 
              data: { 
                count: 100, 
                size: 1024, 
                avgObjSize: 10.24 
              } 
            });
          }
          return Promise.resolve({ 
            data: [
              { name: 'users', type: 'collection' },
              { name: 'products', type: 'collection' }
            ] 
          });
        }),
        post: vi.fn().mockImplementation((url) => {
          if (url.includes('/create')) {
            return Promise.resolve({ 
              data: { 
                success: true, 
                message: 'Collection created successfully' 
              } 
            });
          } else if (url.includes('/rename')) {
            return Promise.resolve({ 
              data: { 
                success: true, 
                message: 'Collection renamed successfully' 
              } 
            });
          }
          return Promise.resolve({ data: {} });
        }),
        put: vi.fn().mockResolvedValue({ data: {} }),
        delete: vi.fn().mockResolvedValue({ 
          data: { 
            success: true, 
            message: 'Collection dropped successfully' 
          } 
        })
      })
    }
  };
});

describe('Collection API', () => {
  const baseUrl = 'http://localhost:4000/api';
  const testConnStr = 'mongodb://localhost:27017/test';
  const testDbName = 'testdb';
  const testCollName = 'testcollection';
  const newCollName = 'newcollection';
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('listCollections', () => {
    it('should list collections in a database', async () => {
      const mockCollections = ['collection1', 'collection2', 'collection3'];
      
      // Mock response
      server.use(
        http.post(`${baseUrl}/databases/${testDbName}/collections`, () => {
          return HttpResponse.json({ success: true, collections: mockCollections });
        })
      );

      // Call the API
      const response = await collectionAPI.listCollections(testConnStr, testDbName);
      
      // Verify response
      expect(response.data).toEqual({ success: true, collections: mockCollections });
    });
  });

  describe('getCollectionStats', () => {
    it('should get collection statistics', async () => {
      const mockStats = { 
        count: 100, 
        size: 1024, 
        avgObjSize: 10.24,
        storageSize: 2048,
        indexes: 2
      };
      
      // Mock response
      server.use(
        http.post(`${baseUrl}/databases/${testDbName}/collections/${testCollName}`, () => {
          return HttpResponse.json({ success: true, stats: mockStats });
        })
      );

      // Call the API
      const response = await collectionAPI.getCollectionStats(testConnStr, testDbName, testCollName);
      
      // Verify response
      expect(response.data).toEqual({ success: true, stats: mockStats });
    });
  });

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      // Mock response
      server.use(
        http.post(`${baseUrl}/databases/${testDbName}/collections/${testCollName}/create`, () => {
          return HttpResponse.json({ success: true, message: 'Collection created successfully' });
        })
      );

      // Call the API
      const response = await collectionAPI.createCollection(testConnStr, testDbName, testCollName);
      
      // Verify response
      expect(response.data).toEqual({ success: true, message: 'Collection created successfully' });
    });
  });

  describe('dropCollection', () => {
    it('should drop a collection', async () => {
      // Mock response
      server.use(
        http.delete(`${baseUrl}/databases/${testDbName}/collections/${testCollName}`, () => {
          return HttpResponse.json({ success: true, message: 'Collection dropped successfully' });
        })
      );

      // Call the API
      const response = await collectionAPI.dropCollection(testConnStr, testDbName, testCollName);
      
      // Verify response
      expect(response.data).toEqual({ success: true, message: 'Collection dropped successfully' });
    });
  });

  describe('renameCollection', () => {
    it('should rename a collection', async () => {
      // Mock response
      server.use(
        http.put(`${baseUrl}/databases/${testDbName}/collections/${testCollName}/rename`, () => {
          return HttpResponse.json({ success: true, message: 'Collection renamed successfully' });
        })
      );

      // Call the API
      const response = await collectionAPI.renameCollection(testConnStr, testDbName, testCollName, newCollName);
      
      // Verify response
      expect(response.data).toEqual({ success: true, message: 'Collection renamed successfully' });
    });
  });
});