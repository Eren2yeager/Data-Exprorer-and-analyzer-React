/**
 * Export/Import Page
 * Interface for exporting and importing collection data
 */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { exportImportAPI } from '../services/api';
import { useToast } from '../../Contexts/toast-Contex';
import { Card, Button, Input, CardSkeleton, EditableJsonViewer, JsonViewer } from '../components/ui';
import { FiDownload, FiUpload, FiFile, FiDatabase, FiAlertCircle } from 'react-icons/fi';
import CollectionNav from '../components/navigation/CollectionNav';

const ExportImportPage = () => {
  const { dbName, collName } = useParams();
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState('export');
  const [exportFormat, setExportFormat] = useState('json');
  const [exportFilter, setExportFilter] = useState({});
  const [exportFields, setExportFields] = useState('');
  const [exportLimit, setExportLimit] = useState(1000);
  const [exportInfo, setExportInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  
  // Import state
  const [importMode, setImportMode] = useState('insert');
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    loadExportInfo();
  }, [dbName, collName]);

  const loadExportInfo = async () => {
    try {
      setLoading(true);
      const response = await exportImportAPI.getExportInfo(dbName, collName, {});
      setExportInfo(response.data.data);
    } catch (error) {
      console.error('Failed to load export info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      // exportFilter is already an object from EditableJsonViewer
      const filter = exportFilter;

      let response;
      if (exportFormat === 'json') {
        response = await exportImportAPI.exportJSON(dbName, collName, filter, exportLimit);
      } else {
        const fields = exportFields.split(',').map(f => f.trim()).filter(Boolean);
        response = await exportImportAPI.exportCSV(dbName, collName, filter, fields, exportLimit);
      }

      // Download file
      const data = exportFormat === 'json' 
        ? JSON.stringify(response.data.data.data, null, 2)
        : response.data.data.csv;
      
      const blob = new Blob([data], { 
        type: exportFormat === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collName}-export-${Date.now()}.${exportFormat}`;
      a.click();
      
      showSuccess(`Exported ${response.data.data.count} documents`);
    } catch (error) {
      showError(error.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);
      
      // Check if we have data
      if (!importData.trim()) {
        showError('Please enter JSON data or select a file');
        return;
      }
      
      let data;
      
      // Check if it's CSV (from file name or content)
      if (importFile && importFile.name.endsWith('.csv')) {
        // CSV import
        try {
          const response = await exportImportAPI.importCSV(dbName, collName, importData, importMode);
          showSuccess(`Imported ${response.data.data.insertedCount} documents`);
          setImportFile(null);
          setImportData('');
          return;
        } catch (csvError) {
          showError(csvError.response?.data?.message || 'Failed to import CSV');
          return;
        }
      }
      
      // JSON import (from file or textarea)
      try {
        data = JSON.parse(importData);
      } catch (parseError) {
        showError('Invalid JSON format');
        return;
      }

      // Validate data is an array
      if (!Array.isArray(data)) {
        showError('Data must be an array of documents');
        return;
      }

      if (data.length === 0) {
        showError('No documents to import');
        return;
      }

      // Import JSON data
      const response = await exportImportAPI.importJSON(dbName, collName, data, importMode);
      showSuccess(`Imported ${response.data.data.insertedCount} documents`);
      setImportFile(null);
      setImportData('');
      
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Import failed';
      showError(errorMessage);
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      
      // Read file content and populate textarea
      try {
        const text = await file.text();
        
        if (file.name.endsWith('.json')) {
          // For JSON, try to format it nicely
          try {
            const parsed = JSON.parse(text);
            setImportData(JSON.stringify(parsed, null, 2));
          } catch (parseError) {
            // If parsing fails, just show raw text
            setImportData(text);
          }
        } else if (file.name.endsWith('.csv')) {
          // For CSV, just show the raw content
          setImportData(text);
        } else {
          setImportData(text);
        }
      } catch (error) {
        console.error('Error reading file:', error);
        showError('Failed to read file');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 w-full ">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent truncate">
          Export & Import Data
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 truncate">
          {dbName} → {collName}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-4 md:mb-6">
        <Button
          variant={activeTab === 'export' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('export')}
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <FiDownload className="mr-2" />
          Export
        </Button>
        <Button
          variant={activeTab === 'import' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('import')}
          size="sm"
          className="flex-1 sm:flex-initial"
        >
          <FiUpload className="mr-2" />
          Import
        </Button>
      </div>

      {/* Navigation Tabs */}
      <CollectionNav />

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Export Info */}
          {exportInfo && (
            <Card>
              <h2 className="text-lg md:text-xl font-semibold mb-4">Collection Info</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 truncate">Total Documents</p>
                  <p className="text-xl md:text-2xl font-bold truncate">{exportInfo.totalDocuments.toLocaleString()}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 truncate">Estimated Size</p>
                  <p className="text-xl md:text-2xl font-bold truncate">{exportInfo.estimatedSizeMB} MB</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 truncate">Available Fields</p>
                  <p className="text-xl md:text-2xl font-bold truncate">{exportInfo.availableFields.length}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-600 truncate">Max Export</p>
                  <p className="text-xl md:text-2xl font-bold truncate">{exportInfo.maxExportLimit.toLocaleString()}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Export Options</h2>
            
            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <div className="flex gap-2">
                  <Button
                    variant={exportFormat === 'json' ? 'primary' : 'outline'}
                    onClick={() => setExportFormat('json')}
                  >
                    <FiFile className="mr-2" />
                    JSON
                  </Button>
                  <Button
                    variant={exportFormat === 'csv' ? 'primary' : 'outline'}
                    onClick={() => setExportFormat('csv')}
                  >
                    <FiDatabase className="mr-2" />
                    CSV
                  </Button>
                </div>
              </div>

              {/* Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Filter (MongoDB Query - Click to edit)
                </label>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 min-h-[120px] max-h-[300px] overflow-auto">
                  <EditableJsonViewer
                    data={exportFilter}
                    onChange={setExportFilter}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Example: Add field "status" with value "active" to filter documents
                </p>
              </div>

              {/* CSV Fields */}
              {exportFormat === 'csv' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fields (comma-separated, leave empty for all)
                  </label>
                  <Input
                    value={exportFields}
                    onChange={(e) => setExportFields(e.target.value)}
                    placeholder="name, email, age"
                  />
                </div>
              )}

              {/* Limit */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Limit (max {exportInfo?.maxExportLimit.toLocaleString()})
                </label>
                <Input
                  type="number"
                  value={exportLimit}
                  onChange={(e) => setExportLimit(parseInt(e.target.value))}
                  min={1}
                  max={exportInfo?.maxExportLimit}
                />
              </div>

              {/* Export Button */}
              <Button
                onClick={handleExport}
                loading={exporting}
                disabled={exporting}
                className="w-full"
              >
                <FiDownload className="mr-2" />
                Export {exportFormat.toUpperCase()}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          {/* Import Warning */}
          <Card className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start">
              <FiAlertCircle className="text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">Important</h3>
                <p className="text-sm text-yellow-800">
                  Importing data will add or update documents in your collection. 
                  Make sure to backup your data before importing.
                </p>
              </div>
            </div>
          </Card>

          {/* Import Options */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Import Options</h2>
            
            <div className="space-y-4">
              {/* Import Mode */}
              <div>
                <label className="block text-sm font-medium mb-2">Import Mode</label>
                <div className="flex gap-2">
                  <Button
                    variant={importMode === 'insert' ? 'primary' : 'outline'}
                    onClick={() => setImportMode('insert')}
                  >
                    Insert (fails on duplicates)
                  </Button>
                  <Button
                    variant={importMode === 'upsert' ? 'primary' : 'outline'}
                    onClick={() => setImportMode('upsert')}
                  >
                    Upsert (update or insert)
                  </Button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload File (JSON or CSV)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <FiUpload className="mx-auto text-4xl text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {importFile ? importFile.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      JSON or CSV files only
                    </p>
                  </label>
                </div>
              </div>

              {/* Or Paste Data */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    {importFile ? 'File Content Preview' : 'Or Paste JSON Data'}
                  </label>
                  {importFile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setImportFile(null);
                        setImportData('');
                      }}
                    >
                      Clear File
                    </Button>
                  )}
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 min-h-[200px] max-h-[400px] overflow-auto">
                  {importData ? (
                    <JsonViewer data={typeof importData === 'string' ? (() => {
                      try {
                        return JSON.parse(importData);
                      } catch {
                        return { error: 'Invalid JSON', raw: importData };
                      }
                    })() : importData} />
                  ) : (
                    <p className="text-gray-400 text-sm">Paste JSON data or upload a file to preview</p>
                  )}
                </div>

              </div>

              {/* Import Button */}
              <Button
                onClick={handleImport}
                loading={importing}
                disabled={importing || (!importFile && !importData)}
                className="w-full"
              >
                <FiUpload className="mr-2" />
                Import Data
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExportImportPage;
