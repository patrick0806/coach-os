# TASK_BOARD.md — Coach OS

Last updated: 2026-03-18 (public page complete)

---

## Backlog

### Module: platform/admins

- [ ] Implement AdminRepository (findByUserId)
- [ ] Implement admin guard (restrict routes to ADMIN role)
- [ ] Implement admin module registration

### Module: platform/subscriptions

- [ ] Implement GetSubscriptionUseCase
- [ ] Implement subscription response DTO
- [ ] Implement get subscription controller (GET /subscriptions/current)
- [ ] Implement get subscription unit tests
- [ ] Implement ChangeSubscriptionPlanUseCase (upgrade/downgrade via Stripe)
- [ ] Implement change plan controller (PATCH /subscriptions/plan)
- [ ] Implement change plan unit tests
- [ ] Implement CancelSubscriptionUseCase
- [ ] Implement cancel subscription controller (POST /subscriptions/cancel)
- [ ] Implement cancel subscription unit tests
- [ ] Implement Stripe webhook handler (subscription.updated, subscription.deleted, invoice.paid)
- [ ] Implement webhook unit tests

### Module: platform/tenants

- [ ] Implement ListTenantsUseCase (admin only)
- [ ] Implement list tenants controller (GET /admin/tenants)
- [ ] Implement list tenants unit tests
- [ ] Implement GetTenantUseCase (admin only)
- [ ] Implement get tenant controller (GET /admin/tenants/:id)
- [ ] Implement get tenant unit tests
- [ ] Implement SuspendTenantUseCase (admin only)
- [ ] Implement suspend tenant controller (PATCH /admin/tenants/:id/suspend)
- [ ] Implement suspend tenant unit tests

### Frontend: dashboard

- [ ] Implement real sidebar navigation
- [ ] Implement dashboard stats (real data from API)

### Frontend: progress (backlog)

- [ ] Implement progress charts (line graphs, comparisons)

### Frontend: public page ✅ DONE

- [x] Implement public page service (profileEditor/services/profile.service.ts)
- [x] Implement public page editor (bio, photo, specialties, colors) — /pagina-publica
- [x] Implement public page preview (link "Visualizar página" in editor)
- [x] Implement public page rendering (/personais/[slug])
- [x] Add availabilityRules to GET /public/:slug backend
- [x] Auth branded sub-routes: /personais/[slug]/configurar-senha, esqueci-senha, redefinir-senha
- [x] Sidebar link enabled for /pagina-publica

### Frontend: student portal ✅ DONE

- [x] Implement student progress page (`/aluno/progresso`)
- [x] Implement student appointments page (`/aluno/agenda`)
- [x] Implement bottom navigation (Treinos / Progresso / Agenda)
- [x] Fix metric labels (PT-BR)
- [x] Allow student to create own progress checkin (metrics + photos)

### Frontend: notifications

- [ ] Implement notification preferences page

### Infrastructure

- [ ] CI/CD pipeline
- [ ] Monitoring (Better Stack integration)

### Institutional Pages

- [ ] FAQ, Contact, Terms, Privacy, About
