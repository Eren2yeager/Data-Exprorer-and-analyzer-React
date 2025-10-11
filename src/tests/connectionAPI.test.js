/**
 * Connection API Tests
 * Tests for the connection API methods
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { server, http, HttpResponse } from './setup';
import { connectionAPI } from '../services/api';

describe('connectionAPI', () => {
  describe('connect', () => {
    it('should connect to MongoDB successfully', async () => {
      // Mock the API response
      server.use(
        http.post('/api/connect', () => {
          return HttpResponse.json({ success: true, message: 'Connected successfully' });
        })
      );

      const connectionString = 'mongodb://localhost:27017';
      const result = await connectionAPI.connect(connectionString);
      
      expect(result.data).toEqual({ success: true, message: 'Connected successfully' });
    });

    it('should handle connection errors', async () => {
      // Mock the API error response
      server.use(
        http.post('/api/connect', () => {
          return new HttpResponse(
            JSON.stringify({ success: false, message: 'Connection failed' }),
            { status: 400 }
          );
        })
      );

      const connectionString = 'invalid-connection-string';
      
      await expect(connectionAPI.connect(connectionString)).rejects.toThrow();
    });
  });

  describe('getConnections', () => {
    it('should get saved connections', async () => {
      const mockConnections = [
        { name: 'Local', uri: 'mongodb://localhost:27017' },
        { name: 'Atlas', uri: 'mongodb+srv://user:pass@cluster.mongodb.net' }
      ];

      server.use(
        http.get('/api/connections', () => {
          return HttpResponse.json(mockConnections);
        })
      );

      const result = await connectionAPI.getConnections();
      expect(result.data).toEqual(mockConnections);
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MongoDB successfully', async () => {
      server.use(
        http.post('/api/disconnect', () => {
          return HttpResponse.json({ success: true, message: 'Disconnected successfully' });
        })
      );

      const result = await connectionAPI.disconnect();
      expect(result.data).toEqual({ success: true, message: 'Disconnected successfully' });
    });
  });
});

// Mock axios to prevent actual API calls
vi.mock('axios', () => {
  return {
    default: {
      create: () => ({
        post: vi.fn().mockImplementation((url) => {
          if (url.includes('/connect')) {
            return Promise.resolve({ data: { success: true, message: 'Connected successfully' } });
          } else if (url.includes('/disconnect')) {
            return Promise.resolve({ data: { success: true, message: 'Disconnected successfully' } });
          }
          return Promise.resolve({ data: {} });
        }),
        get: vi.fn().mockResolvedValue({ data: [{ name: 'Connection 1', uri: 'mongodb://localhost:27017' }] })
      })
    }
  };
});

describe('Connection API', () => {
  const baseUrl = 'http://localhost:4000/api';
  const testConnStr = 'mongodb://localhost:27017/test';
  
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('connect', () => {
    it('should call the connect endpoint with connection string', async () => {
      // Mock response
      server.use(
        http.post(`${baseUrl}/connect`, ({ request }) => {
          // Parse the request body
          return request.json().then(body => {
            expect(body).toEqual({ connStr: testConnStr });
            return HttpResponse.json({ success: true, message: 'Connected successfully' });
          });
        })
      );

      // Call the API
      const response = await connectionAPI.connect(testConnStr);
      
      // Verify response
      expect(response.data).toEqual({ success: true, message: 'Connected successfully' });
    });

    it('should handle connection errors', async () => {
      // Mock error response
      server.use(
        http.post(`${baseUrl}/connect`, () => {
          return new HttpResponse(
            JSON.stringify({ success: false, message: 'Connection failed' }),
            { status: 500 }
          );
        })
      );

      // Call the API and expect it to reject
      await expect(connectionAPI.connect(testConnStr)).rejects.toThrow();
    });
  });

  describe('getConnections', () => {
    it('should retrieve list of connections', async () => {
      const mockConnections = [
        { id: '1', uri: 'mongodb://localhost:27017/test1' },
        { id: '2', uri: 'mongodb://localhost:27017/test2' }
      ];

      // Mock response
      server.use(
        http.get(`${baseUrl}/connections`, () => {
          return HttpResponse.json({ success: true, connections: mockConnections });
        })
      );

      // Call the API
      const response = await connectionAPI.getConnections();
      
      // Verify response
      expect(response.data).toEqual({ success: true, connections: mockConnections });
    });
  });

  describe('disconnect', () => {
    it('should call the disconnect endpoint with connection string', async () => {
      // Mock response
      server.use(
        http.post(`${baseUrl}/disconnect`, ({ request }) => {
          // Parse the request body
          return request.json().then(body => {
            expect(body).toEqual({ connStr: testConnStr });
            return HttpResponse.json({ success: true, message: 'Disconnected successfully' });
          });
        })
      );

      // Call the API
      const response = await connectionAPI.disconnect(testConnStr);
      
      // Verify response
      expect(response.data).toEqual({ success: true, message: 'Disconnected successfully' });
    });
  });
});