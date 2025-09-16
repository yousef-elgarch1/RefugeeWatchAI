/**
 * RefugeeWatch AI - Swagger Documentation Setup
 * Add this to your main app.js file
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RefugeeWatch AI API',
      version: '2.1.0',
      description: 'AI-powered refugee crisis prediction and response system with real data from UNHCR, USGS, NewsAPI, and Guardian',
      contact: {
        name: 'RefugeeWatch AI Team',
        email: 'support@refugeewatch.ai'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.refugeewatch.ai',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        Crisis: {
          type: 'object',
          required: ['id', 'country', 'region', 'coordinates'],
          properties: {
            id: {
              type: 'string',
              description: 'Country code or identifier',
              example: 'SY'
            },
            country: {
              type: 'string',
              description: 'Country name',
              example: 'Syria'
            },
            region: {
              type: 'string',
              description: 'Geographic region',
              example: 'Asia'
            },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              description: 'Latitude and longitude',
              example: [34.8021, 38.9968]
            },
            population: {
              type: 'number',
              description: 'Country population',
              example: 21324000
            },
            risk: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              description: 'Risk level assessment',
              example: 'HIGH'
            },
            displacement: {
              type: 'number',
              description: 'Total displaced population',
              example: 13500000
            },
            crisisTypes: {
              type: 'array',
              items: { type: 'string' },
              description: 'Types of crises affecting the country',
              example: ['Conflict', 'Climate']
            },
            refugeeData: {
              $ref: '#/components/schemas/RefugeeData'
            }
          }
        },
        RefugeeData: {
          type: 'object',
          properties: {
            country: {
              type: 'string',
              example: 'Syrian Arab Republic'
            },
            countryCode: {
              type: 'string',
              example: 'SYR'
            },
            displacement: {
              type: 'object',
              properties: {
                total: { type: 'number', example: 13500000 },
                refugees: { type: 'number', example: 6700000 },
                internal: { type: 'number', example: 6800000 },
                asylum_seekers: { type: 'number', example: 0 }
              }
            },
            destinations: {
              type: 'array',
              items: { type: 'string' },
              example: ['Turkey', 'Lebanon', 'Jordan']
            },
            year: {
              type: 'number',
              example: 2023
            }
          }
        },
        Country: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Syria'
            },
            code: {
              type: 'string',
              example: 'SY'
            },
            capital: {
              type: 'string',
              example: 'Damascus'
            },
            region: {
              type: 'string',
              example: 'Asia'
            },
            population: {
              type: 'number',
              example: 21324000
            },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              example: [34.8021, 38.9968]
            }
          }
        },
        ClimateEvent: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              example: 'earthquake'
            },
            magnitude: {
              type: 'number',
              example: 6.2
            },
            location: {
              type: 'string',
              example: 'Central Turkey'
            },
            time: {
              type: 'string',
              format: 'date-time',
              example: '2024-02-06T01:17:35Z'
            },
            coordinates: {
              type: 'array',
              items: { type: 'number' },
              example: [37.166, 37.032]
            }
          }
        },
        APIResponse: {
          type: 'object',
          required: ['success'],
          properties: {
            success: {
              type: 'boolean',
              description: 'Whether the request was successful',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            error: {
              type: 'string',
              description: 'Error message if request failed'
            },
            source: {
              type: 'string',
              description: 'Data source information',
              example: 'UNHCR API + Reliable Baseline'
            },
            lastUpdated: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp'
            }
          }
        },
        Error: {
          type: 'object',
          required: ['success', 'error'],
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Resource not found'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        }
      },
      responses: {
        BadRequest: {
          description: 'Bad Request - Invalid parameters',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Crisis',
        description: 'Crisis monitoring and analysis endpoints'
      },
      {
        name: 'Geographic',
        description: 'Geographic data and country information'
      },
      {
        name: 'Refugee',
        description: 'UNHCR refugee and displacement data'
      },
      {
        name: 'Climate',
        description: 'Climate events and environmental data'
      },
      {
        name: 'News',
        description: 'Crisis-related news and media'
      },
      {
        name: 'Health',
        description: 'API health and service status'
      }
    ]
  },
  // In swagger.js config
apis: ['./src/routes/*.js', './src/docs/*.js', '../docs/api-docs.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Export for use in app.js
module.exports = { swaggerSpec, swaggerUi };