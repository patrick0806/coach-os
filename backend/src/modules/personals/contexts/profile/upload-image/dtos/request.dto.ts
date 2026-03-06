import { z } from "zod";

export const IMAGE_TYPES = [
  "profilePhoto",
  "lpHeroImage",
  "lpImage1",
  "lpImage2",
  "lpImage3",
] as const;

export type ImageType = (typeof IMAGE_TYPES)[number];

export const UploadImageSchema = z.object({
  fileName: z.string().min(1, "Nome do arquivo é obrigatório"),
  mimeType: z
    .string()
    .regex(/^image\/(jpeg|png|webp|gif)$/, "Tipo de arquivo inválido"),
  imageType: z.enum(IMAGE_TYPES, {
    error: `Tipo de imagem inválido. Use: ${IMAGE_TYPES.join(", ")}`,
  }),
});

export type UploadImageRequestDTO = z.infer<typeof UploadImageSchema>;
