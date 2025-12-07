require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// MongoDB connection with better error handling
if (process.env.DATABASE) {
  mongoose.connect(process.env.DATABASE, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  }).catch((error) => {
    console.error('MongoDB connection error:', error.message);
    // Don't exit in test mode - allow server to start for health checks
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });
} else {
  console.warn('⚠️ DATABASE environment variable not set');
}


mongoose.connection.on('error', (error) => {
  console.log(
    `1. 🔥 Common Error caused issue → : check your .env file first and add your mongodb url`
  );
  console.error(`2. 🚫 Error → : ${error.message}`);
  // Don't exit in test mode
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
const app = require('./app');
const port = process.env.PORT || 8888;
const host = process.env.HOST || '0.0.0.0';

const server = app.listen(port, host, () => {
  console.log(`Express running → On PORT : ${server.address().port}`);
  console.log(`Server listening on http://${host}:${port}`);
});
