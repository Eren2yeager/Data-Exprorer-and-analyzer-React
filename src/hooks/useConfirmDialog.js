import { useConfirm } from '../../Contexts/confirm-context';

/**
 * useConfirmDialog - A custom hook for using the confirm dialog with predefined configurations
 * 
 * This hook provides convenient methods for common confirmation scenarios in a MongoDB data explorer
 * application, such as deleting collections, dropping databases, etc.
 * 
 * @returns {Object} Object containing methods for different confirmation scenarios
 */
const useConfirmDialog = () => {
  const { openConfirmDialog } = useConfirm();

  /**
   * Confirms deletion of a collection
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.collectionName - Name of the collection to delete
   * @param {Function} options.onConfirm - Function to call when confirmed
   * @param {Function} options.onCancel - Function to call when cancelled
   */
  const confirmDeleteCollection = ({ collectionName, onConfirm, onCancel }) => {
    openConfirmDialog({
      title: 'Delete Collection',
      message: `This action cannot be undone. This will permanently delete the "${collectionName}" collection and all documents within it.`,
      itemName: collectionName,
      itemType: 'collection',
      confirmButtonText: 'Delete Collection',
      cancelButtonText: 'Cancel',
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      confirmButtonColor: 'red',
      dangerLevel: 'high',
    });
  };

  /**
   * Confirms dropping a database
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.databaseName - Name of the database to drop
   * @param {Function} options.onConfirm - Function to call when confirmed
   * @param {Function} options.onCancel - Function to call when cancelled
   */
  const confirmDropDatabase = ({ databaseName, onConfirm, onCancel }) => {
    openConfirmDialog({
      title: 'Drop Database',
      message: `This action cannot be undone. This will permanently delete the "${databaseName}" database and all collections within it.`,
      itemName: databaseName,
      itemType: 'database',
      confirmButtonText: 'Drop Database',
      cancelButtonText: 'Cancel',
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      confirmButtonColor: 'red',
      dangerLevel: 'high',
    });
  };

  /**
   * Confirms deletion of a document
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.documentId - ID of the document to delete
   * @param {string} options.collectionName - Name of the collection containing the document
   * @param {Function} options.onConfirm - Function to call when confirmed
   * @param {Function} options.onCancel - Function to call when cancelled
   */
  const confirmDeleteDocument = ({ documentId, collectionName, onConfirm, onCancel }) => {
    openConfirmDialog({
      title: 'Delete Document',
      message: `This action cannot be undone. This will permanently delete the document with ID "${documentId}" from the "${collectionName}" collection.`,
      itemName: documentId,
      itemType: 'document',
      confirmButtonText: 'Delete Document',
      cancelButtonText: 'Cancel',
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      confirmButtonColor: 'red',
      dangerLevel: 'medium',
    });
  };

  /**
   * Confirms dropping an index
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.indexName - Name of the index to drop
   * @param {string} options.collectionName - Name of the collection containing the index
   * @param {Function} options.onConfirm - Function to call when confirmed
   * @param {Function} options.onCancel - Function to call when cancelled
   */
  const confirmDropIndex = ({ indexName, collectionName, onConfirm, onCancel }) => {
    openConfirmDialog({
      title: 'Drop Index',
      message: `This action cannot be undone. This will permanently delete the "${indexName}" index from the "${collectionName}" collection.`,
      itemName: indexName,
      itemType: 'index',
      confirmButtonText: 'Drop Index',
      cancelButtonText: 'Cancel',
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      confirmButtonColor: 'blue',
      dangerLevel: 'medium',
    });
  };

  return {
    confirmDeleteCollection,
    confirmDropDatabase,
    confirmDeleteDocument,
    confirmDropIndex,
  };
};

export default useConfirmDialog;