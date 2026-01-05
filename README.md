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
npm run dev          # Rodar em modo desenvolvimento
npm run build        # Build para produção
npm start            # Iniciar produção
npm test             # Rodar testes
npm run lint         # Verificar código
npm run format       # Formatar código
```

## 📚 API - Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/orders` | Criar novo pedido |
| GET | `/api/orders` | Listar pedidos (paginação/filtros) |
| GET | `/api/orders/:id` | Buscar pedido por ID |
| PUT | `/api/orders/:id` | Atualizar pedido |
| DELETE | `/api/orders/:id` | Deletar pedido |
| PATCH | `/api/orders/:id/advance` | Avançar estado |
| GET | `/api/orders/stats` | Estatísticas |

## 💡 Exemplos de Uso

### Criar Pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "patientName": "João Silva",
    "dentistName": "Dr. Maria Santos",
    "services": ["Coroa", "Implante"],
    "totalValue": 1500.00,
    "deadline": "2026-02-15"
  }'
```

### Listar com Filtros

```bash
# Por estado
curl "http://localhost:3000/api/orders?state=ANALYSIS"

# Por nome e paginação
curl "http://localhost:3000/api/orders?patientName=João&page=1&limit=10"

# Ordenar
curl "http://localhost:3000/api/orders?sortBy=createdAt&sortOrder=desc"
```

### Avançar Estado

```bash
# De CREATED → ANALYSIS → COMPLETED
curl -X PATCH http://localhost:3000/api/orders/{id}/advance
```

### Obter Estatísticas

```bash
curl http://localhost:3000/api/orders/stats
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

```
src/
├── config/
│   ├── env.ts                # Variáveis de ambiente
│   └── database.ts           # Conexão MongoDB
├── models/
│   └── Order.model.ts        # Schema Mongoose
├── services/
│   └── order.service.ts      # Lógica de negócio
├── controllers/
│   └── order.controller.ts   # Controladores HTTP
├── routes/
│   ├── index.ts              # Rotas principais
│   └── order.routes.ts       # Rotas de pedidos
├── validators/
│   └── order.validator.ts    # Validações
├── middlewares/
│   ├── errorHandler.ts       # Tratamento de erros
│   └── validator.ts          # Middleware de validação
├── types/
│   └── order.types.ts        # Interfaces TypeScript
├── __tests__/
│   └── order.service.test.ts # Testes
├── app.ts                    # Setup Express
└── index.ts                  # Entry point
```

## 🔒 Variáveis de Ambiente

Arquivo `.env` (já vem preconfigurado):

```env
# MongoDB
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=supersecret123
MONGO_INITDB_DATABASE=lab_orders_db
MONGODB_URI=mongodb://admin:supersecret123@mongodb:27017/lab_orders_db?authSource=admin

# API
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-muito-longa-aqui
```

⚠️ **Mude em produção!** Use `.env.example` como template.

## 🧪 Testes

```bash
npm test                # Rodar testes
npm run test:coverage   # Com coverage
```

## ❌ Troubleshooting

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

- **[INSTALL.md](INSTALL.md)** - Instalação detalhada
- **[EXAMPLES.md](EXAMPLES.md)** - Exemplos práticos da API
- **[DOCKER.md](DOCKER.md)** - Comandos Docker avançados
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitetura da aplicação

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
