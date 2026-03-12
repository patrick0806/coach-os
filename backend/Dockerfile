# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

ENV HUSKY=0

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

RUN npm ci --omit=dev

EXPOSE 30001

CMD ["npm", "run", "start:prod"]