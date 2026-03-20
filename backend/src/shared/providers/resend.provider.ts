import React from "react";
import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { render } from "@react-email/render";

import { env } from "@config/env";
import { logger } from "@config/pino.config";
import { LogBuilderService } from "./LogBuilder.service";

import { WelcomeEmail } from "@shared/emails/templates/welcome.email";
import { PasswordResetRequestEmail } from "@shared/emails/templates/passwordResetRequest.email";
import { PasswordResetConfirmEmail } from "@shared/emails/templates/passwordResetConfirm.email";
import { PlanSubscribedEmail } from "@shared/emails/templates/planSubscribed.email";
import { PlanChangedEmail } from "@shared/emails/templates/planChanged.email";
import { PlanCancelledEmail } from "@shared/emails/templates/planCancelled.email";
import { AccessLostEmail } from "@shared/emails/templates/accessLost.email";
import { PaymentFailedEmail } from "@shared/emails/templates/paymentFailed.email";
import { PaymentRetryEmail } from "@shared/emails/templates/paymentRetry.email";
import { TrialEndingSoonEmail } from "@shared/emails/templates/trialEndingSoon.email";
import { StudentInviteEmail } from "@shared/emails/templates/studentInvite.email";
import { StudentPasswordSetupEmail } from "@shared/emails/templates/studentPasswordSetup.email";
import { StudentPasswordResetConfirmEmail } from "@shared/emails/templates/studentPasswordResetConfirm.email";

const FROM_ADDRESS = "Coach OS <no-reply@geeknizado.com.br>";

// --- Param interfaces ---

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

export interface SendPasswordResetConfirmParams {
  to: string;
  userName: string;
}

export interface SendWelcomeParams {
  to: string;
  userName: string;
}

export interface SendPlanSubscribedParams {
  to: string;
  userName: string;
  planName: string;
  expiresAt?: string;
}

export interface SendPlanChangedParams {
  to: string;
  userName: string;
  newPlanName: string;
  oldPlanName?: string;
}

export interface SendPlanCancelledParams {
  to: string;
  userName: string;
  expiresAt?: string;
}

export interface SendAccessLostParams {
  to: string;
  userName: string;
}

export interface SendPaymentFailedParams {
  to: string;
  userName: string;
}

export interface SendPaymentRetryParams {
  to: string;
  userName: string;
  retryDate: string;
}

export interface SendTrialEndingSoonParams {
  to: string;
  userName: string;
  trialEndsAt: string;
  upgradeUrl: string;
}

export interface SendStudentPasswordSetupConfirmParams {
  to: string;
  studentName: string;
}

export interface SendStudentPasswordResetConfirmParams {
  to: string;
  studentName: string;
}

@Injectable()
export class ResendProvider {
  private readonly client: Resend | null;

  // Legacy HTML layout kept for booking/session emails not yet migrated
  private readonly legacyColors = {
    primary: "#facc15",
    background: "#09090b",
    card: "#18181b",
    foreground: "#fafafa",
    muted: "#a1a1aa",
    border: "#27272a",
  };

  constructor() {
    this.client = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
    if (!this.client) {
      logger.warn("RESEND_API_KEY not set — email sending is disabled");
    }
  }

  // --- Helper to send email with rendered React Email template ---
  private async sendWithTemplate(params: {
    to: string;
    subject: string;
    element: React.ReactElement;
  }): Promise<void> {
    if (!this.client) return;

    try {
      const html = await render(params.element);
      await this.client.emails.send({
        from: FROM_ADDRESS,
        to: params.to,
        subject: params.subject,
        html,
      });
    } catch (error) {
      LogBuilderService.log("error", `Failed to send email: ${params.subject}`, error);
    }
  }

  // --- New React Email methods ---

  async sendWelcome(params: SendWelcomeParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Bem-vindo ao Coach OS!",
      element: React.createElement(WelcomeEmail, { userName: params.userName }),
    });
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Recuperação de Senha — Coach OS",
      element: React.createElement(PasswordResetRequestEmail, {
        userName: params.userName,
        resetPasswordUrl: params.resetPasswordUrl,
      }),
    });
  }

  async sendPasswordResetConfirm(params: SendPasswordResetConfirmParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Senha redefinida com sucesso — Coach OS",
      element: React.createElement(PasswordResetConfirmEmail, { userName: params.userName }),
    });
  }

  async sendPlanSubscribed(params: SendPlanSubscribedParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: `Plano ${params.planName} ativado — Coach OS`,
      element: React.createElement(PlanSubscribedEmail, {
        userName: params.userName,
        planName: params.planName,
        expiresAt: params.expiresAt,
      }),
    });
  }

  async sendPlanChanged(params: SendPlanChangedParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: `Plano alterado para ${params.newPlanName} — Coach OS`,
      element: React.createElement(PlanChangedEmail, {
        userName: params.userName,
        newPlanName: params.newPlanName,
        oldPlanName: params.oldPlanName,
      }),
    });
  }

  async sendPlanCancelled(params: SendPlanCancelledParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Cancelamento de assinatura agendado — Coach OS",
      element: React.createElement(PlanCancelledEmail, {
        userName: params.userName,
        expiresAt: params.expiresAt,
      }),
    });
  }

  async sendAccessLost(params: SendAccessLostParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Seu acesso ao Coach OS foi encerrado",
      element: React.createElement(AccessLostEmail, { userName: params.userName }),
    });
  }

  async sendPaymentFailed(params: SendPaymentFailedParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Falha no pagamento — Coach OS",
      element: React.createElement(PaymentFailedEmail, { userName: params.userName }),
    });
  }

  async sendPaymentRetry(params: SendPaymentRetryParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Nova tentativa de cobrança agendada — Coach OS",
      element: React.createElement(PaymentRetryEmail, {
        userName: params.userName,
        retryDate: params.retryDate,
      }),
    });
  }

  async sendTrialEndingSoon(params: SendTrialEndingSoonParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Seu período trial está encerrando — Coach OS",
      element: React.createElement(TrialEndingSoonEmail, {
        userName: params.userName,
        trialEndsAt: params.trialEndsAt,
        upgradeUrl: params.upgradeUrl,
      }),
    });
  }

  async sendStudentInvite(params: SendInviteEmailParams): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: `${params.personalName} te convidou para o Coach OS`,
      element: React.createElement(StudentInviteEmail, {
        studentName: params.studentName,
        personalName: params.personalName,
        setupPasswordUrl: params.setupPasswordUrl,
      }),
    });
  }

  async sendStudentPasswordSetupConfirm(
    params: SendStudentPasswordSetupConfirmParams,
  ): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Senha configurada com sucesso — Coach OS",
      element: React.createElement(StudentPasswordSetupEmail, {
        studentName: params.studentName,
      }),
    });
  }

  async sendStudentPasswordResetConfirm(
    params: SendStudentPasswordResetConfirmParams,
  ): Promise<void> {
    await this.sendWithTemplate({
      to: params.to,
      subject: "Senha redefinida com sucesso — Coach OS",
      element: React.createElement(StudentPasswordResetConfirmEmail, {
        studentName: params.studentName,
      }),
    });
  }

  // --- Legacy HTML methods (booking/session emails — not yet migrated) ---

  private getLegacyEmailLayout(content: string): string {
    const c = this.legacyColors;
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { background-color: ${c.background}; color: ${c.foreground}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 32px; }
          .logo { font-size: 24px; font-weight: bold; color: ${c.primary}; text-decoration: none; letter-spacing: -0.025em; }
          .card { background-color: ${c.card}; border: 1px solid ${c.border}; border-radius: 12px; padding: 32px; }
          h1, h2, h3 { color: ${c.foreground}; margin-top: 0; }
          p { font-size: 16px; line-height: 1.6; margin: 16px 0; color: ${c.foreground}; }
          .button { display: inline-block; background-color: ${c.primary}; color: #000000 !important; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; text-decoration: none; text-align: center; margin: 24px 0; }
          .footer { margin-top: 32px; text-align: center; font-size: 14px; color: ${c.muted}; }
          .details { background-color: rgba(255,255,255,0.03); border-radius: 8px; padding: 20px; margin: 24px 0; }
          .detail-row { margin-bottom: 8px; font-size: 15px; }
          .label { color: ${c.muted}; font-weight: 500; width: 100px; display: inline-block; }
          .value { color: ${c.foreground}; font-weight: 600; }
          .divider { height: 1px; background-color: ${c.border}; margin: 24px 0; }
          .muted-text { color: ${c.muted}; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><span class="logo">Coach OS</span></div>
          <div class="card">${content}</div>
          <div class="footer"><p class="muted-text">&copy; ${new Date().getFullYear()} Coach OS. Todos os direitos reservados.</p></div>
        </div>
      </body>
      </html>
    `;
  }

  async sendBookingConfirmation(params: SendBookingConfirmationParams): Promise<void> {
    if (!this.client) return;
    const { to, studentName, personalName, scheduledDate, startTime, endTime, servicePlanName } =
      params;

    const html = this.getLegacyEmailLayout(`
      <h2>Olá, ${studentName}!</h2>
      <p>Excelente notícia! Seu agendamento foi confirmado com sucesso.</p>
      <div class="details">
        <div class="detail-row"><span class="label">Personal:</span><span class="value">${personalName}</span></div>
        <div class="detail-row"><span class="label">Plano:</span><span class="value">${servicePlanName}</span></div>
        <div class="detail-row"><span class="label">Data:</span><span class="value">${scheduledDate}</span></div>
        <div class="detail-row"><span class="label">Horário:</span><span class="value">${startTime} — ${endTime}</span></div>
      </div>
      <p>Prepare-se para o treino!</p>
    `);

    try {
      await this.client.emails.send({
        from: FROM_ADDRESS,
        to,
        subject: "Agendamento Confirmado!",
        html,
      });
    } catch (error) {
      LogBuilderService.log("error", "Failed to send booking confirmation email", error);
    }
  }

  async sendBookingNotification(params: SendBookingNotificationParams): Promise<void> {
    if (!this.client) return;
    const { to, personalName, studentName, scheduledDate, startTime, endTime } = params;

    const html = this.getLegacyEmailLayout(`
      <h2>Olá, ${personalName}!</h2>
      <p>Você tem um novo agendamento realizado por <strong>${studentName}</strong>.</p>
      <div class="details">
        <div class="detail-row"><span class="label">Aluno:</span><span class="value">${studentName}</span></div>
        <div class="detail-row"><span class="label">Data:</span><span class="value">${scheduledDate}</span></div>
        <div class="detail-row"><span class="label">Horário:</span><span class="value">${startTime} — ${endTime}</span></div>
      </div>
      <p>Confira os detalhes no seu painel de controle.</p>
      <div style="text-align: center;"><a href="${env.APP_URL}/painel" class="button">Ver Agenda</a></div>
    `);

    try {
      await this.client.emails.send({
        from: FROM_ADDRESS,
        to,
        subject: `Novo agendamento: ${studentName}`,
        html,
      });
    } catch (error) {
      LogBuilderService.log("error", "Failed to send booking notification email", error);
    }
  }

  async sendSessionCancellation(params: {
    to: string;
    studentName: string;
    scheduledDate: string;
    reason?: string;
  }): Promise<void> {
    if (!this.client) return;
    const { to, studentName, scheduledDate, reason } = params;

    const formattedDate = new Date(`${scheduledDate}T00:00:00`).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const html = this.getLegacyEmailLayout(`
      <h2>Olá, ${studentName}!</h2>
      <p>Seu personal trainer cancelou a sessão de treino do dia abaixo.</p>
      <div class="details">
        <div class="detail-row"><span class="label">Data:</span><span class="value">${formattedDate}</span></div>
        ${reason ? `<div class="detail-row"><span class="label">Motivo:</span><span class="value">${reason}</span></div>` : ""}
      </div>
      <p>Entre em contato com seu personal para reagendar ou tirar dúvidas.</p>
    `);

    try {
      await this.client.emails.send({
        from: FROM_ADDRESS,
        to,
        subject: "Sessão de treino cancelada",
        html,
      });
    } catch (error) {
      LogBuilderService.log("error", "Failed to send session cancellation email", error);
    }
  }

  async sendSupportContact(params: SendSupportContactParams): Promise<void> {
    if (!this.client) return;
    const { name, email, subject, message } = params;

    const html = this.getLegacyEmailLayout(`
      <h2>Novo contato pelo site</h2>
      <p>Uma nova mensagem foi enviada pela página de contato do Coach OS.</p>
      <div class="details">
        <div class="detail-row"><span class="label">Nome:</span><span class="value">${name}</span></div>
        <div class="detail-row"><span class="label">E-mail:</span><span class="value">${email}</span></div>
        <div class="detail-row"><span class="label">Assunto:</span><span class="value">${subject}</span></div>
      </div>
      <p><strong>Mensagem:</strong></p>
      <p>${message.replace(/\n/g, "<br />")}</p>
    `);

    try {
      await this.client.emails.send({
        from: FROM_ADDRESS,
        to: env.SUPPORT_EMAIL,
        subject: `[Contato] ${subject}`,
        html,
        replyTo: email,
      });
    } catch (error) {
      LogBuilderService.log("error", "Failed to send support contact email", error);
    }
  }
}
