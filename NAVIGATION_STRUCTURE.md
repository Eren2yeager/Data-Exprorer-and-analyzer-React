# MongoDB Data Explorer - Navigation Structure

## Complete Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CONNECTION PAGE                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • Connect to MongoDB Atlas                            │    │
│  │  • Connect to Local MongoDB                            │    │
│  │  • Enter Connection String                             │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASES PAGE                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • List all databases                                  │    │
│  │  • Create new database                                 │    │
│  │  • View database statistics                            │    │
│  │  • Delete database                                     │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   COLLECTIONS PAGE                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  • List all collections                                │    │
│  │  • Create new collection                               │    │
│  │  • View collection statistics                          │    │
│  │  • Rename/Delete collection                            │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              COLLECTION DETAIL PAGES (WITH TABS)                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  📄 Documents | 📋 Schema | ⚡ Indexes | 🔧 Aggregation | 📦 Export/Import  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────────┬─────────────────┬─────────────────────┐  │
│  │   DOCUMENTS     │     SCHEMA      │      INDEXES        │  │
│  │                 │                 │                     │  │
│  │ • View docs     │ • Analyze       │ • List indexes      │  │
│  │ • Query/Filter  │ • Field types   │ • Create index      │  │
│  │ • Add/Edit      │ • Frequency     │ • Drop index        │  │
│  │ • Delete        │ • Visualizations│ • View stats        │  │
│  │ • Pagination    │ • Quality score │                     │  │
│  └─────────────────┴─────────────────┴─────────────────────┘  │
│                                                                  │
│  ┌─────────────────┬─────────────────────────────────────────┐ │
│  │  AGGREGATION    │       EXPORT/IMPORT                     │ │
│  │                 │                                         │ │
│  │ • Build pipeline│ • Export to JSON                        │ │
│  │ • Add stages    │ • Export to CSV                         │ │
│  │ • Execute       │ • Import from JSON                      │ │
│  │ • View results  │ • Import from CSV                       │ │
│  │ • Export data   │ • Filter exports                        │ │
│  │ • Suggestions   │ • Bulk operations                       │ │
│  └─────────────────┴─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sidebar Navigation

```
┌──────────────────────────────┐
│      SIDEBAR MENU            │
├──────────────────────────────┤
│                              │
│  🔌 Connections              │
│  ❓ Help & Support           │
│                              │
├──────────────────────────────┤
│      DATABASES               │
├──────────────────────────────┤
│                              │
│  📁 Database 1               │
│     ├─ 📄 Collection 1       │
│     ├─ 📄 Collection 2       │
│     └─ 📄 Collection 3       │
│                              │
│  📁 Database 2               │
│     ├─ 📄 Collection A       │
│     └─ 📄 Collection B       │
│                              │
└──────────────────────────────┘
```

---

## Collection Page Navigation Tabs

### Tab Structure
```
┌────────────────────────────────────────────────────────────────┐
│  Active Tab (Purple Border)                                    │
│  ═══════════                                                   │
│  📄 Documents | 📋 Schema | ⚡ Indexes | 🔧 Aggregation | 📦 Export/Import │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Tab Details

#### 1. Documents Tab 📄
**Route:** `/databases/:dbName/collections/:collName/documents`

**Features:**
- View all documents
- Query builder with filters
- Sort documents
- Pagination
- Add new documents
- Edit existing documents
- Delete documents
- JSON and Table views
- Bulk operations

#### 2. Schema Tab 📋
**Route:** `/databases/:dbName/collections/:collName/schema`

**Features:**
- Analyze collection structure
- Field type distribution (Pie Chart)
- Field frequency analysis (Bar Chart)
- Data quality score (Circular Progress)
- Sample size configuration
- Field statistics
- Type detection
- Schema summary

#### 3. Indexes Tab ⚡
**Route:** `/databases/:dbName/collections/:collName/indexes`

**Features:**
- List all indexes
- Create new indexes
- Drop indexes
- View index properties
- Unique/Sparse/Partial indicators
- Index size information
- Field specifications

#### 4. Aggregation Tab 🔧 (NEW)
**Route:** `/databases/:dbName/collections/:collName/aggregation`

**Features:**
- Visual pipeline builder
- Stage templates ($match, $group, etc.)
- JSON editor for each stage
- Execute pipeline
- View results
- Export results
- Pipeline suggestions
- Execution time tracking
- Tips and best practices

#### 5. Export/Import Tab 📦 (NEW)
**Route:** `/databases/:dbName/collections/:collName/export-import`

**Features:**
- Export to JSON
- Export to CSV
- Custom filters
- Field selection (CSV)
- Import from JSON
- Import from CSV
- File upload
- Paste data
- Insert/Upsert modes
- Collection statistics

---

## URL Structure

### Pattern
```
/databases/:dbName/collections/:collName/:feature
```

### Examples
```
/databases/myDatabase/collections/users/documents
/databases/myDatabase/collections/users/schema
/databases/myDatabase/collections/users/indexes
/databases/myDatabase/collections/users/aggregation
/databases/myDatabase/collections/users/export-import
```

---

## Navigation Hierarchy

```
Level 1: Connection
    └─ Level 2: Databases
        └─ Level 3: Collections
            └─ Level 4: Collection Features (Tabs)
                ├─ Documents
                ├─ Schema
                ├─ Indexes
                ├─ Aggregation
                └─ Export/Import
```

---

## Breadcrumb Navigation

Each page shows breadcrumbs for easy navigation:

```
Databases > myDatabase > users > Documents
    ↑          ↑          ↑         ↑
  Click    Click      Click    Current
   here     here       here      page
```

---

## Mobile Navigation

### Sidebar
- Collapsible sidebar
- Hamburger menu button
- Overlay when open
- Swipe to close

### Tabs
- Horizontal scroll
- Touch-friendly
- Active indicator
- Icon + text

---

## Keyboard Navigation

### Shortcuts
- `Tab` - Navigate between elements
- `Enter` - Activate buttons/links
- `Esc` - Close modals
- `Ctrl/Cmd + K` - Focus search

### Tab Navigation
- Arrow keys to move between tabs
- Enter to activate tab
- Tab to move to content

---

## State Management

### URL-Based State
- Current database: URL param `:dbName`
- Current collection: URL param `:collName`
- Current feature: URL param `:feature`

### Local State
- Sidebar open/closed
- Modal visibility
- Form data
- Loading states

### Context State
- Connection status
- Session ID
- User preferences

---

## Navigation Flow Examples

### Example 1: View Documents
```
1. Connect to MongoDB
2. Click "Databases" in sidebar
3. Click database name
4. Click collection name
5. Automatically on "Documents" tab
```

### Example 2: Build Aggregation
```
1. From any collection page
2. Click "Aggregation" tab
3. Add pipeline stages
4. Execute pipeline
5. View results
```

### Example 3: Export Data
```
1. From any collection page
2. Click "Export/Import" tab
3. Configure export options
4. Click "Export"
5. Download file
```

---

## Protected Routes

All routes except `/` (connection page) require authentication:

```javascript
<Route element={<ProtectedRoute />}>
  <Route element={<MainLayout />}>
    {/* All protected routes */}
  </Route>
</Route>
```

---

## Navigation Components

### 1. Sidebar (`Sidebar.jsx`)
- Database tree view
- Collection list
- Quick links

### 2. Header (`Header.jsx`)
- Connection status
- User actions
- Disconnect button

### 3. Breadcrumbs (Built into pages)
- Current location
- Clickable path
- Auto-generated

### 4. CollectionNav (`CollectionNav.jsx`)
- Tab navigation
- Active highlighting
- Icon indicators

---

## Summary

The navigation structure provides:
- ✅ Clear hierarchy
- ✅ Easy access to all features
- ✅ Consistent user experience
- ✅ Multiple navigation methods
- ✅ Responsive design
- ✅ Keyboard accessibility
- ✅ URL-based routing

Users can navigate using:
1. Sidebar (tree view)
2. Breadcrumbs (path)
3. Tabs (features)
4. URLs (direct)
5. Buttons (actions)
