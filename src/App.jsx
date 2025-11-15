/**
 * Main application component for MongoDB Data Explorer
 * Provides routing and layout for the application
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useToast } from '../Contexts/toast-Contex';
import { ConnectionProvider } from '../Contexts/connection-context';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Page components
import ConnectionPage from './pages/ConnectionPage';
import DatabasesPage from './pages/DatabasesPage';
import CollectionsPage from './pages/CollectionsPage';
import DocumentsPage from './pages/DocumentsPage';
import SchemaPage from './pages/SchemaPage';
import IndexesPage from './pages/IndexesPage';
import AggregationPage from './pages/AggregationPage';
import ExportImportPage from './pages/ExportImportPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected route component
import ProtectedRoute from './components/common/ProtectedRoute';

/**
 * Main application component
 * Sets up routing and layout structure with protected routes
 */
function App() {
  // Toast context is used in child components
  useToast();

  return (
    <ConnectionProvider>
      <Router>
        <Routes>
          {/* Connection page (outside main layout) */}
          <Route path="/" element={<ConnectionPage />} />
          
          {/* Protected routes that require database connection */}
          <Route element={<ProtectedRoute />}>
            {/* Routes with main layout */}
            <Route element={<MainLayout />}>
              {/* Database routes */}
              <Route path="/databases" element={<DatabasesPage />} />
              <Route path="/databases/:dbName/collections" element={<CollectionsPage />} />
              
              {/* Collection routes */}
              <Route path="/databases/:dbName/collections/:collName/documents" element={<DocumentsPage />} />
              <Route path="/databases/:dbName/collections/:collName/schema" element={<SchemaPage />} />
              <Route path="/databases/:dbName/collections/:collName/indexes" element={<IndexesPage />} />
              <Route path="/databases/:dbName/collections/:collName/aggregation" element={<AggregationPage />} />
              <Route path="/databases/:dbName/collections/:collName/export-import" element={<ExportImportPage />} />
            </Route>
          </Route>
          
          {/* Show NotFoundPage for unrecognized routes - Must be outside ProtectedRoute */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </ConnectionProvider>
  );
}

export default App;
