# Configuração do GitHub — Coach OS

Guia completo de tudo que precisa ser configurado no repositório GitHub para que o CI/CD funcione.

---

## Índice

1. [Branch Protection](#1-branch-protection)
2. [Secrets do GitHub Actions](#2-secrets-do-github-actions)
3. [Environment de produção](#3-environment-de-produção)
4. [Onde obter cada valor](#4-onde-obter-cada-valor)

---

## 1. Branch Protection

Impede que código com testes quebrados seja mergeado na `main`.

**Onde configurar:**
`github.com/patrick0806/coach-os` → **Settings** → **Branches** → **Add branch ruleset**

> Caso o repositório use a interface antiga: **Add rule** em vez de **Add branch ruleset**.

### Configuração da regra

| Campo | Valor |
|-------|-------|
| Branch name pattern | `main` |

Marque as seguintes opções:

- [x] **Require a pull request before merging**
  - [x] Required approvals: `1`
  - [x] Dismiss stale pull request approvals when new commits are pushed
- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Adicionar os checks (campo de busca):
    - `Backend Quality`
    - `Frontend Quality`
- [x] **Block force pushes**
- [x] **Do not allow bypassing the above settings**

> **Atenção:** os nomes `Backend Quality` e `Frontend Quality` só aparecem no campo de busca **depois que o CI rodar pela primeira vez** no repositório. Se ainda não rodou, crie um PR de teste primeiro e depois volte para configurar.

---

## 2. Secrets do GitHub Actions

**Onde configurar:**
`github.com/patrick0806/coach-os` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Tabela completa de secrets

| Secret | Obrigatório | Descrição | De onde vem |
|--------|-------------|-----------|-------------|
| `DEPLOY_HOST` | ✅ | IP público ou hostname do servidor | Painel do provedor de VM |
| `DEPLOY_USER` | ✅ | Usuário SSH do servidor | `deploy` (criado no SERVER_SETUP.md) |
| `DEPLOY_SSH_KEY` | ✅ | Chave SSH privada para acesso ao servidor | Gerado localmente (ver abaixo) |
| `DEPLOY_PORT` | ✅ | Porta SSH do servidor | `22` na maioria dos casos |
| `GHCR_TOKEN` | ✅ | GitHub PAT para o servidor baixar imagens do GHCR | Gerado no GitHub (ver abaixo) |

---

## 3. Environment de produção

O job `deploy` no CD usa um **GitHub Environment** chamado `production`. Isso permite adicionar aprovação manual e proteções adicionais.

**Onde configurar:**
**Settings** → **Environments** → **New environment**

| Campo | Valor |
|-------|-------|
| Nome | `production` |

Configurações recomendadas dentro do environment:

- [x] **Required reviewers** → adicionar seu usuário (exige aprovação antes de cada deploy)
- [x] **Prevent self-review** (se tiver time)
- **Wait timer**: 0 minutos (ou 5 se quiser janela de cancelamento)

> Se preferir deploys automáticos sem aprovação, deixe **Required reviewers** desmarcado.

---

## 4. Onde obter cada valor

---

### `DEPLOY_HOST`

O IP público da sua VM.

**Hetzner:** Console → Server → IP address (coluna IPv4)
**DigitalOcean:** Droplets → seu droplet → IP address
**AWS EC2:** EC2 → Instances → Public IPv4 address

Valor exemplo: `49.12.123.45`

---

### `DEPLOY_USER`

O usuário SSH criado no servidor. Se seguiu o `SERVER_SETUP.md`, é `deploy`.

Valor: `deploy`

---

### `DEPLOY_SSH_KEY`

Chave privada SSH usada para o GitHub Actions se conectar ao servidor.

**Passo a passo:**

```bash
# 1. No seu computador local, gerar um par de chaves dedicado ao deploy
#    (não use sua chave pessoal)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/coach-os-deploy
# Pressionar Enter nas perguntas (sem passphrase)

# Dois arquivos serão criados:
#   ~/.ssh/coach-os-deploy      ← chave PRIVADA (vai para o GitHub Secret)
#   ~/.ssh/coach-os-deploy.pub  ← chave PÚBLICA (vai para o servidor)
```

```bash
# 2. Adicionar a chave pública no servidor
ssh-copy-id -i ~/.ssh/coach-os-deploy.pub deploy@IP_DA_VM

# Ou manualmente no servidor:
# cat ~/.ssh/coach-os-deploy.pub | ssh deploy@IP_DA_VM "cat >> ~/.ssh/authorized_keys"
```

```bash
# 3. Testar a conexão
ssh -i ~/.ssh/coach-os-deploy deploy@IP_DA_VM
# Deve conectar sem pedir senha
```

```bash
# 4. Ver o conteúdo da chave privada para copiar para o GitHub
cat ~/.ssh/coach-os-deploy
```

O valor do secret deve incluir **todo o conteúdo**, incluindo as linhas de header e footer:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAA...
(várias linhas)
...AAAAB3NzaC1yc2EAAAADAQAB
-----END OPENSSH PRIVATE KEY-----
```

Cole esse conteúdo completo no secret `DEPLOY_SSH_KEY`.

---

### `DEPLOY_PORT`

A porta SSH do servidor. Na maioria dos provedores é `22`.

Para verificar no servidor:
```bash
sudo grep "^Port" /etc/ssh/sshd_config
# Se não aparecer nada, a porta padrão é 22
```

Valor: `22`

---

### `GHCR_TOKEN`

Personal Access Token do GitHub com permissão de leitura de packages. Usado pelo servidor para fazer `docker pull` das imagens privadas.

**Passo a passo:**

1. Acesse [github.com](https://github.com) → clique no **avatar** (canto superior direito) → **Settings**
2. No menu lateral, vá em **Developer settings** (última opção)
3. Clique em **Personal access tokens** → **Tokens (classic)**
4. Clique em **Generate new token** → **Generate new token (classic)**
5. Preencha:
   - **Note:** `coach-os-ghcr-deploy`
   - **Expiration:** `No expiration` (ou 1 year com lembrete para renovar)
   - **Scopes:** marque apenas `read:packages`
6. Clique em **Generate token**
7. **Copie o token imediatamente** — ele só aparece uma vez

O token tem formato: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

Cole esse valor no secret `GHCR_TOKEN`.

> **Por que `read:packages` e não `write:packages`?**
> O servidor só precisa baixar imagens (`docker pull`). O GitHub Actions usa o `GITHUB_TOKEN` automático para fazer o push — não precisa de PAT para isso.

---

## Verificando se tudo está configurado

Após configurar os secrets, faça um push para `main` (ou merge de um PR) e acompanhe:

**Aba Actions** → workflow **CI** → deve rodar `Backend Quality` e `Frontend Quality`

**Aba Actions** → workflow **CD** → deve rodar após CI passar:
- Job `check-ci` → passa automaticamente
- Job `build-images` → constrói e faz push para GHCR
- Job `deploy` → (aguarda aprovação se configurou Required reviewers) → SSH no servidor

**Para ver as imagens publicadas no GHCR:**
`github.com/patrick0806/coach-os` → **Packages** (menu lateral direito)

---

## Checklist final

Antes do primeiro deploy automatizado, confirme:

- [ ] Secret `DEPLOY_HOST` criado com o IP da VM
- [ ] Secret `DEPLOY_USER` criado com `deploy`
- [ ] Secret `DEPLOY_SSH_KEY` criado com a chave privada completa
- [ ] Secret `DEPLOY_PORT` criado com `22`
- [ ] Secret `GHCR_TOKEN` criado com o PAT
- [ ] Chave pública adicionada em `/home/deploy/.ssh/authorized_keys` no servidor
- [ ] Conexão SSH testada manualmente: `ssh -i ~/.ssh/coach-os-deploy deploy@IP`
- [ ] Servidor com Docker instalado e diretório `/opt/coach-os` criado
- [ ] Arquivos `.env` configurados no servidor (ver `SERVER_SETUP.md`)
- [ ] Branch protection configurada em `main` com os status checks
- [ ] Environment `production` criado no GitHub
- [ ] CI rodou ao menos uma vez (para os job names aparecerem no branch protection)
