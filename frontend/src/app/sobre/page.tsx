import { type Metadata } from "next";
import Link from "next/link";
import { Zap, ArrowRight, Target, Smartphone, Lock } from "lucide-react";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { InstitutionalHero } from "@/features/marketing/components/institutionalHero";

export const metadata: Metadata = {
  title: "Sobre o Coach OS — Nossa história e missão",
  description: "Conheça a plataforma criada por quem entende os desafios dos personal trainers.",
  alternates: { canonical: "/sobre" },
};

const values = [
  {
    icon: Target,
    title: "Foco no coach",
    description:
      "Cada funcionalidade é pensada a partir da rotina real de um personal trainer — não de uma hipótese de escritório.",
  },
  {
    icon: Smartphone,
    title: "Mobile first",
    description:
      "Coaches e alunos trabalham no celular. A plataforma foi construída para o celular primeiro, e adaptada para desktop depois.",
  },
  {
    icon: Lock,
    title: "Dados seguros",
    description:
      "Os dados dos seus alunos são sigilosos. Aplicamos isolamento por workspace, criptografia e conformidade com a LGPD.",
  },
];

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <InstitutionalHero
        icon={Zap}
        title="Construído por quem entende coaches"
        description="O Coach OS nasceu da frustração de ver profissionais talentosos gerenciando tudo pelo WhatsApp e planilha."
      />

      {/* Story section */}
      <section className="relative overflow-hidden px-6 py-16">
        <div className="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-primary/8 blur-[120px]" />
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-muted-foreground">
          <p>
            Vimos coaches incríveis perdendo horas enviando treinos em PDF pelo WhatsApp, cobrando manualmente, esquecendo de atualizar planilhas e sem nenhuma visão do progresso real dos seus alunos.
          </p>
          <p>
            As ferramentas existentes eram genéricas demais, caras demais, ou complicadas demais para quem está focado em atender — não em operar software.
          </p>
          <p className="font-medium text-foreground">
            Criamos o Coach OS para mudar isso.
          </p>
          <p>
            Uma plataforma completa — treinos, agenda, portal do aluno com a sua marca, progresso — que funciona de verdade no celular, que qualquer personal consegue configurar em minutos, e que fica fora do caminho para você focar no que importa: seus alunos.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-primary px-8 py-12 text-center text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-70">Nossa missão</p>
            <p className="mt-4 text-2xl font-bold leading-snug sm:text-3xl">
              Dar ao personal trainer a mesma estrutura profissional que uma grande academia — sem a complexidade e sem o custo.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">O que guia cada decisão</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-background">
                  <v.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-12 text-center backdrop-blur-sm">
          <h2 className="text-3xl font-extrabold tracking-tight">Pronto para começar?</h2>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground">
            14 dias gratuitos. Sem cartão. Cancele quando quiser.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/cadastro"
              className="group flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              Criar minha conta <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contato"
              className="rounded-xl border border-border/60 bg-background px-8 py-3.5 text-sm font-semibold transition-colors hover:bg-accent"
            >
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
