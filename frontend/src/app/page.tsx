import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  Dumbbell,
  Users,
  ArrowRight,
  UserPlus,
  Settings2,
  BarChart3,
  Zap,
} from "lucide-react";

import { listPlans } from "@/features/marketing/services/plans.service";
import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { FeatureBlock } from "@/features/marketing/components/featureBlock";
import { PlanCard } from "@/features/marketing/components/planCard";

export const metadata: Metadata = {
  title: "Coach OS — Plataforma para personal trainers online e presencial",
  description:
    "Portal do aluno com a sua marca, agenda inteligente e programas de treino completos. A plataforma para coaches que atendem online e presencial.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const plans = await listPlans();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
          {/* Background blobs */}
          <div className="absolute left-1/2 top-1/4 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
          <div className="absolute -left-20 top-1/2 -z-10 h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -right-20 bottom-1/4 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-[110px]" />

          <div className="mx-auto max-w-4xl">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Para coaches online e presencial
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
              Sua identidade. <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
                Seus alunos. Um lugar.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Portal do aluno com a sua marca, agenda inteligente e programas
              de treino completos. Pare de gerenciar no WhatsApp — seu negócio
              merece uma plataforma profissional.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30"
              >
                Começar 14 dias grátis
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#planos"
                className="rounded-2xl border border-border bg-card/50 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-colors hover:bg-card"
              >
                Ver planos
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Não precisa de cartão de crédito para começar.
            </p>

            {/* Positioning pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                "Portal com sua marca",
                "Online e presencial",
                "Sem cartão para começar",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-border/60 bg-card/40 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Quick glance grid */}
          <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-6 sm:grid-cols-3">
            {[
              {
                icon: Users,
                label: "Portal com sua marca",
                desc: "Aluno acessa com a identidade visual do seu negócio",
              },
              {
                icon: Dumbbell,
                label: "Prescrição completa",
                desc: "Templates, programas individuais e execução pelo aluno",
              },
              {
                icon: Calendar,
                label: "Agenda inteligente",
                desc: "Online, presencial ou recorrente — sem conflitos",
              },
            ].map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center rounded-2xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-sm"
              >
                <f.icon className="mb-3 size-6 text-primary" />
                <h3 className="font-bold">{f.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Sections */}
        <section id="funcionalidades" className="space-y-10">
          <FeatureBlock
            title="Sua ficha de treino no próximo nível"
            description="Chega de PDFs e planilhas. Ofereça uma experiência mobile premium para seus alunos com cronômetro, vídeos de execução e histórico de cargas."
            icon={Dumbbell}
            imageAlt="Interface de Treinos"
            mockType="training"
            features={[
              "Biblioteca com +50 exercícios",
              "Suporte a vídeos do YouTube",
              "Histórico de evolução de carga",
              "Cronômetro de descanso integrado",
            ]}
          />

          <FeatureBlock
            title="Agenda que trabalha por você"
            description="Permita que seus alunos agendem sessões nos seus horários disponíveis. Controle faltas, desmarcações e recorrências sem trocar uma única mensagem no WhatsApp."
            icon={Calendar}
            imageAlt="Agenda Online"
            mockType="schedule"
            reverse
            features={[
              "Sessões avulsas ou recorrentes",
              "Disponibilidade configurável por dia",
              "Status de presença e No-show",
              "Check-in automático do aluno",
            ]}
          />
        </section>

        {/* Como funciona */}
        <section
          id="como-funciona"
          className="relative overflow-hidden px-6 py-24 sm:py-32"
        >
          <div className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />

          <div className="mx-auto max-w-5xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Simples de começar
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Em 3 passos você está operando como um pro.
              </p>
            </div>

            <div className="relative grid gap-8 sm:grid-cols-3">
              {/* Connector line */}
              <div className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block" />

              {[
                {
                  step: "01",
                  icon: UserPlus,
                  title: "Cadastre",
                  desc: "Crie sua conta em minutos. Sem burocracia, sem cartão de crédito.",
                },
                {
                  step: "02",
                  icon: Settings2,
                  title: "Configure",
                  desc: "Adicione seus alunos, monte templates de treino e defina sua disponibilidade.",
                },
                {
                  step: "03",
                  icon: BarChart3,
                  title: "Gerencie",
                  desc: "Acompanhe a evolução de cada aluno com dados reais em tempo real.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative z-10 mb-5 flex h-20 w-20 flex-col items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm">
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                      {item.step}
                    </span>
                    <item.icon className="size-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="planos" className="relative overflow-hidden px-6 py-24 sm:py-32">
          <div className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />

          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                Invista no seu crescimento
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Planos simples e transparentes. Sem taxas escondidas.
              </p>
            </div>

            {plans.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Carregando planos...
              </p>
            ) : (
              <div
                className={`grid gap-8 ${
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

        {/* CTA Section */}
        <section className="px-6 py-20 md:py-32">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
            {/* Decorative blobs inside CTA */}
            <div className="pointer-events-none absolute inset-0 -z-10" />

            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/15">
              <Zap className="h-7 w-7 text-primary-foreground" />
            </div>

            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Pronto para profissionalizar
              <br className="hidden sm:block" /> sua consultoria?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg opacity-90">
              Comece agora e explore tudo por 14 dias sem precisar de cartão.
              Cancele quando quiser.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="group flex items-center gap-2 rounded-xl bg-background px-8 py-4 text-lg font-bold text-foreground shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Criar minha conta agora
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-primary-foreground/20 px-8 py-4 text-lg font-semibold transition-colors hover:bg-primary-foreground/10"
              >
                Já tenho conta
              </Link>
            </div>

            {/* Mini stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-primary-foreground/20 pt-8">
              {[
                "14 dias grátis sem cartão",
                "Suporte incluso",
                "Cancele quando quiser",
              ].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-2 text-sm opacity-80"
                >
                  <span className="h-1 w-1 rounded-full bg-primary-foreground/60" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
