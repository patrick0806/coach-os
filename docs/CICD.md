# CI/CD — Coach OS

## Visão Geral

O pipeline é composto por dois workflows do GitHub Actions:

| Workflow | Arquivo | Quando dispara |
|----------|---------|---------------|
| **CI** | `.github/workflows/ci.yml` | Todo PR para `main` e todo push em `main` |
| **CD** | `.github/workflows/cd.yml` | Somente quando o CI conclui com **sucesso** em `main` |

A separação garante que **código com testes quebrados nunca chega ao servidor de produção**.

---

## Fluxo Completo

```
Developer faz git push
       │
       ▼
   pre-push hook (.githooks/pre-push) — roda LOCAL antes do push
   ├── Backend: lint + typecheck + unit tests  ┐ paralelo
   └── Frontend: lint + typecheck + E2E        ┘ (~4–5 min)
       │
       ▼ (falhou → push bloqueado, corrigir antes de continuar)
       ▼ (passou → push vai para o GitHub)
       │
       ▼
   CI executa no GitHub Actions (ambiente limpo)
   └── Backend Integration
         ├── db:migrate (banco de teste)
         └── integration tests (Vitest contra postgres:16)
       │
       ▼ (precisa passar)
   PR pode ser mergeado
       │
       ▼
   Push chega em main → CI roda novamente → CD dispara
   ├── Build imagem backend  → ghcr.io/.../backend:sha + :latest
   ├── Build imagem frontend → ghcr.io/.../frontend:sha + :latest
   ├── Push para GHCR
   └── Deploy via SSH
         ├── docker compose pull backend frontend
         ├── docker compose up -d --remove-orphans
         └── docker image prune -f
```

---

## Pre-push Hook — Validação Local

O projeto usa um hook Git (`pre-push`) para bloquear o push localmente caso qualquer verificação falhe. Todo o ciclo de qualidade roda local — o CI fica reservado apenas para o que exige infraestrutura limpa (banco de dados).

O hook fica em `.githooks/pre-push` (rastreado pelo Git) e roda automaticamente a cada `git push`.

### Setup obrigatório após clonar

```bash
git config core.hooksPath .githooks
```

Executar **uma única vez** após clonar o repositório. Sem isso, o hook não é ativado.

### O que o hook roda (em paralelo)

| | Backend | Frontend |
|--|---------|----------|
| Lint | `npm run lint` | `npm run lint` |
| Typecheck | `npm run typecheck` | `npm run typecheck` |
| Build | — | `npm run build` |
| Testes | `npm run test` | `CI=true npx playwright test --project=chromium` |

O frontend faz build antes de rodar o Playwright para evitar conflito com o `.next/dev/lock` de um servidor de desenvolvimento já ativo na porta 3001. O `CI=true` faz o Playwright usar `npm start` (porta 3099) em vez do dev server.

Tempo estimado: ~5–7 min (frontend build + E2E é o gargalo, roda em paralelo com o backend).

### Bypass em emergências

```bash
git push --no-verify
```

Usar apenas em situações excepcionais (hotfix crítico). O CI ainda valida as integration tests no GitHub.

---

## CI — Detalhamento dos Jobs

Lint, typecheck, unit tests e E2E comportamentais **não rodam no CI** — são garantidos pelo pre-push hook local. O CI roda apenas o que exige infraestrutura isolada: banco de dados real.

### Backend Integration

Roda em `ubuntu-latest` com um container PostgreSQL como serviço.

| Etapa | Comando | Observação |
|-------|---------|-----------|
| Install | `npm ci` | Cache via `setup-node` |
| Migrations | `npm run db:migrate` | Aplica schema no banco de teste |
| Integration tests | `npm run test:e2e` | Vitest contra banco real (postgres:16) |

**Variáveis de ambiente injetadas pelo workflow (não precisam de secret):**

```
NODE_ENV=test
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=coachos
DATABASE_PASSWORD=ci_password
DATABASE_NAME=coachos_test
DATABASE_SSL=false
```

Os demais env vars do backend (`JWT_SECRET`, `STRIPE_*`, `AWS_*` etc.) usam os valores padrão definidos em `backend/src/config/env/index.ts` — que só exigem valores seguros em `NODE_ENV=production`.

---

## CD — Detalhamento dos Jobs

### build-images

Autentica no GitHub Container Registry e constrói as imagens Docker com dois tags:

| Tag | Exemplo | Uso |
|-----|---------|-----|
| `sha` (curto) | `abc1234` | Rollback para uma versão específica |
| `latest` | `latest` | O servidor sempre aponta para esta tag |

O build usa **layer cache do GitHub Actions** (`type=gha`) — reduz significativamente o tempo em builds subsequentes.

### deploy

Conecta ao servidor via SSH e executa:

```bash
cd /opt/coach-os
echo "<GHCR_TOKEN>" | docker login ghcr.io -u <actor> --password-stdin
docker compose pull backend frontend
docker compose up -d --remove-orphans --no-build
docker image prune -f
```

O `--remove-orphans` remove containers de serviços que foram removidos do `docker-compose.yml`.

---

## Persistência de Dados e Migrations

### Por que os dados dos clientes não se perdem no deploy

O banco de dados usa um **volume nomeado** do Docker:

```yaml
postgres:
  volumes:
    - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:   # gerenciado pelo Docker, independente dos containers
```

O volume `postgres_data` existe no disco do servidor e é apenas **montado** pelo container do postgres. Quando o deploy recria os containers, o volume permanece intacto. Os dados só são perdidos se alguém executar explicitamente `docker compose down -v` ou `docker volume rm postgres_data` — comandos que nunca fazem parte do pipeline.

| Comando executado no deploy | Apaga dados? |
|-----------------------------|-------------|
| `docker compose pull` | ❌ |
| `docker compose up -d` | ❌ |
| `docker compose down` (sem `-v`) | ❌ |
| `docker compose down -v` | ✅ **sim — nunca executar em produção** |

### Como as migrations são aplicadas automaticamente

O `docker-compose.yml` define um **init container** (`migrate`) que roda a cada deploy:

```yaml
migrate:
  image: ghcr.io/patrick0806/coach-os/backend:latest
  command: ["node", "dist/config/database/migrate.js"]
  depends_on:
    postgres:
      condition: service_healthy
  restart: "no"   # roda uma vez e sai

backend:
  depends_on:
    migrate:
      condition: service_completed_successfully  # só sobe se migrate passou
```

**Sequência garantida a cada deploy:**

```
postgres saudável
       │
       ▼
  migrate roda
  (aplica novas migrations, é idempotente — não refaz o que já foi feito)
       │
  ┌────┴────┐
  │ passou? │
  └────┬────┘
  sim  │  não → deploy falha, backend não sobe, produção continua na versão anterior
       ▼
  backend sobe
```

Drizzle ORM mantém uma tabela interna de controle (`drizzle_migrations`) que registra quais migrations já foram aplicadas — rodar duas vezes é seguro.

---

## Configuração no GitHub — Passo a Passo

### 1. Branch Protection em `main`

Acesse: `github.com/patrick0806/coach-os` → **Settings** → **Branches** → **Add rule**

Configure a regra para o branch `main`:

- [x] **Require a pull request before merging**
  - [x] Require approvals: `1` (recomendado)
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Adicionar o check obrigatório:
    - `Backend Integration`
- [x] **Do not allow bypassing the above settings** (bloqueia até admins)
- [x] **Restrict who can push to matching branches** (opcional, para times maiores)

> O nome do job (`Backend Integration`) só aparece para seleção após o CI ter rodado ao menos uma vez no repositório.

---

### 2. Secrets do GitHub Actions

Acesse: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

#### Secrets obrigatórios para o CD funcionar

| Secret | Descrição | Como obter |
|--------|-----------|-----------|
| `DEPLOY_HOST` | IP ou hostname do servidor de produção | Painel do seu provedor de VM (ex: DigitalOcean, Hetzner) |
| `DEPLOY_USER` | Usuário SSH do servidor | Normalmente `ubuntu`, `root` ou `deploy` |
| `DEPLOY_SSH_KEY` | Chave privada SSH (conteúdo completo, incluindo header/footer) | `cat ~/.ssh/id_ed25519` — a chave **privada** correspondente à pública cadastrada no servidor |
| `DEPLOY_PORT` | Porta SSH do servidor | `22` por padrão — pode omitir se usar 22 |
| `GHCR_TOKEN` | GitHub Personal Access Token para autenticar no GHCR no servidor | Veja instruções abaixo |

#### Como gerar o GHCR_TOKEN

1. Acesse `github.com` → avatar → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Clique em **Generate new token (classic)**
3. Nome: `coach-os-ghcr-deploy`
4. Escopo: marque apenas `read:packages`
5. Copie o token gerado e salve como secret `GHCR_TOKEN`

#### Como gerar o par de chaves SSH para deploy

```bash
# Gerar par de chaves dedicado para deploy (não use sua chave pessoal)
ssh-keygen -t ed25519 -C "deploy@coach-os" -f ~/.ssh/coach-os-deploy

# Adicionar a chave pública no servidor
ssh-copy-id -i ~/.ssh/coach-os-deploy.pub <usuario>@<servidor>

# Conteúdo da chave privada → salvar como DEPLOY_SSH_KEY no GitHub
cat ~/.ssh/coach-os-deploy
```

---

### 3. Ambiente de Produção no GitHub

Acesse: **Settings** → **Environments** → **New environment** → nome: `production`

Configure (opcional mas recomendado):
- **Required reviewers**: adicione seu usuário — exige aprovação manual antes do deploy
- **Wait timer**: 0 minutos (ou coloque 5 min para ter uma janela de cancelamento)

---

## Preparação do Servidor

O servidor precisa de Docker + Docker Compose instalados e do projeto em `/opt/coach-os`.

```bash
# No servidor, executar uma vez
sudo mkdir -p /opt/coach-os
sudo chown $USER:$USER /opt/coach-os
cd /opt/coach-os

# Copiar o docker-compose.yml e o arquivo de monitoramento
scp docker-compose.yml usuario@servidor:/opt/coach-os/
scp -r monitoring/ usuario@servidor:/opt/coach-os/

# Criar o .env com os valores reais de produção
cp .env.example .env
nano .env   # preencher todos os valores

# Copiar também os .env das aplicações
scp backend/.env usuario@servidor:/opt/coach-os/backend/.env
# (ou criar diretamente no servidor)
```

> O servidor **não precisa do código-fonte** — apenas do `docker-compose.yml`, do diretório `monitoring/` e dos arquivos `.env`. As imagens vêm do GHCR.

---

## Rollback Manual

Para voltar para uma versão anterior, use a tag SHA gerada durante o build:

```bash
# No servidor
cd /opt/coach-os

# Editar docker-compose.yml: trocar :latest por :abc1234 no serviço desejado
# Ou usar variável de ambiente:
BACKEND_TAG=abc1234 docker compose up -d backend
FRONTEND_TAG=abc1234 docker compose up -d frontend
```

As tags SHA de cada deploy estão visíveis na aba **Actions** → job **Build & Push Images** → step **Backend/Frontend — image metadata**.

---

## Testes de Fumaça (Smoke Tests)

Os smoke tests do Playwright (`*.smoke.spec.ts`) exigem um backend real e **não rodam no CI padrão**. Para executá-los manualmente antes de um deploy crítico:

```bash
# Localmente, com o backend e banco rodando
cd frontend
npm run test:e2e:smoke
```

Podem ser incluídos em um workflow separado (ex: `smoke.yml`) acionado manualmente via `workflow_dispatch` caso necessário.
