/**
 * EditableJsonViewer Component
 * Interactive JSON editor with inline editing like MongoDB Compass
 * Includes optional raw JSON editor mode for copy/paste
 */
import React, { useState } from 'react';

const EditableJsonViewer = ({ data, onChange, level = 0, showRawEditor = true }) => {
  const [collapsed, setCollapsed] = useState({});
  const [editing, setEditing] = useState({});
  const [editValues, setEditValues] = useState({});
  const [addingField, setAddingField] = useState({});
  const [newFieldName, setNewFieldName] = useState({});
  const [newFieldValue, setNewFieldValue] = useState({});
  const [editingFieldName, setEditingFieldName] = useState({});
  const [editFieldNameValue, setEditFieldNameValue] = useState({});
  const [rawMode, setRawMode] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState('');

  const toggleCollapse = (path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCollapsed(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const startEdit = (path, value) => {
    setEditing(prev => ({ ...prev, [path]: true }));
    setEditValues(prev => ({ 
      ...prev, 
      [path]: typeof value === 'string' ? value : JSON.stringify(value) 
    }));
  };

  const cancelEdit = (path) => {
    setEditing(prev => ({ ...prev, [path]: false }));
    setEditValues(prev => ({ ...prev, [path]: undefined }));
  };

  const saveEdit = (path, originalValue) => {
    const newValue = editValues[path];
    if (newValue === undefined) return;

    // Try to parse the value
    let parsedValue;
    try {
      // Try to parse as JSON first
      parsedValue = JSON.parse(newValue);
    } catch {
      // If it fails, treat as string
      parsedValue = newValue;
    }

    // Update the data
    updateValueAtPath(path, parsedValue);
    
    setEditing(prev => ({ ...prev, [path]: false }));
    setEditValues(prev => ({ ...prev, [path]: undefined }));
  };

  const updateValueAtPath = (path, newValue) => {
    const keys = path.split('.');
    const newData = JSON.parse(JSON.stringify(data)); // Deep clone
    
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = newValue;
    
    if (onChange) {
      onChange(newData);
    }
  };

  const deleteField = (path) => {
    const keys = path.split('.').filter(k => k !== ''); // Remove empty strings
    const newData = JSON.parse(JSON.stringify(data));
    
    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    delete current[keys[keys.length - 1]];
    
    if (onChange) {
      onChange(newData);
    }
  };

  const renameField = (path, oldKey, newKey) => {
    if (!newKey || newKey.trim() === '' || oldKey === newKey) {
      setEditingFieldName(prev => ({ ...prev, [path]: false }));
      return;
    }
    
    const keys = path.split('.').filter(k => k !== '');
    const newData = JSON.parse(JSON.stringify(data));
    
    let current = newData;
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }
    
    // Check if new key already exists
    if (current.hasOwnProperty(newKey)) {
      alert(`Field "${newKey}" already exists!`);
      setEditingFieldName(prev => ({ ...prev, [path]: false }));
      return;
    }
    
    // Copy value to new key and delete old key
    current[newKey] = current[oldKey];
    delete current[oldKey];
    
    if (onChange) {
      onChange(newData);
    }
    
    setEditingFieldName(prev => ({ ...prev, [path]: false }));
    setEditFieldNameValue(prev => ({ ...prev, [path]: '' }));
  };

  const addField = (path) => {
    const fieldName = newFieldName[path];
    const fieldValue = newFieldValue[path];
    
    if (!fieldName || fieldName.trim() === '') return;
    
    const keys = path.split('.').filter(k => k !== '');
    const newData = JSON.parse(JSON.stringify(data));
    
    let current = newData;
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }
    
    // Parse the value
    let parsedValue;
    try {
      parsedValue = JSON.parse(fieldValue || '""');
    } catch {
      parsedValue = fieldValue || '';
    }
    
    current[fieldName] = parsedValue;
    
    if (onChange) {
      onChange(newData);
    }
    
    // Reset state
    setAddingField(prev => ({ ...prev, [path]: false }));
    setNewFieldName(prev => ({ ...prev, [path]: '' }));
    setNewFieldValue(prev => ({ ...prev, [path]: '' }));
  };

  const addArrayItem = (path) => {
    const itemValue = newFieldValue[path];
    
    const keys = path.split('.').filter(k => k !== '');
    const newData = JSON.parse(JSON.stringify(data));
    
    let current = newData;
    for (let i = 0; i < keys.length; i++) {
      current = current[keys[i]];
    }
    
    // Parse the value
    let parsedValue;
    try {
      parsedValue = JSON.parse(itemValue || '""');
    } catch {
      parsedValue = itemValue || '';
    }
    
    current.push(parsedValue);
    
    if (onChange) {
      onChange(newData);
    }
    
    // Reset state
    setAddingField(prev => ({ ...prev, [path]: false }));
    setNewFieldValue(prev => ({ ...prev, [path]: '' }));
  };

  const renderEditableValue = (value, key, path) => {
    const fullPath = path ? `${path}.${key}` : key;
    const isEditing = editing[fullPath];

    // Null
    if (value === null) {
      return isEditing ? (
        <input
          type="text"
          value={editValues[fullPath] || 'null'}
          onChange={(e) => setEditValues(prev => ({ ...prev, [fullPath]: e.target.value }))}
          onBlur={() => saveEdit(fullPath, value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit(fullPath, value);
            if (e.key === 'Escape') cancelEdit(fullPath);
          }}
          className="px-2 py-1 border border-blue-400 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      ) : (
        <span 
          className="text-gray-400 italic cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded"
          onClick={() => startEdit(fullPath, value)}
        >
          null
        </span>
      );
    }

    // Boolean
    if (typeof value === 'boolean') {
      return isEditing ? (
        <select
          value={editValues[fullPath] || String(value)}
          onChange={(e) => {
            const newVal = e.target.value === 'true';
            updateValueAtPath(fullPath, newVal);
            setEditing(prev => ({ ...prev, [fullPath]: false }));
          }}
          className="px-2 py-1 border border-blue-400 rounded bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        >
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : (
        <span 
          className="text-purple-600 dark:text-purple-400 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded"
          onClick={() => startEdit(fullPath, value)}
        >
          {String(value)}
        </span>
      );
    }

    // Number
    if (typeof value === 'number') {
      return isEditing ? (
        <input
          type="text"
          value={editValues[fullPath] ?? value}
          onChange={(e) => setEditValues(prev => ({ ...prev, [fullPath]: e.target.value }))}
          onBlur={() => saveEdit(fullPath, value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit(fullPath, value);
            if (e.key === 'Escape') cancelEdit(fullPath);
          }}
          className="px-2 py-1 border border-blue-400 rounded bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
          autoFocus
        />
      ) : (
        <span 
          className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded"
          onClick={() => startEdit(fullPath, value)}
        >
          {value}
        </span>
      );
    }

    // String
    if (typeof value === 'string') {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(value);
      const isDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
      
      return isEditing ? (
        <input
          type="text"
          value={editValues[fullPath] ?? value}
          onChange={(e) => setEditValues(prev => ({ ...prev, [fullPath]: e.target.value }))}
          onBlur={() => saveEdit(fullPath, value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEdit(fullPath, value);
            if (e.key === 'Escape') cancelEdit(fullPath);
          }}
          className="px-2 py-1 border border-blue-400 rounded bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          autoFocus
        />
      ) : (
        <span 
          className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded ${
            isObjectId ? 'text-orange-600 dark:text-orange-400 font-mono' : 
            isDate ? 'text-green-600 dark:text-green-400' : 
            'text-green-600 dark:text-green-400'
          }`}
          onClick={() => startEdit(fullPath, value)}
        >
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
            type="button"
            onClick={(e) => !isEmpty && toggleCollapse(fullPath, e)}
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
          {isEmpty && !addingField[fullPath] ? (
            <div className="inline-block">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">]</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAddingField(prev => ({ ...prev, [fullPath]: true }));
                }}
                className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add item
              </button>
            </div>
          ) : isEmpty && addingField[fullPath] ? (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              <div className="my-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Value (e.g., 'text', 123, true)"
                  value={newFieldValue[fullPath] || ''}
                  onChange={(e) => setNewFieldValue(prev => ({ ...prev, [fullPath]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addArrayItem(fullPath);
                    if (e.key === 'Escape') setAddingField(prev => ({ ...prev, [fullPath]: false }));
                  }}
                  className="px-2 py-1 border border-blue-400 rounded text-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => addArrayItem(fullPath)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAddingField(prev => ({ ...prev, [fullPath]: false }))}
                  className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                >
                  Cancel
                </button>
              </div>
              <div className="-ml-4">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">]</span>
              </div>
            </div>
          ) : isCollapsed ? (
            <span className="text-gray-500 dark:text-gray-500 text-sm">
              {value.length} {value.length === 1 ? 'item' : 'items'}
              <span className="text-gray-600 dark:text-gray-400 font-semibold ml-1">]</span>
            </span>
          ) : (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {/* Add new array item - shown first */}
              {addingField[fullPath] ? (
                <div className="my-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Value (e.g., 'text', 123, true)"
                    value={newFieldValue[fullPath] || ''}
                    onChange={(e) => setNewFieldValue(prev => ({ ...prev, [fullPath]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addArrayItem(fullPath);
                      if (e.key === 'Escape') setAddingField(prev => ({ ...prev, [fullPath]: false }));
                    }}
                    className="px-2 py-1 border border-blue-400 rounded text-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => addArrayItem(fullPath)}
                    className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingField(prev => ({ ...prev, [fullPath]: false }))}
                    className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAddingField(prev => ({ ...prev, [fullPath]: true }));
                  }}
                  className="my-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add item
                </button>
              )}
              
              {value.map((item, index) => (
                <div key={index} className="my-1 group">
                  <span className="text-gray-500 dark:text-gray-500 text-sm mr-2">{index}:</span>
                  {renderEditableValue(item, index, fullPath)}
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

      return (
        <div className="inline">
          <button
            type="button"
            onClick={(e) => !isEmpty && toggleCollapse(fullPath, e)}
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
          {isEmpty && !addingField[fullPath] ? (
            <div className="inline-block">
              <span className="text-gray-600 dark:text-gray-400 font-semibold">{'}'}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAddingField(prev => ({ ...prev, [fullPath]: true }));
                }}
                className="ml-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add field
              </button>
            </div>
          ) : isEmpty && addingField[fullPath] ? (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              <div className="my-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Field name"
                  value={newFieldName[fullPath] || ''}
                  onChange={(e) => setNewFieldName(prev => ({ ...prev, [fullPath]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById(`value-${fullPath}`)?.focus();
                    }
                    if (e.key === 'Escape') setAddingField(prev => ({ ...prev, [fullPath]: false }));
                  }}
                  className="px-2 py-1 border  text-red-400 border-green-400 rounded bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-32"
                  autoFocus
                />
                <span className="text-gray-600 dark:text-gray-400">:</span>
                <input
                  id={`value-${fullPath}`}
                  type="text"
                  placeholder="Value (e.g., 'text', 123, true)"
                  value={newFieldValue[fullPath] || ''}
                  onChange={(e) => setNewFieldValue(prev => ({ ...prev, [fullPath]: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addField(fullPath);
                    if (e.key === 'Escape') setAddingField(prev => ({ ...prev, [fullPath]: false }));
                  }}
                 className="px-2 py-1 border border-blue-400 rounded text-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <button
                  type="button"
                  onClick={() => addField(fullPath)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setAddingField(prev => ({ ...prev, [fullPath]: false }))}
                  className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                >
                  Cancel
                </button>
              </div>
              <div className="-ml-4">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">{'}'}</span>
              </div>
            </div>
          ) : isCollapsed ? (
            <span className="text-gray-500 dark:text-gray-500 text-sm">
              {keys.length} {keys.length === 1 ? 'field' : 'fields'}
              <span className="text-gray-600 dark:text-gray-400 font-semibold ml-1">{'}'}</span>
            </span>
          ) : (
            <div className="ml-6 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
              {/* Add new field - shown first */}
              {addingField[fullPath] ? (
                <div className="my-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Field name"
                    value={newFieldName[fullPath] || ''}
                    onChange={(e) => setNewFieldName(prev => ({ ...prev, [fullPath]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById(`value-${fullPath}`)?.focus();
                      }
                      if (e.key === 'Escape') setAddingField(prev => ({ ...prev, [fullPath]: false }));
                    }}
                    className="px-2 text-red-400 py-1 border border-blue-400 rounded bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                    autoFocus
                  />
                  <span className="text-gray-600 dark:text-gray-400">:</span>
                  <input
                    id={`value-${fullPath}`}
                    type="text"
                    placeholder="Value (e.g., 'text', 123, true)"
                    value={newFieldValue[fullPath] || ''}
                    onChange={(e) => setNewFieldValue(prev => ({ ...prev, [fullPath]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addField(fullPath);
                      if (e.key === 'Escape') setAddingField(prev => ({ ...prev, [fullPath]: false }));
                    }}
                  className="px-2 py-1 border border-blue-400 rounded text-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => addField(fullPath)}
                    className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingField(prev => ({ ...prev, [fullPath]: false }))}
                    className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setAddingField(prev => ({ ...prev, [fullPath]: true }));
                  }}
                  className="my-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add field
                </button>
              )}
              
              {keys.map((k, index) => {
                const fieldPath = `${fullPath}.${k}`;
                const isEditingKey = editingFieldName[fieldPath];
                
                return (
                  <div key={k} className="my-1 group flex items-center">
                    <div className="flex-1">
                      {isEditingKey ? (
                        <input
                          type="text"
                          value={editFieldNameValue[fieldPath] ?? k}
                          onChange={(e) => setEditFieldNameValue(prev => ({ ...prev, [fieldPath]: e.target.value }))}
                          onBlur={() => renameField(fullPath, k, editFieldNameValue[fieldPath] || k)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameField(fullPath, k, editFieldNameValue[fieldPath] || k);
                            if (e.key === 'Escape') {
                              setEditingFieldName(prev => ({ ...prev, [fieldPath]: false }));
                              setEditFieldNameValue(prev => ({ ...prev, [fieldPath]: '' }));
                            }
                          }}
                          className="px-2 py-1 border border-orange-400 rounded bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 w-32"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className={`text-red-600 dark:text-red-400 font-semibold ${k !== '_id' ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-1 rounded' : ''}`}
                          onClick={() => {
                            if (k !== '_id') {
                              setEditingFieldName(prev => ({ ...prev, [fieldPath]: true }));
                              setEditFieldNameValue(prev => ({ ...prev, [fieldPath]: k }));
                            }
                          }}
                          title={k !== '_id' ? 'Click to rename field' : 'Cannot rename _id field'}
                        >
                          {k}
                        </span>
                      )}
                      <span className="text-gray-600 dark:text-gray-400 mx-1">:</span>
                      {renderEditableValue(value[k], k, fullPath)}
                      {index < keys.length - 1 && <span className="text-gray-400">,</span>}
                    </div>
                    {k !== '_id' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteField(`${fullPath}.${k}`);
                        }}
                        className="ml-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 dark:hover:text-red-300 transition-opacity"
                        title="Delete field"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
              
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

  const toggleRawMode = () => {
    if (!rawMode) {
      // Switching to raw mode - populate textarea
      setRawJson(JSON.stringify(data, null, 2));
      setJsonError('');
    } else {
      // Switching back to visual mode - validate and save
      try {
        const parsed = JSON.parse(rawJson);
        if (onChange) {
          onChange(parsed);
        }
        setJsonError('');
      } catch (err) {
        setJsonError(err.message);
        return; // Don't switch if invalid
      }
    }
    setRawMode(!rawMode);
  };

  const handleRawJsonChange = (value) => {
    setRawJson(value);
    // Try to parse to show errors
    try {
      JSON.parse(value);
      setJsonError('');
    } catch (err) {
      setJsonError(err.message);
    }
  };

  const applyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJson);
      if (onChange) {
        onChange(parsed);
      }
      setJsonError('');
      setRawMode(false);
    } catch (err) {
      setJsonError(err.message);
    }
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      {showRawEditor && (
        <div className="absolute top-0 right-0 z-10">
          <button
            type="button"
            onClick={toggleRawMode}
            className="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
            title={rawMode ? 'Switch to Visual Editor' : 'Switch to Raw JSON Editor'}
          >
            {rawMode ? (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visual
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Raw JSON
              </>
            )}
          </button>
        </div>
      )}

      {/* Raw JSON Editor Mode */}
      {rawMode ? (
        <div className="space-y-2">
          <textarea
            value={rawJson}
            onChange={(e) => handleRawJsonChange(e.target.value)}
            className="w-full h-[500px] px-4 py-3 font-mono text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder='{"field": "value"}'
            spellCheck={false}
          />
          
          {/* Error Message */}
          {jsonError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Invalid JSON</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-1">{jsonError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Copy/paste JSON directly. Use Ctrl+A to select all, Ctrl+C to copy, Ctrl+V to paste.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRawMode(false);
                  setJsonError('');
                }}
                className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyRawJson}
                disabled={!!jsonError}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Visual Editor Mode */
        <div className="font-mono text-sm leading-relaxed">
          {renderEditableValue(data, '', '')}
        </div>
      )}
    </div>
  );
};

export default EditableJsonViewer;
