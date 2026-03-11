import { BadRequestException, Injectable } from "@nestjs/common";

import { ResendProvider } from "@shared/providers/resend.provider";

import { ContactSupportInput, ContactSupportSchema } from "./dtos/request.dto";
import { ContactSupportResponseDTO } from "./dtos/response.dto";

@Injectable()
export class ContactSupportService {
  constructor(private readonly resendProvider: ResendProvider) {}

  async execute(dto: ContactSupportInput): Promise<ContactSupportResponseDTO> {
    const parsed = ContactSupportSchema.safeParse(dto);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0].message);
    }

    await this.resendProvider.sendSupportContact(parsed.data);

    return {
      message: "Sua mensagem foi enviada com sucesso.",
    };
  }
}
