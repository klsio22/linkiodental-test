# ARQUITETURA DO PROJETO

## Visão Geral

Este projeto segue uma **arquitetura modular** inspirada no NestJS, onde cada funcionalidade (feature/domínio) é organizada em seu próprio módulo autocontido. Esta abordagem oferece melhor organização, escalabilidade e manutenibilidade.

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
│         Common Router                    │ ← Health check, registro de módulos
└─────────────────┬───────────────────────┘
                  │
          ┌───────┴───────┐
          ▼               ▼
┌──────────────────┐  ┌──────────────────┐
│  Orders Module   │  │  Future Module   │
│                  │  │  (Users, Auth)   │
└──────────────────┘  └──────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│    Module Internal Structure             │
│  ┌────────────────────────────────────┐ │
│  │ Routes (order.routes.ts)           │ │ ← Define endpoints
│  └──────────────┬─────────────────────┘ │
│                 ▼                        │
│  ┌────────────────────────────────────┐ │
│  │ Validators                         │ │ ← Validação de entrada
│  └──────────────┬─────────────────────┘ │
│                 ▼                        │
│  ┌────────────────────────────────────┐ │
│  │ Controllers                        │ │ ← HTTP handlers
│  └──────────────┬─────────────────────┘ │
│                 ▼                        │
│  ┌────────────────────────────────────┐ │
│  │ Services (Business Logic)          │ │ ← Regras de negócio
│  └──────────────┬─────────────────────┘ │
│                 ▼                        │
│  ┌────────────────────────────────────┐ │
│  │ Models (Mongoose Schemas)          │ │ ← Esquema do banco
│  └──────────────┬─────────────────────┘ │
└─────────────────┼───────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│         MongoDB Database                 │ ← Persistência
└─────────────────────────────────────────┘
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
