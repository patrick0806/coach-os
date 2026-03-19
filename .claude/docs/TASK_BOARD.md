# TASK_BOARD.md — Coach OS

Last updated: 2026-03-18 (subscription system complete)

---

## Backlog

### Module: platform/admins

- [ ] Implement AdminRepository (findByUserId)
- [ ] Implement admin guard (restrict routes to ADMIN role)
- [ ] Implement admin module registration

### Module: platform/subscriptions ✅ DONE

- [x] Implement GetSubscriptionUseCase
- [x] Implement subscription response DTO
- [x] Implement get subscription controller (GET /subscriptions/current)
- [x] Implement get subscription unit tests
- [x] Implement ChangeSubscriptionPlanUseCase (upgrade/downgrade via Stripe)
- [x] Implement change plan controller (PATCH /subscriptions/plan)
- [x] Implement change plan unit tests
- [x] Implement CancelSubscriptionUseCase
- [x] Implement cancel subscription controller (POST /subscriptions/cancel)
- [x] Implement cancel subscription unit tests
- [x] Implement CreatePortalSessionUseCase (POST /subscriptions/portal)
- [x] Implement Stripe webhook handler (subscription.updated, subscription.deleted, invoice.paid, invoice.payment_failed)
- [x] Implement webhook unit tests

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

### Frontend: billing ✅ DONE

- [x] Implement subscription service (getCurrentSubscription, changePlan, cancelSubscription, getPortalUrl)
- [x] Implement useSubscription hook (React Query)
- [x] Implement billing page (/assinatura) with plan cards, status card, change/cancel dialogs
- [x] Implement paywall page (/assinatura/bloqueado) with trial/payment/inactive variants
- [x] Implement trial banner in dashboard layout (differenceInDays, urgent style ≤2 days)
- [x] Add "Assinatura" link in sidebar footer
- [x] Add 403 interceptor in axios for paywall redirect
- [x] Student limit UI: toast with upgrade CTA on student_limit_reached

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

### Frontend: E2E Behavior Tests ✅ DONE

- [x] profileEditor behavior tests (load, tabs, save, error, mobile)
- [x] publicPage behavior tests (not-found fallback, auth sub-pages fallback)
- [x] studentPortal/progresso behavior tests (list, empty, create dialog, expand)
- [x] studentPortal/agenda behavior tests (schedules, appointments, empty states, mobile)
- [x] Added mock helpers to apiMocks.ts (profile, student checkins, appointments, schedules)

### Infrastructure

- [ ] CI/CD pipeline
- [ ] Monitoring (Better Stack integration)

### Institutional Pages

- [ ] FAQ, Contact, Terms, Privacy, About
