import { z } from "zod";

const urlOrEmpty = z.string().url("URL inválida").optional();

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida — use formato hex (#RRGGBB)")
    .optional(),
  phoneNumber: z
    .string()
    .min(10, "Telefone inválido")
    .max(20, "Telefone inválido")
    .optional(),
  profilePhoto: urlOrEmpty,
  lpTitle: z.string().max(255).optional(),
  lpSubtitle: z.string().max(255).optional(),
  lpHeroImage: urlOrEmpty,
  lpAboutTitle: z.string().max(255).optional(),
  lpAboutText: z.string().max(2000).optional(),
  lpImage1: urlOrEmpty,
  lpImage2: urlOrEmpty,
  lpImage3: urlOrEmpty,
});

export type UpdateProfileRequestDTO = z.infer<typeof UpdateProfileSchema>;
