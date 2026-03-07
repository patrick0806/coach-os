import Link from "next/link";
import { Check, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

import { formatPlanPrice, listPlans, type Plan } from "@/services/plans.service";

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        plan.highlighted
          ? "bg-card text-card-foreground shadow-2xl ring-2 ring-primary/40"
          : "bg-card/70 text-card-foreground ring-1 ring-border/70 backdrop-blur"
      }`}
    >
      {plan.highlighted ? (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
          Recomendado
        </span>
      ) : null}

      <div className="mb-6">
        <h3 className="text-xl font-bold">
          {plan.name}
        </h3>
        {plan.description ? (
          <p className="mt-1 text-sm text-muted-foreground">
            {plan.description}
          </p>
        ) : null}
      </div>

      <div className="mb-6">
        <span className="text-4xl font-extrabold">
          {formatPlanPrice(plan.price)}
        </span>
        <span className="ml-1 text-sm text-muted-foreground">
          /mês
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check
              className="mt-0.5 size-4 shrink-0 text-primary"
            />
            <span className="text-sm text-foreground/90">
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/cadastro"
        className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-all hover:-translate-y-0.5 ${
          plan.highlighted
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        }`}
      >
        Começar agora
      </Link>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const plans = await listPlans();

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Hero */}
      <header className="border-b border-border/80 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Coach OS</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
            >
              Testar sem cartão
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="relative overflow-hidden px-6 py-24 text-center">
          <div className="absolute left-1/2 top-10 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
          <div className="mx-auto max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" />
              Plataforma profissional para personal trainers
            </p>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              O sistema que transforma seu atendimento em um negócio
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Organize alunos, treinos, agenda e sua pagina publica em um painel unico.
              Comece com 30 dias gratis e teste sem informar cartao.
            </p>
            <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left text-sm text-foreground/90 sm:grid-cols-3">
              <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                <TimerReset className="mb-1 size-4 text-primary" />
                30 dias de teste
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                <ShieldCheck className="mb-1 size-4 text-primary" />
                Sem cartao de credito
              </div>
              <div className="rounded-xl border border-border/70 bg-card/60 p-3">
                <Check className="mb-1 size-4 text-primary" />
                Setup em poucos minutos
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                Teste sem passar o cartao
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-border bg-card/70 px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-accent/70"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="px-6 py-20" id="planos">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Planos e preços
              </h2>
              <p className="mt-3 text-muted-foreground">
                Escolha o plano ideal para o tamanho do seu negócio.
              </p>
            </div>

            {plans.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Planos indisponíveis no momento.
              </p>
            ) : (
              <div
                className={`grid gap-6 ${
                  plans.length === 1
                    ? "mx-auto max-w-sm"
                    : plans.length === 2
                      ? "mx-auto max-w-3xl sm:grid-cols-2"
                      : "sm:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {plans
                  .sort((a, b) => a.order - b.order)
                  .map((plan) => (
                    <PlanCard key={plan.id} plan={plan} />
                  ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Coach OS. Todos os direitos reservados.
      </footer>
    </div>
  );
}
