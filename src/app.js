const express = require('express');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes');
const { swaggerUi, swaggerSpec } = require('./config/swagger');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Documentation API Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Base status route
app.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Guest Management Service is running.',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Route handler for unmatched endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
  });
});

module.exports = app;
