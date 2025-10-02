#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Directories to scan for optimization
const directories = [
  'components',
  'app'
];

// File extensions to process
const extensions = ['.tsx'];

// Components that should be memoized (expensive components)
const componentsToMemoize = [
  'ProfileResumeBuilder',
  'WorkoutSessionScreen',
  'NotificationPanel',
  'PoliceNewsWidget',
  'SuperAdminContentEditor',
  'PersonalizedFitnessDashboard',
  'EnhancedPremiumPlansDashboard'
];

// Functions that should be memoized (expensive calculations)
const functionsToMemoize = [
  'calculateProgress',
  'getWeekWorkouts',
  'getFocusAreaColor',
  'filterNotifications',
  'computeLevels',
  'calculateStreak'
];

function addReactMemo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Check if component should be memoized
    if (!componentsToMemoize.includes(fileName)) {
      return false;
    }
    
    // Check if already memoized
    if (content.includes('React.memo(') || content.includes('memo(')) {
      return false;
    }
    
    // Find the main component export
    const exportRegex = /export\s+default\s+function\s+(\w+)/;
    const match = content.match(exportRegex);
    
    if (!match) {
      return false;
    }
    
    const componentName = match[1];
    
    // Add React.memo wrapper
    let modifiedContent = content.replace(
      `export default function ${componentName}`,
      `const ${componentName} = React.memo(function ${componentName}`
    );
    
    // Add closing parenthesis and export
    modifiedContent = modifiedContent.replace(
      /}\s*$/,
      `});\n\nexport default ${componentName};`
    );
    
    // Add React import if not present
    if (!modifiedContent.includes('import React')) {
      modifiedContent = modifiedContent.replace(
        /import\s+{([^}]+)}\s+from\s+['"]react['"]/,
        'import React, { $1 } from \'react\''
      );
    }
    
    if (modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Memoized: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function addUseMemo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // Check if file contains expensive functions
    let modifiedContent = content;
    let hasChanges = false;
    
    // Add useMemo for expensive calculations
    functionsToMemoize.forEach(funcName => {
      const funcRegex = new RegExp(`const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*{`, 'g');
      if (funcRegex.test(modifiedContent)) {
        // Replace with useMemo
        modifiedContent = modifiedContent.replace(
          funcRegex,
          `const ${funcName} = useMemo(() => (`
        );
        
        // Find the closing brace and add closing parenthesis
        const closingRegex = new RegExp(`}\\s*;\\s*//\\s*${funcName}`, 'g');
        if (closingRegex.test(modifiedContent)) {
          modifiedContent = modifiedContent.replace(
            closingRegex,
            `}), [/* Add dependencies here */]); // ${funcName}`
          );
        }
        
        hasChanges = true;
      }
    });
    
    // Add useMemo import if needed
    if (hasChanges && !modifiedContent.includes('useMemo')) {
      modifiedContent = modifiedContent.replace(
        /import\s+React,\s*{([^}]+)}\s+from\s+['"]react['"]/,
        'import React, { $1, useMemo } from \'react\''
      );
    }
    
    if (hasChanges && modifiedContent !== content) {
      fs.writeFileSync(filePath, modifiedContent, 'utf8');
      console.log(`✅ Added useMemo: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function optimizeFile(filePath) {
  let optimized = false;
  
  // Add React.memo
  if (addReactMemo(filePath)) {
    optimized = true;
  }
  
  // Add useMemo
  if (addUseMemo(filePath)) {
    optimized = true;
  }
  
  return optimized;
}

function scanDirectory(dirPath) {
  let optimizedFiles = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        optimizedFiles += scanDirectory(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          if (optimizeFile(fullPath)) {
            optimizedFiles++;
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dirPath}:`, error.message);
  }
  
  return optimizedFiles;
}

function main() {
  console.log('🚀 Starting performance optimization...\n');
  
  let totalOptimized = 0;
  
  for (const dir of directories) {
    if (fs.existsSync(dir)) {
      console.log(`📁 Scanning ${dir}/...`);
      const optimized = scanDirectory(dir);
      totalOptimized += optimized;
      console.log(`   Optimized ${optimized} files\n`);
    } else {
      console.log(`⚠️  Directory ${dir}/ not found, skipping...\n`);
    }
  }
  
  console.log(`🎉 Performance optimization complete!`);
  console.log(`📊 Total files optimized: ${totalOptimized}`);
  console.log(`💡 Added React.memo and useMemo optimizations`);
}

if (require.main === module) {
  main();
}

module.exports = { addReactMemo, addUseMemo, optimizeFile, scanDirectory };
