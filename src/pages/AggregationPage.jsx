/**
 * Aggregation Pipeline Builder Page
 * Visual interface for building and executing MongoDB aggregation pipelines
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aggregationAPI } from '../services/api';
import { useToast } from '../../Contexts/toast-Contex';
import { Card, Button, Input, EmptyState, LoadingSkeleton, Badge } from '../components/ui';
import { FiPlus, FiTrash2, FiPlay, FiCode, FiCopy, FiDownload, FiAlertCircle } from 'react-icons/fi';
import CollectionNav from '../components/navigation/CollectionNav';

const AggregationPage = () => {
  const { dbName, collName } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [pipeline, setPipeline] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Common aggregation stage templates
  const stageTemplates = {
    $match: { $match: {} },
    $group: { $group: { _id: null } },
    $project: { $project: {} },
    $sort: { $sort: {} },
    $limit: { $limit: 10 },
    $skip: { $skip: 0 },
    $count: { $count: 'total' },
    $unwind: { $unwind: '$field' },
    $lookup: { 
      $lookup: { 
        from: 'collection', 
        localField: 'field', 
        foreignField: 'field', 
        as: 'result' 
      } 
    }
  };

  useEffect(() => {
    loadSuggestions();
  }, [dbName, collName]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      const response = await aggregationAPI.getSuggestions(dbName, collName);
      setSuggestions(response.data.data.suggestions || []);
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStage = (template = null) => {
    const newStage = template || { $match: {} };
    setPipeline([...pipeline, newStage]);
    setShowSuggestions(false);
  };

  const updateStage = (index, value) => {
    try {
      const parsed = JSON.parse(value);
      const newPipeline = [...pipeline];
      newPipeline[index] = parsed;
      setPipeline(newPipeline);
    } catch (error) {
      // Invalid JSON, don't update
    }
  };

  const removeStage = (index) => {
    setPipeline(pipeline.filter((_, i) => i !== index));
  };

  const executePipeline = async () => {
    if (pipeline.length === 0) {
      showToast('Please add at least one stage to the pipeline', 'warning');
      return;
    }

    try {
      setExecuting(true);
      const response = await aggregationAPI.execute(dbName, collName, pipeline);
      setResults(response.data.data);
      showToast('Pipeline executed successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to execute pipeline', 'error');
    } finally {
      setExecuting(false);
    }
  };

  const copyPipeline = () => {
    navigator.clipboard.writeText(JSON.stringify(pipeline, null, 2));
    showToast('Pipeline copied to clipboard', 'success');
  };

  const exportResults = () => {
    if (!results) return;
    const blob = new Blob([JSON.stringify(results.results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aggregation-results-${Date.now()}.json`;
    a.click();
    showToast('Results exported', 'success');
  };

  const applySuggestion = (suggestion) => {
    setPipeline(suggestion.pipeline);
    setShowSuggestions(false);
    showToast(`Applied: ${suggestion.name}`, 'success');
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
              Aggregation Pipeline Builder
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 truncate">
              {dbName} → {collName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="flex-shrink-0"
            >
              {showSuggestions ? 'Hide' : 'Show'} Suggestions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyPipeline}
              disabled={pipeline.length === 0}
              className="flex-shrink-0"
            >
              <FiCopy className="mr-2" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button
              size="sm"
              onClick={executePipeline}
              disabled={pipeline.length === 0 || executing}
              loading={executing}
              className="flex-shrink-0"
            >
              <FiPlay className="mr-2" />
              Execute
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <CollectionNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Builder */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Pipeline Stages</h2>
              <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
                {Object.keys(stageTemplates).map((stage) => (
                  <Button
                    key={stage}
                    size="sm"
                    variant="outline"
                    onClick={() => addStage(stageTemplates[stage])}
                    className="flex-shrink-0"
                  >
                    <FiPlus className="mr-1" />
                    {stage}
                  </Button>
                ))}
              </div>
            </div>

            {pipeline.length === 0 ? (
              <EmptyState
                icon={FiCode}
                title="No stages in pipeline"
                description="Add stages to build your aggregation pipeline"
                action={
                  <Button onClick={() => addStage()}>
                    <FiPlus className="mr-2" />
                    Add First Stage
                  </Button>
                }
              />
            ) : (
              <div className="space-y-3">
                {pipeline.map((stage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="primary">Stage {index + 1}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeStage(index)}
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                    <textarea
                      className="w-full p-2 md:p-3 border border-gray-300 rounded-lg font-mono text-xs md:text-sm overflow-auto"
                      rows={6}
                      value={JSON.stringify(stage, null, 2)}
                      onChange={(e) => updateStage(index, e.target.value)}
                      placeholder="Enter stage JSON..."
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Results */}
          {results && (
            <Card>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-xl font-semibold">Results</h2>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {results.count} documents • {results.executionTime}ms
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={exportResults}
                  className="flex-shrink-0"
                >
                  <FiDownload className="mr-2" />
                  Export
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 md:p-4 max-h-96 overflow-auto">
                <pre className="text-xs md:text-sm font-mono whitespace-pre-wrap break-words">
                  {JSON.stringify(results.results, null, 2)}
                </pre>
              </div>
            </Card>
          )}
        </div>

        {/* Suggestions Sidebar */}
        {showSuggestions && (
          <div className="space-y-4">
            <Card>
              <h2 className="text-xl font-semibold mb-4">Pipeline Templates</h2>
              {suggestions.length === 0 ? (
                <p className="text-gray-600 text-sm">No suggestions available</p>
              ) : (
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <h3 className="font-semibold text-sm mb-1">{suggestion.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{suggestion.description}</p>
                      <Badge variant="secondary" size="sm">
                        {suggestion.pipeline.length} stages
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold mb-3 flex items-center">
                <FiAlertCircle className="mr-2 text-blue-500" />
                Tips
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Use $match early to filter documents</li>
                <li>• $project to select specific fields</li>
                <li>• $group for aggregations</li>
                <li>• $sort to order results</li>
                <li>• $limit to restrict output</li>
              </ul>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AggregationPage;
