# Epic 02 — Perfil do Personal e Landing Page

Status: `[x]` done

---

## US-003 — Personal configura seu perfil

**Status:** `[x]` done
**Sprint:** 2
**Dependencias:** US-002

**Descricao:**
Como personal trainer, quero configurar meu perfil profissional para personalizar minha presenca e minha landing page.

### Criterios de Aceite
- [ ] Campos editaveis: nome, bio, foto de perfil, telefone, cor do tema
- [ ] Campos da landing page: titulo, subtitulo, hero image, about title, about text, images (1, 2, 3)
- [ ] Upload de imagem para AWS S3 (foto de perfil + imagens LP)
- [ ] Slug nao pode ser alterado diretamente (apenas na criacao)
- [ ] Retorna o perfil atualizado
- [ ] Somente o proprio personal pode editar seu perfil

### Diretivas de Implementacao
- Modulo: `src/modules/personals/`
- Contexts: `profile/get-profile/`, `profile/update-profile/`, `profile/upload-image/`
- Usar `@CurrentUser()` decorator (ja existe em `shared/decorators/current-user.decorator.ts`)
- S3 provider em `shared/providers/`

### Subtasks Backend
- [x] `GET /personals/me/profile` — buscar perfil do personal autenticado
- [x] `PATCH /personals/me/profile` — atualizar dados do perfil
- [x] `POST /personals/me/profile/upload` — upload de imagem para S3 (retorna URL)
- [x] `PersonalsRepository` com metodos `findByUserId`, `update`
- [x] S3 provider (`shared/providers/s3.provider.ts`)
- [x] Guard: apenas role `PERSONAL`
- [x] `get-profile.controller.spec.ts` + `get-profile.service.spec.ts`
- [x] `update-profile.controller.spec.ts` + `update-profile.service.spec.ts`
- [x] `upload-image.controller.spec.ts` + `upload-image.service.spec.ts`

### Subtasks Frontend
- [x] Rota: `/painel/perfil` (equivalente a `/dashboard/profile`, em portugues conforme padrao do projeto)
- [x] Formulario de edicao de perfil com preview de imagem
- [x] Color picker para `themeColor`
- [x] Upload de imagens com preview (foto, hero, imagens da LP)
- [x] React Query para buscar e atualizar perfil (invalidar cache apos update)
- [x] Feedback de sucesso/erro

### Notas Tecnicas
- Configurar AWS SDK com credenciais via `ConfigService` (nunca hardcoded)
- Upload multipart/form-data para o endpoint de upload
- Retornar URL publica do S3 apos upload bem-sucedido

---

## US-004 — Landing Page publica do Personal

**Status:** `[x]` done
**Sprint:** 2
**Dependencias:** US-003

**Descricao:**
Como visitante, quero acessar a pagina publica de um personal trainer pelo seu slug para conhecer o profissional e seus servicos.

### Criterios de Aceite
- [ ] URL: `/{personal-slug}` → landing page publica
- [ ] Exibe: foto, nome, bio, cor do tema, titulo/subtitulo, hero image, about section, galeria
- [ ] Exibe planos de servico ativos (`service_plans`)
- [ ] Botao de contato via WhatsApp (via `phoneNumber`)
- [ ] Slug inexistente → 404
- [ ] Rota publica (sem autenticacao)
- [ ] SEO: meta tags dinamicas (title, description, og:image)

### Diretivas de Implementacao
- Rota Next.js: `app/[personal-slug]/(personal)/page.tsx`
- Usar `generateMetadata` para SEO via SSR
- Tema dinamico via `themeColor` do personal (CSS custom properties no layout)

### Subtasks Backend
- [x] `GET /personals/:slug/public` — dados publicos do personal + service plans ativos
- [x] Decorator `@Public()` na rota
- [x] Response DTO apenas com campos publicos (sem dados sensiveis: userId, senha, etc)
- [x] `get-public-profile.controller.spec.ts` + `get-public-profile.service.spec.ts`

### Subtasks Frontend
- [x] `app/[slug-personal]/(personal)/page.tsx` com SSR
- [x] `app/[slug-personal]/(personal)/layout.tsx` com CSS variable de themeColor
- [x] Secao Hero (titulo, subtitulo, hero image, CTA WhatsApp)
- [x] Secao About (about title, about text, galeria de fotos)
- [x] Secao Plans (cards dos service plans com preco, sessoes/semana, duracao)
- [x] Secao Contact (botao WhatsApp com mensagem pre-preenchida)
- [x] `generateMetadata` dinamico (title, description, og:image)
- [x] Responsivo mobile-first
- [x] Pagina 404 customizada para slug inexistente (`not-found.tsx`)

### Notas Tecnicas
- Landing page nao segue regra de dark/light mode — usa themeColor do personal
- SSR e necessario para SEO; nao usar client-side fetching para esta pagina
- WhatsApp link: `https://wa.me/55{phoneNumber}`
