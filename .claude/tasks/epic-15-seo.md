# Epic 15 — SEO e Autoridade Digital

Status: `[ ]` todo

> **Objetivo:** Maximizar a visibilidade das páginas de marketing (Home, FAQ, Funcionalidades) nos mecanismos de busca, enquanto garantimos que as áreas logadas (Painel, Admin, Aluno) permaneçam privadas e não indexadas.

---

## US-044 — Configuração de Indexação Seletiva (Robots & Sitemap)

**Status:** `[x]` done
**Sprint:** 15

**Descrição:**
Configurar as diretivas de rastreamento para que o Google foque apenas no conteúdo institucional.

### Critérios de Aceite
- [x] Gerar `robots.txt` dinâmico permitindo `/`, `/sobre`, `/funcionalidades`, `/faq` e bloqueando `/painel/*`, `/admin/*`, `/*/alunos/*`.
- [x] Implementar geração automática de `sitemap.xml` (Next.js Metadata API).
- [x] Adicionar tag `<meta name="robots" content="noindex, nofollow">` globalmente para todas as rotas de dashboard.

---

## US-045 — Meta-Tags Dinâmicas e Open Graph (Marketing)

**Status:** `[x]` done
**Sprint:** 15

**Descrição:**
Otimizar as páginas públicas com títulos, descrições e imagens de compartilhamento (OG Tags) atraentes.

### Critérios de Aceite
- [x] Configurar `generateMetadata` para Home e FAQ com palavras-chave estratégicas.
- [x] Implementar imagens Open Graph (OG:Image) padrão para redes sociais.
- [x] Configurar URLs canônicas para evitar conteúdo duplicado.
- [x] Adicionar JSON-LD (Structured Data) para a página de FAQ e para a Organização (Coach OS).


---

## US-046 — Performance e Web Vitals (SEO On-Page)

**Status:** `[x]` done
**Sprint:** 15

**Descrição:**
Garantir que a velocidade de carregamento e a estrutura HTML favoreçam o ranqueamento.

### Critérios de Aceite
- [x] Validar semântica HTML (H1-H6) em todas as páginas de marketing.
- [x] Otimizar carregamento de imagens (Next/Image) com tamanhos e prioridades corretas.
- [x] Garantir pontuação > 90 no Lighthouse para Performance e SEO em mobile (Validação via auditoria de código).
