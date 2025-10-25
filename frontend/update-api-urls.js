#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const OLD_API_URL = 'http://localhost:5000/api';
const NEW_API_URL = 'http://localhost:5000/api';
const FRONTEND_DIR = __dirname;

console.log('🚀 Updating all API URLs to local development...');
console.log(`📝 Changing: ${OLD_API_URL}`);
console.log(`📝 To: ${NEW_API_URL}`);
console.log('');

// Function to recursively find all files
function findFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  let files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files = files.concat(findFiles(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to update file content
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace various patterns
    const patterns = [
      // Direct URL replacements
      { from: OLD_API_URL, to: NEW_API_URL },
      { from: 'http://localhost:5000', to: 'http://localhost:5000' },
      
      // Environment variable fallbacks
      { 
        from: /import\.meta\.env\.VITE_API_BASE_URL \|\| ['"]https:\/\/api\.ozarx\.in\/api['"]/g, 
        to: "import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'" 
      },
      { 
        from: /import\.meta\.env\.VITE_API_BASE_URL \|\| ["']https:\/\/api\.ozarx\.in\/api["']/g, 
        to: "import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'" 
      },
      
      // Fallback URL patterns
      { 
        from: /import\.meta\.env\.VITE_FALLBACK_API_URL \|\| ['"]https:\/\/api\.ozarx\.in\/api['"]/g, 
        to: "import.meta.env.VITE_FALLBACK_API_URL || 'http://localhost:5000/api'" 
      }
    ];
    
    let changes = 0;
    for (const pattern of patterns) {
      if (pattern.from instanceof RegExp) {
        const matches = content.match(pattern.from);
        if (matches) {
          content = content.replace(pattern.from, pattern.to);
          changes += matches.length;
        }
      } else {
        const matches = content.split(pattern.from).length - 1;
        if (matches > 0) {
          content = content.replaceAll(pattern.from, pattern.to);
          changes += matches;
        }
      }
    }
    
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(FRONTEND_DIR, filePath)} (${changes} changes)`);
      return changes;
    }
    
    return 0;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return 0;
  }
}

// Main execution
try {
  const files = findFiles(FRONTEND_DIR);
  let totalChanges = 0;
  let filesUpdated = 0;
  
  console.log(`📁 Found ${files.length} files to check...`);
  console.log('');
  
  for (const file of files) {
    const changes = updateFile(file);
    if (changes > 0) {
      filesUpdated++;
      totalChanges += changes;
    }
  }
  
  console.log('');
  console.log('🎉 Update complete!');
  console.log(`📊 Files updated: ${filesUpdated}`);
  console.log(`📊 Total changes: ${totalChanges}`);
  console.log('');
  console.log('💡 Next steps:');
  console.log('1. Create .env.local file in frontend root with:');
  console.log('   VITE_API_BASE_URL=http://localhost:5000/api');
  console.log('2. Restart your frontend development server');
  console.log('3. Test the connection');
  
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}






