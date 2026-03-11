# Coach OS

Plataforma SaaS para personal trainers gerenciarem alunos, treinos, agenda, assinatura e presença digital em um modelo multi-tenant.

## Visão Geral

O Coach OS combina:

- backend NestJS com Fastify e Drizzle ORM
- frontend Next.js com App Router
- autenticação por JWT e refresh token
- páginas institucionais, área do personal, área do aluno e área admin
- integrações com Stripe, Resend e AWS S3

## Stack

### Backend

- TypeScript
- NestJS
- Fastify
- Drizzle ORM
- PostgreSQL
- Zod
- Vitest
- Stripe
- Resend
- AWS S3

### Frontend

- TypeScript
- Next.js
- Tailwind CSS
- shadcn/ui
- React Query
- React Hook Form
- Zod
- Playwright

## Estrutura

```bash
.
├── backend/
├── frontend/
├── docs/
├── .claude/
└── CLAUDE.md
```

## Pré-requisitos

- Node.js 20+
- npm
- PostgreSQL
- Docker opcional para banco local

## Variáveis de ambiente

Antes de rodar o projeto, configure:

- `backend/.env`
- variáveis públicas do frontend, como `NEXT_PUBLIC_API_URL`

Use os arquivos de configuração do código como referência:

- `backend/src/config/env`
- `frontend/src/services`

## Como rodar

### Banco de dados local com Docker

```bash
docker run --name coach-os-db \
  -p 5432:5432 \
  -e POSTGRES_DB=coach-os-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=123 \
  -d postgres:16.2-alpine
```

### Backend

```bash
cd backend
npm install
npm run db:migrate
npm run db:seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Scripts úteis

### Backend

```bash
npm run start:dev
npm run test
npm run test:watch
npm run test:e2e
npm run test:cov
npm run typecheck
npm run lint
npm run check:all
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test:e2e
```

## Qualidade e testes

O projeto segue TDD no backend e agora possui uma camada de validação local mais completa.

### Backend

- testes unitários com Vitest
- suíte E2E mínima com Vitest + Nest testing
- `husky` com hook de `pre-commit`
- `pre-push` rodando `npm run test` e `npm run test:e2e`
- `lint-staged` para arquivos TypeScript staged
- `check:all` para lint, typecheck e testes

### Frontend

- testes E2E com Playwright
- cenários de cadastro, login e painel
- cobertura responsiva com projeto mobile em Chromium

## Convenções do projeto

- código, comentários e commits em inglês
- interface, labels e mensagens em português
- arquitetura modular
- validação com Zod
- evitar `any`
- separação clara entre módulos, shared e config

## Observações

- o `core.hooksPath` do git é configurado para `backend/.husky`
- os testes E2E do frontend usam porta dedicada no Playwright para evitar conflito com instâncias locais
- o middleware do frontend possui bypass controlado por `E2E_BYPASS_AUTH=true` apenas para execução de testes E2E mockados

## Licença

Projeto privado.
