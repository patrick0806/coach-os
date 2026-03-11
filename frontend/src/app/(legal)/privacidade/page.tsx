export const metadata = {
  title: "Privacidade | Coach OS",
  description: "Entenda como o Coach OS coleta e protege seus dados e de seus alunos.",
};

export default function PrivacyPage() {
  const lastUpdated = "11 de Março de 2026";

  return (
    <>
      <h1>Política de Privacidade</h1>
      <p>Última atualização: {lastUpdated}</p>

      <section>
        <h2>1. Introdução</h2>
        <p>
          O Coach OS está comprometido com a privacidade e proteção dos seus dados. 
          Esta política explica como coletamos, usamos e protegemos as 
          informações coletadas através da nossa plataforma em conformidade com 
          a Lei Geral de Proteção de Dados (LGPD).
        </p>
      </section>

      <section>
        <h2>2. Coleta de Informações</h2>
        <p>
          Coletamos as seguintes categorias de informações:
        </p>
        <ul>
          <li><strong>Informações Cadastrais:</strong> Nome, e-mail e dados profissionais para criação da conta.</li>
          <li><strong>Dados de Alunos:</strong> Informações sobre seus alunos cadastradas por você na plataforma.</li>
          <li><strong>Dados de Uso:</strong> Informações sobre como você interage com nossa plataforma (cookies, logs).</li>
          <li><strong>Dados de Pagamento:</strong> Processados de forma segura e criptografada pelo Stripe (não armazenamos dados de cartão de crédito em nossos servidores).</li>
        </ul>
      </section>

      <section>
        <h2>3. Uso das Informações</h2>
        <p>
          As informações coletadas são utilizadas para:
        </p>
        <ul>
          <li>Fornecer e manter os serviços da plataforma.</li>
          <li>Processar assinaturas e pagamentos.</li>
          <li>Enviar comunicações sobre atualizações, suporte ou marketing.</li>
          <li>Melhorar continuamente a experiência do usuário.</li>
        </ul>
      </section>

      <section>
        <h2>4. Compartilhamento de Dados</h2>
        <p>
          O Coach OS não vende suas informações. Compartilhamos seus dados 
          apenas em circunstâncias limitadas, como:
        </p>
        <ul>
          <li><strong>Provedores de Serviço:</strong> Com parceiros confiáveis como o Stripe (pagamentos), AWS (hospedagem) e Resend (e-mails).</li>
          <li><strong>Obrigações Legais:</strong> Se exigido por lei ou intimação judicial.</li>
        </ul>
      </section>

      <section>
        <h2>5. Segurança</h2>
        <p>
          Implementamos medidas de segurança técnicas e organizacionais para 
          proteger seus dados contra acesso não autorizado, alteração, divulgação 
          ou destruição.
        </p>
      </section>

      <section>
        <h2>6. Seus Direitos (LGPD)</h2>
        <p>
          Você tem o direito de acessar, corrigir, portar ou excluir seus dados 
          pessoais de nossa plataforma a qualquer momento através das 
          configurações da conta.
        </p>
      </section>

      <section>
        <h2>7. Contato</h2>
        <p>
          Em caso de dúvidas sobre nossa política de privacidade, entre em 
          contato com privacidade@coachos.com.br.
        </p>
      </section>
    </>
  );
}
