/**
 * JsonViewer Component
 * Beautiful, colorful JSON viewer similar to MongoDB Compass
 */
import React, { useState } from 'react';

const JsonViewer = ({ data, level = 0 }) => {
  const [collapsed, setCollapsed] = useState({});

  const toggleCollapse = (path) => {
    setCollapsed(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderValue = (value, key, path) => {
    const fullPath = path ? `${path}.${key}` : key;

    // Null
    if (value === null) {
      return <span className="text-gray-400 italic">null</span>;
    }

    // Undefined
    if (value === undefined) {
      return <span className="text-gray-400 italic">undefined</span>;
    }

    // Boolean
    if (typeof value === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400 font-semibold">{String(value)}</span>;
    }

    // Number
    if (typeof value === 'number') {
      return <span className="text-blue-600 dark:text-blue-400 font-semibold">{value}</span>;
    }

    // String
    if (typeof value === 'string') {
      // Check if it's a date string
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return (
          <span className="text-green-600 dark:text-green-400">
            "{value}"
          </span>
        );
      }
      // Check if it's an ObjectId-like string
      if (/^[0-9a-fA-F]{24}$/.test(value)) {
        return (
          <span className="text-orange-600 dark:text-orange-400 font-mono">
            "{value}"
          </span>
        );
      }
      // Regular string
      return (
        <span className="text-green-600 dark:text-green-400">
          "{value}"
        </span>
      );
    }

    // Array
    if (Array.isArray(value)) {
      const isCollapsed = collapsed[fullPath];
      const isEmpty = value.length === 0;

      return (
        <div className="inline">
          <button
            onClick={() => !isEmpty && toggleCollapse(fullPath)}
            className={`inline-flex items-center ${!isEmpty ? 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1' : ''}`}
          >
            {!isEmpty && (
              <svg
                className={`w-3 h-3 mr-1 transition-transform ${isCollapsed ? '' : 'transform rotate-90'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-600 dark:text-gray-400 font-semibold">[</span>
          </button>
          {isEmpty ? (
            <span className="text-gray-600 dark:text-gray-400 font-semibold">]</span>
          ) : isCollapsed ? (
            <span className="text-gray-500 dark:text-gray-500 text-sm">
              {value.length} {value.length === 1 ? 'item' : 'items'}
              <span className="text-gray-600 dark:text-gray-400 font-semibold ml-1">]</span>
            </span>
          ) : (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500 dark:text-gray-500 text-sm mr-2">{index}:</span>
                  {renderValue(item, index, fullPath)}
                  {index < value.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
              <div className="-ml-4">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">]</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Object
    if (typeof value === 'object') {
      const isCollapsed = collapsed[fullPath];
      const keys = Object.keys(value);
      const isEmpty = keys.length === 0;

      // Check if it's an ObjectId
      if (value.$oid) {
        return (
          <span className="text-orange-600 dark:text-orange-400 font-mono">
            ObjectId("{value.$oid}")
          </span>
        );
      }

      // Check if it's a Date
      if (value.$date) {
        return (
          <span className="text-green-600 dark:text-green-400">
            Date("{new Date(value.$date).toISOString()}")
          </span>
        );
      }

      return (
        <div className="inline">
          <button
            onClick={() => !isEmpty && toggleCollapse(fullPath)}
            className={`inline-flex items-center ${!isEmpty ? 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-1' : ''}`}
          >
            {!isEmpty && (
              <svg
                className={`w-3 h-3 mr-1 transition-transform ${isCollapsed ? '' : 'transform rotate-90'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-gray-600 dark:text-gray-400 font-semibold">{'{'}</span>
          </button>
          {isEmpty ? (
            <span className="text-gray-600 dark:text-gray-400 font-semibold">{'}'}</span>
          ) : isCollapsed ? (
            <span className="text-gray-500 dark:text-gray-500 text-sm">
              {keys.length} {keys.length === 1 ? 'field' : 'fields'}
              <span className="text-gray-600 dark:text-gray-400 font-semibold ml-1">{'}'}</span>
            </span>
          ) : (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {keys.map((k, index) => (
                <div key={k} className="my-1">
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    {k}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 mx-1">:</span>
                  {renderValue(value[k], k, fullPath)}
                  {index < keys.length - 1 && <span className="text-gray-400">,</span>}
                </div>
              ))}
              <div className="-ml-4">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">{'}'}</span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return <span className="text-gray-900 dark:text-gray-100">{String(value)}</span>;
  };

  return (
    <div className="font-mono text-sm leading-relaxed">
      {renderValue(data, '', '')}
    </div>
  );
};

export default JsonViewer;
