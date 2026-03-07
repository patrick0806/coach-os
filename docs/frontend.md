# Frontend — Guia de Implementação

> **Contexto:** O backend está 100% implementado. Este documento é o contrato operacional
> que o agente frontend precisa para consumir a API sem ambiguidades.

---

## Stack e Dependências

### Já instalado no projeto

| Pacote | Versão |
|--------|--------|
| Next.js | 16.x |
| React | 19.x |
| Tailwind CSS | 4 |
| Lucide React | 0.577+ |
| shadcn/ui (components) | ver abaixo |

### Componentes shadcn/ui já instalados

```
alert-dialog, badge, button, card, combobox, dropdown-menu,
field, input-group, input, label, select, separator, textarea
```

### Pacotes a instalar antes de começar

```bash
# HTTP client
npm install axios

# Data fetching / cache
npm install @tanstack/react-query @tanstack/react-query-devtools

# Formulários e validação
npm install react-hook-form zod @hookform/resolvers

# Gráficos (US-020 Admin Dashboard)
npm install recharts

# shadcn adicionais conforme necessidade
npx shadcn@latest add table tabs dialog toast skeleton progress switch
```

---

## Variáveis de Ambiente

Crie `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## API — Configuração Base

- **Base URL:** `http://localhost:3000/api/v1`
- **Swagger (docs completos):** `http://localhost:3000/api/docs`
- **Versioning:** URI-based — todas as rotas têm prefixo `/v1`
- **Content-Type:** `application/json` (exceto upload de imagem: `multipart/form-data`)

---

## Autenticação

### Fluxo completo

```
1. POST /auth/login → { accessToken, role, personalSlug } + cookie refreshToken (httpOnly)
2. Armazenar accessToken em MEMÓRIA (não localStorage — risco XSS)
3. Enviar em toda request protegida: Authorization: Bearer <accessToken>
4. accessToken expira em 15 minutos → interceptor detecta 401 → chama POST /auth/refresh
5. POST /auth/refresh (cookie refreshToken enviado automaticamente) → novo accessToken
6. Retry da request original com novo token
7. POST /auth/logout → limpa cookie refreshToken no servidor
```

### Estratégia de armazenamento de token

```ts
// ✅ Correto: armazenar em memória (React Context / useRef)
// O refreshToken está em cookie httpOnly — o browser o envia automaticamente
// O accessToken some ao fechar a aba — o refresh token reautentica na próxima visita

// ❌ Nunca fazer:
localStorage.setItem('accessToken', token) // vulnerável a XSS
```

### JWT Payload decodificado (`IAccessToken`)

```ts
interface IAccessToken {
  sub: string;           // users.id (email do user)
  role: 'PERSONAL' | 'STUDENT' | 'ADMIN';
  profileId: string;     // personals.id | students.id | admins.id
  personalId: string | null; // tenant — null apenas para ADMIN
  personalSlug: string | null; // slug do personal — disponível para STUDENT também
}
```

### Redirect pós-login por role

| Role | Redirect |
|------|----------|
| `PERSONAL` | `/dashboard` |
| `STUDENT` | `/{personalSlug}/students/dashboard` |
| `ADMIN` | `/admin` |

O campo `personalSlug` vem diretamente na resposta do login:
```ts
// Response de POST /auth/login
{ accessToken: string; role: string; personalSlug: string | null }
```

---

## Proteção de Rotas (middleware.ts)

```ts
// Regras de acesso por prefixo de rota:
'/dashboard/*'           → requer role PERSONAL
'/{slug}/students/*'     → requer role STUDENT
'/admin/*'               → requer role ADMIN
```

---

## Temas por Área

| Área | Modo | Observação |
|------|------|-----------|
| `/dashboard/*` | **Light** | Área do Personal |
| `/admin/*` | **Dark** | Área do Admin SaaS |
| `/{slug}/students/*` | **Dark** | Área do Aluno |
| `/{slug}` (landing page) | **Dinâmico** | Usar `themeColor` do personal como CSS custom property |

Landing page: o `themeColor` é um hex (ex: `#10b981`). Aplicar como `--color-primary` no `layout.tsx` do segmento `[personal-slug]`.

---

## Formato de Erro

Todas as respostas de erro seguem:

```ts
interface ApiError {
  timestamp: string;       // ISO 8601
  status: number;          // HTTP status code
  error: string;           // ex: "Bad Request"
  path: string;            // rota que gerou o erro
  transactionId: string | null;
  message: string;         // mensagem legível
  details?: {
    message: string;
    additionalProperties: Record<string, any>[];
  }[];
}
```

**Exemplos práticos:**
- `401` → credenciais inválidas ou token expirado
- `403` → conta inativa ou role sem permissão
- `404` → recurso não encontrado
- `409` → conflito (ex: email duplicado, horário sobreposto)
- `400` → validação falhou (ver `details` para erros por campo)

---

## Formato de Paginação

Todas as listagens paginadas retornam:

```ts
interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

**Query params padrão:** `?page=1&size=10&search=termo`

---

## Mapa Completo de Endpoints

### Auth (`/auth`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/auth/register` | Público | Registrar personal. Body: `{ name, email, password }` |
| POST | `/auth/login` | Público | Login. Body: `{ email, password }`. Retorna `{ accessToken, role, personalSlug }` + cookie |
| POST | `/auth/refresh` | Cookie | Renovar accessToken via refreshToken (cookie httpOnly) |
| POST | `/auth/logout` | Autenticado | Limpar cookie refreshToken |
| POST | `/auth/setup-password` | Público | Aluno define senha. Body: `{ token, password }` |

---

### Perfil do Personal (`/personals`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/personals/me/profile` | PERSONAL | Buscar perfil completo |
| PATCH | `/personals/me/profile` | PERSONAL | Atualizar perfil (bio, themeColor, LP fields...) |
| POST | `/personals/me/profile/upload` | PERSONAL | Upload de imagem S3. `multipart/form-data`, campo `file`. Retorna `{ url }` |
| GET | `/personals/:slug/public` | Público | Landing page data: perfil + service plans ativos |

---

### Alunos (`/students`) — Contexto PERSONAL

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/students` | PERSONAL | Criar aluno. Body: `{ name, email }`. Dispara e-mail de convite |
| GET | `/students` | PERSONAL | Listar alunos paginados. Query: `?page&size&search` |
| GET | `/students/:id` | PERSONAL | Buscar aluno por ID |
| PATCH | `/students/:id` | PERSONAL | Atualizar dados do aluno |
| DELETE | `/students/:id` | PERSONAL | Desativar aluno (soft delete) |
| GET | `/students/:id/workout-plans` | PERSONAL | Planos de treino atribuídos ao aluno |

### Alunos — Contexto STUDENT

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/students/me/workout-plans` | STUDENT | Listar meus planos de treino |
| GET | `/students/me/workout-plans/:planId` | STUDENT | Detalhe de um plano de treino |

---

### Exercícios (`/exercises`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/exercises` | PERSONAL | Listar exercícios (globais + próprios). Query: `?search&muscleGroup` |
| POST | `/exercises` | PERSONAL | Criar exercício personalizado |
| DELETE | `/exercises/:id` | PERSONAL | Deletar exercício próprio |

---

### Planos de Treino (`/workout-plans`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/workout-plans` | PERSONAL | Criar plano. Body: `{ name, description? }` |
| GET | `/workout-plans` | PERSONAL | Listar planos do personal |
| GET | `/workout-plans/:id` | PERSONAL | Detalhe do plano com exercícios |
| PATCH | `/workout-plans/:id` | PERSONAL | Atualizar nome/descrição |
| DELETE | `/workout-plans/:id` | PERSONAL | Deletar plano |
| POST | `/workout-plans/:id/exercises` | PERSONAL | Adicionar exercício ao plano |
| DELETE | `/workout-plans/:id/exercises/:workoutExerciseId` | PERSONAL | Remover exercício do plano |
| PATCH | `/workout-plans/:id/exercises/reorder` | PERSONAL | Reordenar exercícios. Body: `{ items: [{ id, order }] }` |
| POST | `/workout-plans/:id/students` | PERSONAL | Atribuir aluno ao plano. Body: `{ studentId }` |
| DELETE | `/workout-plans/:id/students/:studentId` | PERSONAL | Revogar aluno do plano |

---

### Disponibilidade (`/availability`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/availability` | PERSONAL | Listar slots configurados |
| POST | `/availability` | PERSONAL | Criar slot. Body: `{ dayOfWeek (0-6), startTime (HH:mm), endTime (HH:mm) }` |
| PATCH | `/availability/:id` | PERSONAL | Atualizar slot |
| DELETE | `/availability/:id` | PERSONAL | Deletar slot |

---

### Planos de Serviço (`/service-plans`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/service-plans` | PERSONAL | Listar planos ativos |
| POST | `/service-plans` | PERSONAL | Criar plano. Body: `{ name, price, sessionsPerWeek, durationMinutes?, description? }` |
| PATCH | `/service-plans/:id` | PERSONAL | Atualizar plano |
| DELETE | `/service-plans/:id` | PERSONAL | Desativar plano |

---

### Agendamentos (`/bookings`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/bookings` | PERSONAL | Listar bookings do personal. Query: `?page&size&status&studentId` |
| POST | `/bookings` | STUDENT | Criar agendamento. Body: `{ servicePlanId, scheduledAt }` |
| GET | `/bookings/me` | STUDENT | Listar meus agendamentos |
| GET | `/bookings/available-slots` | STUDENT | Slots disponíveis. Query: `?personalId&date` |
| GET | `/bookings/:id` | PERSONAL/STUDENT | Detalhe do booking |
| PATCH | `/bookings/:id/status` | PERSONAL | Atualizar status. Body: `{ status: 'confirmed'|'cancelled'|'completed' }` |
| PATCH | `/bookings/:id/cancel` | STUDENT | Cancelar booking |

---

### Planos SaaS (`/plans`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/plans` | **Público** | Listar planos ativos ordenados. Usar na home/pricing page |

---

### Assinatura (`/subscriptions`)

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/subscriptions/me` | PERSONAL | Status da assinatura: `{ status, plan, expiresAt }` |
| POST | `/subscriptions/checkout` | PERSONAL | Iniciar checkout Stripe. Body: `{ planId }`. Retorna `{ checkoutUrl }` |
| POST | `/subscriptions/cancel` | PERSONAL | Cancelar assinatura (ao fim do período) |
| GET | `/subscriptions/usage` | PERSONAL | Uso atual: `{ studentsUsed, studentsLimit, planName }` |
| POST | `/subscriptions/portal` | PERSONAL | URL do Stripe Customer Portal: `{ portalUrl }` |
| POST | `/subscriptions/upgrade` | PERSONAL | Upgrade de plano. Body: `{ planId }` |
| POST | `/subscriptions/webhook` | **Público** | Apenas para Stripe — não chamar pelo frontend |

#### Rotas obrigatórias do frontend (Stripe redirects)

O backend já está configurado com estas URLs. Elas **devem existir** no Next.js:

| Rota Next.js | Quando aparece |
|--------------|---------------|
| `/dashboard/subscription/success?session_id=...` | Após checkout bem-sucedido |
| `/dashboard/subscription/cancel` | Se o usuário cancelou no Stripe |
| `/dashboard/subscription` | Retorno do Stripe Customer Portal |

---

### Admin (`/admin`) — Acesso restrito a `ADMIN`

#### Gestão de Personals

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/personals` | Listar todos os personals. Query: `?page&size&search` |
| GET | `/admin/personals/:id` | Detalhe completo (assinatura, stripe, bio) |
| PATCH | `/admin/personals/:id/status` | Ativar/desativar. Body: `{ isActive: boolean }` |

#### Gestão de Planos SaaS

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/plans` | Listar todos (incluindo inativos) |
| POST | `/admin/plans` | Criar plano |
| PATCH | `/admin/plans/:id` | Atualizar plano |
| PATCH | `/admin/plans/:id/status` | Ativar/desativar. Body: `{ isActive: boolean }` |
| PATCH | `/admin/plans/reorder` | Reordenar. Body: `{ items: [{ id, order }] }` |

#### Dashboard BI

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/dashboard/stats` | KPIs: MRR, assinantes, churn, crescimento. Query: `?period=7d\|30d\|90d\|all` |
| GET | `/admin/dashboard/charts` | Gráficos: distribuição de planos + timeline de receita. Query: `?period=` |

**Response de stats:**
```ts
{
  mrr: number;            // receita mensal recorrente em R$
  totalSubscribers: number;
  newSubscribers: number; // no período
  churnCount: number;     // cancelamentos no período
  totalStudents: number;  // total na plataforma
  growthRate: number | null; // % vs período anterior
}
```

**Response de charts:**
```ts
{
  planDistribution: { planName: string; count: number; percentage: number }[];
  revenueTimeline: { month: string; mrr: number }[]; // month: "2026-02"
}
```

---

## Axios — Setup Recomendado

```ts
// src/lib/api.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // envia cookie refreshToken automaticamente
})

// Interceptor: adicionar accessToken em toda request
api.interceptors.request.use((config) => {
  const token = getAccessToken() // do contexto/memória
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: renovar token automaticamente em 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      setAccessToken(data.accessToken) // atualizar no contexto
      error.config.headers.Authorization = `Bearer ${data.accessToken}`
      return api(error.config)
    }
    return Promise.reject(error)
  }
)
```

---

## Estrutura de Diretórios Recomendada

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    [personal-slug]/
      (personal)/           ← landing page pública
        page.tsx            ← SSR com generateMetadata
        layout.tsx          ← aplica themeColor como CSS var
      (students)/           ← área do aluno (dark mode)
        students/dashboard/
    dashboard/              ← área do personal (light mode)
      profile/
      students/
      workouts/
      schedule/
      subscription/
        page.tsx
        success/page.tsx    ← obrigatório (Stripe redirect)
        cancel/page.tsx     ← obrigatório (Stripe redirect)
    admin/                  ← área admin (dark mode)
      page.tsx              ← redirect para /admin/dashboard
      dashboard/
      personals/
      plans/
  components/
    ui/                     ← shadcn (já existentes)
    shared/                 ← componentes reutilizáveis entre áreas
  hooks/
    use-auth.ts
    use-pagination.ts
  lib/
    api.ts                  ← axios instance
    utils.ts                ← já existe
  providers/
    auth.provider.tsx       ← AuthContext com accessToken em memória
    query.provider.tsx      ← ReactQueryProvider
  services/                 ← funções que chamam a API por módulo
    auth.service.ts
    students.service.ts
    ...
  middleware.ts             ← proteção de rotas por role
```

---

## Credenciais de Teste (Seed)

| Role | E-mail | Senha |
|------|--------|-------|
| Admin | admin@example.com | testPassword |
| Personal | personal@example.com | testPassword |
| Student | joao.silva@example.com | studentPassword |

---

## Notas Críticas

1. **Landing page não usa dark/light mode** — usa `themeColor` do personal como cor primária via CSS custom property. É a única exceção às regras de tema.

2. **Upload de imagem** — usar `FormData` com campo `file`. O backend retorna `{ url: string }` com a URL pública do S3.

3. **WhatsApp link** — montar como `https://wa.me/55${phoneNumber.replace(/\D/g, '')}`.

4. **Tenant isolation** — o backend faz o escopo por tenant automaticamente via JWT. O frontend não precisa enviar `personalId` em nenhuma query — o backend extrai do token.

5. **Slug do personal no redirect do Student** — `personalSlug` está disponível diretamente na resposta do login e também no JWT decodificado. Usar para montar a rota `/{personalSlug}/students/dashboard`.

6. **Stripe checkout** — o frontend chama `POST /subscriptions/checkout` com `{ planId }`, recebe `{ checkoutUrl }` e faz `window.location.href = checkoutUrl`. O usuário é redirecionado ao Stripe e volta para as rotas de success/cancel configuradas.

7. **Paginação** — todos os GETs de listagem aceitam `?page=1&size=10`. O tamanho máximo padrão é 100 por request.
