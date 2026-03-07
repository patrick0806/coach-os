# Epic 08 — Estabilização da Base (Quality & UX)

Status: `[ ]` todo

> Épico de melhoria de qualidade antes de novas features.
> Foco em UX crítica, code quality e robustez.
> Nenhuma quebra de contrato de API — só mudanças no frontend, salvo indicação contrária.

---

## US-IMP-01 — Time Picker 24h no módulo de Disponibilidade e Agendamento

**Status:** `[ ]` todo
**Prioridade:** 🔴 Alta
**Dependências:** nenhuma

**Problema:**
O campo `<Input type="time">` exibe o seletor em formato AM/PM no macOS Safari e em alguns navegadores Chrome com locale inglês. O público brasileiro usa exclusivamente o formato 24h (ex.: `14:30`), então o AM/PM causa confusão desnecessária e erros de entrada.

**Arquivos afetados:**
- `frontend/src/app/painel/agenda/disponibilidade/page.tsx` (linha 106 e 115) — personal configura slots
- `frontend/src/app/[slug-personal]/(alunos)/alunos/agenda/page.tsx` (linha 171) — aluno seleciona data (input date)

**Solução:**
Criar um componente `TimeSelect` reutilizável com dois `<Select>` (shadcn): um para hora (00–23) e um para minuto (00, 15, 30, 45 ou 00–59 com step 5). Isso garante exibição em 24h em qualquer navegador/OS.

### Critérios de Aceite
- [ ] Componente `TimeSelect` em `frontend/src/components/ui/time-select.tsx`
  - Props: `value: string` (formato `HH:mm`), `onChange: (value: string) => void`, `disabled?: boolean`
  - Dois selects: horas (00–23) e minutos (00, 05, 10, ..., 55)
  - Output sempre no formato `HH:mm` (ex: `"09:00"`, `"14:30"`)
- [ ] Substituir `<Input type="time">` no formulário de adicionar slot de disponibilidade pelo `TimeSelect`
- [ ] Substituir `<Input type="time">` no formulário de edição de slot pelo `TimeSelect` (se existir)
- [ ] Validação de `startTime < endTime` deve continuar funcionando após a substituição
- [ ] Aparência consistente com os demais selects shadcn do sistema

### Subtasks
- [x] Criar `TimeSelect` component com lista de horas 00–23 e minutos com step 5
- [x] Integrar `TimeSelect` no `AddSlotDialog` (disponibilidade/page.tsx)
- [ ] Testar no Chrome/macOS — confirmar ausência de AM/PM
- [x] Garantir que o schema Zod `slotSchema` ainda valida `startTime < endTime`

---

## US-IMP-02 — Dashboard do Personal com KPIs

**Status:** `[ ]` todo
**Prioridade:** 🔴 Alta
**Dependências:** nenhuma (dados já existem via APIs implementadas)

**Problema:**
A home do personal trainer (`/painel`) exibe apenas "Bem-vindo ao seu painel de gestão." sem nenhuma informação útil. Um coach ao fazer login não tem visão nenhuma do seu negócio — não sabe quantos alunos tem, quais sessões tem hoje, nem nenhuma ação rápida.

**Arquivo afetado:**
- `frontend/src/app/painel/page.tsx` — completamente vazio

**Solução:**
Implementar um dashboard de visão geral com KPIs e atalhos rápidos, consumindo APIs já existentes no backend.

### Critérios de Aceite
- [ ] Card: total de alunos ativos com link para `/painel/alunos`
- [ ] Card: sessões agendadas para hoje com link para `/painel/agenda`
- [ ] Card: próxima sessão do dia (horário + nome do aluno)
- [ ] Card: total de planos de treino criados com link para `/painel/treinos`
- [ ] Seção "Próximas sessões" — lista as 5 sessões mais próximas (status `scheduled`)
- [ ] Estado vazio amigável quando não há dados (ex: coach novo sem alunos)
- [ ] Atalho para "Configurar perfil" se a bio ou foto estiver ausente (onboarding hint)
- [ ] Skeleton loading enquanto carrega
- [ ] Layout responsivo (cards em grid 2x2 no desktop, coluna única no mobile)

### APIs a consumir (já implementadas)
- `GET /students?size=1` — usa `totalElements` para contagem de alunos ativos
- `GET /bookings?from=hoje&to=hoje&status=scheduled` — sessões de hoje
- `GET /bookings?from=hoje&to=+7dias&status=scheduled&size=5` — próximas sessões
- `GET /workout-plans?size=1` — usa `totalElements` para contagem de planos
- `GET /personals/me/profile` — para verificar se perfil está completo

### Subtasks
- [ ] Implementar componente `StatCard` (ícone + label + valor + link) — reutilizável
- [ ] Query: alunos ativos totais
- [ ] Query: sessões agendadas hoje
- [ ] Query: próximas 5 sessões (próximos 7 dias)
- [ ] Query: total de planos de treino
- [ ] Seção "Próximas sessões" com mini-cards
- [ ] Hint de onboarding condicional (se sem foto/bio)
- [ ] Skeleton loading para cada card
- [ ] Responsividade mobile

---

## US-IMP-03 — Painel do Aluno com Próximas Sessões

**Status:** `[ ]` todo
**Prioridade:** 🟡 Média
**Dependências:** nenhuma

**Problema:**
O painel inicial do aluno (`/{slug}/alunos/painel`) exibe apenas os planos de treino. O aluno não tem visão de seus próximos agendamentos, o que é a informação mais relevante para quem acabou de fazer login.

**Arquivo afetado:**
- `frontend/src/app/[slug-personal]/(alunos)/alunos/painel/page.tsx`

**Solução:**
Adicionar seção de próximas sessões antes dos treinos, e um card de destaque para a próxima sessão mais imediata.

### Critérios de Aceite
- [ ] Seção "Próxima sessão" no topo — card destacado com data, horário e plano (se houver sessão agendada)
- [ ] Seção "Próximas sessões" listando até 3 sessões futuras com status `scheduled`
- [ ] Se não há sessões futuras: mensagem encorajadora com link para `/alunos/agenda`
- [ ] Seção de treinos mantida, mas posicionada abaixo das sessões
- [ ] Skeleton loading para as novas seções

### APIs a consumir (já implementadas)
- `GET /bookings/me` — agendamentos do aluno autenticado (já implementado em `bookings.service.ts`)

### Subtasks
- [ ] Query: `getMyBookings` filtrado por `status=scheduled` e ordenado por data
- [ ] Componente `NextSessionCard` — card destacado com a próxima sessão
- [ ] Lista de sessões futuras (até 3)
- [ ] Estado vazio com link para agendar
- [ ] Manter seção de treinos abaixo

---

## US-IMP-04 — Refatorar padrão `refetchKey` para `invalidateQueries`

**Status:** `[ ]` todo
**Prioridade:** 🟡 Média
**Dependências:** nenhuma

**Problema:**
Em `alunos/agenda/page.tsx:297`, o padrão `useState(0)` + incremento para forçar re-fetch é um anti-pattern do React Query. Além de quebrar o cache do React Query, faz com que as queries sejam recriadas ao invés de invalidadas corretamente.

```tsx
// anti-pattern atual
const [refetchKey, setRefetchKey] = useState(0);
queryKey: ["my-bookings", refetchKey],
onBooked={() => setRefetchKey((k) => k + 1)}

// correto
queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
```

### Critérios de Aceite
- [ ] Remover `useState(0)` / `refetchKey` de `alunos/agenda/page.tsx`
- [ ] Usar `useQueryClient` + `invalidateQueries({ queryKey: ["my-bookings"] })` após booking criado
- [ ] A lista de próximas sessões atualiza corretamente após novo agendamento
- [ ] Nenhuma regressão no comportamento de agendamento

### Subtasks
- [ ] Refatorar `AlunoAgendaPage` — remover `refetchKey`, passar `queryClient.invalidateQueries` via `onBooked`
- [ ] Garantir que `BookingForm` recebe e chama o callback correto
- [ ] Testar fluxo: agendar → lista de próximas sessões atualiza sem reload

---

## US-IMP-05 — Error Boundaries nas rotas principais

**Status:** `[ ]` todo
**Prioridade:** 🟡 Média
**Dependências:** nenhuma

**Problema:**
Nenhuma rota do painel ou da área do aluno tem `error.tsx` do Next.js. Um erro de rede ou exceção não tratada derruba a página inteira exibindo a tela de erro padrão do Next.js — sem mensagem amigável, sem opção de retry.

### Critérios de Aceite
- [ ] Componente `ErrorFallback` reutilizável em `components/shared/error-fallback.tsx`
  - Ícone de alerta, mensagem genérica em português, botão "Tentar novamente" (`router.refresh()`)
- [ ] `error.tsx` nas rotas: `/painel`, `/painel/alunos`, `/painel/treinos`, `/painel/agenda`, `/painel/agenda/disponibilidade`, `/painel/planos-servico`, `/painel/assinatura`
- [ ] `error.tsx` nas rotas do aluno: `/{slug}/alunos/painel`, `/{slug}/alunos/treinos`, `/{slug}/alunos/agenda`
- [ ] `error.tsx` na área admin: `/admin/dashboard`, `/admin/personals`, `/admin/plans`
- [ ] Design consistente com o modo (light no painel, dark no admin/aluno)

### Subtasks
- [ ] Criar `ErrorFallback` component (light e dark variant)
- [ ] Criar `error.tsx` no layout do painel (`/painel/error.tsx`) — cobre todas as sub-rotas
- [ ] Criar `error.tsx` no layout do aluno (`/{slug}/alunos/error.tsx`)
- [ ] Criar `error.tsx` no layout do admin (`/admin/error.tsx`)

---

## US-IMP-06 — Componente WhatsAppIcon reutilizável

**Status:** `[ ]` todo
**Prioridade:** 🟢 Baixa
**Dependências:** nenhuma

**Problema:**
O SVG do ícone do WhatsApp está duplicado inline em dois lugares na landing page (`page.tsx:151` e `page.tsx:327`). Qualquer mudança (cor, tamanho, acessibilidade) exige edição em dois lugares.

**Arquivo afetado:**
- `frontend/src/app/[slug-personal]/(personal)/page.tsx`

### Critérios de Aceite
- [ ] Componente `WhatsAppIcon` em `frontend/src/components/ui/whatsapp-icon.tsx`
  - Props: `className?: string`
  - SVG extraído do inline atual
- [ ] Substituir os dois SVGs inline na landing page pelo componente
- [ ] Comportamento visual idêntico ao atual

### Subtasks
- [ ] Criar `WhatsAppIcon` component
- [ ] Substituir nas duas ocorrências em `page.tsx`

---

## US-IMP-07 — Padronizar Loading Skeletons

**Status:** `[ ]` todo
**Prioridade:** 🟢 Baixa
**Dependências:** US-IMP-02 (o dashboard usa skeletons)

**Problema:**
Algumas páginas usam `animate-pulse` com divs customizados e outras não têm skeleton algum. Não há um padrão consistente de loading state no sistema.

**Páginas sem skeleton adequado:**
- `/painel/planos-servico` — sem loading state
- `/painel/treinos/[id]` — sem loading state na lista de exercícios
- `/{slug}/alunos/treinos/[planId]` — sem loading state

### Critérios de Aceite
- [ ] Componente `SkeletonCard` genérico (linhas de texto animadas) em `components/ui/skeleton.tsx` via shadcn
- [ ] Adicionar skeleton em `/painel/planos-servico/page.tsx`
- [ ] Adicionar skeleton em `/painel/treinos/[id]/page.tsx`
- [ ] Adicionar skeleton em `/{slug}/alunos/treinos/[planId]/page.tsx`
- [ ] Padrão visual uniforme: `animate-pulse`, `bg-gray-100` (light) ou `bg-accent` (dark)

### Subtasks
- [ ] Verificar se shadcn `skeleton` já está instalado, instalar se necessário
- [ ] Auditar todas as páginas e identificar as sem skeleton
- [ ] Implementar skeletons nas páginas listadas
