# Épico 21 — Qualidade, Segurança e Resiliência (End-to-End)

**Status:** `[ ]` todo
**Prioridade:** Alta
**Responsáveis:** Minerva McGonagall (PO), Ron Weasley (QA), Harry Potter (Security)

> **Objetivo:** Transformar o Coach OS em uma fortaleza digital. Não basta que as funcionalidades existam; elas devem ser à prova de falhas, resistentes a tentativas de abuso e garantir a isolação total de dados entre diferentes Personais e Alunos. Validaremos o fluxo completo da aplicação sob estresse, entradas maliciosas e cenários de borda complexos.

---

## 🎙️ Perspectivas dos Especialistas

### 🧙‍♂️ Minerva McGonagall (Product Owner)
*"Nossa prioridade é a confiança do usuário. Um Personal Trainer não pode, sob hipótese alguma, ver os dados de um aluno que não é dele."*

### 🐀 Ron Weasley (Quality Assurance)
*"Eu vou procurar cada buraco onde um 'Gnomo de Jardim' possa se esconder. Precisamos de testes que tentem quebrar o sistema de todas as formas criativas possíveis."*

### ⚡ Harry Potter (Security & DevOps)
*"Minha missão é garantir que ninguém use 'Artes das Trevas' contra nossos usuários. Vamos testar XSS, SQLi e IDOR."*

---

## 📋 Histórias de Usuário e Cenários de Teste

### US-065 — Autenticação Robusta e Gestão de Sessão
- [ ] **Acesso Protegido:** Tentar acessar `/painel` deslogado.
- [ ] **Token Expirado:** Simular 401 e validar logout.
- [ ] **Recuperação de Senha:** Fluxo completo com token.

---

### US-066 — Isolação de Dados (Multi-tenancy) e IDOR
- [ ] **IDOR em Alunos:** Tentar acessar aluno de outro personal.
- [ ] **IDOR em Treinos:** Tentar editar treino alheio via API.
- [ ] **Vazamento de Dados:** Validar filtros de tenant.

---

### US-067 — Fluxos Complexos e Resiliência
- [ ] **Treino Fantasma:** Tentar criar sem dados obrigatórios.
- [ ] **Concorrência:** Dois agendamentos no mesmo slot.
- [ ] **Uploads:** Validar limites de tamanho e tipo.

---

### US-068 — Entradas Maliciosas (XSS/SQLi)
- [ ] **XSS:** Scripts em campos de texto.
- [ ] **SQLi:** Caracteres de escape em buscas.

---

### US-069 — Limites de Plano e Rate Limiting
- [ ] **Limite de Alunos:** Bloquear criação no 11º aluno (Free).
- [ ] **Excesso de Requisições:** Validar 429 (Too Many Requests).
- [ ] **Inadimplência:** Simular bloqueio de acesso por falta de pagamento.

---

## 🚀 Recomendações Técnicas
1. **Mocks de Rede:** Simular falhas de infraestrutura.
2. **Audit Logs:** Logar ações críticas para rastreabilidade.
3. **Zod:** Validação estrita em todas as entradas.
