import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { ApplicationRoles } from "@shared/enums";
import { UpdateYoutubeUrlService } from "../update-youtube-url.service";

const mockCurrentUser = {
  sub: "user-id",
  role: ApplicationRoles.PERSONAL,
  personalId: "personal-id",
  personalSlug: "john-doe",
  profileId: "personal-id",
};

describe("UpdateYoutubeUrlService", () => {
  let service: UpdateYoutubeUrlService;
  let exercisesRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateYoutubeUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    exercisesRepository = {
      findById: vi.fn(),
      updateYoutubeUrl: vi.fn(),
    };
    service = new UpdateYoutubeUrlService(exercisesRepository as any);
  });

  it("salva youtube_url valida em exercicio customizado", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id",
      personalId: "personal-id",
    });
    exercisesRepository.updateYoutubeUrl.mockResolvedValue(undefined);

    const result = await service.execute(
      "exercise-id",
      { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      mockCurrentUser,
    );

    expect(exercisesRepository.updateYoutubeUrl).toHaveBeenCalledWith(
      "exercise-id",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
    expect(result).toEqual({
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
  });

  it("remove youtube_url quando recebe null", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id",
      personalId: "personal-id",
    });
    exercisesRepository.updateYoutubeUrl.mockResolvedValue(undefined);

    const result = await service.execute(
      "exercise-id",
      { youtubeUrl: null },
      mockCurrentUser,
    );

    expect(exercisesRepository.updateYoutubeUrl).toHaveBeenCalledWith("exercise-id", null);
    expect(result).toEqual({ youtubeUrl: null });
  });

  it("retorna 400 para URL que nao e do YouTube", async () => {
    await expect(
      service.execute(
        "exercise-id",
        { youtubeUrl: "https://vimeo.com/123" },
        mockCurrentUser,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(exercisesRepository.findById).not.toHaveBeenCalled();
  });

  it("retorna 400 para URL com formato invalido", async () => {
    await expect(
      service.execute(
        "exercise-id",
        { youtubeUrl: "nao-e-url" },
        mockCurrentUser,
      ),
    ).rejects.toThrow(BadRequestException);
    expect(exercisesRepository.findById).not.toHaveBeenCalled();
  });

  it("retorna 403 para exercicio global", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id",
      personalId: null,
    });

    await expect(
      service.execute(
        "exercise-id",
        { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        mockCurrentUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("retorna 403 para exercicio de outro personal", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id",
      personalId: "other-personal-id",
    });

    await expect(
      service.execute(
        "exercise-id",
        { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        mockCurrentUser,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("retorna 404 para exercicio inexistente", async () => {
    exercisesRepository.findById.mockResolvedValue(null);

    await expect(
      service.execute(
        "missing-id",
        { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
        mockCurrentUser,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it("aceita youtu.be como dominio valido", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id",
      personalId: "personal-id",
    });
    exercisesRepository.updateYoutubeUrl.mockResolvedValue(undefined);

    await service.execute(
      "exercise-id",
      { youtubeUrl: "https://youtu.be/dQw4w9WgXcQ" },
      mockCurrentUser,
    );

    expect(exercisesRepository.updateYoutubeUrl).toHaveBeenCalledWith(
      "exercise-id",
      "https://youtu.be/dQw4w9WgXcQ",
    );
  });

  it("aceita www.youtube.com como dominio valido", async () => {
    exercisesRepository.findById.mockResolvedValue({
      id: "exercise-id",
      personalId: "personal-id",
    });
    exercisesRepository.updateYoutubeUrl.mockResolvedValue(undefined);

    await service.execute(
      "exercise-id",
      { youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
      mockCurrentUser,
    );

    expect(exercisesRepository.updateYoutubeUrl).toHaveBeenCalledWith(
      "exercise-id",
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });
});
