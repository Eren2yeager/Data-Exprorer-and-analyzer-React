# Confirm Dialog Usage Guide

This guide explains how to use the Confirm Dialog context in your MongoDB Data Explorer application.

## Setup

1. First, wrap your application with the `ConfirmProvider` in your main App component:

```jsx
// App.jsx
import { ConfirmProvider } from '../Contexts/confirm-context';

function App() {
  return (
    <ConfirmProvider>
      {/* Your app components */}
    </ConfirmProvider>
  );
}
```

## Basic Usage

### Using the Context Directly

```jsx
import { useConfirm } from '../Contexts/confirm-context';

function MyComponent() {
  const { openConfirmDialog } = useConfirm();
  
  const handleDeleteItem = () => {
    openConfirmDialog({
      title: 'Delete Item',
      message: 'This action cannot be undone. This will permanently delete the item.',
      itemName: 'my_item',
      itemType: 'item',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      onConfirm: () => {
        // Handle confirmation
        console.log('Item deleted!');
      },
      onCancel: () => {
        // Handle cancellation
        console.log('Delete cancelled');
      },
      confirmButtonColor: 'red', // 'red', 'blue', 'green'
      dangerLevel: 'high', // 'low', 'medium', 'high'
    });
  };
  
  return (
    <button onClick={handleDeleteItem}>Delete Item</button>
  );
}
```

### Using the Custom Hook

For common MongoDB operations, use the `useConfirmDialog` hook:

```jsx
import useConfirmDialog from '../hooks/useConfirmDialog';

function CollectionActions({ collectionName }) {
  const { confirmDeleteCollection } = useConfirmDialog();
  
  const handleDelete = () => {
    confirmDeleteCollection({
      collectionName,
      onConfirm: () => {
        // Call your API to delete the collection
        console.log(`Collection ${collectionName} deleted!`);
      },
      onCancel: () => {
        console.log('Delete cancelled');
      }
    });
  };
  
  return (
    <button onClick={handleDelete}>Delete Collection</button>
  );
}
```

## Available Confirmation Types

The `useConfirmDialog` hook provides these pre-configured confirmations:

1. `confirmDeleteCollection({ collectionName, onConfirm, onCancel })`
2. `confirmDropDatabase({ databaseName, onConfirm, onCancel })`
3. `confirmDeleteDocument({ documentId, collectionName, onConfirm, onCancel })`
4. `confirmDropIndex({ indexName, collectionName, onConfirm, onCancel })`

## Customization Options

When using `openConfirmDialog` directly, you can customize:

| Option | Type | Description |
|--------|------|-------------|
| `title` | string | Dialog title |
| `message` | string | Dialog message |
| `itemName` | string | Name of the item to be confirmed (user must type this) |
| `itemType` | string | Type of the item (collection, database, etc.) |
| `confirmButtonText` | string | Text for the confirm button |
| `cancelButtonText` | string | Text for the cancel button |
| `onConfirm` | function | Function to call when confirmed |
| `onCancel` | function | Function to call when cancelled |
| `confirmButtonColor` | string | Color of the confirm button ('red', 'blue', 'green') |
| `dangerLevel` | string | Danger level ('low', 'medium', 'high') |

## Security Features

The confirm dialog requires users to type the exact name of the item they want to delete, ensuring they understand the consequences of their action. This is especially important for destructive operations like deleting collections or dropping databases.