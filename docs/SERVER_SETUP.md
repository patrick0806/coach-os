# Configuração do Servidor (VM) — Coach OS

Guia completo para preparar o servidor do zero até o primeiro deploy funcionando.

---

## Pré-requisitos

- VM com **Ubuntu 22.04 LTS** (recomendado) — mínimo 2 vCPU, 4 GB RAM, 40 GB disco
- Acesso root ou usuário com sudo
- Domínio `coachos.com.br` apontando para o IP da VM
- Conta no Cloudflare gerenciando o DNS do domínio (necessário para SSL wildcard)

---

## Índice

1. [Configuração inicial do sistema](#1-configuração-inicial-do-sistema)
2. [Instalar Docker](#2-instalar-docker)
3. [Instalar Nginx](#3-instalar-nginx)
4. [Instalar certificado SSL (Cloudflare Origin Certificate)](#4-instalar-certificado-ssl-cloudflare-origin-certificate)
5. [Configurar Nginx](#5-configurar-nginx)
6. [Preparar o projeto](#6-preparar-o-projeto)
7. [Configurar variáveis de ambiente](#7-configurar-variáveis-de-ambiente)
8. [Autenticar no GHCR](#8-autenticar-no-ghcr)
9. [Primeiro deploy manual](#9-primeiro-deploy-manual)
10. [Verificar funcionamento](#10-verificar-funcionamento)

---

## 1. Configuração inicial do sistema

```bash
# Atualizar pacotes
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl git unzip ufw

# Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Criar usuário de deploy (não usar root para o projeto)
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG sudo deploy
sudo usermod -aG docker deploy   # adicionar ao grupo docker (após instalar Docker)

# Adicionar sua chave SSH pública ao usuário deploy
sudo mkdir -p /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
# Colar aqui o conteúdo de ~/.ssh/id_ed25519.pub (ou a chave que você usa)
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

---

## 2. Instalar Docker

```bash
# Adicionar repositório oficial do Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalação
docker --version
docker compose version

# Iniciar Docker e habilitar no boot
sudo systemctl enable --now docker

# Adicionar usuário deploy ao grupo docker (se ainda não fez)
sudo usermod -aG docker deploy

# Aplicar grupo sem precisar fazer logout (na sessão atual)
newgrp docker
```

---

## 3. Instalar Nginx

```bash
sudo apt install -y nginx

sudo systemctl enable --now nginx

# Verificar
curl -I http://localhost
# Esperado: HTTP/1.1 200 OK (página padrão do Nginx)
```

---

## 4. Instalar certificado SSL (Cloudflare Origin Certificate)

Usamos o **Cloudflare Origin Certificate** em vez do Certbot. Vantagens:
- Válido por 15 anos — sem renovação automática necessária
- Suporta wildcard `*.coachos.com.br` nativamente
- Zero configuração de DNS challenge ou plugins

### 4.1 Ativar Full (strict) no Cloudflare

No painel do Cloudflare → seu domínio → **SSL/TLS → Overview** → selecionar **Full (strict)**.

Isso garante que a conexão entre Cloudflare e sua VM seja criptografada e validada com o Origin Certificate.

### 4.2 Emitir o Origin Certificate

No painel do Cloudflare → **SSL/TLS → Origin Server** → **Create Certificate**:

- Deixar **"Let Cloudflare generate a key and CSR"** selecionado
- Confirmar que os hostnames incluem `coachos.com.br` e `*.coachos.com.br`
- Validade: **15 years**
- Clicar em **Create**

O Cloudflare exibirá dois blocos de texto — **copie ambos agora** (a Private Key não é exibida novamente):
- **Origin Certificate** → será o `cert.pem`
- **Private Key** → será o `key.pem`

### 4.3 Instalar os certificados na VM

```bash
# Criar diretório para os certificados
sudo mkdir -p /etc/ssl/coachos
```

Cole o conteúdo de cada arquivo (use o editor de sua preferência):

```bash
sudo nano /etc/ssl/coachos/cert.pem   # colar o Origin Certificate
sudo nano /etc/ssl/coachos/key.pem    # colar a Private Key
```

Proteger a chave privada:

```bash
sudo chmod 644 /etc/ssl/coachos/cert.pem
sudo chmod 600 /etc/ssl/coachos/key.pem
```

**Caminhos finais:**
- `/etc/ssl/coachos/cert.pem`
- `/etc/ssl/coachos/key.pem`

---

## 5. Configurar Nginx

### 5.1 Criar configuração principal

```bash
sudo nano /etc/nginx/sites-available/coachos
```

Cole o conteúdo abaixo:

```nginx
# ─────────────────────────────────────────
# Redirecionar HTTP → HTTPS (todos os domínios)
# ─────────────────────────────────────────
server {
    listen 80;
    listen [::]:80;
    server_name coachos.com.br www.coachos.com.br *.coachos.com.br;

    return 301 https://$host$request_uri;
}

# ─────────────────────────────────────────
# Principal — coachos.com.br + www
# Frontend em / e Backend em /api/*
# ─────────────────────────────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name coachos.com.br www.coachos.com.br;

    ssl_certificate     /etc/ssl/coachos/cert.pem;
    ssl_certificate_key /etc/ssl/coachos/key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Backend — qualquer coisa que comece com /api/
    # Cobre: /api/v1/*, /api/v2/*, /api/docs, etc.
    location ~ ^/api/ {
        proxy_pass         http://localhost:30001;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;

        # Limite de tamanho do body (uploads)
        client_max_body_size 10M;

        # Timeouts para operações longas
        proxy_read_timeout    60s;
        proxy_connect_timeout 10s;
    }

    # Frontend — todo o restante
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# ─────────────────────────────────────────
# Wildcard — *.coachos.com.br → Frontend
# Subdomínios por coach (ex: joao.coachos.com.br)
# O Next.js proxy.ts faz o roteamento interno
# ─────────────────────────────────────────
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name *.coachos.com.br;

    ssl_certificate     /etc/ssl/coachos/cert.pem;
    ssl_certificate_key /etc/ssl/coachos/key.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5.2 Ativar configuração

```bash
# Criar symlink para ativar o site
sudo ln -s /etc/nginx/sites-available/coachos /etc/nginx/sites-enabled/coachos

# Remover configuração padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração (não pode ter erros)
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

### 5.3 Configurar DNS no Cloudflare

No painel do Cloudflare, configure os seguintes registros para o domínio `coachos.com.br`:

| Tipo | Nome | Conteúdo | Proxy |
|------|------|----------|-------|
| A | `@` | IP_DA_VM | ☁️ Proxied |
| A | `www` | IP_DA_VM | ☁️ Proxied |
| A | `*` | IP_DA_VM | ☁️ Proxied |

> Todos os registros ficam com proxy **ativado** (ícone laranja). O Cloudflare termina o SSL para o usuário e usa o Origin Certificate para se comunicar com a VM de forma segura (Full strict).
>
> Não há registro `api` separado — backend e frontend estão no mesmo domínio (`coachos.com.br`), roteados pelo Nginx via path (`/api/*` → backend, restante → frontend).

---

## 6. Preparar o projeto

```bash
# Criar diretório do projeto
sudo mkdir -p /opt/coach-os/monitoring
sudo chown -R deploy:deploy /opt/coach-os

# Conectar como usuário deploy
su - deploy
cd /opt/coach-os
```

Copie do seu computador local para o servidor os arquivos necessários:

```bash
# Do seu computador local (não do servidor):
scp docker-compose.yml deploy@IP_DA_VM:/opt/coach-os/
scp monitoring/otel-collector.yml deploy@IP_DA_VM:/opt/coach-os/monitoring/
scp .env.example deploy@IP_DA_VM:/opt/coach-os/
```

Ou crie diretamente no servidor:

```bash
# No servidor, como usuário deploy:
nano /opt/coach-os/docker-compose.yml   # colar conteúdo do repositório
nano /opt/coach-os/monitoring/otel-collector.yml
```

---

## 7. Configurar variáveis de ambiente

### 7.1 Arquivo principal — `/opt/coach-os/.env`

Usado pelo `docker-compose.yml` (postgres, otel-collector, frontend DSN):

```bash
nano /opt/coach-os/.env
```

```env
# ── PostgreSQL
POSTGRES_DB=coachos
POSTGRES_USER=coachos
POSTGRES_PASSWORD=senha_forte_aqui_min_32_chars

# ── Better Stack — backend logs (source ID: 2311390)
BETTERSTACK_BACKEND_TOKEN=o6mPD6hRftzAgzKWA3Fkap3P
BETTERSTACK_BACKEND_HOST=s2311390.eu-fsn-3.betterstackdata.com

# ── Better Stack — frontend logs (source ID: 2311393)
BETTERSTACK_FRONTEND_TOKEN=CyMUBYZmkuhVXT9e5NNBCmuU
BETTERSTACK_FRONTEND_HOST=s2311393.eu-fsn-3.betterstackdata.com

# ── Better Stack — infra/traces (source ID: 2311396)
BETTERSTACK_INFRA_TOKEN=q8JJ7VnESbdTtz3SkuQz6RCe
BETTERSTACK_INFRA_HOST=s2311396.eu-fsn-3.betterstackdata.com

# ── Error tracking DSNs
BETTERSTACK_BACKEND_DSN=https://4t2zrcaZEvK32tXR6SkpAsur@s2311378.eu-fsn-3.betterstackdata.com/2311378
BETTERSTACK_FRONTEND_DSN=https://3S9TgQitHA414KPojpZxhKxz@s2311384.eu-fsn-3.betterstackdata.com/2311384
```

### 7.2 Backend — `/opt/coach-os/backend/.env`

```bash
mkdir -p /opt/coach-os/backend
nano /opt/coach-os/backend/.env
```

```env
NODE_ENV=production
PORT=30001

# ── Banco de dados
# Host é o nome do serviço no docker-compose (não localhost)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=coachos
DATABASE_PASSWORD=senha_forte_aqui_min_32_chars   # igual ao POSTGRES_PASSWORD
DATABASE_NAME=coachos
DATABASE_SSL=false

# ── JWT (gerar valores únicos — mínimo 32 caracteres cada)
JWT_SECRET=gere_aqui_um_segredo_aleatorio_com_min_32_chars
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=outro_segredo_aleatorio_diferente_min_32_chars
JWT_REFRESH_EXPIRATION=7d

# ── Segurança de senha
HASH_PEPPER=mais_um_segredo_aleatorio_diferente_min_32_chars

# ── AWS S3 (para upload de fotos)
AWS_ACCESS_KEY_ID=sua_access_key_id
AWS_SECRET_ACCESS_KEY=sua_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=nome-do-seu-bucket

# ── Resend (emails transacionais)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
APP_URL=https://coachos.com.br
SUPPORT_EMAIL=suporte@coachos.com.br

# ── Stripe (pagamentos)
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_BASICO=price_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_PRO=price_xxxxxxxxxxxxxxxxxxxxxxxxxx
STRIPE_PRICE_EMPRESARIAL=price_xxxxxxxxxxxxxxxxxxxxxxxxxx

# ── Admin
CAN_CREATE_ADMIN=false
```

> **Como gerar segredos JWT/HASH seguros:**
> ```bash
> # Rodar no terminal (gera string aleatória de 64 chars)
> openssl rand -hex 32
> ```
> Rodar 3 vezes para ter valores distintos para `JWT_SECRET`, `JWT_REFRESH_SECRET` e `HASH_PEPPER`.

### 7.3 Frontend — `/opt/coach-os/frontend/.env.local`

```bash
mkdir -p /opt/coach-os/frontend
nano /opt/coach-os/frontend/.env.local
```

```env
NEXT_PUBLIC_API_URL=https://api.coachos.com.br
NEXT_PUBLIC_BETTERSTACK_DSN=https://3S9TgQitHA414KPojpZxhKxz@s2311384.eu-fsn-3.betterstackdata.com/2311384
NEXT_PUBLIC_SHOW_TUTORIAL=true
```

### 7.4 Proteger os arquivos de ambiente

```bash
chmod 600 /opt/coach-os/.env
chmod 600 /opt/coach-os/backend/.env
chmod 600 /opt/coach-os/frontend/.env.local
```

---

## 8. Autenticar no GHCR

O servidor precisa de um token para baixar as imagens privadas do GitHub Container Registry.

```bash
# Usar o GHCR_TOKEN gerado (ver docs/GITHUB_SETUP.md)
echo "SEU_GHCR_TOKEN" | docker login ghcr.io -u SEU_USUARIO_GITHUB --password-stdin

# Verificar
docker pull ghcr.io/patrick0806/coach-os/backend:latest
```

> Esta autenticação fica salva em `~/.docker/config.json` e é persistente — não precisa repetir a cada deploy. O pipeline de CD re-autentica automaticamente em cada execução.

---

## 9. Primeiro deploy manual

```bash
cd /opt/coach-os

# Baixar imagens (na primeira vez pode demorar alguns minutos)
docker compose pull

# Subir todos os serviços
docker compose up -d

# Acompanhar logs ao vivo
docker compose logs -f
```

Sequência esperada:
1. `postgres` sobe e fica saudável
2. `migrate` roda e aplica as migrations (deve finalizar com `Migration completed`)
3. `backend` sobe na porta 30001
4. `frontend` sobe na porta 3000
5. `otel-collector` inicia coleta de logs e métricas
6. `beyla` detecta o processo na porta 30001

---

## 10. Verificar funcionamento

```bash
# Status de todos os containers
docker compose ps

# Verificar backend
curl http://localhost:30001/api/v1/health

# Verificar frontend
curl -I http://localhost:3000

# Verificar via Nginx (HTTPS)
curl -I https://coachos.com.br
curl -I https://coachos.com.br/api/v1/health

# Verificar wildcard (quando subdomínios estiverem em uso)
curl -I https://teste.coachos.com.br

# Ver logs de um serviço específico
docker compose logs backend --tail=50
docker compose logs migrate --tail=20
```

---


## Resumo de portas

| Serviço | Porta interna | Exposta externamente via |
|---------|--------------|--------------------------|
| Frontend (Next.js) | 3000 | Nginx → `coachos.com.br` + `*.coachos.com.br` (path `/`) |
| Backend (NestJS) | 30001 | Nginx → `coachos.com.br` (path `/api/*`) |
| PostgreSQL | 5432 | Não exposta (apenas interno Docker) |
| OTel Collector gRPC | 4317 | Não exposta (apenas interno Docker) |
| OTel Collector HTTP | 4318 | Não exposta (apenas interno Docker) |

---

## Comandos úteis do dia a dia

```bash
# Ver status dos containers
docker compose -f /opt/coach-os/docker-compose.yml ps

# Reiniciar um serviço específico
docker compose -f /opt/coach-os/docker-compose.yml restart backend

# Ver logs em tempo real
docker compose -f /opt/coach-os/docker-compose.yml logs -f backend

# Rodar migration manualmente (se necessário)
docker compose -f /opt/coach-os/docker-compose.yml run --rm migrate

# Parar tudo (sem apagar dados)
docker compose -f /opt/coach-os/docker-compose.yml down

# ⚠️ NUNCA rodar em produção — apaga todos os dados
# docker compose down -v
```
