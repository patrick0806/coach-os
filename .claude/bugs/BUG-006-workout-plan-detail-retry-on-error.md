# BUG-006 — Página de detalhe do plano de treino faz retry desnecessário em 404

**Status:** `[x]` done
**Prioridade:** BAIXA
**Relatado em:** 2026-03-12
**Módulo:** `frontend/student-treinos`

## 📝 Descrição do Bug

Na página `/[slug]/alunos/treinos/[planId]`, quando o plano não é encontrado (404), o React Query realiza 3 tentativas com backoff exponencial antes de exibir o estado de erro. Durante esse período, o usuário fica vendo um loading spinner por vários segundos antes de ver a mensagem "Treino não encontrado."

### Cenário de Reprodução:
1. Aluno acessa um URL de plano com `planId` inválido ou deletado.
2. A API retorna 404.
3. O usuário aguarda ~15 segundos (3 retries com backoff) vendo o loading.
4. Finalmente a mensagem de erro aparece.

## 🔍 Causa Raiz

A query que busca o plano de treino do aluno não define `retry: false`:

```typescript
// src/app/[slug-personal]/(alunos)/alunos/treinos/[planId]/page.tsx (linha ~115)
const { data: plan, isLoading } = useQuery({
  queryKey: ["me-workout-plan", planId],
  queryFn: () => getMeWorkoutPlan(planId),
  // ← falta: retry: false
});
```

Para recursos por ID, retries não fazem sentido — um 404 não vai mudar entre tentativas.

## ✅ Critérios de Aceite
- [ ] A query `getMeWorkoutPlan` deve ter `retry: false`.
- [ ] Em caso de 404, o estado "Treino não encontrado." deve aparecer imediatamente.
- [ ] Não há regressão no fluxo normal de carregamento do plano.
