/**
 * Database API Tests
 * Tests for the database API methods
 */
import { describe, it, expect, vi } from 'vitest';
import { server, http, HttpResponse } from './setup';
import { databaseAPI } from '../services/api';

describe('databaseAPI', () => {
  describe('listDatabases', () => {
    it('should list all databases', async () => {
      const mockDatabases = ['admin', 'local', 'test'];
      
      server.use(
        http.get('/api/databases', () => {
          return HttpResponse.json(mockDatabases);
        })
      );

      const result = await databaseAPI.listDatabases();
      expect(result.data).toEqual(mockDatabases);
    });
  });

  describe('getDatabaseInfo', () => {
    it('should get database information', async () => {
      const dbName = 'testdb';
      const mockInfo = { 
        name: 'testdb', 
        sizeOnDisk: 1024, 
        empty: false 
      };
      
      server.use(
        http.get(`/api/databases/${dbName}`, () => {
          return HttpResponse.json(mockInfo);
        })
      );

      const result = await databaseAPI.getDatabaseInfo(dbName);
      expect(result.data).toEqual(mockInfo);
    });
  });

  describe('createDatabase', () => {
    it('should create a database', async () => {
      const dbName = 'newdb';
      
      server.use(
        http.post(`/api/databases/${dbName}/create`, () => {
          return HttpResponse.json({ 
            success: true, 
            message: 'Database created successfully' 
          });
        })
      );

      const result = await databaseAPI.createDatabase(dbName);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Database created successfully' 
      });
    });
  });

  describe('dropDatabase', () => {
    it('should drop a database', async () => {
      const dbName = 'testdb';
      
      server.use(
        http.delete(`/api/databases/${dbName}/drop`, () => {
          return HttpResponse.json({ 
            success: true, 
            message: 'Database dropped successfully' 
          });
        })
      );

      const result = await databaseAPI.dropDatabase(dbName);
      expect(result.data).toEqual({ 
        success: true, 
        message: 'Database dropped successfully' 
      });
    });
  });
});

// Mock axios to prevent actual API calls
vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        get: vi.fn().mockImplementation((url) => {
          if (url.includes('/databases/testdb')) {
            return Promise.resolve({ data: { name: 'testdb', sizeOnDisk: 1024, empty: false } });
          }
          return Promise.resolve({ data: ['testdb', 'admin', 'local'] });
        }),
        post: vi.fn().mockImplementation((url) => {
          return Promise.resolve({ data: { success: true, message: 'Database created successfully' } });
        }),
        delete: vi.fn().mockImplementation((url) => {
          return Promise.resolve({ data: { success: true, message: 'Database dropped successfully' } });
        })
      })
    }
  };
});