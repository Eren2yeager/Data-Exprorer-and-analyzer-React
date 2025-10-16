/**
 * DatabasesPage Component
 * Page for displaying and managing MongoDB databases
 * Enhanced with responsive design and visual improvements
 */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { databaseAPI } from "../services/api";
import useConfirmDialog from "../hooks/useConfirmDialog";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsivePageContainer, 
  PageHeader, 
  ResponsiveCard, 
  ResponsiveGrid,
  Notification,
  GradientButton,
  Icons,
  animationVariants
} from '../components/common/ResponsiveUtils';
/**
 * Database explorer page component
 */
const DatabasesPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newDbName, setNewDbName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDb, setSelectedDb] = useState(null);
  const { confirmDropDatabase } = useConfirmDialog();
  // Get connection string from location state or localStorage
  const connStr =
    location.state?.connStr || localStorage.getItem("currentConnStr");

  /**
   * Load databases on component mount
   */
  useEffect(() => {
    // if (!connStr) {
    //   navigate("/");
    //   return;
    // }

    // Store current connection string in localStorage
    localStorage.setItem("currentConnStr", connStr);

    loadDatabases();
  }, [connStr, navigate]);

  /**
   * Load databases from API
   */
  const loadDatabases = async () => {
    setLoading(true);
    try {
      const response = await databaseAPI.listDatabases(connStr);
      if (response.data.success) {
        setDatabases(response.data.data || []);
      } else {
        setError(response.data.message || "Failed to load databases");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load databases"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle database selection
   * @param {String} dbName - Database name
   */
  const handleSelectDatabase = (dbName) => {
    setSelectedDb(dbName);
    navigate(`/databases/${dbName}/collections`);
  };

  /**
   * Handle database creation
   * @param {Event} e - Form submit event
   */
  const handleCreateDatabase = async (e) => {
    e.preventDefault();
    if (!newDbName.trim()) return;

    setLoading(true);
    try {
      const response = await databaseAPI.createDatabase(newDbName);
      if (response.data.success) {
        setNewDbName("");
        setShowCreateForm(false);
        loadDatabases();
      } else {
        setError(response.data.message || "Failed to create database");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to create database"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle database deletion
   * @param {String} dbName - Database name
   */
  const handleDropDatabase = async (dbName) => {
    confirmDropDatabase({
      databaseName: dbName,
      onConfirm: async () => {
        setLoading(true);
        try {
          const response = await databaseAPI.dropDatabase(dbName);
          if (response.data.success) {
            loadDatabases();
          } else {
            setError(response.data.message || "Failed to drop database");
          }
        } catch (error) {
          setError(
            error.response?.data?.message ||
              error.message ||
              "Failed to drop database"
          );
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => console.log("Drop cancelled"),
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Databases ({databases.length})</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "Create Database"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Create database form */}
      {showCreateForm && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Create New Database</h2>
          <form onSubmit={handleCreateDatabase}>
            <div className="flex">
              <input
                type="text"
                value={newDbName}
                onChange={(e) => setNewDbName(e.target.value)}
                placeholder="Database name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 disabled:bg-blue-400"
              >
                Create
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Note: In MongoDB, a database is not actually created until data is
              inserted into it.
            </p>
          </form>
        </div>
      )}

      {/* Databases list */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : databases.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-500">No databases found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {databases.map((db) => (
            <div
              key={db.name}
              className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${
                selectedDb === db.name
                  ? "border-blue-500"
                  : "border-transparent"
              } hover:border-blue-300 transition-colors`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2
                    className="text-lg font-semibold mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleSelectDatabase(db.name)}
                  >
                    {db.name}
                  </h2>
                  <div className="text-sm text-gray-500">
                    <p>Collections: {db.collections.length || 0}</p>

                    <p>Size: {formatSize(db.sizeOnDisk || 0)}</p>
                  </div>
                </div>
                <div className="flex">
                  <button
                    onClick={() => handleSelectDatabase(db.name)}
                    className="mr-2 p-2 text-blue-600 hover:bg-blue-100 rounded"
                    title="View Collections"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {/* Don't allow dropping system databases */}
                  {!["admin", "local", "config"].includes(db.name) && (
                    <button
                      onClick={() => handleDropDatabase(db.name)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                      title="Drop Database"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Format byte size to human-readable format
 * @param {Number} bytes - Size in bytes
 * @returns {String} Formatted size string
 */
const formatSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default DatabasesPage;
