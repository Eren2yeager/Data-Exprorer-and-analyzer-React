# 🚀 Quick Start Guide

## Prerequisites

Before running the application, ensure you have:
- Node.js (v16 or higher)
- npm or yarn
- MongoDB instance (local or remote)

---

## Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd Front-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

---

## Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

The application will start on `http://localhost:5173` (or another port if 5173 is busy).

### Production Build

```bash
npm run build
# or
yarn build
```

### Preview Production Build

```bash
npm run preview
# or
yarn preview
```

---

## First Time Setup

### 1. Start MongoDB
Make sure your MongoDB instance is running:

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
- Ensure your cluster is running
- Whitelist your IP address
- Get your connection string

### 2. Connect to Database

1. Open the application in your browser
2. You'll see the ConnectionPage
3. Choose one of these options:

   **Option A: Quick Connect (Local)**
   - Click "Quick Connect to Local MongoDB"
   - Default: `mongodb://localhost:27017`

   **Option B: Custom Connection**
   - Click "New Connection"
   - Enter connection details:
     - Name: `My Database`
     - URI: `mongodb://localhost:27017` (or your MongoDB URI)
   - Click "Save & Connect"

### 3. Explore Your Data

Once connected, you can:
- View all databases
- Browse collections
- Query documents
- Analyze schema
- Manage indexes

---

## Application Structure

```
Front-end/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   └── navigation/      # Navigation components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   └── App.jsx              # Main app component
├── public/                  # Static assets
└── package.json
```

---

## Available Pages

### 1. Connection Page (`/`)
- Manage MongoDB connections
- Quick connect to local MongoDB
- Test connections

### 2. Databases Page (`/databases`)
- View all databases
- Create new databases
- Delete databases
- Search databases

### 3. Collections Page (`/databases/:dbName/collections`)
- View collections in a database
- Create new collections
- Drop collections
- View collection statistics

### 4. Documents Page (`/databases/:dbName/collections/:collName/documents`)
- View documents (JSON/Table view)
- Query documents with filters
- Create/Edit/Delete documents
- Pagination

### 5. Schema Page (`/databases/:dbName/collections/:collName/schema`)
- Analyze collection schema
- View field types and distribution
- Configure sample size

### 6. Indexes Page (`/databases/:dbName/collections/:collName/indexes`)
- View collection indexes
- Create new indexes
- Configure index options
- Delete indexes

---

## Common Tasks

### Creating a Database
1. Go to Databases page
2. Click "Create Database"
3. Enter database name
4. Click "Create"

### Creating a Collection
1. Navigate to a database
2. Click "Create Collection"
3. Enter collection name
4. Click "Create"

### Inserting Documents
1. Navigate to a collection's Documents page
2. Click "New Document"
3. Enter JSON data
4. Click "Create Document"

### Querying Documents
1. Go to Documents page
2. Click "Query" button
3. Enter filter (e.g., `{"status": "active"}`)
4. Enter sort (e.g., `{"createdAt": -1}`)
5. Click "Apply Query"

### Creating an Index
1. Go to Indexes page
2. Click "Create Index"
3. Add fields and configure options
4. Click "Create Index"

---

## Keyboard Shortcuts

- `Esc` - Close modals
- `Ctrl/Cmd + K` - Focus search (when available)
- Browser back/forward - Navigate between pages

---

## Troubleshooting

### Connection Issues

**Problem**: Cannot connect to MongoDB
**Solutions**:
- Verify MongoDB is running
- Check connection URI format
- Ensure network access (firewall, IP whitelist)
- Check MongoDB authentication credentials

### Page Not Loading

**Problem**: Page shows loading indefinitely
**Solutions**:
- Check browser console for errors
- Verify API endpoint is accessible
- Check network tab for failed requests
- Refresh the page

### Empty Data

**Problem**: No databases/collections showing
**Solutions**:
- Verify you're connected to the correct MongoDB instance
- Check if databases/collections exist in MongoDB
- Verify user permissions

---

## Development Tips

### Hot Module Replacement (HMR)
The app uses Vite's HMR for instant updates during development. Changes to components will reflect immediately without full page reload.

### Component Development
All UI components are in `src/components/ui/`. You can import them like:
```jsx
import { Button, Card, Input } from '../components/ui';
```

### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `src/App.jsx`
3. Update navigation if needed

---

## Environment Variables

Create a `.env` file in the `Front-end` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=MongoDB Data Explorer
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Performance Tips

1. **Use pagination** for large collections
2. **Limit sample size** in schema analysis
3. **Use indexes** for frequently queried fields
4. **Filter data** before loading large datasets

---

## Getting Help

### Documentation
- `REDESIGN_SUMMARY.md` - Complete feature overview
- `TESTING_GUIDE.md` - Testing checklist
- `REDESIGN_PROGRESS.md` - Development progress

### Common Issues
Check the browser console for error messages and refer to the troubleshooting section above.

---

## Next Steps

After getting started:
1. ✅ Connect to your MongoDB instance
2. ✅ Explore the redesigned interface
3. ✅ Test all features
4. ✅ Provide feedback
5. ✅ Report any issues

---

**Happy Exploring!** 🎉

For more detailed information, see:
- [REDESIGN_SUMMARY.md](./REDESIGN_SUMMARY.md) - Complete feature list
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing checklist
