# ARQUITETURA DO PROJETO

## Visão Geral

Este projeto segue uma arquitetura em camadas (layered architecture) com separação clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│           Cliente (HTTP)                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Routes (Rotas)                   │ ← Define endpoints da API
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Validators (Validação)             │ ← Valida entrada de dados
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      Controllers (Controladores)         │ ← Recebe requisições HTTP
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Services (Lógica de Negócio)       │ ← Regras de negócio
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Models (Mongoose)                │ ← Esquema do banco
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         MongoDB Database                 │ ← Persistência
└─────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
src/
├── config/                 # Configurações
│   ├── env.ts             # Variáveis de ambiente
│   └── database.ts        # Conexão MongoDB
│
├── models/                # Models Mongoose (esquema do banco)
│   └── Order.model.ts     # Model de pedidos
│
├── services/              # Lógica de negócio
│   └── order.service.ts   # Serviço de pedidos
│
├── controllers/           # Controllers (camada HTTP)
│   └── order.controller.ts
│
├── routes/                # Definição de rotas
│   ├── index.ts           # Rotas principais
│   └── order.routes.ts    # Rotas de pedidos
│
├── validators/            # Validações (express-validator)
│   └── order.validator.ts
│
├── middlewares/           # Middlewares Express
│   ├── errorHandler.ts    # Tratamento de erros
│   └── validator.ts       # Middleware de validação
│
├── types/                 # TypeScript types/interfaces
│   └── order.types.ts     # Tipos de pedidos
│
├── __tests__/             # Testes unitários
│   └── order.service.test.ts
│
├── app.ts                 # Configuração do Express
└── index.ts               # Entry point
```

## Camadas Detalhadas

### 1. Routes (Rotas)

**Responsabilidade:** Define os endpoints HTTP e associa com controllers

```typescript
router.post('/', validate(createOrderValidation), orderController.createOrder);
```

- Define verbos HTTP (GET, POST, PUT, DELETE, PATCH)
- Aplica middlewares (validação, autenticação)
- Mapeia para controllers

### 2. Validators (Validação)

**Responsabilidade:** Valida dados de entrada antes de processar

```typescript
body('totalValue')
  .isFloat({ min: 0.01 })
  .withMessage('Valor total deve ser maior que zero')
```

- Usa `express-validator`
- Valida tipos, formatos, ranges
- Retorna erros amigáveis

### 3. Controllers (Controladores)

**Responsabilidade:** Lida com requisições HTTP e respostas

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

### 4. Services (Lógica de Negócio)

**Responsabilidade:** Implementa regras de negócio

```typescript
async createOrder(orderData: Partial<IOrderDocument>) {
  // Validações de negócio
  if (!orderData.services || orderData.services.length === 0) {
    throw new AppError('Pedido deve ter pelo menos um serviço', 400);
  }
  // ...
}
```

- Validações de negócio
- Operações complexas
- Transações
- Coordena Models

### 5. Models (Mongoose)

**Responsabilidade:** Define esquema do banco de dados

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

### 6. Types (Tipos TypeScript)

**Responsabilidade:** Define interfaces e tipos TypeScript

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
2. Routes (order.routes.ts)
   router.post('/', validate(...), controller.createOrder)
   │
   ▼
3. Validator (order.validator.ts)
   Valida campos obrigatórios, tipos, formatos
   │
   ▼
4. Controller (order.controller.ts)
   Extrai req.body, chama service
   │
   ▼
5. Service (order.service.ts)
   Aplica regras de negócio
   Valida que services.length > 0
   Valida que totalValue > 0
   │
   ▼
6. Model (Order.model.ts)
   Cria documento Mongoose
   Aplica validações do schema
   │
   ▼
7. MongoDB
   Persiste dados
   │
   ▼
8. Resposta
   201 Created
   { status: "success", data: { ... } }
```

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
