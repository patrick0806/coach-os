import type { Metadata } from "next";
import {
  Users,
  Dumbbell,
  Calendar,
  Rocket,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { FeatureBlock } from "@/components/marketing/feature-block";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Explore todas as ferramentas que o Coach OS oferece: gestão de alunos, construtor de treinos ágil, agenda automatizada e pagamentos integrados.",
  alternates: {
    canonical: "/funcionalidades",
  },
  openGraph: {
    title: "Funcionalidades | Coach OS",
    description: "Tudo o que você precisa para escalar sua consultoria em um único lugar.",
    url: "/funcionalidades",
  },
};

export default function FeaturesPage() {
  return (
    <div className="pb-20">
      {/* Page Header */}
      <section className="relative px-6 py-20 text-center md:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Tudo o que você precisa <br />
            <span className="text-primary">em um único lugar</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Elimine as planilhas, os PDFs no WhatsApp e a confusão de pagamentos.
            Concentre-se no que importa: o resultado dos seus alunos.
          </p>
        </div>
      </section>

      {/* Detail Blocks */}
      <FeatureBlock
        title="Gestão de Alunos sem Fricção"
        description="Tenha o histórico completo de cada aluno em segundos. Monitore o progresso, dados biométricos e histórico de treinos em uma interface intuitiva."
        icon={Users}
        imageAlt="Interface de Alunos"
        features={[
          "Ficha cadastral completa e organizada",
          "Timeline de notas e observações privadas",
          "Evolução de medidas e fotos (Em breve)",
          "Status de ativação e inativação de conta"
        ]}
      />

      <FeatureBlock
        title="O Construtor de Treinos mais Ágil do Mercado"
        description="Prescreva treinos complexos em minutos. Utilize nossa biblioteca com +50 exercícios ou crie os seus próprios com vídeos do YouTube."
        icon={Dumbbell}
        imageAlt="Construtor de Treinos"
        reverse
        features={[
          "Biblioteca global com GIFs de execução",
          "Crie modelos (templates) reutilizáveis",
          "Duplique treinos com um clique",
          "Histórico de cargas acessível pelo aluno"
        ]}
      />

      <FeatureBlock
        title="Sua Agenda Online e Automatizada"
        description="Chega de conflitos de horário. Configure sua disponibilidade e deixe que seus alunos agendem ou cancelem sessões de forma independente."
        icon={Calendar}
        imageAlt="Agenda do Coach"
        features={[
          "Configuração de slots por dia da semana",
          "Recorrência automática de sessões",
          "Notificações de presença e No-show",
          "Visualização semanal e mensal clara"
        ]}
      />

      {/* Secondary Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Outros Benefícios</h2>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm">
            <Rocket className="mb-4 size-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Landing Page Própria</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Receba um link profissional com sua foto, bio e planos de serviço 
              para enviar no Instagram ou WhatsApp.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm">
            <ShieldCheck className="mb-4 size-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Pagamentos com Stripe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Gerencie suas assinaturas e receba seus pagamentos com a segurança 
              da maior plataforma de pagamentos do mundo.
            </p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm">
            <TrendingUp className="mb-4 size-8 text-primary" />
            <h3 className="mb-2 text-xl font-bold">Dashboard do Admin</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Visão clara da sua receita mensal (MRR), total de assinantes e 
              saúde financeira do seu negócio.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
