import React from 'react';
import { useConfirm } from '../../../Contexts/confirm-context';

/**
 * ConfirmDialog - A component that demonstrates how to use the confirm dialog
 * 
 * This is a sample component that shows how to use the confirm dialog context
 * in your application.
 */
const ConfirmDialog = () => {
  // Get the confirm dialog methods from the context
  const { openConfirmDialog } = useConfirm();

  /**
   * Handles the delete collection action
   */
  const handleDeleteCollection = () => {
    openConfirmDialog({
      title: 'Delete Collection',
      message: 'This action cannot be undone. This will permanently delete the collection and all documents within it.',
      itemName: 'users',
      itemType: 'collection',
      confirmButtonText: 'Delete Collection',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        console.log('Collection deleted!');
        // Call your API to delete the collection here
      },
      onCancel: () => {
        console.log('Delete cancelled');
      },
      confirmButtonColor: 'red',
      dangerLevel: 'high',
    });
  };

  /**
   * Handles the drop database action
   */
  const handleDropDatabase = () => {
    openConfirmDialog({
      title: 'Drop Database',
      message: 'This action cannot be undone. This will permanently delete the database and all collections within it.',
      itemName: 'my_database',
      itemType: 'database',
      confirmButtonText: 'Drop Database',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        console.log('Database dropped!');
        // Call your API to drop the database here
      },
      onCancel: () => {
        console.log('Drop cancelled');
      },
      confirmButtonColor: 'red',
      dangerLevel: 'high',
    });
  };

  /**
   * Handles the update index action
   */
  const handleUpdateIndex = () => {
    openConfirmDialog({
      title: 'Update Index',
      message: 'This will update the index configuration. This operation may affect query performance.',
      itemName: 'user_index',
      itemType: 'index',
      confirmButtonText: 'Update Index',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        console.log('Index updated!');
        // Call your API to update the index here
      },
      onCancel: () => {
        console.log('Update cancelled');
      },
      confirmButtonColor: 'blue',
      dangerLevel: 'medium',
    });
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Confirm Dialog Examples</h2>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Delete Collection</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Demonstrates a high-danger confirmation for deleting a collection.
          </p>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            onClick={handleDeleteCollection}
          >
            Delete Collection
          </button>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <h3 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Drop Database</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Demonstrates a high-danger confirmation for dropping a database.
          </p>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            onClick={handleDropDatabase}
          >
            Drop Database
          </button>
        </div>

        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
          <h3 className="mb-2 text-lg font-semibold text-orange-700 dark:text-orange-400">Update Index</h3>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            Demonstrates a medium-danger confirmation for updating an index.
          </p>
          <button
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            onClick={handleUpdateIndex}
          >
            Update Index
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;