# ARQUITETURA DO PROJETO

## Visão Geral

Este projeto segue uma **arquitetura modular** inspirada no NestJS, onde cada funcionalidade (feature/domínio) é organizada em seu próprio módulo autocontido. O sistema é um gerenciador de pedidos para laboratório dentário com autenticação JWT baseada em roles.

**Stack Técnico:**
- Node.js 20 Alpine
- Express.js 4.18.2
- TypeScript 5.3.3 (strict mode)
- MongoDB 7.0 + Mongoose 8.0.3
- Docker Compose 3.9
- Vitest 1.1.0 (testes unitários)

## 📐 Diagrama de Arquitetura

```
┌─────────────────────────────────────────┐
│           Cliente (HTTP)                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Application (app.ts)             │ ← Entry point, configuração Express
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    ┌─────────────────────────────────┐  │
│    │  Common (Shared Infrastructure) │  │
│    │  ├── Middlewares (auth, error)  │  │
│    │  ├── Config (env, database)     │  │
│    │  └── Errors (AppError)          │  │
│    └─────────────────────────────────┘  │
│                  ▲                      │
│                  │                      │
│  ┌────────────────────────────────────┐ │
│  │  Modules (Domain-Specific)         │ │
│  │  ┌──────────────┐  ┌────────────┐ │ │
│  │  │ Users Module │  │Orders Module│ │ │
│  │  ├──────────────┤  ├────────────┤ │ │
│  │  │ Types        │  │Types       │ │ │
│  │  │ Models       │  │Models      │ │ │
│  │  │ Services     │  │Services    │ │ │
│  │  │ Controllers  │  │Controllers │ │ │
│  │  │ Validators   │  │Validators  │ │ │
│  │  │ Routes       │  │Routes      │ │ │
│  │  └──────────────┘  └────────────┘ │ │
│  └────────────────────────────────────┘ │
└───────────────────┬────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   MongoDB Database     │
        │ ├── Users Collection   │
        │ └── Orders Collection  │
        └───────────────────────┘
```

## Estrutura de Diretórios

```
src/
├── common/                          # Código compartilhado entre módulos
│   ├── config/                      # Configurações globais
│   │   ├── env.ts                  # Variáveis de ambiente
│   │   └── database.ts             # Conexão MongoDB
│   ├── middlewares/                 # Middlewares compartilhados
│   │   ├── errorHandler.ts         # Tratamento global de erros
│   │   └── validator.ts            # Middleware de validação
│   └── index.ts                     # Router principal (health + módulos)
│
├── modules/                         # Módulos de funcionalidades
│   └── orders/                      # Módulo de pedidos
│       ├── controllers/
│       │   └── order.controller.ts # Controller de pedidos
│       ├── services/
│       │   └── order.service.ts    # Lógica de negócio
│       ├── models/
│       │   └── Order.model.ts      # Schema Mongoose
│       ├── validators/
│       │   └── order.validator.ts  # Regras de validação
│       ├── types/
│       │   └── order.types.ts      # Interfaces TypeScript
│       ├── __tests__/
│       │   └── order.service.test.ts
│       ├── order.routes.ts         # Rotas do módulo
│       └── orders.module.ts        # Configuração do módulo
│
├── app.ts                           # Configuração do Express
└── index.ts                         # Entry point da aplicação
```

## Arquitetura Modular

### Princípios

1. **Encapsulamento**: Cada módulo contém todos os arquivos relacionados a uma funcionalidade
2. **Separação de Responsabilidades**: Cada camada tem uma responsabilidade clara
3. **Reutilização**: Componentes comuns ficam em `common/`
4. **Escalabilidade**: Fácil adicionar novos módulos sem afetar existentes
5. **Testabilidade**: Módulos independentes são mais fáceis de testar

### Anatomia de um Módulo

Cada módulo é autocontido e segue a estrutura:

```
modules/
└── <feature-name>/
    ├── controllers/         # HTTP request handlers
    ├── services/            # Business logic
    ├── models/              # Database schemas
    ├── validators/          # Input validation
    ├── types/               # TypeScript interfaces
    ├── __tests__/           # Unit tests
    ├── <feature>.routes.ts  # Module routes
    └── <feature>.module.ts  # Module configuration
```

### Arquivo de Módulo (.module.ts)

O arquivo de módulo é responsável por:
- Registrar as rotas do módulo
- Configurar middlewares específicos
- Exportar uma instância configurada

```typescript
export class OrdersModule {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/orders', orderRoutes);
  }
}

export default new OrdersModule();
```

## Camadas Detalhadas

### 1. Common (Compartilhado)

**Responsabilidade:** Componentes reutilizáveis entre módulos

#### Config
```typescript
// common/config/env.ts - Variáveis de ambiente centralizadas
export const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI,
  // ...
};
```

#### Middlewares
```typescript
// common/middlewares/errorHandler.ts - Tratamento global de erros
export const errorHandler = (err, req, res, next) => {
  // ...
};
```

### 2. Modules (Módulos de Funcionalidade)

Cada módulo segue a mesma estrutura interna:

#### Module File (orders.module.ts)
**Responsabilidade:** Configurar e exportar o módulo

```typescript
export class OrdersModule {
  public router: Router;
  
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  
  private initializeRoutes(): void {
    this.router.use('/orders', orderRoutes);
  }
}
```

#### Routes (order.routes.ts)
**Responsabilidade:** Definir endpoints e aplicar middlewares

```typescript
const router = Router();
router.post('/', validate(createOrderValidation), orderController.createOrder);
router.get('/', validate(listOrdersValidation), orderController.listOrders);
```

- Define verbos HTTP
- Aplica validadores
- Conecta a controllers

#### Validators (order.validator.ts)

#### Validators (order.validator.ts)
**Responsabilidade:** Validar dados de entrada

```typescript
body('totalValue')
  .isFloat({ min: 0.01 })
  .withMessage('Total value must be greater than zero')
```

- Usa `express-validator`
- Valida tipos, formatos, ranges
- Retorna erros amigáveis

#### Controllers (order.controller.ts)
**Responsabilidade:** Lidar com requisições HTTP

```typescript
createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.body);
  res.status(201).json({ status: 'success', data: order });
});
```

- Recebe requisições HTTP
- Extrai dados (body, params, query)
- Chama services
- Formata resposta HTTP

#### Services (order.service.ts)
**Responsabilidade:** Implementar lógica de negócio

```typescript
async createOrder(orderData: Partial<IOrderDocument>) {
  if (!orderData.services || orderData.services.length === 0) {
    throw new AppError('Order must have at least one service', 400);
  }
  // ...
}
```

- Validações de negócio
- Operações complexas
- Transações
- Coordena Models

#### Models (Order.model.ts)
**Responsabilidade:** Definir schema do banco

```typescript
const orderSchema = new Schema<IOrderDocument>({
  patientName: { type: String, required: true },
  // ...
});
```

- Define estrutura de dados
- Validações do Mongoose
- Métodos de instância
- Hooks (pre/post save)
- Índices

#### Types (order.types.ts)
**Responsabilidade:** Definir interfaces TypeScript

```typescript
export interface IOrder {
  patientName: string;
  dentistName: string;
  // ...
}
```

- Type safety
- Auto-complete no IDE
- Documentação implícita

## Fluxo de uma Requisição

Exemplo: Criar um pedido

```
1. Cliente HTTP
   POST /api/orders
   { patientName: "João", ... }
   │
   ▼
2. Application (app.ts)
   Express recebe requisição
   │
   ▼
3. Common Router (common/index.ts)
   Roteia para módulo apropriado
   │
   ▼
4. Orders Module (orders.module.ts)
   Direciona para rotas internas
   │
   ▼
5. Routes (order.routes.ts)
   Aplica validadores, chama controller
   │
   ▼
6. Validator (order.validator.ts)
   Valida campos obrigatórios, tipos
   │
   ▼
7. Controller (order.controller.ts)
   Extrai req.body, chama service
   │
   ▼
8. Service (order.service.ts)
   Aplica regras de negócio
   Valida que services.length > 0
   │
   ▼
9. Model (Order.model.ts)
   Cria documento Mongoose
   Aplica validações do schema
   │
   ▼
10. MongoDB
    Persiste dados
    │
    ▼
11. Resposta
    201 Created
    { status: "success", data: { ... } }
```

## Vantagens da Arquitetura Modular

### 1. Organização Clara
- Todos os arquivos relacionados a uma funcionalidade ficam juntos
- Fácil navegar e encontrar código
- Estrutura previsível

### 2. Escalabilidade
- Adicionar novos módulos não afeta existentes
- Cada módulo pode evoluir independentemente
- Fácil dividir em microserviços no futuro

### 3. Manutenibilidade
- Mudanças ficam isoladas em um módulo
- Menor chance de efeitos colaterais
- Código mais testável

### 4. Reutilização
- Componentes comuns em `common/`
- Evita duplicação de código
- Padrões consistentes

### 5. Colaboração em Equipe
- Times podem trabalhar em módulos diferentes
- Menor conflito de merge
- Propriedade clara de código

## Como Adicionar um Novo Módulo

Exemplo: Criar módulo de Usuários

```bash
# 1. Criar estrutura
mkdir -p src/modules/users/{controllers,services,models,validators,types,__tests__}

# 2. Criar arquivos base
touch src/modules/users/user.controller.ts
touch src/modules/users/user.service.ts
touch src/modules/users/User.model.ts
touch src/modules/users/user.validator.ts
touch src/modules/users/user.types.ts
touch src/modules/users/user.routes.ts
touch src/modules/users/users.module.ts

# 3. Implementar module file
# src/modules/users/users.module.ts
export class UsersModule {
  public router: Router;
  
  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  
  private initializeRoutes(): void {
    this.router.use('/users', userRoutes);
  }
}

# 4. Registrar no router principal
# src/common/index.ts
import usersModule from '../modules/users/users.module';
router.use(usersModule.router);
```

## Comparação com Arquitetura em Camadas

### Arquitetura em Camadas (Antes)
```
src/
├── controllers/     # Todos os controllers
├── services/        # Todos os services
├── models/          # Todos os models
└── routes/          # Todas as rotas
```
❌ Arquivos relacionados espalhados  
❌ Difícil escalar  
❌ Muitos arquivos na mesma pasta

### Arquitetura Modular (Agora)
```
src/
├── common/          # Compartilhado
└── modules/
    ├── orders/      # Tudo sobre pedidos
    └── users/       # Tudo sobre usuários
```
✅ Arquivos relacionados juntos  
✅ Fácil escalar  
✅ Organização por domínio

✅ Arquivos relacionados juntos  
✅ Fácil escalar  
✅ Organização por domínio

## Padrões Utilizados

### Repository Pattern (implícito)

O Mongoose já implementa um padrão similar ao Repository, então usamos diretamente:

```typescript
const order = await Order.findById(id);
await order.save();
```

### Service Layer Pattern

Toda lógica de negócio está nos Services, não nos Controllers:

```typescript
// ❌ Ruim - lógica no controller
if (order.state === 'COMPLETED') { ... }

// ✅ Bom - lógica no service
await orderService.advanceOrderState(id);
```

### Dependency Injection (simples)

```typescript
// Service é exportado como singleton
export default new OrderService();

// Controller importa e usa
import orderService from '../services/order.service';
```

### Error Handling Pattern

Erros customizados com `AppError`:

```typescript
throw new AppError('Pedido não encontrado', 404);
```

Capturados pelo middleware:

```typescript
app.use(errorHandler);
```

### Async Handler Pattern

Evita try/catch repetitivo:

```typescript
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
```

## Regras de Negócio Implementadas

### 1. Validação de Pedido

- Pelo menos 1 serviço
- Valor total > 0
- Prazo no futuro
- Nomes com mínimo 3 caracteres

### 2. Transição de Estados

```typescript
CREATED → ANALYSIS → COMPLETED
```

- Sequencial (não pode pular)
- Unidirecional (não retrocede)
- Implementado no Model:

```typescript
canAdvanceState(): boolean
advanceState(): Promise<IOrderDocument>
```

### 3. Imutabilidade do Estado

Controllers não podem alterar `state` diretamente:

```typescript
if (updateData.state) {
  throw new AppError('Use o endpoint /advance', 400);
}
```

## Segurança

### Implementado

- **Helmet**: Headers de segurança HTTP
- **CORS**: Cross-Origin Resource Sharing
- **Validação**: Todos os inputs validados
- **Type Safety**: TypeScript previne erros

### Recomendações para Produção

- Autenticação JWT
- Rate limiting
- HTTPS obrigatório
- Logs estruturados
- Monitoramento (Sentry, DataDog)
- Secrets em vault (AWS Secrets Manager)

## Performance

### Otimizações Implementadas

- **Índices MongoDB**:
  ```typescript
  orderSchema.index({ state: 1, createdAt: -1 });
  orderSchema.index({ patientName: 1 });
  ```

- **Paginação**:
  ```typescript
  .skip((page - 1) * limit).limit(limit)
  ```

- **Queries Paralelas**:
  ```typescript
  const [orders, total] = await Promise.all([...]);
  ```

## Escalabilidade

### Horizontal

- Stateless (sem sessões)
- MongoDB com replicação
- Load balancer (Nginx)

### Vertical

- Node.js cluster mode
- PM2 para gestão de processos
- Cache (Redis) para queries frequentes

## Testes

### Estrutura

```
src/__tests__/
├── order.service.test.ts
├── order.controller.test.ts
└── order.model.test.ts
```

### Estratégia

- **Unit Tests**: Services e Models
- **Integration Tests**: Controllers com DB
- **E2E Tests**: API completa

## Próximos Passos

1. **Autenticação**: JWT + refresh tokens
2. **Upload de arquivos**: Imagens de pedidos
3. **Notificações**: Email/SMS quando estado muda
4. **Logs**: Winston ou Pino
5. **Cache**: Redis para listagens
6. **GraphQL**: Alternativa ao REST
7. **WebSockets**: Updates em tempo real
8. **Filas**: Bull para tarefas assíncronas
9. **Documentação**: Swagger/OpenAPI
10. **CI/CD**: GitHub Actions

---

# 🔐 AUTENTICAÇÃO & AUTORIZAÇÃO

## 📐 Fluxo de Autenticação

### 1. User Registration

```
Client          Express                Database
  │               │                      │
  ├─POST /register─>                     │
  │               ├─Validate─>          │
  │               │  (email, password)  │
  │               │                      │
  │               ├─Hash Password─>      │
  │               │  (bcryptjs)         │
  │               │                      │
  │               ├─Save User───────────>│
  │               │                      │
  │               │<─User Saved──────────┤
  │               │                      │
  │               ├─Generate JWT─>       │
  │               │  (7 days)           │
  │               │                      │
  │<──201 + Token─┤                      │
  │               │                      │
```

### 2. User Login

```
Client          Express                Database
  │               │                      │
  ├─POST /login───>                     │
  │               │                      │
  │               ├─Find User────────────>
  │               │  (by email)         │
  │               │<─User Found──────────┤
  │               │                      │
  │               ├─Compare Password     │
  │               │  (bcryptjs)         │
  │               │                      │
  │               ├─Generate JWT─>       │
  │               │  (7 days)           │
  │               │                      │
  │<──200 + Token─┤                      │
  │               │                      │
```

### 3. Protected Request (Orders)

```
Client              Express             Auth           Database
  │                 │                    │              │
  ├─GET /orders     │                    │              │
  │ Header:         │                    │              │
  │ Auth: Bearer {JWT}  ├─Extract JWT──────>           │
  │                 │                    │              │
  │                 │   ├─Verify JWT     │              │
  │                 │   │ (signature)    │              │
  │                 │<──Token Valid──────┤              │
  │                 │                    │              │
  │                 │   ├─Attach UserId  │              │
  │                 │   │ to Request     │              │
  │                 │                    │              │
  │                 │ ├─Query Orders     │──────────────>
  │                 │ │ WHERE userId={id}              │
  │                 │ │                 │<─User Orders─┤
  │                 │ │                 │              │
  │<──200 Orders────┤                    │              │
  │                 │                    │              │
```

## 👥 User Module

### IUser Interface

```typescript
export interface IUser {
  email: string;
  password: string;      // Hashed with bcryptjs
  name: string;
  role: UserRole;        // ATTENDANT | LAB_ADMIN | SUPER_ADMIN
  isActive: boolean;
}
```

### User Roles

| Role | Permissões | Uso |
|------|-----------|-----|
| **ATTENDANT** | Criar e gerenciar pedidos | Operador padrão |
| **LAB_ADMIN** | Gerenciar pedidos do laboratório | Administrador do lab |
| **SUPER_ADMIN** | Acesso completo | Gerenciador máster |

**Nota**: Role CUSTOMER foi removido. Apenas ATTENDANT pode criar pedidos.

### User Endpoints

```
POST   /api/users/register     → Registrar novo usuário
POST   /api/users/login        → Fazer login e obter token
GET    /api/users/:id          → Obter usuário por ID (requer auth)
PUT    /api/users/:id          → Atualizar usuário (requer auth)
```

## 📦 Order Module

### IOrder Interface

```typescript
export interface IOrder {
  userId: string;        // Reference to User._id
  lab: string;
  patient: string;
  customer: string;      // Dentist name
  services: Service[];   // Array of services with value and status
  state: OrderState;     // CREATED | ANALYSIS | COMPLETED
  status: OrderStatus;   // ACTIVE | DELETED
}
```

### Order State Machine

```
CREATED ──┐
  │       │
  │       ├─→ ANALYSIS ──┐
  │       │              │
  │       │              └─→ COMPLETED
  └───────┘
  
- Sequencial (não pode pular)
- Unidirecional (não retrocede)
- Imutável via PUT (use PATCH /advance)
```

### Service Status

```
PENDING ──→ DONE
```

### Order Endpoints

```
POST   /api/orders              → Criar novo pedido (requer auth + ATTENDANT)
GET    /api/orders              → Listar pedidos do usuário (requer auth)
GET    /api/orders/:id          → Buscar pedido por ID (requer auth)
PUT    /api/orders/:id          → Atualizar pedido (requer auth)
DELETE /api/orders/:id          → Deletar pedido (requer auth)
PATCH  /api/orders/:id/advance  → Avançar estado (requer auth)
GET    /api/orders/stats        → Estatísticas do usuário (requer auth)
```

## 🔗 User-Order Relationship

### Schema Design

**User Collection:**
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Order Collection:**
```javascript
{
  _id: ObjectId,
  userId: String,          // FK → User._id
  lab: String,
  patient: String,
  customer: String,
  services: [
    {
      name: String,
      value: Number,
      status: String
    }
  ],
  state: String,          // State machine: CREATED → ANALYSIS → COMPLETED
  status: String,         // ACTIVE | DELETED
  createdAt: Date,
  updatedAt: Date
}
```

### Database Relationships

```
┌─────────────────────┐         ┌─────────────────────┐
│       User          │         │       Order         │
├─────────────────────┤         ├─────────────────────┤
│ _id: ObjectId ◄─┐   │         │ _id: ObjectId       │
│ email: String   │   │         │ userId: String ────┼─→ User._id
│ password: String│   │         │ lab: String         │
│ name: String    │   │         │ patient: String     │
│ role: String    │   │         │ customer: String    │
│ isActive: Boolean   │         │ services: Array     │
│ createdAt: Date │   │         │ state: String       │
│ updatedAt: Date │   │         │ status: String      │
└─────────────────────┘         │ createdAt: Date     │
                                │ updatedAt: Date     │
        1 User                   └─────────────────────┘
         : :                              ▲
         : :                              │
         : └──────────(1:N)──────────────┘
         :                      Many Orders
```

### Query Filtering

```typescript
// Service Layer - Order Service
async listOrders(userId: string, params: OrderQueryParams) {
  const filter = { userId };  // Always filter by userId
  
  if (params.state) filter.state = params.state;
  if (params.status) filter.status = params.status;
  if (params.patientName) filter.patient = {...};
  
  return Order.find(filter)...
}

// Resultado: Cada usuário vê APENAS seus pedidos
```

## 🔐 JWT Implementation

### Token Structure

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "id": "507f1f77bcf86cd799439011",  // User ID
  "role": "ATTENDANT",                // User Role
  "iat": 1704067200,                  // Issued at
  "exp": 1704672000                   // Expires in 7 days
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "dev-secret-change-in-production"
)
```

### Token Usage

```
Request Header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwNDA2NzIwMCwiZXhwIjoxNzA0NjcyMDAwfQ.abc123...

Middleware:
1. Extract token from "Authorization: Bearer {token}"
2. Verify signature with jwtSecret
3. Decode payload and extract user ID and role
4. Attach user info to req.user
5. Pass control to route handler
```

## 🛡️ Security Features

### Password Hashing

```typescript
// Pre-save hook no User Model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
  next();
});
```

### Password Verification

```typescript
// Instance method no User Model
comparePassword(candidatePassword: string): Promise<boolean> {
  return bcryptjs.compare(candidatePassword, this.password);
}
```

### Role-Based Authorization

```typescript
// Middleware requireAttendant
export const requireAttendant = (req, res, next) => {
  if (req.user?.role !== UserRole.ATTENDANT) {
    throw new AppError('Only ATTENDANT role can create orders', 403);
  }
  next();
};

// Applied in routes:
router.post('/', requireAttendant, createOrderController);
```

### Data Isolation

```typescript
// Middleware de autenticação
authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, config.jwtSecret);
  req.user = { id: decoded.id, role: decoded.role };  // Store user info
  next();
}

// Serviço de Orders
async listOrders(userId: string, params) {
  // ALWAYS filter by userId - impossível ver pedidos de outro usuário
  return Order.find({ userId, ...otherFilters });
}
```

## 📝 Validation

### User Validation

```typescript
registerValidation: [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Min 6 caracteres'),
  body('name').isLength({ min: 3 }).withMessage('Min 3 caracteres'),
]
```

### Order Validation

```typescript
createOrderValidation: [
  body('lab').notEmpty().isLength({ min: 2 }),
  body('patient').notEmpty().isLength({ min: 3 }),
  body('customer').notEmpty().isLength({ min: 3 }),
  body('services').isArray({ min: 1 }).withMessage('Min 1 serviço'),
  body('services.*.name').notEmpty(),
  body('services.*.value').isFloat({ min: 0.01 }),
]
```

## 🔄 Request Flow Examples

### 1. Register User

```bash
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123",
  "name": "João Silva"
}

# Response
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "name": "João Silva",
  "role": "ATTENDANT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Create Order

```bash
POST /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "lab": "Lab Sorriso",
  "patient": "João Silva",
  "customer": "Dr. Maria Santos",
  "services": [
    {"name": "Coroa", "value": 800.00},
    {"name": "Implante", "value": 1700.00}
  ]
}

# Response
{
  "id": "607f1f77bcf86cd799439012",
  "userId": "507f1f77bcf86cd799439011",  ← Linked to user
  "lab": "Lab Sorriso",
  "patient": "João Silva",
  "customer": "Dr. Maria Santos",
  "services": [...],
  "state": "CREATED",
  "status": "ACTIVE",
  "createdAt": "2024-01-01T10:30:00Z",
  "updatedAt": "2024-01-01T10:30:00Z"
}
```

### 3. List User Orders

```bash
GET /api/orders
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Query executed:
# db.orders.find({ userId: "507f1f77bcf86cd799439011" })

# Response - Only user's orders are returned
{
  "data": [
    {
      "id": "607f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

## 🧪 Testing

### Test Coverage

- **Order Service**: 13 unit tests
  - createOrder validations
  - listOrders with pagination and filtering
  - State transitions (CREATED → ANALYSIS → COMPLETED)
  - updateOrder restrictions
  - deleteOrder
  - getOrderStats

- **User Service**: 11 unit tests
  - register with default/custom roles
  - login with valid/invalid credentials
  - getUserById
  - updateUser
  - email conflict detection

### Test Execution

```bash
# Run all tests with auto-exit
npm test

# Run in watch mode
npm run test:watch

# Build TypeScript
npm run build
```

### Type Safety

- All test files use proper TypeScript types (`Partial<IOrderDocument>`, `Partial<IUserDocument>`)
- Mongoose ObjectId casting with `as any` only where necessary
- Full type inference for mock objects
- Zero `any` escape hatches for domain types
