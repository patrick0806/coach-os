# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de definição de dependências
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copia o código fonte
COPY . .

# Gera o build do NestJS
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas os arquivos necessários para execução
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instala apenas dependências de produção
RUN npm ci --only=production

# Expõe a porta definida no main.ts (padrão 3000)
EXPOSE 30001

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
