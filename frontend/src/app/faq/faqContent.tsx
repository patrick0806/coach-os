"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

const categories = [
  {
    id: "planos",
    title: "Planos & Cobrança",
    items: [
      {
        q: "Como funciona o período de teste gratuito?",
        a: "Você tem 14 dias para explorar todas as funcionalidades sem precisar cadastrar cartão de crédito. Ao final do período, você escolhe um plano para continuar.",
      },
      {
        q: "Posso mudar de plano a qualquer momento?",
        a: "Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A cobrança é proporcional ao período já utilizado.",
      },
      {
        q: "O que acontece se eu ultrapassar o limite de alunos?",
        a: "Você não conseguirá adicionar novos alunos até fazer upgrade para um plano maior ou arquivar alunos inativos. Seus dados e alunos existentes não são afetados.",
      },
      {
        q: "Como funciona o cancelamento?",
        a: "Você pode cancelar a qualquer momento pelo painel em Assinatura > Cancelar. O acesso continua até o fim do período pago e não há multa ou burocracia.",
      },
      {
        q: "Aceitam quais formas de pagamento?",
        a: "Aceitamos cartão de crédito e débito das principais bandeiras (Visa, Mastercard, Elo, Amex). O processamento é feito via Stripe com segurança PCI-DSS.",
      },
    ],
  },
  {
    id: "funcionalidades",
    title: "Funcionalidades",
    items: [
      {
        q: "Posso criar exercícios personalizados?",
        a: "Sim, nos planos Pro e Elite você pode criar exercícios privados com vídeo, descrição e grupos musculares. Eles ficam visíveis apenas para você.",
      },
      {
        q: "Como funcionam os templates de treino?",
        a: "Você cria um template com workouts e exercícios. Ao aplicar a um aluno, cria-se um programa independente — alterar o template não afeta programas já atribuídos.",
      },
      {
        q: "Consigo acompanhar a evolução dos meus alunos?",
        a: "Sim. Você pode registrar métricas de progresso (peso, medidas, % de gordura) e fotos de evolução. O aluno também visualiza seu histórico de cargas após cada treino.",
      },
      {
        q: "A agenda funciona para sessões online e presenciais?",
        a: "Sim. Você configura sua disponibilidade por dia da semana. Sessões online têm link de reunião e sessões presenciais têm localização. O sistema avisa sobre conflitos de horário.",
      },
    ],
  },
  {
    id: "portal",
    title: "Portal do Aluno",
    items: [
      {
        q: "O aluno precisa baixar algum aplicativo?",
        a: "Não. O portal do aluno é acessado pelo navegador, funciona perfeitamente no celular e pode ser adicionado como atalho na tela inicial (PWA).",
      },
      {
        q: "Como o aluno acessa a plataforma?",
        a: "O aluno recebe um convite por e-mail ou link do WhatsApp. Ele cria uma senha e acessa pelo navegador com o visual da sua marca.",
      },
      {
        q: "O portal tem a minha identidade visual?",
        a: "Sim. Você configura a cor primária e o logo. O portal do aluno exibe esses elementos criando uma experiência white-label com a sua marca.",
      },
      {
        q: "O aluno consegue registrar a execução do treino?",
        a: "Sim. O aluno inicia o treino, registra as cargas e repetições de cada série, e finaliza ao concluir. O histórico fica disponível para você acompanhar.",
      },
    ],
  },
  {
    id: "conta",
    title: "Conta & Segurança",
    items: [
      {
        q: "Meus dados são seguros?",
        a: "Sim. Usamos criptografia em trânsito (HTTPS) e em repouso. Senhas são armazenadas com Argon2id. A plataforma segue as diretrizes da LGPD.",
      },
      {
        q: "Posso exportar meus dados?",
        a: "Você pode solicitar a exportação dos seus dados a qualquer momento pelo suporte. Trabalhamos para disponibilizar essa função diretamente no painel em breve.",
      },
      {
        q: "Como recupero o acesso se esquecer a senha?",
        a: 'Na tela de login, clique em "Esqueci minha senha". Você receberá um link de redefinição por e-mail válido por 2 horas.',
      },
    ],
  },
];

export function FaqContent() {
  const [search, setSearch] = useState("");

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          search.trim() === "" ||
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-3xl">
        {/* Search */}
        <div className="relative mb-12">
          <input
            type="search"
            placeholder="Buscar pergunta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border/60 bg-card/40 px-5 py-4 pl-5 text-sm backdrop-blur-sm transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Categories */}
        {filteredCategories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              Nenhuma pergunta encontrada para{" "}
              <span className="font-medium text-foreground">"{search}"</span>.
            </p>
            <Link
              href="/contato"
              className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Fale com a gente <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredCategories.map((cat) => (
              <div key={cat.id} id={cat.id}>
                <h2 className="mb-4 text-lg font-bold">{cat.title}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {cat.items.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      value={`${cat.id}-${idx}`}
                      className="rounded-2xl border border-border/60 bg-card/40 px-5 backdrop-blur-sm"
                    >
                      <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-3xl border border-border/60 bg-card/40 p-8 text-center backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background">
            <MessageCircle className="size-5 text-primary" />
          </div>
          <h3 className="font-bold">Não encontrou o que procurava?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Nossa equipe responde em até 24 horas úteis.
          </p>
          <Link
            href="/contato"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
          >
            Falar com o suporte <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
