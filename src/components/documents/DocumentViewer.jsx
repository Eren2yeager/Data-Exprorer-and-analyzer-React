/**
 * DocumentViewer Component
 * Displays JSON documents with syntax highlighting and collapsible sections
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * DocumentViewer component for displaying JSON documents
 * @param {Object} props - Component props
 * @param {Object} props.document - Document to display
 * @param {Function} props.onEdit - Edit handler function
 * @param {Function} props.onDelete - Delete handler function
 * @returns {JSX.Element} DocumentViewer component
 */
const DocumentViewer = ({ document, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);

  // Format JSON with syntax highlighting
  const formatJSON = (obj, indent = 0) => {
    if (!obj) return null;
    
    const indentStr = ' '.repeat(indent * 2);
    
    return Object.entries(obj).map(([key, value], index) => {
      const isLastItem = index === Object.entries(obj).length - 1;
      const comma = isLastItem ? '' : ',';
      
      // Handle different value types
      if (value === null) {
        return (
          <div key={key} className="flex">
            <span className="text-blue-600 font-mono">{indentStr}"{key}"</span>
            <span className="text-gray-500 font-mono">: </span>
            <span className="text-red-500 font-mono">null{comma}</span>
          </div>
        );
      } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        return (
          <div key={key}>
            <div className="flex">
              <span className="text-blue-600 font-mono">{indentStr}"{key}"</span>
              <span className="text-gray-500 font-mono">: {`{`}</span>
            </div>
            {formatJSON(value, indent + 1)}
            <div>
              <span className="text-gray-500 font-mono">{indentStr}{`}`}{comma}</span>
            </div>
          </div>
        );
      } else if (Array.isArray(value)) {
        return (
          <div key={key}>
            <div className="flex">
              <span className="text-blue-600 font-mono">{indentStr}"{key}"</span>
              <span className="text-gray-500 font-mono">: [</span>
            </div>
            {value.map((item, i) => {
              const isLastArrayItem = i === value.length - 1;
              const arrayComma = isLastArrayItem ? '' : ',';
              
              if (typeof item === 'object' && item !== null) {
                return (
                  <div key={i}>
                    <div className="text-gray-500 font-mono">{indentStr}  {`{`}</div>
                    {formatJSON(item, indent + 2)}
                    <div className="text-gray-500 font-mono">{indentStr}  {`}`}{arrayComma}</div>
                  </div>
                );
              }
              
              return (
                <div key={i} className="flex">
                  <span className="font-mono">
                    {indentStr}  
                    {typeof item === 'string' ? (
                      <span className="text-green-500">"{item}"</span>
                    ) : typeof item === 'number' ? (
                      <span className="text-purple-500">{item}</span>
                    ) : (
                      <span className="text-orange-500">{String(item)}</span>
                    )}
                    {arrayComma}
                  </span>
                </div>
              );
            })}
            <div>
              <span className="text-gray-500 font-mono">{indentStr}]{comma}</span>
            </div>
          </div>
        );
      } else {
        return (
          <div key={key} className="flex">
            <span className="text-blue-600 font-mono">{indentStr}"{key}"</span>
            <span className="text-gray-500 font-mono">: </span>
            {typeof value === 'string' ? (
              <span className="text-green-500 font-mono">"{value}"{comma}</span>
            ) : typeof value === 'number' ? (
              <span className="text-purple-500 font-mono">{value}{comma}</span>
            ) : (
              <span className="text-orange-500 font-mono">{String(value)}{comma}</span>
            )}
          </div>
        );
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className={`h-4 w-4 transform transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">
            {document._id && (
              <span className="font-mono text-xs text-gray-500">ID: {document._id}</span>
            )}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(document)}
            className="p-1 text-blue-600 hover:text-blue-800 focus:outline-none"
            title="Edit document"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button
            onClick={() => onDelete(document._id)}
            className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
            title="Delete document"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
      
      {expanded && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 overflow-auto max-h-96"
        >
          <div className="text-sm">
            <div className="text-gray-500 font-mono">{'{'}</div>
            {formatJSON(document, 1)}
            <div className="text-gray-500 font-mono">{'}'}</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default DocumentViewer;