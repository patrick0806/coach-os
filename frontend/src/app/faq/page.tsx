import { Metadata } from "next";
import { HelpCircle } from "lucide-react";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { InstitutionalHero } from "@/features/marketing/components/institutionalHero";
import { FaqContent } from "./faqContent";

export const metadata: Metadata = {
  title: "Perguntas Frequentes — Coach OS",
  description:
    "Tire suas dúvidas sobre planos, funcionalidades, portal do aluno e segurança da plataforma Coach OS.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Perguntas Frequentes — Coach OS",
    description:
      "Tire suas dúvidas sobre planos, funcionalidades, portal do aluno e segurança da plataforma Coach OS.",
    url: "/faq",
  },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <InstitutionalHero
        icon={HelpCircle}
        title="Perguntas frequentes"
        description="Tudo o que você precisa saber sobre o Coach OS. Não encontrou? Fale com a gente."
      />

      <FaqContent />

      <Footer />
    </div>
  );
}
