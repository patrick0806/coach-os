import { Metadata } from "next";
import { Mail, Clock, MessageSquare } from "lucide-react";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { InstitutionalHero } from "@/features/marketing/components/institutionalHero";
import { ContatoForm } from "./contatoForm";

export const metadata: Metadata = {
  title: "Fale com a Gente — Coach OS",
  description:
    "Entre em contato com a equipe Coach OS. Respondemos em até 24 horas úteis para dúvidas, sugestões ou suporte.",
  alternates: { canonical: "/contato" },
  openGraph: {
    title: "Fale com a Gente — Coach OS",
    description:
      "Entre em contato com a equipe Coach OS. Respondemos em até 24 horas úteis.",
    url: "/contato",
  },
};

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <InstitutionalHero
        icon={Mail}
        title="Fale com a gente"
        description="Tem dúvidas, sugestões ou precisa de ajuda? A equipe do Coach OS responde em até 24 horas úteis."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <div className="rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm">
            <ContatoForm />
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background">
                <Mail className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold">E-mail</h3>
              <p className="mt-1 text-sm text-muted-foreground">suporte@coachos.com.br</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background">
                <Clock className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold">Tempo de resposta</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Respondemos em até <span className="font-medium text-foreground">24 horas úteis</span>.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background">
                <MessageSquare className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold">FAQ</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Confira as{" "}
                <a href="/faq" className="font-medium text-primary hover:underline">
                  perguntas frequentes
                </a>{" "}
                — talvez sua dúvida já esteja respondida.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
