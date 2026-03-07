import { z } from "zod";

export const profileFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres"),
  phoneNumber: z.string(),
  themeColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida — use formato hex (#RRGGBB)"),
  profilePhoto: z.string(),
  lpTitle: z.string().max(255),
  lpSubtitle: z.string().max(255),
  lpHeroImage: z.string(),
  lpAboutTitle: z.string().max(255),
  lpAboutText: z.string().max(2000),
  lpImage1: z.string(),
  lpImage2: z.string(),
  lpImage3: z.string(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export type ImageField =
  | "profilePhoto"
  | "lpHeroImage"
  | "lpImage1"
  | "lpImage2"
  | "lpImage3";
