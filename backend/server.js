// route-validator.js - Run this to check for route issues
const express = require('express');
const fs = require('fs');
const path = require('path');

function validateRouteFile(routePath) {
  console.log(`\n🔍 Checking route file: ${routePath}`);
  
  if (!fs.existsSync(routePath)) {
    console.log(`❌ File not found: ${routePath}`);
    return false;
  }
  
  try {
    const route = require(routePath);
    
    if (!route) {
      console.log(`❌ Route file exports nothing: ${routePath}`);
      return false;
    }
    
    if (typeof route !== 'function' && typeof route.router !== 'function') {
      console.log(`❌ Route file doesn't export router: ${routePath}`);
      return false;
    }
    
    // Test if the route can be mounted without errors
    const testApp = express();
    try {
      testApp.use('/test', route);
      console.log(`✅ Route file is valid: ${routePath}`);
      return true;
    } catch (mountError) {
      console.log(`❌ Route mounting error in ${routePath}:`, mountError.message);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ Error loading route ${routePath}:`, error.message);
    
    // Check for common issues
    if (error.message.includes('Missing parameter name')) {
      console.log(`🔧 Possible fix: Check route parameter definitions (e.g., '/:id' instead of '/:')`);
    }
    if (error.message.includes('pathToRegexpError')) {
      console.log(`🔧 Possible fix: Check for invalid route patterns`);
    }
    
    return false;
  }
}

// Validate all route files
async function validateAllRoutes() {
  console.log('🚀 Starting route validation...\n');
  
  const routeFiles = [
    './routes/auth.js',
    './routes/jobs.js',
    './routes/applications.js',
    './routes/agentApplications.js',
    './routes/users.js',
    './routes/admin.js',
    './routes/reports.js',
    './routes/crm.js',
    './routes/leadRoutes.js',
    './swagger.js'
  ];
  
  let validRoutes = 0;
  let totalRoutes = routeFiles.length;
  
  for (const routeFile of routeFiles) {
    if (validateRouteFile(path.resolve(routeFile))) {
      validRoutes++;
    }
  }
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`✅ Valid routes: ${validRoutes}/${totalRoutes}`);
  console.log(`❌ Invalid routes: ${totalRoutes - validRoutes}/${totalRoutes}`);
  
  if (validRoutes === totalRoutes) {
    console.log(`\n🎉 All routes are valid!`);
  } else {
    console.log(`\n⚠️  Please fix the invalid routes before starting the server.`);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateAllRoutes();
}

module.exports = { validateRouteFile, validateAllRoutes };