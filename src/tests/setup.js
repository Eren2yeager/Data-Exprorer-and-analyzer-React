/**
 * Test setup file
 * Configures the testing environment
 */
import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Export http for use in test files
export { http, HttpResponse };

// Export the server for use in test files
export const server = setupServer();

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Close server after all tests
afterAll(() => server.close());