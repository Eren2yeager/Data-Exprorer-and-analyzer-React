# Quick Start Guide - Phase 3 Features

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Application
```bash
# Terminal 1 - Backend
cd Back-end
npm start

# Terminal 2 - Frontend  
cd Front-end
npm run dev
```

### Step 2: Connect to MongoDB
1. Open `http://localhost:5173`
2. Enter your MongoDB connection string
3. Or click "Connect to Local MongoDB"

### Step 3: Navigate to a Collection
1. Click on any database in the sidebar
2. Click on any collection
3. You'll see the new navigation tabs!

---

## 🎯 Try These Features

### 1️⃣ Build an Aggregation Pipeline (2 minutes)

**Click: Aggregation Tab**

```javascript
// Try this simple pipeline:
1. Click "$match" button
2. Edit JSON: { "status": "active" }
3. Click "$count" button  
4. Click "Execute"
5. See results!
```

**What you'll see:**
- Count of active documents
- Execution time
- Results in JSON format

---

### 2️⃣ Export Your Data (1 minute)

**Click: Export/Import Tab**

```javascript
// Export to JSON:
1. Stay on "Export" tab
2. Select "JSON" format
3. Set limit (e.g., 100)
4. Click "Export JSON"
5. File downloads automatically!
```

**What you'll get:**
- JSON file with your data
- Filtered by your query
- Ready to use elsewhere

---

### 3️⃣ View Schema Visualizations (30 seconds)

**Click: Schema Tab**

```javascript
// See beautiful charts:
1. Click "Analyze Schema"
2. Wait for analysis
3. Scroll down to see:
   - Field frequency chart
   - Type distribution pie chart
   - Data quality score
```

**What you'll learn:**
- Which fields are most common
- What data types you have
- How consistent your data is

---

## 💡 Quick Tips

### Aggregation
- Start with $match to filter
- Use suggestions for ideas
- Copy pipeline for reuse
- Export results as JSON

### Export/Import
- Use filters to export subsets
- CSV is great for Excel
- JSON keeps full structure
- Always backup before import

### Schema
- Larger samples = more accurate
- Check quality score regularly
- Use charts to spot issues
- Monitor field frequency

---

## 🎨 Navigation

### The Tab Bar
```
📄 Documents | 📋 Schema | ⚡ Indexes | 🔧 Aggregation | 📦 Export/Import
```

**Click any tab to switch views!**

### Keyboard Shortcuts
- `Tab` - Navigate between fields
- `Enter` - Submit forms
- `Esc` - Close modals

---

## 🔥 Cool Things to Try

### 1. Group and Count
```javascript
// Aggregation pipeline:
[
  { "$group": { "_id": "$category", "count": { "$sum": 1 } } },
  { "$sort": { "count": -1 } }
]
```

### 2. Export Filtered Data
```javascript
// Export only active users:
Filter: { "status": "active", "age": { "$gt": 18 } }
Format: CSV
Fields: name, email, age
```

### 3. Check Data Quality
```javascript
// Schema tab:
1. Set sample size to 1000
2. Click "Analyze Schema"
3. Check quality score
4. Review field frequency
```

---

## 📊 What Each Tab Does

### 📄 Documents
View, add, edit, delete documents

### 📋 Schema  
Analyze structure with charts

### ⚡ Indexes
Manage database indexes

### 🔧 Aggregation (NEW!)
Build query pipelines visually

### 📦 Export/Import (NEW!)
Transfer data in/out

---

## 🎯 Common Tasks

### Task: Find all users over 25
```
1. Go to Aggregation tab
2. Add $match stage
3. Set: { "age": { "$gt": 25 } }
4. Execute
```

### Task: Export to Excel
```
1. Go to Export/Import tab
2. Select CSV format
3. Choose fields
4. Export
5. Open in Excel
```

### Task: Check data consistency
```
1. Go to Schema tab
2. Analyze schema
3. Check quality score
4. Review frequency chart
```

---

## 🆘 Troubleshooting

### Can't see new tabs?
- Make sure you're on a collection page
- Refresh the browser
- Check console for errors

### Aggregation not working?
- Check JSON syntax
- Verify field names
- Try simpler pipeline first

### Export fails?
- Reduce limit
- Check filter syntax
- Verify collection has data

---

## 🎉 You're Ready!

You now have access to:
- ✅ Visual aggregation builder
- ✅ Data export/import tools
- ✅ Beautiful visualizations
- ✅ Easy navigation

**Start exploring your data! 🚀**

---

## 📚 More Help

- **Feature Guide**: `PHASE3_FEATURES_GUIDE.md`
- **Navigation**: `NAVIGATION_STRUCTURE.md`
- **Full Docs**: `PHASE3_COMPLETE.md`

---

**Happy Data Exploring! 🎊**
