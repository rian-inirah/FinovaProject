// server.js (safer require + stub routes)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Safe route loader
 * - tries to require the route module.
 * - if successful and it exports a router (function or Router), mounts it on the given path.
 * - if it fails, mounts a stub router that returns 501 and logs the original error.
 */
function requireRouteSafe(routePath, mountPath) {
  try {
    const required = require(routePath);

    // If module exports the router directly (function or object), mount it.
    if (typeof required === 'function' || (required && typeof required === 'object')) {
      app.use(mountPath, required);
      console.log(`✅ Mounted ${routePath} at ${mountPath}`);
      return;
    }

    // Fallback if exported something unexpected
    console.error(`❌ ${routePath} does not export a valid router. Mounted stub at ${mountPath}.`);
  } catch (err) {
    console.error(`❌ Failed to load route ${routePath} -> mounted stub at ${mountPath}.`);
    console.error(err && err.stack ? err.stack : err);
  }

  // Mount stub so server doesn't crash
  const expressRouter = express.Router();
  expressRouter.use((req, res) => {
    res.status(501).json({
      error: 'Route unavailable (stub). Check server logs for require/exports errors.',
      route: mountPath,
      loadedFrom: routePath
    });
  });
  app.use(mountPath, expressRouter);
}

// -----------------
// Mount routes (safe)
// -----------------
requireRouteSafe('./routes/auth', '/api/auth');
requireRouteSafe('./routes/business', '/api/business');
requireRouteSafe('./routes/items', '/api/items');
requireRouteSafe('./routes/orders', '/api/orders');
requireRouteSafe('./routes/billing', '/api/billing');
requireRouteSafe('./routes/reports', '/api/reports');
requireRouteSafe('./routes/psg', '/api/psg');

// 404 handler (only for routes that didn't match; API clients get JSON)
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully');
  await db.sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
