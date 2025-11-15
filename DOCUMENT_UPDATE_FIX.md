# 🔧 Document Update Fix - Immutable _id Field

## Problem
When trying to update a document, the error appeared:
```
Failed to update document: Performing an update on the path "_id" would modify the immutable field "_id"
```

## Root Cause
The edit modal was displaying the full document including the `_id` field. When the user edited and saved, the entire JSON (including `_id`) was sent to the backend. MongoDB doesn't allow modifying the `_id` field as it's immutable.

## Solution
Modified the `handleUpdateDocument` function to remove the `_id` field before sending the update to the backend.

### Code Change

**Before:**
```javascript
const handleUpdateDocument = async (e) => {
  // ... validation code ...
  
  updateData = JSON.parse(editDocument);
  
  // ❌ Sends entire document including _id
  const response = await documentAPI.updateDocument(
    dbName, 
    collName, 
    showEditModal._id, 
    updateData
  );
};
```

**After:**
```javascript
const handleUpdateDocument = async (e) => {
  // ... validation code ...
  
  updateData = JSON.parse(editDocument);
  
  // ✅ Remove _id field before sending
  const { _id, ...dataWithoutId } = updateData;
  
  const response = await documentAPI.updateDocument(
    dbName, 
    collName, 
    showEditModal._id, 
    dataWithoutId
  );
};
```

## How It Works

### Object Destructuring
```javascript
const { _id, ...dataWithoutId } = updateData;
```

This JavaScript destructuring:
1. Extracts `_id` into a variable (which we don't use)
2. Puts all other properties into `dataWithoutId` object
3. Effectively removes `_id` from the update payload

### Example
```javascript
// Original document
const updateData = {
  _id: "507f1f77bcf86cd799439011",
  name: "John Doe",
  email: "john@example.com",
  age: 30
};

// After destructuring
const { _id, ...dataWithoutId } = updateData;

// dataWithoutId = {
//   name: "John Doe",
//   email: "john@example.com",
//   age: 30
// }
```

## MongoDB _id Field Rules

### Immutable
- The `_id` field cannot be changed after document creation
- Attempting to update `_id` results in an error
- This is a MongoDB design decision for data integrity

### Unique
- Each document must have a unique `_id`
- MongoDB uses `_id` for indexing and lookups
- Default type is ObjectId, but can be any unique value

### Best Practices
1. ✅ Never include `_id` in update operations
2. ✅ Use `_id` only for document identification
3. ✅ Let MongoDB generate `_id` automatically
4. ✅ Remove `_id` from user-editable data

## Testing

### Test Scenarios
1. **Edit Document** - Open edit modal, modify fields, save
   - ✅ Should update successfully without _id error
   
2. **Edit with _id visible** - User sees _id in JSON editor
   - ✅ _id is automatically removed before update
   
3. **Add new fields** - User adds new properties
   - ✅ New fields are added to document
   
4. **Remove fields** - User removes properties
   - ✅ Fields are removed from document

### Expected Behavior
- ✅ Document updates successfully
- ✅ No immutable field errors
- ✅ _id remains unchanged
- ✅ All other fields update correctly

## Related Files
- `Front-end/src/pages/DocumentsPage.jsx` - Fixed update handler
- `Front-end/src/services/api.js` - API client
- `Back-end/controllers/documentController.js` - Backend update logic

## Additional Notes

### Why Show _id in Editor?
The `_id` is shown in the edit modal because:
1. Users need to see the complete document structure
2. It helps identify which document is being edited
3. It's part of the document's actual data

### Why Remove _id Before Update?
We remove it because:
1. MongoDB doesn't allow _id modifications
2. The document ID is already in the URL/request
3. Prevents accidental _id change attempts

## Impact
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Fixes update functionality
- ✅ Improves user experience

---

**Status**: ✅ Fixed  
**Date**: November 14, 2025  
**Impact**: Document updates now work correctly
