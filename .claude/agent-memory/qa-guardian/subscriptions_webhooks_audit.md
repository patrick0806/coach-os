---
name: subscriptions_webhooks_audit
description: QA audit findings for subscriptions module and Stripe webhook handler — critical revenue flow vulnerabilities
type: project
---

Audit performed 2026-03-21 on subscriptions/ and webhooks/ modules.

Key findings:
1. **changePlan has no student limit check on downgrade** — coach can downgrade to a plan with fewer maxStudents than current count without warning or blocking. Students module enforces limits on create/invite but not retroactively.
2. **changePlan atomicity gap** — Stripe subscription is updated FIRST, then local DB. If local DB update fails, Stripe and DB are out of sync. No rollback mechanism.
3. **cancelSubscription atomicity gap** — Same pattern: Stripe cancel_at_period_end set before local DB update.
4. **Webhook has no idempotency protection** — Stripe can retry webhooks; each retry re-processes the same event. No event ID deduplication.
5. **Webhook out-of-order risk** — subscription.updated and invoice.paid can arrive in any order; no timestamp/version comparison to prevent stale updates overwriting fresh data.
6. **findByStripeCustomerId has no uniqueness constraint check** — if two personals share a customerId (data corruption), webhook silently affects only the first one.
7. **createCheckoutSession uses session.url! (non-null assertion)** — if Stripe returns null URL, throws at runtime with unhelpful error.
8. **BypassTenantAccess on getSubscription/checkout/portal** — intentional (allows expired tenants to view/manage billing), but means these endpoints skip tenant access validation entirely.
9. **invoice.paid uses period_end not lines[0].period.end** — may be invoice-level period, not subscription item period. Could be inaccurate for prorated invoices.
10. **handleInvoicePaymentFailed casts invoice as any for next_payment_attempt** — type safety gap.

**Why:** These are all revenue-critical paths. A Stripe/DB desync can cause coaches to lose access or retain access they shouldn't have.

**How to apply:** When modifying subscription or webhook code, always consider atomicity (Stripe + DB), idempotency (event deduplication), and ordering (event timestamp comparison).
