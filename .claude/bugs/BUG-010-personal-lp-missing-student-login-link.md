# BUG-010 — LP do Personal sem link de acesso para alunos já cadastrados

**Status:** `[x]` resolvido
**Prioridade:** ALTA
**Relatado em:** 2026-03-13
**Módulo:** `frontend/app/[slug-personal]/(personal)/page.tsx`

## 📝 Descrição do Bug

A Landing Page pública do personal trainer (`/{slug}`) não possui nenhum link ou botão para que alunos já cadastrados acessem a área deles (`/{slug}/alunos/painel`). O único fluxo disponível é o contato via WhatsApp — o que impede completamente que um aluno existente faça login diretamente pela LP.

### Cenário de Reprodução:
1. Um aluno já cadastrado acessa a LP do personal: `/{slug}`.
2. Procura uma forma de entrar na sua conta / acessar seus treinos.
3. Não encontra nenhum link, botão ou seção de acesso.
4. Precisa adivinhar ou ter salvo a URL `/{slug}/login` para conseguir logar.

## 🔍 Causa Raiz

**Arquivo:** `frontend/src/app/[slug-personal]/(personal)/page.tsx`

A página renderiza apenas:
- `HeroSection` — CTA de WhatsApp
- `AboutSection` — texto e fotos
- `PlansSection` — planos com CTA de WhatsApp
- `AgendamentoSection` — seção de agendamento
- `ContactSection` — CTA de WhatsApp

Nenhuma das seções referencia `/{slug}/login` (rota de login do aluno) ou `/{slug}/alunos/painel` (área do aluno).

A rota de login do aluno existe em:
```
frontend/src/app/[slug-personal]/(personal)/login/page.tsx
```

## ✅ Critérios de Aceite

- [ ] A LP deve conter um link/botão visível com destino `/{slug}/login` para alunos existentes.
- [ ] O link deve ser discreto (secundário) para não desviar atenção do CTA principal de novos leads.
- [ ] Sugestão de posicionamento: no rodapé da LP ou como link fixo no topo da página (ex.: "Já é aluno? Entrar").
- [ ] O texto deve ser claro: "Já sou aluno" / "Acessar área do aluno" / "Entrar".
- [ ] Deve usar o `slug` do perfil para compor a URL corretamente: `/{slug}/login`.
