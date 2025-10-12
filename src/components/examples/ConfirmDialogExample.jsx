import React from 'react';
import useConfirmDialog from '../../hooks/useConfirmDialog';

/**
 * ConfirmDialogExample - A component that demonstrates how to use the useConfirmDialog hook
 */
const ConfirmDialogExample = () => {
  // Get the confirm dialog methods from the custom hook
  const {
    confirmDeleteCollection,
    confirmDropDatabase,
    confirmDeleteDocument,
    confirmDropIndex
  } = useConfirmDialog();

  // Example handlers for different confirmation scenarios
  const handleDeleteCollection = () => {
    confirmDeleteCollection({
      collectionName: 'users',
      onConfirm: () => console.log('Collection deleted!'),
      onCancel: () => console.log('Delete cancelled')
    });
  };

  const handleDropDatabase = () => {
    confirmDropDatabase({
      databaseName: 'my_database',
      onConfirm: () => console.log('Database dropped!'),
      onCancel: () => console.log('Drop cancelled')
    });
  };

  const handleDeleteDocument = () => {
    confirmDeleteDocument({
      documentId: '507f1f77bcf86cd799439011',
      collectionName: 'users',
      onConfirm: () => console.log('Document deleted!'),
      onCancel: () => console.log('Delete cancelled')
    });
  };

  const handleDropIndex = () => {
    confirmDropIndex({
      indexName: 'email_1',
      collectionName: 'users',
      onConfirm: () => console.log('Index dropped!'),
      onCancel: () => console.log('Drop cancelled')
    });
  };

  return (
    <div className="p-6">
      <h2 className="mb-6 text-2xl font-bold text-gray-800 dark:text-white">Confirm Dialog Examples</h2>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Delete Collection Example */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-md transition-transform hover:scale-105 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Delete Collection</h3>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Demonstrates confirming collection deletion
          </p>
          <button
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            onClick={handleDeleteCollection}
          >
            Delete Collection
          </button>
        </div>

        {/* Drop Database Example */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-md transition-transform hover:scale-105 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Drop Database</h3>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Demonstrates confirming database deletion
          </p>
          <button
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            onClick={handleDropDatabase}
          >
            Drop Database
          </button>
        </div>

        {/* Delete Document Example */}
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 shadow-md transition-transform hover:scale-105 dark:border-orange-800 dark:bg-orange-900/20">
          <h3 className="mb-2 text-lg font-semibold text-orange-700 dark:text-orange-400">Delete Document</h3>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Demonstrates confirming document deletion
          </p>
          <button
            className="w-full rounded-md bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-800"
            onClick={handleDeleteDocument}
          >
            Delete Document
          </button>
        </div>

        {/* Drop Index Example */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 shadow-md transition-transform hover:scale-105 dark:border-blue-800 dark:bg-blue-900/20">
          <h3 className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-400">Drop Index</h3>
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
            Demonstrates confirming index deletion
          </p>
          <button
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={handleDropIndex}
          >
            Drop Index
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialogExample;