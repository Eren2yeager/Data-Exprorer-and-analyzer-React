/**
 * SchemaPage Component
 * Page for analyzing and visualizing the schema of a MongoDB collection
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schemaAPI } from '../services/api';

/**
 * Schema page component
 */
const SchemaPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  
  // State for schema data
  const [schemaData, setSchemaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sampleSize, setSampleSize] = useState(100);
  
  /**
   * Load schema data on component mount
   */
  useEffect(() => {
    if (!dbName || !collName) {
      navigate('/databases');
      return;
    }
    
    loadSchemaData();
  }, [dbName, collName, sampleSize, navigate]);

  /**
   * Load schema data from API
   */
  const loadSchemaData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await schemaAPI.analyzeSchema(dbName, collName, sampleSize);
      
      if (response.data.success) {
        {console.log(response.data.data)}
        setSchemaData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to analyze schema');
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to analyze schema');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle sample size change
   * @param {Event} e - Change event
   */
  const handleSampleSizeChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setSampleSize(value);
    }
  };

  /**
   * Navigate back to documents page
   */
  const handleBackToDocuments = () => {
    navigate(`/databases/${dbName}/collections/${collName}/documents`);
  };

  /**
   * Render a type badge with appropriate color
   * @param {String} type - Field type
   * @returns {JSX.Element} Type badge
   */
  const renderTypeBadge = (type) => {
    const typeColors = {
      'String': 'bg-blue-100 text-blue-800',
      'Number': 'bg-green-100 text-green-800',
      'Boolean': 'bg-yellow-100 text-yellow-800',
      'Date': 'bg-purple-100 text-purple-800',
      'Object': 'bg-indigo-100 text-indigo-800',
      'Array': 'bg-pink-100 text-pink-800',
      'ObjectId': 'bg-gray-100 text-gray-800',
      'Null': 'bg-red-100 text-red-800',
      'Mixed': 'bg-orange-100 text-orange-800'
    };
    
    const color = typeColors[type] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${color}`}>
        {type}
      </span>
    );
  };

  /**
   * Render a frequency bar
   * @param {Number} frequency - Frequency percentage
   * @returns {JSX.Element} Frequency bar
   */
  const renderFrequencyBar = (frequency) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${frequency}%` }}
        ></div>
      </div>
    );
  };

  /**
   * Recursively render field information
   * @param {Object} field - Field data
   * @param {String} path - Field path
   * @param {Number} depth - Nesting depth
   * @returns {JSX.Element} Field information
   */
  const renderField = (field, path, depth = 0) => {
    const paddingLeft = depth * 20;
    
    // Extract field types from the API response format
    const fieldTypes = Object.keys(field.types || {}).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
      count: field.types[type]
    }));
    
    return (
      <div key={path} className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center" style={{ paddingLeft: `${paddingLeft}px` }}>
            {depth > 0 && (
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            )}
            <span className="font-medium text-gray-800">{path.split('.').pop()}</span>
            <div className="ml-2">
              {fieldTypes.map((type, index) => (
                <span key={index} className="mr-1">
                  {renderTypeBadge(type.name)}
                </span>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {field.count} / {schemaData.sampleSize} ({Math.round(field.frequency * 100)}%)
          </div>
        </div>
        
        <div style={{ paddingLeft: `${paddingLeft + 20}px` }}>
          {renderFrequencyBar(field.frequency * 100)}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto">
      {/* Header with collection info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {collName} <span className="text-gray-500 text-lg">Schema Analysis</span>
        </h1>
        <div className="text-sm text-gray-500">
          Database: {dbName} • Collection: {collName}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDocuments}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Back to Documents
            </button>
            
            <div className="flex items-center">
              <label htmlFor="sampleSize" className="mr-2 text-sm font-medium text-gray-700">
                Sample Size:
              </label>
              <input
                id="sampleSize"
                type="number"
                min="1"
                value={sampleSize}
                onChange={handleSampleSizeChange}
                className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={loadSchemaData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Analyze Schema
          </button>
        </div>
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

      {/* Schema visualization */}
      {!loading && schemaData && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Schema Analysis</h2>
            <p className="text-sm text-gray-500">
              Based on {schemaData.sampleSize} documents
            </p>
          </div>
          
          <div className="p-4">
            <div className="mb-6">
              <h3 className="text-md font-medium text-gray-700 mb-2">Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Sample Size</div>
                  <div className="text-xl font-semibold">{schemaData.sampleSize}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Fields</div>
                  <div className="text-xl font-semibold">{Object.keys(schemaData.fieldStats || {}).length}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Schema Structure</div>
                  <div className="text-xl font-semibold">{Object.keys(schemaData.schema || {}).length} paths</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">Fields</h3>
              <div className="border border-gray-200 rounded-lg">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between">
                  <div className="text-sm font-medium text-gray-500">Field</div>
                  <div className="text-sm font-medium text-gray-500">Frequency</div>
                </div>
                <div className="p-4">
                  {Object.keys(schemaData?.fieldStats || {}).map(fieldName => 
                    renderField(schemaData?.fieldStats?.[fieldName], fieldName)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No schema data message */}
      {!loading && !schemaData && !error && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No schema data</h3>
          <p className="mt-1 text-sm text-gray-500">
            Click "Analyze Schema" to start the analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default SchemaPage;