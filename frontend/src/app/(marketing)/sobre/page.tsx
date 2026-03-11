import type { Metadata } from "next";
import { Rocket, Target, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre Nós",
  description:
    "Conheça a missão do Coach OS e como estamos transformando a gestão de treinamentos físicos no Brasil com tecnologia e simplicidade.",
  alternates: {
    canonical: "/sobre",
  },
  openGraph: {
    title: "Sobre Nós | Coach OS",
    description: "Nossa missão é empoderar treinadores com o melhor sistema operacional para fitness.",
    url: "/sobre",
  },
};

export default function AboutPage() {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center md:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-8">
            Nossa missão é <br />
            <span className="text-primary italic">empoderar treinadores</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            O Coach OS nasceu da frustração de personal trainers reais com ferramentas 
            limitadas, planilhas confusas e PDFs estáticos.
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="space-y-12">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-4">O Problema</h2>
              <p className="text-muted-foreground leading-relaxed">
                Durante anos, o mercado de personal training foi dominado por 
                processos manuais. O treinador gastava mais tempo enviando 
                mensagens e montando tabelas do que analisando a performance 
                dos seus alunos.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-8">
              <Users className="size-12 text-primary mb-4" aria-hidden="true" />
              <p className="font-medium">O Coach perdia a vida gerenciando o operacional, em vez de focar no humano.</p>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 items-center md:flex-row-reverse">
            <div className="md:order-2">
              <h2 className="text-3xl font-bold tracking-tight mb-4">A Nossa Solução</h2>
              <p className="text-muted-foreground leading-relaxed">
                Decidimos criar o sistema operacional definitivo para o fitness. 
                Uma plataforma que não apenas organiza dados, mas que 
                simplifica a vida do coach e eleva a experiência do aluno.
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card/40 p-8 md:order-1">
              <Target className="size-12 text-primary mb-4" aria-hidden="true" />
              <p className="font-medium">Transformar gestão complexa em cliques simples e automações inteligentes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values / Stats */}
      <section className="mx-auto max-w-7xl px-6 py-20 bg-card/20 rounded-3xl border border-border/40">
        <h2 className="sr-only">Nossos Valores</h2>
        <div className="grid gap-12 sm:grid-cols-3 text-center">
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Rocket className="size-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">Simplicidade</h3>
            <p className="text-sm text-muted-foreground">
              Software poderoso não precisa ser complicado. Priorizamos a agilidade.
            </p>
          </div>
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Target className="size-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">Foco no Resultado</h3>
            <p className="text-sm text-muted-foreground">
              Tudo o que construímos é para ajudar o treinador a gerar mais impacto.
            </p>
          </div>
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="size-8 text-primary" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-bold mb-2">Comunidade</h3>
            <p className="text-sm text-muted-foreground">
              Estamos ouvindo cada feedback para evoluir junto com os profissionais.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
