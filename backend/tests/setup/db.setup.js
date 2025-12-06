const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

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
 * Load all models
 */
const loadModels = () => {
  const { globSync } = require('glob');
  const path = require('path');
  
  // Get the project root directory (backend folder)
  const projectRoot = path.resolve(__dirname, '../..');
  const modelsPattern = path.join(projectRoot, 'src/models/**/*.js');
  const modelsFiles = globSync(modelsPattern);
  
  for (const filePath of modelsFiles) {
    require(path.resolve(filePath));
  }
};

module.exports = {
  connectDB,
  closeDB,
  clearDB,
  loadModels,
};

