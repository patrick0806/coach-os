# Epic 09 — Freemium e Conversao

Status: `[ ]` todo

---

## US-021 — Trial de 30 dias para novos personals

**Status:** `[ ]` todo
**Sprint:** 7
**Dependencias:** US-001, US-016

**Descricao:**
Como personal recem-cadastrado, quero usar a plataforma por 30 dias gratis para avaliar o produto antes de assinar.

### Criterios de Aceite
- [ ] Todo novo personal inicia com trial de 30 dias automaticamente
- [ ] API de assinatura retorna status `trialing` com `trialEndsAt`
- [ ] Quando trial expira, status muda para `expired` se nao houver assinatura ativa
- [ ] Datas de trial aparecem no painel de assinatura
- [ ] Status de acesso do tenant e reutilizado para controlar acesso de personal e alunos

### Diretivas de Implementacao
- Migration em `personals`:
  - `trialStartedAt` (timestamp)
  - `trialEndsAt` (timestamp)
  - `accessStatus` (`trialing | active | past_due | expired | canceled`)
- Centralizar regra de status de acesso em service unico
- Nao quebrar compatibilidade com `subscriptionStatus` atual

### Subtasks Backend
- [ ] Migration para campos de trial/acesso
- [ ] Atualizar fluxo de cadastro para iniciar trial
- [ ] Atualizar `GET /subscriptions/me` para incluir trial
- [ ] Job/rotina de reconciliacao para expiracao de trial (ou regra lazy on-read)
- [ ] Unit tests para inicio e expiracao de trial

### Subtasks Frontend
- [ ] Atualizar `/painel/assinatura` com card de trial (dias restantes)
- [ ] Badge visual para `trialing`, `expired`, `past_due`, `active`
- [ ] CTA de upgrade na pagina de assinatura durante trial

---

## US-022 — Bloqueio de recursos apos trial expirar

**Status:** `[ ]` todo
**Sprint:** 7
**Dependencias:** US-021

**Descricao:**
Como dono da plataforma, quero bloquear o acesso do tenant inteiro (personal e alunos) quando o trial expirar ou houver inadimplencia, para manter o modelo de assinatura.

### Criterios de Aceite
- [ ] Personal com acesso expirado/inadimplente nao consegue acessar o painel (leitura e escrita)
- [ ] Alunos vinculados ao personal tambem perdem acesso ao portal (`/{slug}/alunos/*`)
- [ ] Login pode autenticar, mas o acesso deve ser barrado por status do tenant com mensagem clara
- [ ] Mensagem de bloqueio orienta regularizacao da assinatura
- [ ] Bloqueio aplicado no backend (nao so frontend), cobrindo personal e student

### Subtasks Backend
- [ ] Criar guard/policy `TenantAccessGuard` validando status de acesso do personal dono do tenant
- [ ] Aplicar guard em rotas `PERSONAL` e `STUDENT` (exceto auth, checkout e webhook)
- [ ] Padronizar erro de negocio para tenant bloqueado (`trial_expired`, `payment_required`, `subscription_inactive`)
- [ ] Unit tests por modulo para cobrir bloqueio para personal e aluno

### Subtasks Frontend
- [ ] Interceptar erro de tenant bloqueado e redirecionar para tela de bloqueio
- [ ] Tela de bloqueio no painel do personal com CTA para `/painel/assinatura`
- [ ] Tela de bloqueio no portal do aluno explicando indisponibilidade temporaria
- [ ] Banner preventivo quando faltarem <= 7 dias de trial

### Rollout Tecnico — Guard por Prioridade

**Excecoes (nao bloquear):**
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/setup-password`
- Billing: `POST /subscriptions/checkout`, `POST /subscriptions/webhook`, `GET /subscriptions/me`
- Publico: `GET /personals/:slug/public`, landing pages

**P0 — Bloqueio imediato (core operacional)**
- Backend PERSONAL:
  - `POST/GET/PATCH/DELETE /students*`
  - `POST/GET/PATCH/DELETE /workout-plans*` e `/:id/exercises*`, `/:id/students*`
  - `POST/GET/PATCH/DELETE /availability*`
  - `POST/GET/PATCH/DELETE /service-plans*`
  - `GET/PATCH /bookings*` (`/bookings`, `/bookings/:id`, `/bookings/:id/status`, `/bookings/:id/cancel`)
- Backend STUDENT:
  - `GET /bookings/me`, `GET /bookings/available-slots`, `POST /bookings`
  - `GET /students/me/workout-plans`, `GET /students/me/workout-plans/:planId`
- Frontend rotas:
  - Personal: `/painel`, `/painel/alunos*`, `/painel/treinos*`, `/painel/agenda*`, `/painel/planos-servico`, `/painel/perfil`
  - Aluno: `/{slug}/alunos/painel`, `/{slug}/alunos/treinos*`, `/{slug}/alunos/agenda`

**P1 — Experiencia de bloqueio e redirecionamento**
- Middleware/frontend:
  - Redirecionar PERSONAL bloqueado para `/painel/bloqueado` com CTA `/painel/assinatura`
  - Redirecionar STUDENT bloqueado para `/{slug}/alunos/bloqueado`
- API client:
  - Mapear erro `tenant_blocked` e evitar loops de refresh/login

**P2 — Endurecimento**
- Bloquear tambem uploads de perfil e imagens quando tenant bloqueado:
  - `POST /personals/me/profile/upload`
- Auditar endpoints administrativos internos que possam ser usados por PERSONAL/STUDENT

---

## US-023 — Checklist de onboarding para ativacao do personal

**Status:** `[ ]` todo
**Sprint:** 8
**Dependencias:** US-021

**Descricao:**
Como personal novo, quero um checklist simples para configurar rapidamente minha conta e perceber valor nos primeiros dias.

### Criterios de Aceite
- [ ] Checklist com etapas: completar perfil, criar 1 aluno, criar 1 treino, criar 1 sessao
- [ ] Progresso em percentual no dashboard `/painel`
- [ ] Cada item aponta para rota de acao direta
- [ ] Quando tudo completo, esconder checklist e exibir mensagem de parabens

### Subtasks Backend
- [ ] Endpoint `GET /onboarding/progress` com status das etapas
- [ ] Reutilizar dados existentes (sem novas tabelas inicialmente)
- [ ] Unit tests do calculo de progresso

### Subtasks Frontend
- [ ] Widget no dashboard do personal com progresso e links
- [ ] Estados: vazio, parcial, completo
- [ ] Persistencia de "dispensar card" opcional no frontend
