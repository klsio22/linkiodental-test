# 🐳 COMANDOS DOCKER ÚTEIS

## Comandos Básicos

### Iniciar o projeto

```bash
# Primeira vez (com build)
docker compose up --build

# Iniciar em background
docker compose up -d

# Ver logs em tempo real
docker compose logs -f

# Ver logs só da API
docker compose logs -f api

# Ver logs só do MongoDB
docker compose logs -f mongodb
```

### Parar o projeto

```bash
# Parar containers (mantém dados)
docker compose down

# Parar e remover volumes (APAGA O BANCO!)
docker compose down -v

# Parar e remover imagens
docker compose down --rmi all
```

### Status e Informações

```bash
# Ver containers rodando
docker compose ps

# Ver logs
docker compose logs

# Ver uso de recursos
docker stats

# Inspecionar container
docker inspect lab-orders-api
```

## Acessar Containers

### Shell da API (Node.js)

```bash
# Entrar no container
docker compose exec api sh

# Dentro do container você pode:
ls -la                    # Listar arquivos
cat dist/index.js         # Ver código compilado
npm list                  # Ver dependências instaladas
node dist/index.js        # Rodar a app manualmente
exit                      # Sair
```

### MongoDB Shell

```bash
# Método 1: Com credenciais inline
docker compose exec mongodb mongosh -u admin -p supersecret123 --authenticationDatabase admin

# Método 2: Entrar e depois autenticar
docker compose exec mongodb mongosh
# Dentro do mongosh:
use admin
db.auth("admin", "supersecret123")
```

### Comandos úteis no MongoDB

```javascript
// Listar bancos
show dbs

// Usar banco lab_orders_db
use lab_orders_db

// Listar coleções
show collections

// Ver todos os pedidos
db.orders.find().pretty()

// Contar pedidos
db.orders.countDocuments()

// Buscar pedidos por estado
db.orders.find({ state: "ANALYSIS" }).pretty()

// Ver pedido específico
db.orders.findOne({ _id: ObjectId("...") })

// Agregação - contar por estado
db.orders.aggregate([
  { $group: { _id: "$state", count: { $sum: 1 } } }
])

// Apagar todos os pedidos (CUIDADO!)
db.orders.deleteMany({})

// Criar índice manualmente
db.orders.createIndex({ state: 1, createdAt: -1 })

// Ver índices
db.orders.getIndexes()

// Sair
exit
```

## Gerenciamento de Volumes

### Listar volumes

```bash
docker volume ls
```

### Inspecionar volume do MongoDB

```bash
docker volume inspect linkiodental-test_mongo-data
```

### Backup do banco

```bash
# Criar backup
docker compose exec mongodb mongodump \
  -u admin \
  -p supersecret123 \
  --authenticationDatabase admin \
  -d lab_orders_db \
  --out /dump

# Copiar backup para host
docker cp lab-orders-mongodb:/dump ./backup-$(date +%Y%m%d)
```

### Restaurar backup

```bash
# Copiar backup para container
docker cp ./backup-20260105 lab-orders-mongodb:/restore

# Restaurar
docker compose exec mongodb mongorestore \
  -u admin \
  -p supersecret123 \
  --authenticationDatabase admin \
  -d lab_orders_db \
  /restore/lab_orders_db
```

### Limpar volumes órfãos

```bash
docker volume prune
```

## Rebuild e Clean

### Rebuild completo

```bash
# Parar tudo
docker compose down

# Remover volumes (CUIDADO: apaga dados!)
docker compose down -v

# Rebuild e iniciar
docker compose up --build
```

### Rebuild apenas da API

```bash
docker compose up --build api
```

### Limpar tudo (cache, imagens, etc)

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Remover volumes não usados
docker volume prune

# Remover redes não usadas
docker network prune

# Limpar TUDO (CUIDADO!)
docker system prune -a --volumes
```

## Debugging

### Ver logs detalhados

```bash
# API
docker compose logs -f --tail=100 api

# MongoDB
docker compose logs -f --tail=100 mongodb
```

### Ver variáveis de ambiente

```bash
docker compose exec api env
```

### Testar conexão MongoDB

```bash
# Dentro do container da API
docker compose exec api sh -c "nc -zv mongodb 27017"

# Ou usando mongosh da API (se tiver instalado)
docker compose exec api sh -c "npm list | grep mongoose"
```

### Reiniciar um serviço específico

```bash
# Reiniciar só a API
docker compose restart api

# Reiniciar só o MongoDB
docker compose restart mongodb
```

## Performance e Monitoramento

### Ver recursos usados

```bash
# Todos os containers
docker stats

# Apenas do projeto
docker stats lab-orders-api lab-orders-mongodb
```

### Ver processos dentro do container

```bash
docker compose exec api ps aux
```

## Networks

### Listar networks

```bash
docker network ls
```

### Inspecionar network do projeto

```bash
docker network inspect linkiodental-test_lab-network
```

### Testar conectividade entre containers

```bash
# Da API para o MongoDB
docker compose exec api ping mongodb

# Verificar porta
docker compose exec api nc -zv mongodb 27017
```

## Desenvolvimento

### Rodar comando npm dentro do container

```bash
# Instalar nova dependência
docker compose exec api npm install express-rate-limit

# Rodar testes
docker compose exec api npm test

# Verificar versão
docker compose exec api node --version
docker compose exec api npm --version
```

### Hot reload (já configurado)

O Docker Compose está configurado com volumes para hot reload:

```yaml
volumes:
  - .:/app
  - /app/node_modules
command: npm run dev
```

Qualquer mudança no código é refletida automaticamente!

### Build para produção

```bash
# Build da imagem
docker build -t lab-orders-api:1.0 .

# Rodar em produção
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://... \
  -e JWT_SECRET=... \
  lab-orders-api:1.0
```

## Troubleshooting

### Porta já em uso

```bash
# Verificar o que está usando a porta 3000
sudo lsof -i :3000

# Ou
sudo netstat -tulpn | grep 3000

# Mudar porta no .env
PORT=3001
```

### Container não inicia

```bash
# Ver logs
docker compose logs api

# Verificar status
docker compose ps

# Forçar rebuild
docker compose build --no-cache api
docker compose up api
```

### Problemas de permissão

```bash
# Linux
sudo chown -R $USER:$USER .

# Dar permissão aos volumes
docker compose exec api chmod -R 755 /app
```

### MongoDB não aceita conexão

```bash
# Verificar se está rodando
docker compose ps mongodb

# Ver logs
docker compose logs mongodb

# Verificar se porta está aberta
docker compose exec mongodb netstat -tuln | grep 27017

# Testar autenticação
docker compose exec mongodb mongosh -u admin -p supersecret123 --authenticationDatabase admin
```

## Produção

### Variáveis de ambiente seguras

```bash
# Não commitar .env no git!
# Usar secrets em produção:

# AWS
docker run --env-file <(aws secretsmanager get-secret-value ...) ...

# Docker Swarm
docker secret create mongo_password mongo_password.txt
docker service create --secret mongo_password ...
```

### Health checks

Adicionar no docker-compose.yml:

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Deploy

```bash
# Push para registry
docker tag lab-orders-api:latest registry.example.com/lab-orders-api:1.0
docker push registry.example.com/lab-orders-api:1.0

# Deploy com Docker Swarm
docker stack deploy -c docker-compose.yml lab-orders

# Ou com Kubernetes (converter compose)
kompose convert
kubectl apply -f .
```
