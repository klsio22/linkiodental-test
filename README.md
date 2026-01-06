# Lab Orders API

Sistema de gerenciamento de pedidos de laboratório odontológico com Node.js, Express, TypeScript, MongoDB e Docker.

## 🚀 Tecnologias

- **Node.js 20** com TypeScript
- **Express** - Framework web
- **MongoDB 7.0** - Banco de dados
- **Mongoose** - ODM para MongoDB
- **Docker & Docker Compose** - Containerização
- **Vitest** - Testes unitários
- **ESLint + Prettier** - Qualidade de código

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 20+ (opcional, para desenvolvimento local)

## 🏃 Quick Start

### Com Docker (Recomendado)

```bash
# Clone ou navegue até o projeto
cd linkiodental-test

# Inicie os containers
docker compose up --build

# Ou use o script interativo
./scripts.sh
```

A API estará disponível em: **http://localhost:3000**

Health check:
```bash
curl http://localhost:3000/api/health
```

### Desenvolvimento Local (sem Docker)

```bash
npm install

# Certifique-se de que o MongoDB está rodando
# Com Docker: docker compose up mongodb -d
# Ou localmente: sudo systemctl start mongodb

npm run dev          # Rodar em modo desenvolvimento
npm run build        # Build para produção
npm start            # Iniciar produção
npm test             # Rodar testes
npm run lint         # Verificar código
npm run format       # Formatar código
```

**Nota:** O arquivo `.env` usa `localhost` por padrão. Para Docker, altere para `mongodb`.

## 🔐 Autenticação

O sistema utiliza **JWT (JSON Web Tokens)** para autenticação. Todos os endpoints de pedidos requerem autenticação.

### Endpoints de Usuário

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/users/register` | Registrar novo usuário | ❌ |
| POST | `/api/users/login` | Fazer login | ❌ |
| GET | `/api/users/profile` | Ver perfil | ✅ |
| PUT | `/api/users/profile` | Atualizar perfil | ✅ |

### User Roles (Papéis de Usuário)

| Role | Descrição | Pode Criar Pedidos? | Pode Modificar? |
|------|-----------|-------------------|-----------------|
| **CUSTOMER** | Cliente/Paciente | ❌ Não | ❌ Não |
| **ATTENDANT** | Atendente/Funcionário (STAFF) | ✅ Sim | ✅ Sim |
| **LAB_ADMIN** | Admin do Laboratório | ✅ Sim | ✅ Sim |
| **SUPER_ADMIN** | Super Admin | ✅ Sim | ✅ Sim |

### ⚠️ Importante

- **CUSTOMER** é quem representa o **paciente** nos pedidos
- **CUSTOMER** NÃO pode criar pedidos - apenas visualizar ❌
- **ATTENDANT** (funcionário) cria os pedidos informando o cliente como **"patient"**
- Cada usuário vê APENAS seus próprios pedidos (isolamento de dados)

### 1️⃣ Registrar Atendente (STAFF)

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "atendente@lab.com",
    "password": "senha123",
    "name": "Maria Atendente",
    "role": "ATTENDANT"
  }'
```

### 2️⃣ Registrar Cliente/Paciente

```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@example.com",
    "password": "senha123",
    "name": "João Silva",
    "role": "CUSTOMER"
  }'
```

### 3️⃣ Login e Obter Token

```bash
# Atendente faz login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "atendente@lab.com",
    "password": "senha123"
  }'

# Resposta contém token JWT
{
  "id": "507f1f77bcf86cd799439011",
  "email": "atendente@lab.com",
  "name": "Maria Atendente",
  "role": "ATTENDANT",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4️⃣ Criar Pedido (ATTENDANT Apenas)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer {ATTENDANT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "lab": "Lab Sorriso",
    "patient": "João Silva",
    "customer": "Dr. Maria Santos",
    "services": [
      {"name": "Coroa", "value": 800.00},
      {"name": "Implante", "value": 1700.00}
    ]
  }'
```

### 5️⃣ Tentar Criar Pedido como CUSTOMER (Erro 403)

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer {CUSTOMER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Resposta:
# 403 Forbidden
# "Only staff members (ATTENDANT) can create orders. Clients cannot create orders."
```

### 6️⃣ Listar Pedidos do Usuário

```bash
# Atendente vê seus pedidos
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer {ATTENDANT_TOKEN}"

# Cliente vê seus pedidos (se tiver)
curl -X GET http://localhost:3000/api/orders \
  -H "Authorization: Bearer {CUSTOMER_TOKEN}"
```

## 🧪 Testar a API

### Com REST Client (VS Code)

1. **Instale a extensão** [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
2. **Abra** [api-test/orders.http](api-test/orders.http)
3. **Clique em "Send Request"** acima de qualquer requisição

O arquivo `orders.http` contém:
- ✅ Health check
- 📝 Criar pedidos (9+ cenários)
- 📋 Listar com filtros e paginação (12+ variações)
- 🔍 Buscar por ID
- ✏️ Atualizar pedidos
- ⏩ Avançar estados (CREATED → ANALYSIS → COMPLETED)
- 🗑️ Deletar pedidos
- 📊 Estatísticas
- 🔄 Workflow completo de exemplo
- 🎯 Edge cases e testes de validação

**Atalhos:**
- `Ctrl+Alt+R` (Win/Linux) ou `Cmd+Alt+R` (Mac) - Enviar requisição
- `Ctrl+Alt+C` (Win/Linux) ou `Cmd+Alt+C` (Mac) - Cancelar requisição

### Com cURL

#### Endpoints de Usuário

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/users/register` | Registrar novo usuário |
| POST | `/api/users/login` | Fazer login e obter token |
| GET | `/api/users/profile` | Ver perfil (requer auth) |
| PUT | `/api/users/profile` | Atualizar perfil (requer auth) |

#### Endpoints de Pedidos (Requerem Autenticação)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/orders` | Criar novo pedido |
| GET | `/api/orders` | Listar pedidos do usuário |
| GET | `/api/orders/:id` | Buscar pedido por ID |
| GET | `/api/orders/:id/status` | Obter status do pedido (ACTIVE \| DELETED) |
| PUT | `/api/orders/:id` | Atualizar pedido |
| DELETE | `/api/orders/:id` | Deletar pedido |
| PATCH | `/api/orders/:id/advance` | Avançar estado |

## 💡 Exemplos de Uso

### Criar Pedido

```bash
# Primeiro faça login para obter o token
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com","password":"senha123"}' \
  | jq -r '.token')

# Depois crie um pedido
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lab": "Lab Sorriso",
    "patient": "João Silva",
    "customer": "Dr. Maria Santos",
    "services": [
      {"name": "Coroa", "value": 800.00},
      {"name": "Implante", "value": 700.00}
    ]
  }'
```

### Listar Pedidos do Usuário

```bash
# Listar todos os pedidos do usuário autenticado
curl -X GET "http://localhost:3000/api/orders" \
  -H "Authorization: Bearer $TOKEN"

# Com filtros
curl -X GET "http://localhost:3000/api/orders?state=ANALYSIS&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

### Avançar Estado

```bash
curl -X PATCH "http://localhost:3000/api/orders/{id}/advance" \
  -H "Authorization: Bearer $TOKEN"
```

### Obter Status do Pedido

```bash
curl -X GET http://localhost:3000/api/orders/{id}/status \
  -H "Authorization: Bearer $TOKEN"

# Resposta
{
  "status": "success",
  "data": {
    "status": "ACTIVE",
    "state": "CREATED"
  }
}
```

Para mais exemplos, veja [EXAMPLES.md](EXAMPLES.md).

## 🔄 Estados do Pedido

```
CREATED → ANALYSIS → COMPLETED
```

- Sequencial (não pula estados)
- Unidirecional (não retrocede)
- Use PATCH `/advance` para mudar

## 📊 Validações de Negócio

- ✅ Pelo menos 1 serviço obrigatório
- ✅ Valor total > 0
- ✅ Prazo deve ser data futura
- ✅ Nomes com mínimo 3 caracteres
- ✅ Não pode alterar estado diretamente (use `/advance`)

## 🐳 Comandos Docker Úteis

```bash
# Logs em tempo real
docker compose logs -f api

# Logs do MongoDB
docker compose logs -f mongodb

# Parar containers
docker compose down

# Resetar banco (APAGA DADOS!)
docker compose down -v

# Acessar MongoDB
docker compose exec mongodb mongosh -u admin -p supersecret123 --authenticationDatabase admin

# Shell da API
docker compose exec api sh

# Verificar containers
docker compose ps
```

Para mais comandos, veja [DOCKER.md](DOCKER.md).

## 📁 Estrutura do Projeto

**Arquitetura Modular** inspirada no NestJS:

```
src/
├── common/                          # Código compartilhado
│   ├── config/
│   │   ├── env.ts                  # Variáveis de ambiente
│   │   └── database.ts             # Conexão MongoDB
│   ├── middlewares/
│   │   ├── errorHandler.ts         # Tratamento de erros
│   │   └── validator.ts            # Middleware de validação
│   └── index.ts                     # Router principal
│
├── modules/                         # Módulos de funcionalidades
│   └── orders/                      # Módulo de pedidos
│       ├── controllers/
│       │   └── order.controller.ts
│       ├── services/
│       │   └── order.service.ts    # Lógica de negócio
│       ├── models/
│       │   └── Order.model.ts      # Schema Mongoose
│       ├── validators/
│       │   └── order.validator.ts
│       ├── types/
│       │   └── order.types.ts
│       ├── __tests__/
│       │   └── order.service.test.ts
│       ├── order.routes.ts         # Rotas do módulo
│       └── orders.module.ts        # Configuração do módulo
│
├── app.ts                           # Setup Express
└── index.ts                         # Entry point
```

**Vantagens:**
- ✅ Organização por domínio/funcionalidade
- ✅ Fácil adicionar novos módulos
- ✅ Melhor escalabilidade e manutenibilidade
- ✅ Código compartilhado em `common/`

## 🔒 Variáveis de Ambiente

Arquivo `.env`:

```env
# MongoDB
MONGODB_URI=mongodb://admin:supersecret123@localhost:27017/lab_orders_db?authSource=admin
```

**Para Docker:** Altere `localhost` para `mongodb`
```env
MONGODB_URI=mongodb://admin:supersecret123@mongodb:27017/lab_orders_db?authSource=admin
```

⚠️ **Mude as credenciais em produção!**

## 🧪 Testes

```bash
npm test                # Rodar testes
npm run test:coverage   # Com coverage
```

## ❌ Troubleshooting

### MongoDB não conecta localmente
```bash
# Erro: getaddrinfo ENOTFOUND mongodb
# Solução: Altere no .env de 'mongodb' para 'localhost'
MONGODB_URI=mongodb://admin:supersecret123@localhost:27017/lab_orders_db?authSource=admin

# Ou inicie MongoDB com Docker
docker compose up mongodb -d
```

### Porta em uso
```bash
# Mudar no .env
PORT=3001
docker compose up --build
```

### MongoDB não conecta
```bash
docker compose logs mongodb
docker compose ps
```

### Limpar tudo
```bash
docker compose down -v
docker compose up --build
```

Para mais detalhes, veja [INSTALL.md](INSTALL.md).

## 📚 Documentação

- **[api-test/orders.http](api-test/orders.http)** - Testes completos da API com REST Client
- **[INSTALL.md](INSTALL.md)** - Instalação detalhada
- **[EXAMPLES.md](EXAMPLES.md)** - Exemplos práticos da API
- **[DOCKER.md](DOCKER.md)** - Comandos Docker avançados
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura modular do sistema

## 🎯 Próximos Passos

- [ ] Autenticação JWT
- [ ] Upload de arquivos
- [ ] Notificações (email/SMS)
- [ ] Cache com Redis
- [ ] Documentação OpenAPI/Swagger
- [ ] WebSockets para updates em tempo real
- [ ] Filas com Bull
- [ ] CI/CD com GitHub Actions

## 📝 Licença

MIT

---

**Desenvolvido com ❤️ usando Node.js, Express, TypeScript e MongoDB**
