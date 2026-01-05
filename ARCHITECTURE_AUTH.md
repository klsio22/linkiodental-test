# Architecture - User Authentication & Order Management

## 📐 System Architecture Overview

O sistema foi projetado com arquitetura modular (inspirada em NestJS) onde cada módulo é responsável por um domínio específico.

```
┌─────────────────────────────────────────────────────────┐
│                    Express Application                   │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │  Common (Shared Infrastructure)                 │   │
│  │  ├── Middlewares (auth, errorHandler, validator)   │
│  │  ├── Config (environment, database)            │   │
│  │  └── Errors (AppError, ValidationError)        │   │
│  └─────────────────────────────────────────────────┘   │
│                          ▲                              │
│                          │                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Modules (Domain-Specific)                       │  │
│  │                                                   │  │
│  │  ┌──────────────┐      ┌──────────────────────┐ │  │
│  │  │ Users Module │      │  Orders Module       │ │  │
│  │  ├──────────────┤      ├──────────────────────┤ │  │
│  │  │ Types        │      │  Types               │ │  │
│  │  │ Models       │      │  Models              │ │  │
│  │  │ Services     │      │  Services            │ │  │
│  │  │ Controllers  │      │  Controllers         │ │  │
│  │  │ Validators   │      │  Validators          │ │  │
│  │  │ Routes       │      │  Routes              │ │  │
│  │  └──────────────┘      └──────────────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                          ▲                              │
│                          │                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Database Layer (MongoDB + Mongoose)             │  │
│  │  ├── User Collection                             │  │
│  │  └── Order Collection (with userId reference)   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

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
  role: UserRole;        // CUSTOMER | LAB_ADMIN | SUPER_ADMIN
  isActive: boolean;
}
```

### User Roles

| Role | Permissões | Uso |
|------|-----------|-----|
| **CUSTOMER** | Gerenciar seus pedidos | Clientes regulares |
| **LAB_ADMIN** | Gerenciar pedidos do laboratório | Administrador do lab |
| **SUPER_ADMIN** | Acesso completo | Gerenciador máster |

### User Endpoints

```
POST   /api/users/register     → Registrar novo usuário
POST   /api/users/login        → Fazer login e obter token
GET    /api/users/profile      → Ver perfil (requer auth)
PUT    /api/users/profile      → Atualizar perfil (requer auth)
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
POST   /api/orders              → Criar novo pedido (requer auth)
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
3. Decode payload and extract user ID
4. Attach user ID to req.user.id
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

### Data Isolation

```typescript
// Middleware de autenticação
authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, config.jwtSecret);
  req.user = { id: decoded.id };  // Store user ID
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

## 🔄 Request Flow Example

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
  "role": "CUSTOMER",
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

## 📊 Module Structure

```
src/
├── common/
│   ├── config/
│   │   ├── database.ts        # MongoDB connection
│   │   └── env.ts             # Environment variables
│   ├── middlewares/
│   │   ├── auth.ts            # JWT verification
│   │   ├── errorHandler.ts    # Error handling
│   │   └── validator.ts       # express-validator wrapper
│   ├── errors/
│   │   └── AppError.ts        # Custom error class
│   └── index.ts               # Router aggregator
│
├── modules/
│   ├── users/
│   │   ├── controllers/
│   │   │   └── user.controller.ts
│   │   ├── models/
│   │   │   └── User.model.ts
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   ├── types/
│   │   │   └── user.types.ts
│   │   ├── validators/
│   │   │   └── user.validator.ts
│   │   ├── user.routes.ts
│   │   └── users.module.ts
│   │
│   └── orders/
│       ├── controllers/
│       │   └── order.controller.ts
│       ├── models/
│       │   └── Order.model.ts
│       ├── services/
│       │   └── order.service.ts
│       ├── types/
│       │   └── order.types.ts
│       ├── validators/
│       │   └── order.validator.ts
│       ├── order.routes.ts
│       └── orders.module.ts
│
└── index.ts                   # Express app entry point
```

## 🚀 Performance Considerations

### Database Indexes

```javascript
// User indexes
User.createIndex({ email: 1 }, { unique: true })

// Order indexes
Order.createIndex({ userId: 1, createdAt: -1 })
Order.createIndex({ userId: 1, state: 1 })
Order.createIndex({ userId: 1, status: 1 })
Order.createIndex({ patient: 1 })
Order.createIndex({ customer: 1 })
```

### Query Optimization

```typescript
// Efficient - uses index
Order.find({ userId, state: 'CREATED' })
  .sort({ createdAt: -1 })
  .limit(20)
  .lean()  // Return plain objects, not full documents

// Inefficient - no userId filter
Order.find({ state: 'CREATED' })  // ❌ Scans ALL orders
```

## 🧪 Testing Workflow

1. **Register User** → Get JWT token
2. **Create Orders** → Link to user automatically
3. **List Orders** → See only user's orders
4. **Update/Delete** → Only for user's own orders
5. **View Stats** → User-specific statistics

