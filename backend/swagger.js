// swagger.js
const express =require('express');
const router = express.Router()
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Ozarx HR API',
      version: '1.0.0',
      description: 'API documentation for Ozarx HR Admin Dashboard',
    },
    servers: [
      {
        url: 'http://localhost:5000', // Change this if deploying online
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes/*.js'], // Adjust this path to your routes folder
};

const swaggerSpec = swaggerJSDoc(options);

router.use('/' ,swaggerUi.serve,swaggerUi.setup(swaggerSpec));


module.exports = router;
