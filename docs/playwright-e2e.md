# Guia de Testes E2E (Playwright) — Coach OS

Este documento descreve como configurar, rodar e manter os testes de ponta-a-ponta (End-to-End) utilizando o Playwright no Coach OS.

---

## 🚀 Como Rodar os Testes

Os testes E2E rodam no diretório `frontend/`. O Playwright está configurado para subir automaticamente um servidor de desenvolvimento na porta `3100` caso um não esteja rodando.

### 1. Pré-requisitos
Certifique-se de que o **Backend** esteja rodando na porta `3333` (ou conforme configurado no `playwright.config.ts`), pois os testes E2E dependem da API real.

### 2. Comando Principal
Para rodar todos os testes em modo headless (sem abrir o navegador):

```bash
cd frontend
npm run test:e2e
```

### 3. Rodar em Modo UI (Interativo)
Recomendado durante o desenvolvimento para debugar e ver os testes rodando passo a passo:

```bash
cd frontend
npx playwright test --ui
```

### 4. Rodar um Arquivo Específico
```bash
npx playwright test tests/e2e/auth-and-dashboard.spec.ts
```

### 5. Debugar um Teste
Para abrir o navegador e o debugger do Playwright:
```bash
npx playwright test --debug
```

---

## 📁 Estrutura de Arquivos

- **Configuração:** `frontend/playwright.config.ts`
- **Testes:** `frontend/tests/e2e/*.spec.ts`
- **Resultados/Snapshots:** `frontend/test-results/` (gerado após execução)

---

## 🛠️ Configurações Importantes

O arquivo `playwright.config.ts` define:
- **baseURL:** `http://127.0.0.1:3100`
- **webServer:** Comando para subir o Next.js automaticamente.
- **Projects:** Configurado para rodar em **Desktop Chrome** e **Mobile (Pixel 7)**.
- **Bypass Auth:** Ativa a variável `E2E_BYPASS_AUTH=true` para simplificar fluxos de login em ambiente de teste quando necessário.

---

## 📝 Melhores Práticas

1.  **Locators:** Prefira usar `getByRole`, `getByText` ou `getByPlaceholder` em vez de seletores CSS (`.classe`) ou IDs.
2.  **Isolamento:** Cada teste deve ser independente. Evite depender do estado deixado por um teste anterior.
3.  **Ambiente:** Os testes E2E rodam contra o banco de dados configurado no backend. Em CI, recomenda-se usar um banco de dados de teste limpo.
4.  **Esperas:** Use as esperas automáticas do Playwright (`await expect(locator).toBeVisible()`) em vez de `setTimeout`.

---

## 📊 Relatórios de Erro

Se um teste falhar, o Playwright gera um relatório HTML detalhado. Para visualizar:

```bash
npx playwright show-report
```
