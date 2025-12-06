require('module-alias/register');
require('dotenv').config({ path: '.env.test' });

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { globSync } = require('glob');
const path = require('path');

let mongoServer;

/**
 * Load all Mongoose models
 */
const loadModels = () => {
  const projectRoot = path.resolve(__dirname, '../../../');
  const modelsPattern = path.join(projectRoot, 'src/models/**/*.js');
  const modelsFiles = globSync(modelsPattern);
  
  for (const filePath of modelsFiles) {
    require(path.resolve(filePath));
  }
};

/**
 * Connect to the in-memory database
 */
const connectDB = async () => {
  // Close existing connection if any
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Wait for connection to be ready
  await mongoose.connection.db.admin().ping();
  
  return mongoServer;
};

/**
 * Drop database, close the connection and stop mongoServer
 */
const closeDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

/**
 * Clear all test data from collections
 */
const clearDB = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

/**
 * Initialize Express app for testing
 */
const initApp = () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-for-integration-tests';
  process.env.DATABASE = 'mongodb://localhost:27017/test-db';
  
  // Load models before requiring app
  loadModels();
  
  // Now require the app
  const app = require('@/app');
  return app;
};

module.exports = {
  connectDB,
  closeDB,
  clearDB,
  loadModels,
  initApp,
};

