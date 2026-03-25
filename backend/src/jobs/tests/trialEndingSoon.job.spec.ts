import { describe, it, expect, beforeEach, vi } from "vitest";
import { addDays } from "date-fns";

import { TrialEndingSoonJob } from "../trialEndingSoon.job";

vi.mock("@config/env", () => ({
  env: {
    APP_URL: "http://localhost:3000",
  },
}));

vi.mock("@config/pino.config", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

const makeCoach = (overrides = {}) => ({
  personalId: "personal-id-1",
  email: "coach@email.com",
  name: "João Silva",
  trialEndsAt: addDays(new Date(), 3),
  ...overrides,
});

const makePersonalsRepository = () => ({
  findTrialsEndingOn: vi.fn().mockResolvedValue([]),
});

const makeResendProvider = () => ({
  sendTrialEndingSoon: vi.fn().mockResolvedValue(undefined),
});

describe("TrialEndingSoonJob", () => {
  let job: TrialEndingSoonJob;
  let personalsRepository: ReturnType<typeof makePersonalsRepository>;
  let resendProvider: ReturnType<typeof makeResendProvider>;

  beforeEach(() => {
    personalsRepository = makePersonalsRepository();
    resendProvider = makeResendProvider();
    job = new TrialEndingSoonJob(
      personalsRepository as any,
      resendProvider as any,
    );
  });

  it("should query trials ending in 3 days and 1 day", async () => {
    await job.handle();

    expect(personalsRepository.findTrialsEndingOn).toHaveBeenCalledTimes(2);
  });

  it("should send email for coaches with trial ending in 3 days", async () => {
    const coach = makeCoach({ trialEndsAt: addDays(new Date(), 3) });
    personalsRepository.findTrialsEndingOn
      .mockResolvedValueOnce([coach])
      .mockResolvedValueOnce([]);

    await job.handle();

    expect(resendProvider.sendTrialEndingSoon).toHaveBeenCalledOnce();
    expect(resendProvider.sendTrialEndingSoon).toHaveBeenCalledWith({
      to: coach.email,
      userName: coach.name,
      trialEndsAt: coach.trialEndsAt.toISOString(),
      upgradeUrl: "http://localhost:3000/assinatura",
    });
  });

  it("should send email for coaches with trial ending in 1 day", async () => {
    const coach = makeCoach({ trialEndsAt: addDays(new Date(), 1) });
    personalsRepository.findTrialsEndingOn
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([coach]);

    await job.handle();

    expect(resendProvider.sendTrialEndingSoon).toHaveBeenCalledOnce();
    expect(resendProvider.sendTrialEndingSoon).toHaveBeenCalledWith({
      to: coach.email,
      userName: coach.name,
      trialEndsAt: coach.trialEndsAt.toISOString(),
      upgradeUrl: "http://localhost:3000/assinatura",
    });
  });

  it("should send emails for multiple coaches", async () => {
    const coaches = [
      makeCoach({ personalId: "p1", email: "a@email.com" }),
      makeCoach({ personalId: "p2", email: "b@email.com" }),
    ];
    personalsRepository.findTrialsEndingOn
      .mockResolvedValueOnce(coaches)
      .mockResolvedValueOnce([]);

    await job.handle();

    expect(resendProvider.sendTrialEndingSoon).toHaveBeenCalledTimes(2);
  });

  it("should not send emails when no trials are ending", async () => {
    await job.handle();

    expect(resendProvider.sendTrialEndingSoon).not.toHaveBeenCalled();
  });
});
