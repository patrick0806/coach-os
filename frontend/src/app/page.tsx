import Link from "next/link";
import { Check } from "lucide-react";

import { formatPlanPrice, listPlans, type Plan } from "@/services/plans.service";

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        plan.highlighted
          ? "bg-white text-gray-900 shadow-2xl ring-2 ring-white"
          : "bg-white/5 text-white ring-1 ring-white/10"
      }`}
    >
      {plan.highlighted ? (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-white">
          Recomendado
        </span>
      ) : null}

      <div className="mb-6">
        <h3
          className={`text-xl font-bold ${plan.highlighted ? "text-gray-900" : "text-white"}`}
        >
          {plan.name}
        </h3>
        {plan.description ? (
          <p className={`mt-1 text-sm ${plan.highlighted ? "text-gray-500" : "text-white/60"}`}>
            {plan.description}
          </p>
        ) : null}
      </div>

      <div className="mb-6">
        <span
          className={`text-4xl font-extrabold ${plan.highlighted ? "text-gray-900" : "text-white"}`}
        >
          {formatPlanPrice(plan.price)}
        </span>
        <span className={`ml-1 text-sm ${plan.highlighted ? "text-gray-500" : "text-white/60"}`}>
          /mês
        </span>
      </div>

      <ul className="mb-8 flex-1 space-y-3">
        {plan.benefits.map((benefit, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check
              className={`mt-0.5 size-4 shrink-0 ${plan.highlighted ? "text-primary" : "text-primary"}`}
            />
            <span
              className={`text-sm ${plan.highlighted ? "text-gray-600" : "text-white/80"}`}
            >
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      <Link
        href="/cadastro"
        className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold transition-opacity hover:opacity-90 ${
          plan.highlighted
            ? "bg-primary text-white"
            : "bg-white/10 text-white hover:bg-white/20"
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
      <header className="border-b border-border/40 px-6 py-4">
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
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="px-6 py-24 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
              Gerencie seus alunos com{" "}
              <span className="text-primary">inteligência</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              A plataforma completa para personal trainers: treinos, agenda, landing page e
              muito mais. Tudo em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
              >
                Criar conta grátis
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-accent"
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

      <footer className="border-t border-border/40 px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Coach OS. Todos os direitos reservados.
      </footer>
    </div>
  );
}
