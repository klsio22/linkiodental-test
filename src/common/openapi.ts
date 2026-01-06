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
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: { description: 'API is healthy' },
        },
      },
    },
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
                  email: { type: 'string', format: 'email', example: 'attendant@lab.com' },
                  password: { type: 'string', minLength: 6, example: 'senha123' },
                  name: { type: 'string', minLength: 3, example: 'Maria Atendente' },
                  role: { type: 'string', enum: ['ATTENDANT', 'LAB_ADMIN', 'SUPER_ADMIN'], example: 'ATTENDANT' },
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
          400: { description: 'Dados inválidos' },
          409: { description: 'Email já registrado' },
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
                  email: { type: 'string', format: 'email', example: 'attendant@lab.com' },
                  password: { type: 'string', example: 'senha123' },
                },
                required: ['email', 'password'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Login realizado com sucesso' },
          401: { description: 'Email ou senha inválidos' },
        },
      },
    },
    '/users/profile': {
      get: {
        tags: ['Users'],
        summary: 'Obter perfil do usuário',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Perfil do usuário' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Atualizar perfil do usuário',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', minLength: 3 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Perfil atualizado' },
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
            description: 'User ID (ObjectId)',
          },
        ],
        responses: {
          200: { description: 'Usuário encontrado' },
          404: { description: 'Usuário não encontrado' },
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
                  email: { type: 'string', format: 'email' },
                  isActive: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Usuário atualizado' },
          404: { description: 'Usuário não encontrado' },
        },
      },
    },
    '/orders': {
      post: {
        tags: ['Orders'],
        summary: 'Criar novo pedido',
        description: 'Apenas usuários com role ATTENDANT podem criar pedidos',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  lab: { type: 'string', minLength: 2, example: 'Lab Sorriso' },
                  patient: { type: 'string', minLength: 3, example: 'João Silva' },
                  customer: { type: 'string', minLength: 3, example: 'Dr. Maria Santos' },
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
          400: { description: 'Dados inválidos' },
          403: { description: 'Apenas ATTENDANT pode criar pedidos' },
        },
      },
      get: {
        tags: ['Orders'],
        summary: 'Listar pedidos do usuário',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'number', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'number', default: 20 } },
          { name: 'state', in: 'query', schema: { type: 'string', enum: ['CREATED', 'ANALYSIS', 'COMPLETED'] } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['ACTIVE', 'DELETED'] } },
          { name: 'patientName', in: 'query', schema: { type: 'string' } },
          { name: 'dentistName', in: 'query', schema: { type: 'string' } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['createdAt'] } },
          { name: 'sortOrder', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
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
            description: 'Order ID (ObjectId)',
          },
        ],
        responses: {
          200: { description: 'Pedido encontrado' },
          404: { description: 'Pedido não encontrado' },
        },
      },
      put: {
        tags: ['Orders'],
        summary: 'Atualizar pedido',
        description: 'Não é possível alterar o state via PUT. Use PATCH /orders/{id}/advance',
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
                  services: {
                    type: 'array',
                    minItems: 1,
                    items: { $ref: '#/components/schemas/Service' },
                  },
                  status: { type: 'string', enum: ['ACTIVE', 'DELETED'] },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Pedido atualizado' },
          400: { description: 'Dados inválidos ou tentou alterar state' },
          404: { description: 'Pedido não encontrado' },
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
          404: { description: 'Pedido não encontrado' },
        },
      },
    },
    '/orders/{id}/advance': {
      patch: {
        tags: ['Orders'],
        summary: 'Avançar estado do pedido',
        description: 'Transiciona o pedido para o próximo estado (CREATED → ANALYSIS → COMPLETED)',
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
          200: { description: 'Estado avançado com sucesso' },
          400: { description: 'Pedido já está no estado final' },
          404: { description: 'Pedido não encontrado' },
        },
      },
    },
    '/orders/{id}/status': {
      get: {
        tags: ['Orders'],
        summary: 'Obter status do pedido por ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Order ID (ObjectId)',
          },
        ],
        responses: {
          200: {
            description: 'Status do pedido',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['ACTIVE', 'DELETED'] },
                  },
                },
              },
            },
          },
          404: { description: 'Pedido não encontrado' },
        },
      },
    },
  },
};
