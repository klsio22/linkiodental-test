export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'LinkioDental API',
    version: '1.0.0',
    description: 'Sistema de gerenciamento de pedidos para laboratório odontológico',
    contact: {
      name: 'LinkioDental Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development Server',
    },
    {
      url: 'http://localhost:8000/api',
      description: 'Docker Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from login or register endpoints',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'User ID (ObjectId)' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: {
            type: 'string',
            enum: ['ATTENDANT', 'LAB_ADMIN', 'SUPER_ADMIN'],
          },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string' },
          token: { type: 'string' },
        },
      },
      Service: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          value: { type: 'number', minimum: 0.01 },
          status: { type: 'string', enum: ['PENDING', 'DONE'] },
        },
        required: ['name', 'value'],
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' },
          lab: { type: 'string' },
          patient: { type: 'string' },
          customer: { type: 'string' },
          services: {
            type: 'array',
            items: { $ref: '#/components/schemas/Service' },
          },
          state: {
            type: 'string',
            enum: ['CREATED', 'ANALYSIS', 'COMPLETED'],
          },
          status: { type: 'string', enum: ['ACTIVE', 'DELETED'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/users/register': {
      post: {
        tags: ['Users'],
        summary: 'Registrar novo usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  name: { type: 'string', minLength: 3 },
                  role: { type: 'string', enum: ['ATTENDANT', 'LAB_ADMIN', 'SUPER_ADMIN'] },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário registrado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string' },
                    data: { $ref: '#/components/schemas/AuthResponse' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/users/login': {
      post: {
        tags: ['Users'],
        summary: 'Login de usuário',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login realizado com sucesso',
          },
        },
      },
    },
    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Obter usuário por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Usuário encontrado' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Atualizar usuário',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Usuário atualizado' },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Criar novo pedido',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab: { type: 'string' },
                  patient: { type: 'string' },
                  customer: { type: 'string' },
                  services: {
                    type: 'array',
                    minItems: 1,
                    items: { $ref: '#/components/schemas/Service' },
                  },
                },
                required: ['lab', 'patient', 'customer', 'services'],
              },
            },
          },
        },
        responses: {
          201: { description: 'Pedido criado com sucesso' },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Listar pedidos do usuário',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'number' } },
          { name: 'limit', in: 'query', schema: { type: 'number' } },
          { name: 'state', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Lista de pedidos' },
        },
      },
    },
    '/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Obter pedido por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Pedido encontrado' },
        },
      },
      put: {
        tags: ['Orders'],
        summary: 'Atualizar pedido',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab: { type: 'string' },
                  patient: { type: 'string' },
                  customer: { type: 'string' },
                  services: { type: 'array' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Pedido atualizado' },
        },
      },
      delete: {
        tags: ['Orders'],
        summary: 'Deletar pedido',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          204: { description: 'Pedido deletado' },
        },
      },
    },
    '/orders/{id}/advance': {
      patch: {
        tags: ['Orders'],
        summary: 'Avançar estado do pedido',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Estado avançado' },
        },
      },
    },
    '/orders/stats': {
      get: {
        tags: ['Orders'],
        summary: 'Obter estatísticas de pedidos',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Estatísticas' },
        },
      },
    },
  },
};
