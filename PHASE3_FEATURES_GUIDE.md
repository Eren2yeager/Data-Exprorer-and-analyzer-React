# Phase 3 Features Guide 🎯

## Quick Navigation

All collection pages now have a unified navigation bar with 5 tabs:

```
┌─────────────────────────────────────────────────────────────┐
│  Documents | Schema | Indexes | Aggregation | Export/Import │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Aggregation Pipeline Builder 🔧

### What it does
Build and execute MongoDB aggregation pipelines visually without writing code manually.

### Key Features
- **Stage Templates**: Quick-add buttons for common stages
- **JSON Editor**: Edit each stage with syntax highlighting
- **Live Results**: Execute and see results immediately
- **Suggestions**: Pre-built pipeline templates
- **Export**: Download results as JSON

### How to use
1. Navigate to any collection
2. Click "Aggregation" tab
3. Click stage buttons ($match, $group, etc.) to add stages
4. Edit JSON for each stage
5. Click "Execute" to run pipeline
6. View results and export if needed

### Example Use Cases
- Count documents by category
- Calculate average values
- Group and aggregate data
- Join collections with $lookup
- Filter and transform data

---

## 2. Export/Import Data 📦

### What it does
Export collection data to JSON/CSV or import data from files.

### Export Features

**Formats:**
- JSON - Full document structure
- CSV - Tabular data with field selection

**Options:**
- Filter: Apply MongoDB query to export subset
- Fields: Select specific fields (CSV only)
- Limit: Control number of documents

**Info Display:**
- Total documents
- Estimated size
- Available fields
- Max export limit

### Import Features

**Methods:**
- Upload file (JSON or CSV)
- Paste JSON data directly

**Modes:**
- Insert: Add new documents (fails on duplicates)
- Upsert: Update existing or insert new

### How to use

**Export:**
1. Go to "Export/Import" tab
2. Select format (JSON or CSV)
3. Set filter (optional)
4. Choose fields for CSV (optional)
5. Set limit
6. Click "Export"

**Import:**
1. Go to "Export/Import" tab
2. Click "Import" tab
3. Choose mode (Insert or Upsert)
4. Upload file or paste JSON
5. Click "Import Data"

---

## 3. Enhanced Schema Visualizations 📊

### What's New
The Schema page now includes beautiful charts and quality metrics.

### Visualizations

**1. Field Frequency Chart**
- Horizontal bar chart
- Shows how often each field appears
- Percentage display
- Top 10 fields

**2. Type Distribution Pie Chart**
- Visual breakdown of field types
- Color-coded segments
- Percentage labels
- Legend with counts

**3. Data Quality Score**
- Circular progress indicator
- Score from 0-100
- Based on:
  - Required fields ratio
  - Unique fields ratio
  - Average field frequency
- Color-coded (green/yellow/red)

**4. Schema Summary**
- Total documents
- Sample size
- Sampling percentage
- Unique fields count

### How to interpret

**Quality Score:**
- 80-100: Excellent (green)
- 60-79: Good (yellow)
- 0-59: Needs improvement (red)

**Field Frequency:**
- 100%: Field exists in all documents
- <100%: Optional or missing field
- Helps identify data consistency

**Type Distribution:**
- Shows data type diversity
- Helps understand schema complexity
- Identifies dominant types

---

## 4. Collection Navigation 🧭

### What it does
Provides consistent navigation across all collection pages.

### Tabs Available

**Documents** 📄
- View and manage documents
- Query and filter
- Add, edit, delete

**Schema** 🔍
- Analyze structure
- View field types
- Data quality metrics
- Visualizations

**Indexes** ⚡
- Manage indexes
- Create new indexes
- View index stats
- Drop indexes

**Aggregation** 🔧 (NEW)
- Build pipelines
- Execute queries
- View results
- Export data

**Export/Import** 📦 (NEW)
- Export to JSON/CSV
- Import from files
- Bulk operations
- Data transfer

---

## Tips & Best Practices 💡

### Aggregation
1. Use $match early to filter documents
2. $project to select only needed fields
3. $group for aggregations and counting
4. $sort to order results
5. $limit to restrict output size

### Export
1. Use filters to export subsets
2. Set reasonable limits
3. Choose CSV for spreadsheet compatibility
4. Use JSON for full document structure

### Import
1. Always backup before importing
2. Use Insert mode for new data
3. Use Upsert mode to update existing
4. Validate data format before import
5. Start with small batches for testing

### Schema Analysis
1. Use larger sample sizes for accuracy
2. Check quality score regularly
3. Monitor field frequency for consistency
4. Review type distribution for anomalies

---

## Keyboard Shortcuts ⌨️

- `Ctrl/Cmd + K`: Focus search
- `Tab`: Navigate between fields
- `Enter`: Submit forms
- `Esc`: Close modals

---

## Common Workflows 🔄

### Workflow 1: Analyze and Export
1. Go to Schema tab
2. Analyze collection structure
3. Note important fields
4. Go to Export/Import tab
5. Select fields for CSV export
6. Download data

### Workflow 2: Transform and Import
1. Export data to JSON
2. Transform data externally
3. Go to Import tab
4. Upload transformed file
5. Use Upsert mode to update

### Workflow 3: Aggregate and Visualize
1. Go to Aggregation tab
2. Build pipeline to group data
3. Execute and view results
4. Export results
5. Analyze in external tools

---

## Troubleshooting 🔧

### Aggregation Issues
- **Pipeline fails**: Check JSON syntax in each stage
- **No results**: Verify $match filters
- **Timeout**: Reduce data size or add indexes

### Export Issues
- **File too large**: Reduce limit or add filters
- **Missing fields**: Check field names in CSV export
- **Empty export**: Verify filter query

### Import Issues
- **Duplicate errors**: Use Upsert mode instead
- **Format errors**: Validate JSON/CSV format
- **Large files**: Split into smaller batches

---

## What's Next? 🚀

Phase 4 will focus on:
- Performance optimizations
- Mobile responsiveness
- Animations and polish
- Final testing and deployment

---

## Need Help? 💬

- Check tooltips and hints in the UI
- Review error messages for guidance
- Refer to MongoDB documentation for query syntax
- Test with small datasets first

---

**Happy Data Exploring! 🎉**
