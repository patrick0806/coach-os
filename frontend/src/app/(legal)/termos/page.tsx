export const metadata = {
  title: "Termos de Uso | Coach OS",
  description: "Leia os termos e condições de uso da plataforma Coach OS.",
};

export default function TermsPage() {
  const lastUpdated = "11 de Março de 2026";

  return (
    <>
      <h1>Termos de Uso</h1>
      <p>Última atualização: {lastUpdated}</p>

      <section>
        <h2>1. Aceitação dos Termos</h2>
        <p>
          Ao acessar e utilizar a plataforma Coach OS, você concorda em cumprir e
          estar vinculado aos seguintes Termos de Uso. Se você não concordar com
          algum destes termos, você não deve utilizar nossa plataforma.
        </p>
      </section>

      <section>
        <h2>2. Descrição do Serviço</h2>
        <p>
          O Coach OS é uma plataforma de gestão para Personal Trainers,
          oferecendo ferramentas de prescrição de treinos, gestão de alunos,
          agendamento de sessões e cobrança de assinaturas.
        </p>
      </section>

      <section>
        <h2>3. Responsabilidades do Usuário</h2>
        <p>
          Como Personal Trainer, você é o único responsável pela veracidade das
          informações fornecidas, pela prescrição técnica dos exercícios e pelo
          uso ético dos dados dos seus alunos. Você concorda em não utilizar a
          plataforma para fins ilegais ou não autorizados.
        </p>
      </section>

      <section>
        <h2>4. Assinaturas e Pagamentos</h2>
        <p>
          O Coach OS oferece planos de assinatura pagos. Os pagamentos são
          processados via Stripe. Ao assinar um plano, você concorda com as
          tarifas vigentes e autoriza a cobrança recorrente no método de
          pagamento fornecido.
        </p>
        <p>
          <strong>Cancelamento:</strong> Você pode cancelar sua assinatura a
          qualquer momento através do painel de gestão. O acesso será mantido
          até o final do período já pago.
        </p>
      </section>

      <section>
        <h2>5. Limitação de Responsabilidade</h2>
        <p>
          O Coach OS é uma ferramenta de suporte. Não nos responsabilizamos por
          lesões físicas, danos à saúde ou qualquer outro evento resultante da
          execução de treinos prescritos através da plataforma. A supervisão
          técnica e médica é de inteira responsabilidade do profissional e do
          aluno.
        </p>
      </section>

      <section>
        <h2>6. Alterações nos Termos</h2>
        <p>
          Reservamo-nos o direito de atualizar estes termos a qualquer momento.
          Alterações significativas serão notificadas através do e-mail
          cadastrado ou aviso na plataforma.
        </p>
      </section>

      <section>
        <h2>7. Contato</h2>
        <p>
          Se tiver dúvidas sobre estes termos, entre em contato conosco através
          do e-mail suporte@coachos.com.br.
        </p>
      </section>
    </>
  );
}
