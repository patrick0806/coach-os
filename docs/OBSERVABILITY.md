# Observabilidade — Coach OS

## Visão Geral

A stack de observabilidade coleta três tipos de sinais:

| Sinal | O que captura | Tecnologia |
|-------|--------------|-----------|
| **Traces** | Spans HTTP/gRPC do backend (latência, erros, rotas) | Grafana Beyla (eBPF) |
| **Logs** | Saída estruturada de backend e frontend | OTel Collector + Docker logs |
| **Métricas** | CPU, memória, disco, rede, processos do host | OTel Collector hostmetrics |
| **Erros** | Exceções não tratadas com stack trace | Sentry SDK (Better Stack) |

Todos os dados são enviados para o **Better Stack**, que oferece interface unificada de logs, métricas, dashboards e alertas.

---

## Arquitetura

```
┌──────────────────────────────────────────────────────┐
│                    Servidor de Produção               │
│                                                      │
│  ┌─────────────┐    stdout    ┌──────────────────┐   │
│  │   Backend   │─────────────►│                  │   │
│  │  (NestJS)   │              │  OTel Collector  │   │
│  └─────────────┘    stdout    │                  │   │
│                               │  ┌────────────┐  │   │
│  ┌─────────────┐─────────────►│  │docker_obs  │  │   │
│  │  Frontend   │              │  │ + recv_crt │  │   │
│  │  (Next.js)  │              │  └────────────┘  │   │
│  └─────────────┘              │  ┌────────────┐  │   │
│                               │  │hostmetrics │  │   │
│  ┌─────────────┐   OTLP/HTTP  │  │ (CPU, mem) │  │   │
│  │    Beyla    │─────────────►│  └────────────┘  │   │
│  │   (eBPF)    │  HTTP traces │  ┌────────────┐  │   │
│  └─────────────┘              │  │otlp recv   │  │   │
│        ▲ instrumenta          │  └────────────┘  │   │
│        │ via eBPF (sem código)│                  │   │
│  porta 30001 do backend       └────────┬─────────┘   │
│                                        │             │
└────────────────────────────────────────┼─────────────┘
                                         │ OTLP/HTTPS
                    ┌────────────────────▼──────────────┐
                    │           Better Stack             │
                    │                                   │
                    │  ┌──────────┐  ┌───────────────┐  │
                    │  │ backend  │  │   frontend    │  │
                    │  │  source  │  │    source     │  │
                    │  └──────────┘  └───────────────┘  │
                    │  ┌──────────┐  ┌───────────────┐  │
                    │  │  infra   │  │  error apps   │  │
                    │  │  source  │  │  (backend +   │  │
                    │  └──────────┘  │   frontend)   │  │
                    │                └───────────────┘  │
                    └───────────────────────────────────┘
```

---

## Componentes

### Grafana Beyla (eBPF)

**O que é:** agente de instrumentação automática baseado em eBPF. Captura spans HTTP/gRPC **sem nenhuma modificação no código da aplicação**, lendo diretamente as chamadas de sistema do kernel Linux.

**Como funciona:**
- Executa com `privileged: true` e `pid: host` para acessar o namespace de processos do host
- Monitora a porta `30001` (backend NestJS)
- Detecta automaticamente: método HTTP, rota, status code, latência
- Envia os traces em formato OTLP para o OTel Collector

**Requisitos de kernel:** Linux ≥ 4.18 com suporte a eBPF (presente em todas as distribuições modernas — Ubuntu 20.04+, Debian 11+).

**Configuração relevante em `docker-compose.yml`:**
```yaml
beyla:
  image: grafana/beyla:1.9
  privileged: true
  pid: host
  environment:
    BEYLA_OPEN_PORT: "30001"
    BEYLA_SERVICE_NAME: "coach-os-backend"
    OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector:4318"
    BEYLA_SAMPLER_RATIO: "1.0"   # 100% dos traces capturados
```

> Para reduzir volume em produção de alto tráfego, ajuste `BEYLA_SAMPLER_RATIO` para `0.1` (10%).

---

### OpenTelemetry Collector

**O que é:** pipeline central de coleta. Recebe dados de múltiplas fontes, processa e roteia para os destinos corretos.

**Arquivo de configuração:** `monitoring/otel-collector.yml`

#### Receivers (fontes de dados)

| Receiver | O que coleta |
|----------|-------------|
| `otlp` (gRPC :4317, HTTP :4318) | Traces do Beyla e métricas de futura instrumentação SDK |
| `hostmetrics` | CPU, memória, disco, sistema de arquivos, rede, paginação, processos |
| `receiver_creator` + `docker_observer` | Logs dos containers Docker identificados por label |

#### Como os logs dos containers são coletados

O `docker_observer` monitora o socket Docker (`/var/run/docker.sock`) e detecta containers em execução. O `receiver_creator` cria dinamicamente um receiver `filelog` para cada container que tiver a label `service`:

```yaml
# Em docker-compose.yml — o OTel Collector usa essa label para roteamento
labels:
  service: "coach-os-backend"
  logging: "true"
```

O `filelog` lê o arquivo de log do container em `/var/lib/docker/containers/<id>/*-json.log`, faz o parse do wrapper JSON do Docker, extrai o conteúdo real do log e define `resource.service.name` com base na label.

#### Processors

| Processor | Função |
|-----------|--------|
| `memory_limiter` | Descarta dados se o coletor ultrapassar 512 MiB — evita OOM |
| `batch` | Agrupa dados em lotes de 1000 itens ou 5 segundos — reduz chamadas à API |
| `resourcedetection` | Enriquece todos os dados com hostname e sistema operacional do host |

#### Routing (roteamento de logs)

O `routing` connector direciona logs para o destino correto com base em `resource.service.name`:

```
service.name == "coach-os-backend"  ──► Better Stack source: backend
service.name == "coach-os-frontend" ──► Better Stack source: frontend
qualquer outro                       ──► Better Stack source: infra
```

#### Pipelines

| Pipeline | Receiver → Processor → Exporter |
|----------|----------------------------------|
| `traces` | otlp → memory_limiter, batch, resourcedetection → infra |
| `metrics/infra` | hostmetrics → memory_limiter, batch, resourcedetection → infra |
| `metrics/apps` | otlp → memory_limiter, batch → infra |
| `logs/collect` | receiver_creator → memory_limiter, batch → routing |
| `logs/backend` | routing → otlphttp/backend |
| `logs/frontend` | routing → otlphttp/frontend |
| `logs/infra` | routing → otlphttp/infra |

---

### Better Stack — Sources (Logs + Métricas)

Três sources foram criadas na conta Better Stack (região Europa — `eu-fsn-3`):

| Source | ID | Finalidade |
|--------|----|-----------|
| `coach-os-backend` | 2311390 | Logs da aplicação NestJS |
| `coach-os-frontend` | 2311393 | Logs da aplicação Next.js |
| `coach-os-infra` | 2311396 | Métricas do host + traces eBPF |

Retenção de logs: **3 dias** (limite do plano atual). Retenção de métricas: **30 dias**.

Para visualizar: [https://logs.betterstack.com](https://logs.betterstack.com) → selecionar o source desejado.

---

### Better Stack — Applications (Error Tracking)

Dois applications foram criados para rastreamento de erros com SDK compatível com Sentry:

| Application | ID | Plataforma | DSN |
|-------------|-----|-----------|-----|
| `coach-os-backend` | 2311378 | NestJS | `https://4t2zrcaZEvK32tXR6SkpAsur@s2311378.eu-fsn-3.betterstackdata.com/2311378` |
| `coach-os-frontend` | 2311384 | Next.js | `https://3S9TgQitHA414KPojpZxhKxz@s2311384.eu-fsn-3.betterstackdata.com/2311384` |

> Os DSNs são públicos por natureza (ficam no bundle do frontend) — não tratá-los como secrets.

Para visualizar: [https://errors.betterstack.com](https://errors.betterstack.com)

**Status atual:** as applications foram criadas mas o SDK ainda **não foi integrado** ao código. Ver seção [Próximos Passos](#próximos-passos---sdk-de-erros) abaixo.

---

## Variáveis de Ambiente

### No arquivo `.env` (raiz do projeto — usado pelo `docker-compose.yml`)

Estas variáveis são passadas para o container `otel-collector`:

```env
# Source: coach-os-backend (ID: 2311390)
BETTERSTACK_BACKEND_TOKEN=o6mPD6hRftzAgzKWA3Fkap3P
BETTERSTACK_BACKEND_HOST=s2311390.eu-fsn-3.betterstackdata.com

# Source: coach-os-frontend (ID: 2311393)
BETTERSTACK_FRONTEND_TOKEN=CyMUBYZmkuhVXT9e5NNBCmuU
BETTERSTACK_FRONTEND_HOST=s2311393.eu-fsn-3.betterstackdata.com

# Source: coach-os-infra (ID: 2311396)
BETTERSTACK_INFRA_TOKEN=q8JJ7VnESbdTtz3SkuQz6RCe
BETTERSTACK_INFRA_HOST=s2311396.eu-fsn-3.betterstackdata.com

# DSNs de error tracking
BETTERSTACK_BACKEND_DSN=https://4t2zrcaZEvK32tXR6SkpAsur@s2311378.eu-fsn-3.betterstackdata.com/2311378
BETTERSTACK_FRONTEND_DSN=https://3S9TgQitHA414KPojpZxhKxz@s2311384.eu-fsn-3.betterstackdata.com/2311384
```

O arquivo `.env.example` na raiz do projeto já contém todos esses valores preenchidos como referência.

### No `otel-collector.yml`

O coletor lê as variáveis via sintaxe `${env:VAR_NAME}` — **não precisa editar o arquivo**:

```yaml
headers:
  Authorization: "Bearer ${env:BETTERSTACK_BACKEND_TOKEN}"
```

---

## Onde Cadastrar Cada Configuração

### Servidor de Produção (`/opt/coach-os/.env`)

```bash
# Copiar o template e preencher
cp .env.example .env
```

Variáveis que precisam estar neste arquivo:

| Variável | Obrigatório | Observação |
|----------|-------------|-----------|
| `BETTERSTACK_BACKEND_TOKEN` | Sim | Já preenchido no `.env.example` |
| `BETTERSTACK_BACKEND_HOST` | Sim | Já preenchido no `.env.example` |
| `BETTERSTACK_FRONTEND_TOKEN` | Sim | Já preenchido no `.env.example` |
| `BETTERSTACK_FRONTEND_HOST` | Sim | Já preenchido no `.env.example` |
| `BETTERSTACK_INFRA_TOKEN` | Sim | Já preenchido no `.env.example` |
| `BETTERSTACK_INFRA_HOST` | Sim | Já preenchido no `.env.example` |
| `POSTGRES_DB` | Sim | Nome do banco |
| `POSTGRES_USER` | Sim | Usuário do banco |
| `POSTGRES_PASSWORD` | Sim | Senha forte |

### Frontend (`frontend/.env.local` no servidor)

```env
NEXT_PUBLIC_BETTERSTACK_DSN=https://3S9TgQitHA414KPojpZxhKxz@s2311384.eu-fsn-3.betterstackdata.com/2311384
```

Necessário quando o SDK de erros do frontend for integrado.

### Backend (`backend/.env` no servidor)

```env
BETTERSTACK_BACKEND_DSN=https://4t2zrcaZEvK32tXR6SkpAsur@s2311378.eu-fsn-3.betterstackdata.com/2311378
```

Necessário quando o SDK de erros do backend for integrado.

---

## Alertas no Better Stack

Os alertas são configurados diretamente na interface do Better Stack em [https://uptime.betterstack.com](https://uptime.betterstack.com).

### Alertas recomendados para configurar

**1. Monitor de Uptime HTTP**

Acesse: Uptime → **Monitors** → New Monitor

| Campo | Valor |
|-------|-------|
| URL | `https://api.coachos.com.br/api/v1/health` |
| Tipo | HTTP |
| Frequência | 1 minuto |
| Threshold | 3 falhas consecutivas |
| Notificação | Email + Slack (se configurado) |

**2. Alertas de Log (anomalias)**

Acesse: Logs → source `coach-os-backend` → **Alerts** → New Alert

| Alerta | Condição | Threshold |
|--------|----------|-----------|
| Erros críticos | `level == "error"` | > 5 ocorrências em 5 min |
| Falha de banco | `message contains "database"` | qualquer ocorrência |
| Stripe webhook falhou | `message contains "stripe" AND level == "error"` | qualquer ocorrência |

**3. Alertas de Métricas (infra)**

Acesse: Telemetry → source `coach-os-infra` → **Dashboards** → criar dashboard

Métricas sugeridas para monitorar:
- `system.cpu.utilization` > 80% por mais de 5 minutos
- `system.memory.utilization` > 85%
- `system.filesystem.utilization` > 90% (disco cheio)
- `process.cpu.utilization` (por processo `node`)

---

## Verificando se a Observabilidade Está Funcionando

### 1. Verificar se o OTel Collector está rodando

```bash
docker compose ps otel-collector
docker compose logs otel-collector --tail=50
```

### 2. Verificar se o Beyla detectou o backend

```bash
docker compose logs beyla --tail=20
# Esperado: "Instrumenting process ... port 30001"
```

### 3. Verificar logs chegando no Better Stack

```bash
# Fazer uma requisição ao backend
curl http://localhost:30001/api/v1/health

# No Better Stack Logs → coach-os-backend, aguardar ~10 segundos
# O log da requisição deve aparecer
```

### 4. Verificar métricas

Acesse Better Stack → Telemetry → source `coach-os-infra` → Explore.
Execute a query: `SELECT * FROM "coach_os_infra" LIMIT 10`

### 5. Verificar traces

Acesse Better Stack → Telemetry → source `coach-os-infra` → Explore.
Filtre por `span.name` para ver os spans HTTP capturados pelo Beyla.

---

## Próximos Passos — SDK de Erros

As applications de error tracking foram criadas no Better Stack, mas o SDK ainda precisa ser integrado ao código.

### Backend (NestJS)

```bash
cd backend
npm install @sentry/nestjs @sentry/profiling-node
```

Criar `backend/src/instrument.ts`:

```typescript
import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.BETTERSTACK_BACKEND_DSN,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
});
```

Importar no topo de `main.ts` (antes de qualquer outro import):

```typescript
import "./instrument";
```

### Frontend (Next.js)

```bash
cd frontend
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

O wizard do Sentry configura automaticamente:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- Ajustes no `next.config.ts`

Usar o DSN: `https://3S9TgQitHA414KPojpZxhKxz@s2311384.eu-fsn-3.betterstackdata.com/2311384`

---

## Referências

- [Better Stack Docs — OpenTelemetry](https://betterstack.com/docs/logs/open-telemetry/)
- [Grafana Beyla Docs](https://grafana.com/docs/beyla/latest/)
- [OTel Collector Contrib — docker_observer](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/observer/dockerobserver)
- [OTel Collector Contrib — receiver_creator](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/receivercreator)
- [OTel Collector Contrib — hostmetrics](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/hostmetricsreceiver)
