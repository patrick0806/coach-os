# Backend — Guia de Operações

## Pré-requisitos

- Node.js >= 20
- npm >= 10
- PostgreSQL rodando localmente (ou via Docker)

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do diretório `backend/` com as seguintes variáveis:

```env
# App
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRATION=7d

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=123
DATABASE_NAME=personal_saas_db
DATABASE_SSL=false
```

---

## Instalação

```bash
cd backend
npm install
```

---

## Rodando o Backend

### Modo desenvolvimento (hot reload)

```bash
npm run start:dev
```

### Modo produção

```bash
npm run build
npm run start:prod
```

A API estará disponível em `http://localhost:3000`.
Swagger disponível em `http://localhost:3000/docs`.

---

## Banco de Dados — Migrations

O projeto usa **Drizzle ORM** com migrations SQL versionadas localizadas em:

```
backend/src/config/database/migrations/
```

### Gerar uma nova migration

Após alterar qualquer arquivo de schema em `src/config/database/schema/`, execute:

```bash
npm run db:generate
```

Isso analisa o schema TypeScript e gera um novo arquivo `.sql` na pasta de migrations.

### Aplicar migrations (up)

```bash
npm run db:migrate
```

Executa todas as migrations pendentes na ordem correta. Seguro para uso em produção.

### Reverter migrations

O Drizzle ORM não possui um comando nativo de rollback por migration. Para reverter:

**Opção 1 — Reset completo (destrói todos os dados):**

```bash
npm run db:reset
```

Este script executa `drizzle-kit drop` (remove todas as tabelas) seguido de `drizzle-kit push` (recria o schema atual direto no banco, sem usar os arquivos de migration).

> **Atenção:** `db:reset` apaga todos os dados. Use apenas em desenvolvimento.

**Opção 2 — Push direto do schema (desenvolvimento):**

```bash
npm run db:push
```

Sincroniza o schema TypeScript com o banco sem gerar arquivos de migration. Útil para iterações rápidas em desenvolvimento. **Não recomendado para produção.**

### Visualizar o banco (Drizzle Studio)

```bash
npm run db:studio
```

Abre uma interface web local para inspecionar e editar os dados do banco.

---

## Seed

O seed popula o banco com dados iniciais para desenvolvimento e testes.

### Rodar o seed (sem limpar o banco)

```bash
npm run db:seed
```

### Rodar o seed limpando o banco antes

```bash
npm run db:seed -- --clean
```

### Apenas limpar o banco (sem inserir dados)

```bash
npm run db:seed -- --only-clean
```

### Credenciais inseridas pelo seed

| Papel    | E-mail                      | Senha           |
|----------|-----------------------------|-----------------|
| Admin    | admin@example.com           | testPassword    |
| Personal | personal@example.com        | testPassword    |
| Student  | joao.silva@example.com      | studentPassword |

---

## Testes

### Rodar todos os testes

```bash
npm run test
```

### Rodar em modo watch

```bash
npm run test:watch
```

### Rodar com cobertura

```bash
npm run test:cov
```

---

## Fluxo típico de desenvolvimento

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env

# 3. Aplicar migrations
npm run db:migrate

# 4. Popular o banco com dados de teste
npm run db:seed

# 5. Subir o servidor
npm run start:dev
```
