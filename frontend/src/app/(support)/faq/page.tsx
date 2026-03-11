import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BadgeHelp, Clock3, LifeBuoy, ShieldCheck } from "lucide-react";

const faqGroups = [
  {
    title: "Começando com o Coach OS",
    items: [
      {
        question: "O Coach OS é indicado para qual tipo de profissional?",
        answer:
          "A plataforma foi pensada para personal trainers e consultores que precisam centralizar alunos, treinos, agenda e operação em um fluxo único.",
      },
      {
        question: "Existe período de teste?",
        answer:
          "Sim. O cadastro inicial foi desenhado para facilitar a avaliação da ferramenta antes da contratação definitiva, sem forçar uma implantação complexa.",
      },
      {
        question: "Preciso instalar algum aplicativo?",
        answer:
          "Não. O acesso principal acontece pela web, com experiência otimizada para desktop e mobile.",
      },
    ],
  },
  {
    title: "Agenda, alunos e treinos",
    items: [
      {
        question: "Posso cadastrar meus alunos e organizar os atendimentos em um só lugar?",
        answer:
          "Sim. O fluxo central do Coach OS une cadastro de alunos, agendamentos, planos de atendimento e histórico operacional no mesmo painel.",
      },
      {
        question: "Os treinos podem ser reutilizados?",
        answer:
          "Sim. A arquitetura atual trabalha com modelos de treino, permitindo atribuição aos alunos a partir do detalhe de cada perfil.",
      },
      {
        question: "Consigo acompanhar faltas e sessões concluídas?",
        answer:
          "Sim. A agenda contempla status operacionais como agendado, concluído, não compareceu e cancelado, refletindo no histórico do aluno.",
      },
    ],
  },
  {
    title: "Suporte e segurança",
    items: [
      {
        question: "Como entro em contato com o suporte?",
        answer:
          "Você pode usar a página de contato para dúvidas comerciais, onboarding ou questões técnicas. A mensagem vai direto para o canal interno de atendimento.",
      },
      {
        question: "Os dados dos alunos ficam protegidos?",
        answer:
          "Sim. O produto já possui páginas legais dedicadas e uma base pensada para operação SaaS profissional, com foco em organização, rastreabilidade e boas práticas de acesso.",
      },
      {
        question: "Onde encontro termos e política de privacidade?",
        answer:
          "Essas informações estão disponíveis nas páginas institucionais de Termos de Uso e Privacidade, acessíveis no rodapé do site.",
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Perguntas Frequentes (FAQ)",
  description: "Tire todas as suas dúvidas sobre o Coach OS: como funciona a agenda, prescrição de treinos, suporte e segurança dos dados.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "Perguntas Frequentes | Coach OS",
    description: "Tire suas dúvidas sobre a melhor plataforma para Personal Trainers.",
    url: "/faq",
  },
};

export default function FaqPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }))
    ),
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Coach OS",
    url: "https://coachos.com.br",
    logo: "https://coachos.com.br/logo.png",
    description: "Plataforma de gestão para Personal Trainers.",
  };

  return (
    <div className="pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
        <div className="absolute left-1/2 top-16 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
            <BadgeHelp className="size-3.5 text-primary" />
            Central de ajuda
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
            Respostas rápidas para dúvidas de compra, operação e suporte
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Organizamos as perguntas mais comuns para reduzir atrito na avaliação da plataforma e
            acelerar a adoção do Coach OS.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-3">
          {[
            {
              icon: LifeBuoy,
              title: "Pré-venda",
              description: "Entenda como o produto se encaixa na sua operação.",
            },
            {
              icon: Clock3,
              title: "Resposta objetiva",
              description: "FAQ pensado para responder sem enrolação.",
            },
            {
              icon: ShieldCheck,
              title: "Mais confiança",
              description: "Informações institucionais alinhadas a um SaaS profissional.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm"
            >
              <item.icon className="size-6 text-primary" />
              <h2 className="mt-4 text-lg font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-8">
        <div className="space-y-10">
          {faqGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-2xl font-bold tracking-tight">{group.title}</h2>
              <div className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-border/60 bg-card/45 p-6 backdrop-blur-sm transition-colors open:border-primary/40 open:bg-card/70"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold marker:content-none">
                      <span>{item.question}</span>
                      <span className="text-primary transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-3xl border border-border/60 bg-card/50 p-8 backdrop-blur md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Ainda não encontrou o que precisava?</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Fale com nosso time</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Use a página de contato para dúvidas técnicas, comerciais ou de onboarding.
            </p>
          </div>
          <Link
            href="/contato"
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-transform hover:-translate-y-0.5"
          >
            Ir para contato
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
