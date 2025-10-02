const fs = require('fs');
const path = require('path');

// Directories to scan
const directories = [
  'app',
  'components',
  'context',
  'lib',
  'hooks',
  'utils'
];

// File extensions to process
const extensions = ['.tsx', '.ts', '.js', '.jsx'];

// Keep console.error for error logging
const keepConsoleTypes = ['console.error', 'console.warn'];

function removeConsoleLogs(content) {
  // Remove console.log statements but keep console.error and console.warn
  let modifiedContent = content;
  
  // Remove console.log statements
  modifiedContent = modifiedContent.replace(/console\.log\([^)]*\);?\s*/g, '');
  
  // Remove console.info statements
  modifiedContent = modifiedContent.replace(/console\.info\([^)]*\);?\s*/g, '');
  
  // Remove console.debug statements
  modifiedContent = modifiedContent.replace(/console\.debug\([^)]*\);?\s*/g, '');
  
  // Remove console.trace statements
  modifiedContent = modifiedContent.replace(/console\.trace\([^)]*\);?\s*/g, '');
  
  // Remove console.dir statements
  modifiedContent = modifiedContent.replace(/console\.dir\([^)]*\);?\s*/g, '');
  
  // Remove console.table statements
  modifiedContent = modifiedContent.replace(/console\.table\([^)]*\);?\s*/g, '');
  
  // Remove console.count statements
  modifiedContent = modifiedContent.replace(/console\.count\([^)]*\);?\s*/g, '');
  
  // Remove console.time statements
  modifiedContent = modifiedContent.replace(/console\.time\([^)]*\);?\s*/g, '');
  
  // Remove console.timeEnd statements
  modifiedContent = modifiedContent.replace(/console\.timeEnd\([^)]*\);?\s*/g, '');
  
  // Remove console.group statements
  modifiedContent = modifiedContent.replace(/console\.group\([^)]*\);?\s*/g, '');
  
  // Remove console.groupEnd statements
  modifiedContent = modifiedContent.replace(/console\.groupEnd\([^)]*\);?\s*/g, '');
  
  return modifiedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const modifiedContent = removeConsoleLogs(content);
    
    if (originalContent !== modifiedContent) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Cleaned: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dirPath) {
  let cleanedFiles = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        cleanedFiles += scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (processFile(fullPath)) {
            cleanedFiles++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
  }
  
  return cleanedFiles;
}

function main() {
  console.log('🧹 Starting console log cleanup...\n');
  
  let totalCleaned = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Scanning ${dir}/...`);
      const cleaned = scanDirectory(dir);
      totalCleaned += cleaned;
      console.log(`   Cleaned ${cleaned} files\n`);
    } else {
      console.log(`⚠️  Directory ${dir}/ not found, skipping...\n`);
    }
  }
  
  console.log(`🎉 Console log cleanup complete!`);
  console.log(`📊 Total files cleaned: ${totalCleaned}`);
  console.log(`💡 Kept console.error and console.warn for error logging`);
}

if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs, processFile, scanDirectory };
