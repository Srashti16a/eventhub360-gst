const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EventHub360 - Guest Management API',
      version: '1.0.0',
      description: 'API documentation for the Guest Management module of EventHub360. Includes endpoints for RSVPs, check-ins, guest listings, and seating reassignments.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
  },
  apis: ['./src/routes/*.routes.js', './src/routes/*.js'], // Path to route files containing swagger JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
