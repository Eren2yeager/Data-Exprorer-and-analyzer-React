/**
 * Document API Tests
 * Tests for the document API methods
 */
import { describe, it, expect, vi } from 'vitest';
import { server, http, HttpResponse } from './setup';
import { documentAPI } from '../services/api';

describe('documentAPI', () => {
  const dbName = 'testdb';
  const collName = 'users';
  
  describe('queryDocuments', () => {
    it('should query documents with filters', async () => {
      const mockDocuments = [
        { _id: '1', name: 'John', age: 30 }
      ];
      
      server.use(
        http.post(`/api/databases/${dbName}/collections/${collName}/documents`, () => {
          return HttpResponse.json(mockDocuments);
        })
      );

      const filter = { age: { $gt: 20 } };
      const result = await documentAPI.queryDocuments(dbName, collName, filter);
      expect(result.data).toEqual(mockDocuments);
    });
  });

  describe('getDocumentById', () => {
    it('should get a document by ID', async () => {
      const docId = '1';
      const mockDocument = { _id: '1', name: 'John', age: 30 };
      
      server.use(
        http.get(`/api/databases/${dbName}/collections/${collName}/documents/${docId}`, () => {
          return HttpResponse.json(mockDocument);
        })
      );

      const result = await documentAPI.getDocumentById(dbName, collName, docId);
      expect(result.data).toEqual([{ _id: '1', name: 'John', age: 30 }]);
    });
  });

  describe('insertDocuments', () => {
    it('should insert documents', async () => {
      const documents = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ];
      
      server.use(
        http.post(`/api/databases/${dbName}/collections/${collName}/documents/insert`, () => {
          return HttpResponse.json({ 
            success: true, 
            insertedCount: 2,
            insertedIds: ['1', '2']
          });
        })
      );

      const result = await documentAPI.insertDocuments(dbName, collName, documents);
      expect(result.data).toEqual({ 
        success: true, 
        insertedCount: 2,
        insertedIds: ['1', '2']
      });
    });
  });

  describe('updateDocument', () => {
    it('should update a document', async () => {
      const docId = '1';
      const update = { $set: { age: 31 } };
      
      server.use(
        http.put(`/api/databases/${dbName}/collections/${collName}/documents/${docId}/update`, () => {
          return HttpResponse.json({ 
            success: true, 
            modifiedCount: 1
          });
        })
      );

      const result = await documentAPI.updateDocument(dbName, collName, docId, update);
      expect(result.data).toEqual({ 
        success: true, 
        modifiedCount: 1
      });
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      const docId = '1';
      
      server.use(
        http.delete(`/api/databases/${dbName}/collections/${collName}/documents/${docId}/delete`, () => {
          return HttpResponse.json({ 
            success: true, 
            deletedCount: 1
          });
        })
      );

      const result = await documentAPI.deleteDocument(dbName, collName, docId);
      expect(result.data).toEqual({ 
        success: true, 
        deletedCount: 1
      });
    });
  });
});

// Mock axios to prevent actual API calls
vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        get: vi.fn().mockResolvedValue({ data: { _id: '1', name: 'John', age: 30 } }),
        post: vi.fn().mockImplementation((url) => {
          if (url.includes('/documents/insert')) {
            return Promise.resolve({ 
              data: { 
                success: true, 
                insertedCount: 2,
                insertedIds: ['1', '2']
              } 
            });
          }
          return Promise.resolve({ data: [{ _id: '1', name: 'John', age: 30 }] });
        }),
        put: vi.fn().mockResolvedValue({ 
          data: { 
            success: true, 
            modifiedCount: 1 
          } 
        }),
        delete: vi.fn().mockResolvedValue({ 
          data: { 
            success: true, 
            deletedCount: 1 
          } 
        })
      })
    }
  };
});