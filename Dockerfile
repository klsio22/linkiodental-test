# Etapa 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Build do TypeScript
RUN npm run build

# Etapa 2: Runtime (imagem leve para produção)
FROM node:20-alpine

WORKDIR /app

# Copiar build e dependências
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
