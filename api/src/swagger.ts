import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

export const swaggerUiServe = swaggerUi.serve;

export const swaggerUiSetup = swaggerUi.setup(
  swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PlantCare API',
        version: '1.0.0',
        description: 'API do zarządzania podlewaniem roślin',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      paths: {
        '/auth/register': {
          post: {
            summary: 'Rejestruje nowego użytkownika',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string' },
                      password: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              '201': { description: 'Utworzono użytkownika' },
              '409': { description: 'Email jest już zajęty' },
            },
          },
        },
        '/auth/login': {
          post: {
            summary: 'Loguje użytkownika i zwraca token JWT',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string' },
                      password: { type: 'string' },
                    },
                  },
                },
              },
            },
            responses: {
              '200': { description: 'Zalogowano użytkownika' },
              '401': { description: 'Niepoprawne dane logowania' },
            },
          },
        },
        '/plants': {
          get: {
            summary: 'Pobiera rośliny zalogowanego użytkownika',
            security: [{ bearerAuth: [] }],
            responses: {
              '200': { description: 'Lista roślin' },
            },
          },
          post: {
            summary: 'Dodaje nową roślinę do konta użytkownika',
            security: [{ bearerAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'interval'],
                    properties: {
                      name: { type: 'string' },
                      interval: { type: 'integer' },
                    },
                  },
                },
              },
            },
            responses: {
              '201': { description: 'Utworzono roślinę' },
              '400': { description: 'Niepoprawne dane' },
            },
          },
        },
        '/plants/{id}': {
          put: {
            summary: 'Edytuje roślinę zalogowanego użytkownika',
            security: [{ bearerAuth: [] }],
            responses: {
              '200': { description: 'Zaktualizowano roślinę' },
              '404': { description: 'Nie znaleziono rośliny' },
            },
          },
          delete: {
            summary: 'Usuwa roślinę zalogowanego użytkownika',
            security: [{ bearerAuth: [] }],
            responses: {
              '204': { description: 'Usunięto roślinę' },
              '404': { description: 'Nie znaleziono rośliny' },
            },
          },
        },
        '/plants/{id}/water': {
          patch: {
            summary: 'Oznacza roślinę jako podlaną',
            security: [{ bearerAuth: [] }],
            responses: {
              '200': { description: 'Roślina została podlana' },
              '404': { description: 'Nie znaleziono rośliny' },
            },
          },
        },
      },
    },
    apis: [],
  }),
);
