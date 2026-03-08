# Coach OS 🚀

Uma plataforma SaaS robusta, escalável e modular para personal trainers gerenciarem seus alunos, planos de treino e presença digital.

## 📌 Visão Geral

Coach OS é uma solução **White Label** que permite que cada profissional de educação física tenha sua própria Landing Page personalizada e um painel de gestão completo. A plataforma utiliza o conceito de **multi-tenancy** (separação por tenant ID) para isolar os dados de cada profissional.

## 🛠️ Stack Tecnológica

### Backend (API REST)
- **Framework:** [NestJS](https://nestjs.com/) com [Fastify](https://www.fastify.io/)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL com [Drizzle ORM](https://orm.drizzle.team/)
- **Validação:** Zod
- **Autenticação:** JWT, Passport (Estratégias Local e JWT)
- **Logs:** Pino Logger
- **Testes:** [Vitest](https://vitest.dev/) (TDD First)
- **Integrações:**
  - **Emails:** Resend API
  - **Pagamentos:** Stripe
  - **Storage:** AWS S3

### Frontend (Web)
- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Estilização:** TailwindCSS v4, shadcn/ui
- **Gerenciamento de Estado/Dados:** React Query, React Hook Form
- **Linguagem:** TypeScript

---

## 📂 Estrutura do Repositório

```bash
├── backend/    # API NestJS (Porta 3000 por padrão)
├── frontend/   # Aplicação Next.js (Porta 3001 por padrão)
├── docs/       # Documentação técnica adicional
└── .claude/    # Regras e contexto para agentes de IA
```

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (v20 ou superior)
- Docker & Docker Compose (para o banco de dados)

### 1. Configuração do Banco de Dados
Você pode subir um PostgreSQL rapidamente usando Docker:
```bash
docker run --name coach-os-db \
    -p 5432:5432 \
    -e POSTGRES_DB=coach-os-db \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=123 \
    -d postgres:16.2-alpine
```

### 2. Backend
```bash
cd backend
npm install

# Configure seu .env (use src/config/env/index.ts como referência)
# Rode as migrações e o seed
npm run db:migrate
npm run db:seed

# Inicie em modo desenvolvimento
npm run start:dev
```

### 3. Frontend
```bash
cd frontend
npm install

# Inicie em modo desenvolvimento
npm run dev
```

---

## 🧪 Testes

O projeto segue a filosofia **TDD First**. Os testes são fundamentais para garantir a estabilidade.

Para rodar os testes no backend:
```bash
cd backend
npm run test        # Executar uma vez
npm run test:watch  # Modo watch (desenvolvimento)
```

---

## 📐 Arquitetura e Padrões

- **Padrões de Código:** Uso rigoroso de interfaces, evitar `any`, validação com Zod em todas as entradas.
- **Internacionalização:**
  - Código e commits em **Inglês**.
  - UI (labels, mensagens, erros) em **Português**.
- **Design:**
  - Mobile First e Responsivo.
  - **Modo Dark:** Obrigatório para áreas de Alunos, Admin e páginas de produto.
  - **Modo Light:** Áreas de gestão do Personal.

---

## 📄 Licença
Este projeto é privado e proprietário.
