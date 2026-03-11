import { BadRequestException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactSupportService } from "../contact-support.service";

describe("ContactSupportService", () => {
  let service: ContactSupportService;
  let resendProvider: {
    sendSupportContact: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    resendProvider = {
      sendSupportContact: vi.fn(),
    };

    service = new ContactSupportService(resendProvider as any);
  });

  it("should validate and send the contact message", async () => {
    resendProvider.sendSupportContact.mockResolvedValue(undefined);

    const result = await service.execute({
      name: "João Silva",
      email: "joao@exemplo.com",
      subject: "Quero testar a plataforma",
      message: "Gostaria de entender melhor como funciona o período de trial.",
    });

    expect(resendProvider.sendSupportContact).toHaveBeenCalledWith({
      name: "João Silva",
      email: "joao@exemplo.com",
      subject: "Quero testar a plataforma",
      message: "Gostaria de entender melhor como funciona o período de trial.",
    });
    expect(result).toEqual({
      message: "Sua mensagem foi enviada com sucesso.",
    });
  });

  it("should throw BadRequestException when payload is invalid", async () => {
    await expect(
      service.execute({
        name: "A",
        email: "invalido",
        subject: "",
        message: "curta",
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
