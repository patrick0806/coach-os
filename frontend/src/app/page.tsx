import Link from "next/link";
import type { Metadata } from "next";
import {
  Calendar,
  Check,
  Dumbbell,
  Users,
  ArrowRight,
} from "lucide-react";

import { listPlans } from "@/services/plans.service";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
import { FeatureBlock } from "@/components/marketing/featureBlock";
import { PlanCard } from "@/app/_components/planCard";

export const metadata: Metadata = {
  title: "Domine sua agenda, escale seus treinos",
  description:
    "A plataforma completa para Personal Trainers que desejam profissionalismo, agilidade na montagem de treinos e uma gestão financeira impecável.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const plans = await listPlans();
  console.log("plans:", plans);
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
          {/* Background Blobs */}
          <div className="absolute left-1/2 top-1/4 -z-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -left-20 top-1/2 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />

          <div className="mx-auto max-w-4xl">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl">
              Domine sua agenda, <br />
              <span className="bg-linear-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent">
                escale seus treinos
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              A plataforma completa para Personal Trainers que desejam profissionalismo,
              agilidade na montagem de treinos e uma gestão financeira impecável.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="group flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-primary/30"
              >
                Começar 30 dias grátis
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#planos"
                className="rounded-2xl border border-border bg-card/50 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-colors hover:bg-card"
              >
                Ver planos
              </Link>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Não precisa de cartão de crédito para começar.
            </p>
          </div>

          {/* Feature Highlight Grid - Quick glance */}
          <div className="mx-auto mt-20 grid max-w-5xl gap-6 px-6 sm:grid-cols-3">
            {[
              { icon: Users, label: "Gestão de Alunos", desc: "Controle total de perfis e evolução" },
              { icon: Dumbbell, label: "Prescrição Ágil", desc: "Crie treinos complexos em segundos" },
              { icon: Calendar, label: "Agenda Online", desc: "Agendamentos e recorrência automática" },
            ].map((f, i) => (
              <div key={i} className="flex flex-col items-center rounded-2xl border border-border/60 bg-card/40 p-6 text-center backdrop-blur-sm">
                <f.icon className="mb-3 size-6 text-primary" />
                <h3 className="font-bold">{f.label}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Sections - The "Zebra" Layout */}
        <section id="funcionalidades" className="space-y-10">
          <FeatureBlock
            title="Sua ficha de treino no próximo nível"
            description="Chega de PDFs e planilhas. Ofereça uma experiência mobile premium para seus alunos com cronômetro, vídeos de execução e histórico de cargas."
            icon={Dumbbell}
            imageAlt="Interface de Treinos"
            features={[
              "Biblioteca com +50 exercícios",
              "Suporte a vídeos do YouTube",
              "Histórico de evolução de carga",
              "Cronômetro de descanso integrado"
            ]}
          />

          <FeatureBlock
            title="Agenda que trabalha por você"
            description="Permita que seus alunos agendem sessões em seus horários disponíveis. Controle faltas, desmarcações e recorrências sem trocar uma única mensagem no WhatsApp."
            icon={Calendar}
            imageAlt="Agenda Online"
            reverse
            features={[
              "Sessões avulsas ou recorrentes",
              "Disponibilidade configurável por dia",
              "Status de presença e No-show",
              "Check-in automático do aluno"
            ]}
          />
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
                className={`grid gap-8 ${plans.length === 1
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
          <div className="mx-auto max-w-5xl rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl shadow-primary/20">
            <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Pronto para profissionalizar sua consultoria?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg opacity-90">
              Junte-se a centenas de treinadores que já estão economizando horas de
              trabalho manual todas as semanas.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/cadastro"
                className="rounded-xl bg-background px-8 py-4 text-lg font-bold text-foreground shadow-lg transition-transform hover:-translate-y-1"
              >
                Criar minha conta agora
              </Link>
              <Link
                href="/contato"
                className="rounded-xl border border-primary-foreground/20 px-8 py-4 text-lg font-semibold transition-colors hover:bg-primary-foreground/10"
              >
                Falar com consultor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
