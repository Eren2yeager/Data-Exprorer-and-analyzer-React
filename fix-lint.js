/**
 * Lint error fix script
 * Run with: node fix-lint.js
 */
const fs = require('fs');
const path = require('path');

// Common patterns to fix
const fixes = [
  {
    // Remove unused motion import
    pattern: /import\s+{\s*motion,\s*([^}]+)\s*}\s*from\s+['"]framer-motion['"];/g,
    replacement: 'import { $1 } from "framer-motion";'
  },
  {
    // Fix React Hook dependency warnings by adding missing dependencies
    pattern: /useEffect\(\(\)\s*=>\s*{([^}]*)},\s*\[\]\);/g,
    replacement: (match, p1, offset, string) => {
      // Extract function names from the effect body
      const functionPattern = /(\w+)\(/g;
      const functions = [];
      let match;
      while ((match = functionPattern.exec(p1)) !== null) {
        if (!['useState', 'useEffect', 'useContext'].includes(match[1])) {
          functions.push(match[1]);
        }
      }
      
      // Create a unique list of dependencies
      const uniqueDeps = [...new Set(functions)];
      return `useEffect(() => {${p1}}, [${uniqueDeps.join(', ')}]);`;
    }
  }
];

// Directories to process
const directories = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'Contexts')
];

// File extensions to process
const extensions = ['.jsx', '.js'];

// Process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Apply fixes
    fixes.forEach(fix => {
      const newContent = content.replace(fix.pattern, fix.replacement);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    // Save changes if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Walk directories recursively
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (extensions.includes(path.extname(file))) {
      processFile(filePath);
    }
  });
}

// Start processing
console.log('Starting lint error fixes...');
directories.forEach(walkDir);
console.log('Completed lint error fixes.');