import { describe, it, expect, beforeEach, vi } from "vitest";
import { ZodError } from "zod";
import { JoinWaitlistUseCase } from "../joinWaitlist.useCase";

const makeWaitlistRepository = (existing: unknown = null) => ({
  findByEmail: vi.fn().mockResolvedValue(existing),
  create: vi.fn().mockResolvedValue(undefined),
});

const makeResendProvider = () => ({
  sendWaitlistConfirmation: vi.fn().mockResolvedValue(undefined),
});

describe("JoinWaitlistUseCase", () => {
  let useCase: JoinWaitlistUseCase;
  let waitlistRepository: ReturnType<typeof makeWaitlistRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  const validBody = { email: "test@example.com", name: "João" };

  beforeEach(() => {
    waitlistRepository = makeWaitlistRepository();
    resendProvider = makeResendProvider();
    useCase = new JoinWaitlistUseCase(
      waitlistRepository as any,
      resendProvider as any,
    );
  });

  it("should create entry and send confirmation email", async () => {
    const result = await useCase.execute(validBody);

    expect(result.message).toBe("Obrigado! Você será notificado quando estivermos prontos.");
    expect(waitlistRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(waitlistRepository.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "João",
    });
    expect(resendProvider.sendWaitlistConfirmation).toHaveBeenCalledWith({
      to: "test@example.com",
      name: "João",
    });
  });

  it("should normalize email to lowercase", async () => {
    await useCase.execute({ email: "TEST@EXAMPLE.COM" });

    expect(waitlistRepository.findByEmail).toHaveBeenCalledWith("test@example.com");
    expect(waitlistRepository.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: undefined,
    });
  });

  it("should return success silently when email already exists", async () => {
    waitlistRepository = makeWaitlistRepository({ id: "existing-1", email: "test@example.com" });
    useCase = new JoinWaitlistUseCase(waitlistRepository as any, resendProvider as any);

    const result = await useCase.execute(validBody);

    expect(result.message).toBe("Obrigado! Você será notificado quando estivermos prontos.");
    expect(waitlistRepository.create).not.toHaveBeenCalled();
    expect(resendProvider.sendWaitlistConfirmation).not.toHaveBeenCalled();
  });

  it("should work without name", async () => {
    await useCase.execute({ email: "test@example.com" });

    expect(waitlistRepository.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: undefined,
    });
  });

  it("should throw ZodError for invalid email", async () => {
    await expect(useCase.execute({ email: "not-an-email" })).rejects.toThrow(ZodError);
  });

  it("should throw ZodError for missing email", async () => {
    await expect(useCase.execute({})).rejects.toThrow(ZodError);
  });
});
