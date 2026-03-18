# TASK_BOARD.md — Coach OS

Last updated: 2026-03-18

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

### Frontend: public page

- [ ] Implement public page service
- [ ] Implement public page editor (bio, photo, specialties, colors)
- [ ] Implement public page preview
- [ ] Implement public page rendering (app.com/personal/:slug)

### Frontend: student portal

- [ ] Implement student progress page
- [ ] Implement student appointments page

### Frontend: notifications

- [ ] Implement notification preferences page

### Infrastructure

- [ ] CI/CD pipeline
- [ ] Monitoring (Better Stack integration)

### Institutional Pages

- [ ] FAQ, Contact, Terms, Privacy, About
