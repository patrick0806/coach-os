import { type Metadata } from "next";
import { Shield } from "lucide-react";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { InstitutionalHero } from "@/features/marketing/components/institutionalHero";
import { LegalDocument } from "@/features/marketing/components/legalDocument";

export const metadata: Metadata = {
  title: "Política de Privacidade — Coach OS",
  description: "Entenda como o Coach OS coleta, usa e protege seus dados pessoais conforme a LGPD.",
  alternates: { canonical: "/privacidade" },
};

const sections = [
  { id: "controlador", title: "1. Controlador dos Dados" },
  { id: "dados-coletados", title: "2. Dados Coletados" },
  { id: "finalidade", title: "3. Finalidade do Tratamento" },
  { id: "base-legal", title: "4. Base Legal" },
  { id: "compartilhamento", title: "5. Compartilhamento" },
  { id: "retencao", title: "6. Retenção de Dados" },
  { id: "seguranca", title: "7. Segurança" },
  { id: "direitos", title: "8. Seus Direitos (LGPD)" },
  { id: "cookies", title: "9. Cookies" },
  { id: "menores", title: "10. Menores de Idade" },
  { id: "alteracoes", title: "11. Alterações" },
  { id: "contato", title: "12. Contato do DPO" },
];

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <InstitutionalHero
        icon={Shield}
        title="Política de Privacidade"
        description="Sua privacidade é levada a sério. Veja como coletamos, usamos e protegemos seus dados."
      />

      <LegalDocument sections={sections} updatedAt="23 de março de 2026">
        <div className="space-y-12 text-sm leading-relaxed text-foreground">

          <section id="controlador" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">1. Controlador dos Dados</h2>
            <p className="text-muted-foreground">
              O controlador dos dados pessoais tratados nesta política é o Coach OS Tecnologia Ltda. Esta política aplica-se a todos os dados coletados por meio da plataforma Coach OS, acessível em coachos.com.br.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="dados-coletados" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">2. Dados Coletados</h2>
            <p className="text-muted-foreground">Coletamos as seguintes categorias de dados:</p>
            <div className="space-y-4">
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-medium">Dados de identificação</p>
                <p className="mt-1 text-muted-foreground">Nome, e-mail e senha (armazenada em formato hash irreversível com Argon2id).</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-medium">Dados de uso</p>
                <p className="mt-1 text-muted-foreground">Registros de acesso, logs de atividade, preferências de configuração e funcionalidades utilizadas.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-medium">Dados de cobrança</p>
                <p className="mt-1 text-muted-foreground">Gerenciados diretamente pelo Stripe. O Coach OS não armazena dados completos de cartão de crédito.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-medium">Dados de alunos</p>
                <p className="mt-1 text-muted-foreground">Inseridos pelo Coach (Personal Trainer) no contexto da prestação de serviços ao aluno — nome, e-mail, objetivo, progresso e fotos de evolução.</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-medium">Dados sensiveis de saude</p>
                <p className="mt-1 text-muted-foreground">Fotos de progresso e imagens corporais enviadas pelo coach ou pelo aluno para acompanhamento de evolucao fisica. Esses dados sao tratados com base no consentimento explicito do titular e armazenados com as mesmas medidas de seguranca aplicadas aos demais dados pessoais.</p>
              </div>
            </div>
          </section>

          <div className="border-t border-border/40" />

          <section id="finalidade" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">3. Finalidade do Tratamento</h2>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Prestação dos serviços contratados (gestão de treinos, agenda, portal do aluno).</li>
              <li>Processamento de pagamentos e gestão de assinaturas.</li>
              <li>Comunicações transacionais (confirmações, alertas de segurança, notas fiscais).</li>
              <li>Acompanhamento de evolucao fisica do aluno por meio de fotos de progresso e registros de medidas corporais.</li>
              <li>Melhoria contínua da plataforma por meio de análise de uso agregado e anonimizado.</li>
              <li>Cumprimento de obrigações legais e regulatórias.</li>
            </ul>
          </section>

          <div className="border-t border-border/40" />

          <section id="base-legal" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">4. Base Legal (LGPD)</h2>
            <p className="text-muted-foreground">O tratamento dos seus dados é realizado com fundamento nas seguintes bases legais previstas na LGPD (Lei 13.709/2018):</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Execução de contrato</span> — para prestar os serviços contratados.</li>
              <li><span className="font-medium text-foreground">Consentimento</span> — para comunicações de marketing (revogável a qualquer momento).</li>
              <li><span className="font-medium text-foreground">Obrigação legal</span> — para cumprimento de exigências fiscais e regulatórias.</li>
              <li><span className="font-medium text-foreground">Legítimo interesse</span> — para segurança da plataforma e prevenção de fraudes.</li>
            </ul>
          </section>

          <div className="border-t border-border/40" />

          <section id="compartilhamento" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">5. Compartilhamento de Dados</h2>
            <p className="text-muted-foreground">Não vendemos dados pessoais. Compartilhamos informações apenas com:</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Stripe</span> — processamento de pagamentos (sede nos EUA, adequação GDPR/LGPD).</li>
              <li><span className="font-medium text-foreground">Amazon Web Services (AWS)</span> — armazenamento de arquivos em servidores no Brasil.</li>
              <li><span className="font-medium text-foreground">Resend</span> — envio de e-mails transacionais.</li>
              <li><span className="font-medium text-foreground">Autoridades competentes</span> — quando exigido por lei ou ordem judicial.</li>
            </ul>
          </section>

          <div className="border-t border-border/40" />

          <section id="retencao" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">6. Retenção de Dados</h2>
            <p className="text-muted-foreground">
              Mantemos seus dados pelo tempo necessário para a prestação dos serviços e cumprimento de obrigações legais. Imagens e fotos de progresso sao removidas do armazenamento quando substituidas ou quando o titular solicita a exclusao. Após o encerramento da conta, todos os dados pessoais — incluindo imagens armazenadas — sao excluidos em até 30 dias, exceto quando a retenção for obrigatória por lei (ex.: dados fiscais por 5 anos).
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="seguranca" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">7. Segurança</h2>
            <p className="text-muted-foreground">Adotamos medidas técnicas e organizacionais para proteger seus dados:</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Senhas armazenadas com hash Argon2id + pepper.</li>
              <li>Comunicação criptografada via HTTPS/TLS.</li>
              <li>Isolamento de dados por tenant (workspace) — nenhum coach acessa dados de outro.</li>
              <li>Tokens de acesso com expiração curta e refresh tokens em cookies HTTP-only.</li>
              <li>Uploads de arquivos via URLs pré-assinadas direto para AWS S3.</li>
            </ul>
          </section>

          <div className="border-t border-border/40" />

          <section id="direitos" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">8. Seus Direitos (LGPD)</h2>
            <p className="text-muted-foreground">Conforme a LGPD, você tem direito a:</p>
            <ul className="list-inside list-disc space-y-2 text-muted-foreground">
              <li>Confirmar a existência do tratamento dos seus dados.</li>
              <li>Acessar os dados que mantemos sobre você.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Solicitar a portabilidade dos seus dados.</li>
              <li>Solicitar a exclusao de fotos de progresso e imagens corporais a qualquer momento.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
            <p className="text-muted-foreground">
              Para exercer qualquer desses direitos, entre em{" "}
              <a href="/contato" className="text-primary hover:underline">contato</a> conosco.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="cookies" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">9. Cookies</h2>
            <p className="text-muted-foreground">
              Utilizamos cookies estritamente necessários para autenticação e funcionamento da plataforma (refresh token em cookie HTTP-only). Não utilizamos cookies de rastreamento publicitário.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="menores" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">10. Menores de Idade</h2>
            <p className="text-muted-foreground">
              A plataforma é destinada a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Caso identifique dados de menor registrados sem autorização, entre em contato para remoção imediata.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="alteracoes" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">11. Alterações nesta Política</h2>
            <p className="text-muted-foreground">
              Podemos atualizar esta Política periodicamente. Alterações relevantes serão comunicadas por e-mail. A data de &quot;última atualização&quot; no topo desta página indica a versão vigente.
            </p>
          </section>

          <div className="border-t border-border/40" />

          <section id="contato" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold">12. Contato do DPO</h2>
            <p className="text-muted-foreground">
              Para questões relacionadas a privacidade e proteção de dados, entre em contato com nosso Encarregado de Proteção de Dados (DPO):
            </p>
            <div className="rounded-xl border border-border/60 bg-card/40 p-4">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">E-mail:</span> privacidade@coachos.com.br
              </p>
              <p className="mt-1 text-muted-foreground">
                <span className="font-medium text-foreground">Formulário:</span>{" "}
                <a href="/contato" className="text-primary hover:underline">coachos.com.br/contato</a>
              </p>
            </div>
          </section>

        </div>
      </LegalDocument>

      <Footer />
    </div>
  );
}
