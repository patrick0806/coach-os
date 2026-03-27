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

## Setup após clonar

```bash
# 1. Ativar o pre-push hook (obrigatório — roda uma vez)
git config core.hooksPath .githooks

# 2. Instalar dependências
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

O hook garante que lint, typecheck e testes unitários passam antes de cada push. Veja `docs/CICD.md` para detalhes.

## Variáveis de ambiente

Copie os exemplos e preencha com os valores locais:

```bash
cp backend/.env.example backend/.env
```

Referências:
- `backend/src/config/env/index.ts` — todas as variáveis do backend com seus defaults
- `frontend/src/` — variáveis `NEXT_PUBLIC_*` necessárias

## Como rodar localmente

### Banco de dados com Docker

```bash
docker run --name coach-os-db \
  -p 5432:5432 \
  -e POSTGRES_DB=coachos \
  -e POSTGRES_USER=coachos \
  -e POSTGRES_PASSWORD=coachos \
  -d postgres:16-alpine
```

### Backend

```bash
cd backend
npm run db:migrate
npm run db:seed
npm run start:dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## Scripts úteis

### Backend

```bash
npm run start:dev      # servidor em modo watch
npm run test           # testes unitários
npm run test:watch     # testes em modo watch
npm run test:e2e       # testes de integração (requer banco)
npm run test:cov       # testes com cobertura
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run db:migrate     # aplica migrations pendentes
npm run db:seed        # popula banco com dados iniciais
```

### Frontend

```bash
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção
npm run lint           # ESLint
npm run typecheck      # tsc --noEmit
npm run test:e2e       # suíte core: fluxos críticos + sanidade web/mobile
npm run test:e2e:full  # suíte detalhada mocked por feature
npm run test:e2e:smoke # smoke tests (requer backend rodando)
```

## Qualidade e CI/CD

### Pre-push hook (local)

A cada `git push`, o hook em `.githooks/pre-push` roda automaticamente:
- **Backend:** lint + typecheck + testes unitários (paralelo)
- **Frontend:** lint + typecheck

Push é bloqueado se qualquer verificação falhar. Para bypass em emergências: `git push --no-verify`.

### CI — GitHub Actions

O CI foca no que exige ambiente limpo:
- **Backend:** testes de integração contra PostgreSQL real
- **Frontend:** build de produção + testes E2E com Playwright

### CD — Deploy automático

Após CI passar em `main`, o CD constrói as imagens Docker e faz deploy via SSH.

Veja `docs/CICD.md` para o fluxo completo.

## Convenções do projeto

- código, comentários e commits em inglês
- interface, labels e mensagens em português
- arquitetura modular com separação clara backend/frontend
- validação com Zod em todas as bordas do sistema
- evitar `any` — tipos explícitos sempre
- commits seguem Conventional Commits + Gitmoji

## Licença

Projeto privado.
