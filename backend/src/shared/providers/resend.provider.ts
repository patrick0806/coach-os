import { Injectable, Logger } from "@nestjs/common";
import { Resend } from "resend";

import { env } from "@config/env";

export interface SendInviteEmailParams {
  to: string;
  studentName: string;
  personalName: string;
  setupPasswordUrl: string;
}

@Injectable()
export class ResendProvider {
  private readonly client: Resend;
  private readonly logger = new Logger(ResendProvider.name);

  constructor() {
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async sendStudentInvite(params: SendInviteEmailParams): Promise<void> {
    const { to, studentName, personalName, setupPasswordUrl } = params;

    try {
      await this.client.emails.send({
        from: "no-reply@coachos.app",
        to,
        subject: `${personalName} te convidou para a plataforma`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Olá, ${studentName}!</h2>
            <p>
              <strong>${personalName}</strong> criou uma conta para você na plataforma Coach OS.
            </p>
            <p>
              Para começar, clique no botão abaixo e defina sua senha de acesso:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a
                href="${setupPasswordUrl}"
                style="
                  background-color: #10b981;
                  color: white;
                  padding: 14px 28px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: bold;
                  display: inline-block;
                "
              >
                Definir minha senha
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Este link é válido por <strong>48 horas</strong>.
              Após esse prazo, entre em contato com ${personalName} para receber um novo convite.
            </p>
            <p style="color: #6b7280; font-size: 12px;">
              Se você não esperava receber este e-mail, ignore-o com segurança.
            </p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.error("Failed to send student invite email", error);
      // Email failure must not roll back the student creation
    }
  }
}
