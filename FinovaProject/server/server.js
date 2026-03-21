// server.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Import database
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------
// Security middleware
// -----------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// -----------------
// CORS configuration
// -----------------
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://legendary-lily-29b929.netlify.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Handle preflight requests
app.options('*', cors());

// -----------------
// Body parsing
// -----------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// -----------------
// Static files
// -----------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// -----------------
// Health check
// -----------------
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// -----------------
// Safe route loader
// -----------------
function requireRouteSafe(routePath, mountPath) {
  try {
    const required = require(routePath);

    if (typeof required === 'function' || (required && typeof required === 'object')) {
      app.use(mountPath, required);
      console.log(`✅ Mounted ${routePath} at ${mountPath}`);
      return;
    }

    console.error(`❌ ${routePath} did not export a valid router`);
  } catch (err) {
    console.error(`❌ Failed to load route ${routePath}`);
    console.error(err);
  }

  // fallback stub
  const expressRouter = express.Router();
  expressRouter.use((req, res) => {
    res.status(501).json({
      error: 'Route unavailable (stub)',
      route: mountPath,
      loadedFrom: routePath
    });
  });

  app.use(mountPath, expressRouter);
}

// -----------------
// Mount routes
// -----------------
requireRouteSafe('./routes/auth', '/api/auth');
requireRouteSafe('./routes/business', '/api/business');
requireRouteSafe('./routes/items', '/api/items');
requireRouteSafe('./routes/orders', '/api/orders');
requireRouteSafe('./routes/billing', '/api/billing');
requireRouteSafe('./routes/reports', '/api/reports');
requireRouteSafe('./routes/psg', '/api/psg');

// -----------------
// 404 handler
// -----------------
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// -----------------
// Global error handler
// -----------------
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// -----------------
// Start server
// -----------------
const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connected');

    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ DB synced');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  await db.sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received');
  await db.sequelize.close();
  process.exit(0);
});

startServer();

module.exports = app;