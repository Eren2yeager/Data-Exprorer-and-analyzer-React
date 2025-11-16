/**
 * SchemaPage Component - Redesigned
 * Modern schema analysis with visual field statistics and type distribution
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { schemaAPI } from '../services/api';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Badge,
  CardSkeleton,
  EmptyState,
} from '../components/ui';
import {
  FieldTypeDistribution,
  FieldFrequencyChart,
  DataQualityScore
} from '../components/common/DataVisualization';
import CollectionNav from '../components/navigation/CollectionNav';

const SchemaPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  
  const [schemaData, setSchemaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sampleSize, setSampleSize] = useState(100);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!dbName || !collName) {
      navigate('/databases');
      return;
    }
    loadSchemaData();
  }, [dbName, collName]);

  const loadSchemaData = async () => {
    setLoading(true);
    setAnalyzing(true);
    setError(null);
    
    try {
      const response = await schemaAPI.analyzeSchema(dbName, collName, sampleSize);
      
      if (response.data.success) {
        setSchemaData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to analyze schema');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze schema');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    loadSchemaData();
  };

  const getTypeBadgeVariant = (type) => {
    const typeMap = {
      'String': 'primary',
      'Number': 'success',
      'Boolean': 'warning',
      'Date': 'info',
      'Object': 'secondary',
      'Array': 'danger',
      'ObjectId': 'default',
      'Null': 'default',
      'Mixed': 'warning'
    };
    return typeMap[type] || 'default';
  };

  const renderFrequencyBar = (frequency) => {
    const percentage = Math.round(frequency * 100);
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
          />
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12 text-right">
          {percentage}%
        </span>
      </div>
    );
  };

  const renderField = (field, fieldName, index) => {
    const fieldTypes = Object.keys(field.types || {}).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      count: field.types[type]
    }));

    return (
      <motion.div
        key={fieldName}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {fieldName}
                  </h3>
                  {fieldTypes.map((type, idx) => (
                    <Badge key={idx} variant={getTypeBadgeVariant(type.name)} size="sm">
                      {type.name}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Found in {field.count} of {schemaData.sampleSize} documents
                </p>
              </div>
            </div>
            {renderFrequencyBar(field.frequency)}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
              <button
                onClick={() => navigate('/databases')}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Databases
              </button>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <button
                onClick={() => navigate(`/databases/${dbName}/collections`)}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {dbName}
              </button>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 dark:text-white font-medium">{collName}</span>
            </nav>

            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Schema Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Analyze field types and distribution patterns
            </p>
          </motion.div>
        </div>

        {/* Collection Navigation */}
        <CollectionNav />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sample Size
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={sampleSize}
                      onChange={(e) => setSampleSize(parseInt(e.target.value) || 100)}
                      className="w-32"
                    />
                  </div>
                  <div className="pt-6">
                    <Button onClick={handleAnalyze} disabled={analyzing}>
                      {analyzing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Analyze Schema
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 dark:text-red-200">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && <CardSkeleton count={2} />}

        {/* Schema Data */}
        {!loading && schemaData && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Sample Size</p>
                        <p className="text-3xl font-bold mt-1">{schemaData.sampleSize}</p>
                      </div>
                      <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Total Fields</p>
                        <p className="text-3xl font-bold mt-1">
                          {Object.keys(schemaData.fieldStats || {}).length}
                        </p>
                      </div>
                      <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-100 text-sm font-medium">Schema Paths</p>
                        <p className="text-3xl font-bold mt-1">
                          {Object.keys(schemaData.schema || {}).length}
                        </p>
                      </div>
                      <svg className="w-12 h-12 text-pink-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Field Frequency</CardTitle>
                    <CardDescription>
                      How often each field appears in documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldFrequencyChart 
                      fields={schemaData.fields || []} 
                      limit={10}
                    />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <DataQualityScore 
                  fields={schemaData.fields || []}
                  totalDocuments={schemaData.totalDocuments}
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Type Distribution</CardTitle>
                    <CardDescription>
                      Distribution of field types across the schema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldTypeDistribution fields={schemaData.fields || []} />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Schema Summary</CardTitle>
                    <CardDescription>
                      Key metrics about your collection schema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Documents</span>
                        <span className="font-semibold">{schemaData.totalDocuments?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sample Size</span>
                        <span className="font-semibold">{schemaData.sampleSize}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Sampling %</span>
                        <span className="font-semibold">{schemaData.samplingPercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Unique Fields</span>
                        <span className="font-semibold">{schemaData.fields?.length || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Fields List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Field Details</CardTitle>
                  <CardDescription>
                    Detailed statistics for each field in the collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(schemaData.fieldStats || {}).length === 0 ? (
                    <EmptyState
                      title="No fields found"
                      description="The collection appears to be empty or has no analyzable fields"
                    />
                  ) : (
                    <div>
                      {Object.entries(schemaData.fieldStats || {}).map(([fieldName, field], index) =>
                        renderField(field, fieldName, index)
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* Empty State */}
        {!loading && !schemaData && !error && (
          <EmptyState
            title="No schema analysis yet"
            description="Click 'Analyze Schema' to start analyzing the collection structure"
            action={
              <Button onClick={handleAnalyze}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Analyze Schema
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default SchemaPage;
