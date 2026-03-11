import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

import { env } from "@config/env";

export interface SendInviteEmailParams {
  to: string;
  studentName: string;
  personalName: string;
  setupPasswordUrl: string;
}

export interface SendBookingConfirmationParams {
  to: string;
  studentName: string;
  personalName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  servicePlanName: string;
}

export interface SendBookingNotificationParams {
  to: string;
  personalName: string;
  studentName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
}

export interface SendSupportContactParams {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SendPasswordResetParams {
  to: string;
  userName: string;
  resetPasswordUrl: string;
}

@Injectable()
export class ResendProvider {
  private readonly client: Resend | null;
  private readonly logger = new Logger(ResendProvider.name);

  // Theme colors matching frontend (approximate OKLCH to HEX)
  private readonly colors = {
    primary: "#facc15", // oklch(0.77 0.16 70)
    background: "#09090b", // oklch(0.147 0.004 49.25)
    card: "#18181b", // oklch(0.216 0.006 56.043)
    foreground: "#fafafa", // oklch(0.985 0.001 106.423)
    muted: "#a1a1aa", // oklch(0.709 0.01 56.259)
    border: "#27272a", // oklch(1 0 0 / 10%) -> approximation
  };

  constructor() {
    this.client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
    if (!this.client) {
      this.logger.warn("RESEND_API_KEY not set — email sending is disabled");
    }
  }

  private getEmailLayout(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            background-color: ${this.colors.background};
            color: ${this.colors.foreground};
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: ${this.colors.primary};
            text-decoration: none;
            letter-spacing: -0.025em;
          }
          .card {
            background-color: ${this.colors.card};
            border: 1px solid ${this.colors.border};
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
          h1, h2, h3 {
            color: ${this.colors.foreground};
            margin-top: 0;
          }
          p {
            font-size: 16px;
            line-height: 1.6;
            margin: 16px 0;
            color: ${this.colors.foreground};
          }
          .button {
            display: inline-block;
            background-color: ${this.colors.primary};
            color: #000000 !important;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            text-align: center;
            margin: 24px 0;
          }
          .footer {
            margin-top: 32px;
            text-align: center;
            font-size: 14px;
            color: ${this.colors.muted};
          }
          .details {
            background-color: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 20px;
            margin: 24px 0;
          }
          .detail-row {
            margin-bottom: 8px;
            font-size: 15px;
          }
          .detail-row:last-child {
            margin-bottom: 0;
          }
          .label {
            color: ${this.colors.muted};
            font-weight: 500;
            width: 100px;
            display: inline-block;
          }
          .value {
            color: ${this.colors.foreground};
            font-weight: 600;
          }
          .divider {
            height: 1px;
            background-color: ${this.colors.border};
            margin: 24px 0;
          }
          .muted-text {
            color: ${this.colors.muted};
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="logo">Coach OS</span>
          </div>
          <div class="card">
            ${content}
          </div>
          <div class="footer">
            <p class="muted-text">
              &copy; ${new Date().getFullYear()} Coach OS. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendStudentInvite(params: SendInviteEmailParams): Promise<void> {
    if (!this.client) return;
    const { to, studentName, personalName, setupPasswordUrl } = params;

    const html = this.getEmailLayout(`
      <h2>Olá, ${studentName}!</h2>
      <p>
        <strong>${personalName}</strong> convidou você para fazer parte da plataforma <strong>Coach OS</strong>.
      </p>
      <p>
        Estamos ansiosos para ajudar você a alcançar seus objetivos. Para começar, clique no botão abaixo para definir sua senha de acesso:
      </p>
      <div style="text-align: center;">
        <a href="${setupPasswordUrl}" class="button">Definir minha senha</a>
      </div>
      <div class="divider"></div>
      <p class="muted-text">
        Este link é válido por <strong>48 horas</strong>.
        Após esse prazo, será necessário solicitar um novo convite ao seu personal.
      </p>
      <p class="muted-text" style="font-size: 12px; margin-top: 16px;">
        Se você não esperava receber este e-mail, pode ignorá-lo com segurança.
      </p>
    `);

    try {
      await this.client.emails.send({
        from: "Coach OS <no-reply@geeknizado.com.br>",
        to,
        subject: `${personalName} te convidou para o Coach OS`,
        html,
      });
    } catch (error) {
      this.logger.error("Failed to send student invite email", error);
    }
  }

  async sendBookingConfirmation(params: SendBookingConfirmationParams): Promise<void> {
    if (!this.client) return;
    const { to, studentName, personalName, scheduledDate, startTime, endTime, servicePlanName } =
      params;

    const html = this.getEmailLayout(`
      <h2>Olá, ${studentName}!</h2>
      <p>Excelente notícia! Seu agendamento foi confirmado com sucesso.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Personal:</span>
          <span class="value">${personalName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Plano:</span>
          <span class="value">${servicePlanName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Data:</span>
          <span class="value">${scheduledDate}</span>
        </div>
        <div class="detail-row">
          <span class="label">Horário:</span>
          <span class="value">${startTime} — ${endTime}</span>
        </div>
      </div>
      
      <p>Prepare-se para o treino!</p>
    `);

    try {
      await this.client.emails.send({
        from: "Coach OS <no-reply@geeknizado.com.br>",
        to,
        subject: "Agendamento Confirmado! 🚀",
        html,
      });
    } catch (error) {
      this.logger.error("Failed to send booking confirmation email", error);
    }
  }

  async sendBookingNotification(params: SendBookingNotificationParams): Promise<void> {
    if (!this.client) return;
    const { to, personalName, studentName, scheduledDate, startTime, endTime } = params;

    const html = this.getEmailLayout(`
      <h2>Olá, ${personalName}!</h2>
      <p>Você tem um novo agendamento realizado por <strong>${studentName}</strong>.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Aluno:</span>
          <span class="value">${studentName}</span>
        </div>
        <div class="detail-row">
          <span class="label">Data:</span>
          <span class="value">${scheduledDate}</span>
        </div>
        <div class="detail-row">
          <span class="label">Horário:</span>
          <span class="value">${startTime} — ${endTime}</span>
        </div>
      </div>
      
      <p>Confira os detalhes no seu painel de controle.</p>
      <div style="text-align: center;">
        <a href="${env.APP_URL}/painel" class="button">Ver Agenda</a>
      </div>
    `);

    try {
      await this.client.emails.send({
        from: "Coach OS <no-reply@geeknizado.com.br>",
        to,
        subject: `Novo agendamento: ${studentName}`,
        html,
      });
    } catch (error) {
      this.logger.error("Failed to send booking notification email", error);
    }
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    if (!this.client) return;
    const { to, userName, resetPasswordUrl } = params;

    const html = this.getEmailLayout(`
      <h2>Recuperação de Senha</h2>
      <p>Olá, ${userName}!</p>
      <p>Recebemos uma solicitação para redefinir a sua senha no <strong>Coach OS</strong>.</p>
      <p>Se foi você que solicitou, clique no botão abaixo para criar uma nova senha:</p>
      <div style="text-align: center;">
        <a href="${resetPasswordUrl}" class="button">Redefinir minha senha</a>
      </div>
      <div class="divider"></div>
      <p class="muted-text">
        Este link é válido por <strong>2 horas</strong> por motivos de segurança.
        Se você não solicitou a redefinição de senha, pode ignorar este e-mail.
      </p>
    `);

    try {
      await this.client.emails.send({
        from: "Coach OS <no-reply@geeknizado.com.br>",
        to,
        subject: "Recuperação de Senha — Coach OS",
        html,
      });
    } catch (error) {
      this.logger.error("Failed to send password reset email", error);
    }
  }

  async sendSupportContact(params: SendSupportContactParams): Promise<void> {
    if (!this.client) return;
    const { name, email, subject, message } = params;

    const html = this.getEmailLayout(`
      <h2>Novo contato pelo site</h2>
      <p>Uma nova mensagem foi enviada pela página de contato do Coach OS.</p>

      <div class="details">
        <div class="detail-row">
          <span class="label">Nome:</span>
          <span class="value">${name}</span>
        </div>
        <div class="detail-row">
          <span class="label">E-mail:</span>
          <span class="value">${email}</span>
        </div>
        <div class="detail-row">
          <span class="label">Assunto:</span>
          <span class="value">${subject}</span>
        </div>
      </div>

      <p><strong>Mensagem:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `);

    try {
      await this.client.emails.send({
        from: "Coach OS <no-reply@geeknizado.com.br>",
        to: env.SUPPORT_EMAIL,
        subject: `[Contato] ${subject}`,
        html,
        replyTo: email,
      });
    } catch (error) {
      this.logger.error("Failed to send support contact email", error);
    }
  }
}
