#!/usr/bin/env node

/**
 * Database Optimization Script
 * Run this script to create indexes and optimize database performance
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { createIndexes } = require('./utils/optimizeDatabase');

async function optimizeDatabase() {
  try {
    console.log('🚀 Starting database optimization...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Create indexes
    await createIndexes();
    
    // Test connection
    console.log('🔍 Testing database connection...');
    const testQuery = await mongoose.connection.db.admin().ping();
    console.log('✅ Database ping successful:', testQuery);
    
    console.log('🎉 Database optimization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase();
}

module.exports = optimizeDatabase;





