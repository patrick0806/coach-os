# Backlog Pós-MVP — Ideias para Após o Lançamento

> Itens aqui documentados foram identificados como relevantes mas **deliberadamente adiados** por não serem bloqueantes para o MVP. Revisitar após o lançamento e validação com usuários reais.

---

## Suporte a Aluno Atendido por Mais de Um Personal

**Contexto:** Atualmente o sistema assume que um aluno é exclusivo de um personal. Se um aluno que já usa a plataforma com o Personal A tentar ser cadastrado pelo Personal B, ocorre conflito de email (409) porque o sistema tenta criar um novo `user` com email já existente.

**Por que foi adiado:** Cenário raro no MVP. Exige mudança arquitetural no schema (`students` + `users`) e nova lógica de convite. Risco de regressão alto para ganho pequeno no início.

**Solução proposta:**
- Se o email já existe em `users`, reutilizar o user ao invés de criar novo
- Criar novo registro em `students` linkando o user existente ao novo personal (tenant)
- Adicionar constraint `UNIQUE(user_id, personal_id)` na tabela `students`
- Email de convite diferenciado para usuário já existente (sem link de setup-password, apenas convite para acessar o painel do novo personal com credenciais existentes)
- 3 cenários a cobrir: email novo (fluxo atual), email existente sem vínculo (novo fluxo), email existente já vinculado ao mesmo personal (409 específico)

**Impacto estimado:** Migration de schema + refatoração de `StudentsService.create()` + novo template de email. Médio esforço, baixo risco arquitetural se feito de forma isolada.

**Dependências:** US-005 (já concluído)

---
