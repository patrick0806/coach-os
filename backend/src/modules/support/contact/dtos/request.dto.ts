import { ApiProperty } from "@nestjs/swagger";
import { z } from "zod";

export const ContactSupportSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(120, "Nome deve ter no máximo 120 caracteres"),
  email: z.email("Informe um e-mail válido"),
  subject: z.string().trim().min(3, "Assunto deve ter pelo menos 3 caracteres").max(160, "Assunto deve ter no máximo 160 caracteres"),
  message: z.string().trim().min(10, "Mensagem deve ter pelo menos 10 caracteres").max(4000, "Mensagem deve ter no máximo 4000 caracteres"),
});

export type ContactSupportInput = z.infer<typeof ContactSupportSchema>;

export class ContactSupportDTO implements ContactSupportInput {
  @ApiProperty({ example: "João Silva" })
  name: string;

  @ApiProperty({ example: "joao@exemplo.com" })
  email: string;

  @ApiProperty({ example: "Quero conhecer o Coach OS" })
  subject: string;

  @ApiProperty({ example: "Gostaria de entender melhor como funciona a agenda para personal trainers." })
  message: string;
}
