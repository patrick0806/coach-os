import { type Metadata } from "next";
import { Scale } from "lucide-react";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { InstitutionalHero } from "@/features/marketing/components/institutionalHero";
import { LegalDocument } from "@/features/marketing/components/legalDocument";

export const metadata: Metadata = {
  title: "Termos de Uso — Coach OS",
  description: "Termos e condições de uso da plataforma Coach OS.",
  alternates: { canonical: "/termos" },
};

const sections = [
  { id: "introducao", title: "1. Introdução" },
  { id: "definicoes", title: "2. Definições" },
  { id: "uso", title: "3. Uso da Plataforma" },
  { id: "conta", title: "4. Conta e Responsabilidades" },
  { id: "planos", title: "5. Planos e Cobrança" },
  { id: "propriedade", title: "6. Propriedade Intelectual" },
  { id: "dados", title: "7. Dados e Privacidade" },
  { id: "limitacoes", title: "8. Limitações de Responsabilidade" },
  { id: "rescisao", title: "9. Rescisão" },
  { id: "alteracoes", title: "10. Alterações nos Termos" },
  { id: "foro", title: "11. Foro e Legislação" },
];

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <InstitutionalHero
        icon={Scale}
        title="Termos de Uso"
        description="Leia com atenção as condições que regem o uso da plataforma Coach OS."
      />

      <LegalDocument sections={sections} updatedAt="20 de março de 2026">
        <div className="space-y-12 text-sm leading-relaxed text-foreground">

          <section id="introducao" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">1. Introdução</h2>
            <p className="text-muted-foreground">
              Estes Termos de Uso regulam o acesso e a utilização da plataforma Coach OS, operada por Coach OS Tecnologia Ltda. (&quot;Coach OS&quot;, &quot;nós&quot;). Ao criar uma conta ou utilizar qualquer funcionalidade da plataforma, você (&quot;Usuário&quot;) concorda integralmente com estes termos.
            </p>
            <p className="text-muted-foreground">
              Se você não concordar com qualquer disposição destes Termos, não utilize a plataforma.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="definicoes" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">2. Definições</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Plataforma:</span> o sistema Coach OS acessível em coachos.com.br e seus subdomínios.</li>
              <li><span className="font-medium text-foreground">Coach (Personal Trainer):</span> profissional que contrata a plataforma para gerir seus alunos.</li>
              <li><span className="font-medium text-foreground">Aluno:</span> cliente do Coach que acessa o portal do aluno.</li>
              <li><span className="font-medium text-foreground">Workspace (Tenant):</span> ambiente isolado de dados de cada Coach.</li>
              <li><span className="font-medium text-foreground">Conteúdo:</span> qualquer dado, texto, imagem ou arquivo inserido na plataforma pelo Usuário.</li>
            </ul>
          </section>

          <div className="border-t border-border/40" />

          <section id="uso" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">3. Uso da Plataforma</h2>
            <p className="text-muted-foreground">O Usuário se compromete a utilizar a plataforma somente para fins lícitos e de acordo com estes Termos. É vedado:</p>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Compartilhar credenciais de acesso com terceiros não autorizados.</li>
              <li>Realizar engenharia reversa, descompilar ou tentar acessar o código-fonte.</li>
              <li>Inserir conteúdo ilegal, ofensivo, fraudulento ou que viole direitos de terceiros.</li>
              <li>Utilizar a plataforma para envio de spam ou comunicações não solicitadas.</li>
              <li>Tentar comprometer a segurança, disponibilidade ou integridade do sistema.</li>
            </ul>
          </section>

          <div className="border-t border-border/40" />

          <section id="conta" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">4. Conta e Responsabilidades</h2>
            <p className="text-muted-foreground">
              O Usuário é responsável por manter a confidencialidade de suas credenciais de acesso. Todas as atividades realizadas com suas credenciais são de sua responsabilidade.
            </p>
            <p className="text-muted-foreground">
              O Coach é inteiramente responsável pelo conteúdo inserido na plataforma e pela gestão dos dados de seus alunos, incluindo o cumprimento da legislação de proteção de dados aplicável.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="planos" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">5. Planos e Cobrança</h2>
            <p className="text-muted-foreground">
              A plataforma é oferecida mediante assinatura mensal conforme os planos disponíveis em coachos.com.br. As cobranças são processadas via Stripe e renovadas automaticamente a cada ciclo.
            </p>
            <p className="text-muted-foreground">
              O período de avaliação gratuita (quando disponível) não exige cartão de crédito. Ao contratar um plano, a cobrança é imediata. O cancelamento pode ser feito a qualquer momento e o acesso permanece até o fim do período pago.
            </p>
            <p className="text-muted-foreground">
              Não realizamos reembolsos de períodos já utilizados, salvo nos casos previstos no Código de Defesa do Consumidor.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="propriedade" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">6. Propriedade Intelectual</h2>
            <p className="text-muted-foreground">
              O software, design, marcas e demais elementos da plataforma são de propriedade exclusiva do Coach OS e protegidos pela legislação de propriedade intelectual aplicável.
            </p>
            <p className="text-muted-foreground">
              O Conteúdo inserido pelo Usuário permanece de sua propriedade. Ao inserir conteúdo na plataforma, o Usuário concede ao Coach OS licença limitada e não exclusiva para armazenar e exibir esse conteúdo exclusivamente no contexto da prestação do serviço.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="dados" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">7. Dados e Privacidade</h2>
            <p className="text-muted-foreground">
              O tratamento de dados pessoais pelo Coach OS é regido pela nossa{" "}
              <a href="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>
              , em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018).
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="limitacoes" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">8. Limitações de Responsabilidade</h2>
            <p className="text-muted-foreground">
              A plataforma é fornecida &quot;no estado em que se encontra&quot;. O Coach OS não garante disponibilidade ininterrupta e não se responsabiliza por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso ou impossibilidade de uso da plataforma.
            </p>
            <p className="text-muted-foreground">
              Em nenhuma hipótese a responsabilidade do Coach OS excederá o valor pago pelo Usuário nos últimos 3 meses de assinatura.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="rescisao" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">9. Rescisão</h2>
            <p className="text-muted-foreground">
              O Usuário pode encerrar sua conta a qualquer momento. O Coach OS pode suspender ou encerrar contas que violem estes Termos, sem prejuízo de outras medidas legais cabíveis.
            </p>
            <p className="text-muted-foreground">
              Após o encerramento da conta, os dados do Usuário são mantidos por até 30 dias para eventual recuperação, sendo depois excluídos permanentemente.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="alteracoes" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">10. Alterações nos Termos</h2>
            <p className="text-muted-foreground">
              O Coach OS pode alterar estes Termos a qualquer momento. Alterações relevantes serão notificadas por e-mail com pelo menos 10 dias de antecedência. O uso continuado da plataforma após esse prazo implica aceitação dos novos termos.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="foro" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">11. Foro e Legislação</h2>
            <p className="text-muted-foreground">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer controvérsias, renunciando as partes a qualquer outro, por mais privilegiado que seja.
            </p>
            <p className="text-muted-foreground">
              Em caso de dúvidas sobre estes Termos, entre em contato:{" "}
              <a href="/contato" className="text-primary hover:underline">
                coachos.com.br/contato
              </a>
              .
            </p>
          </section>

        </div>
      </LegalDocument>

      <Footer />
    </div>
  );
}
