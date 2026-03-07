"use client";

import { type UseFormReturn } from "react-hook-form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadButton } from "./image-upload-button";
import { type ImageField, type ProfileFormValues } from "../_types";

interface LandingPageCardProps {
  form: UseFormReturn<ProfileFormValues>;
  uploadingField: ImageField | null;
  onImageUpload: (field: ImageField, file: File) => Promise<void>;
}

export function LandingPageCard({ form, uploadingField, onImageUpload }: LandingPageCardProps) {
  const { register, watch } = form;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Página de apresentação</CardTitle>
        <CardDescription>Personalize o conteúdo exibido na sua página pública.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lpTitle">Título principal</Label>
            <Input
              id="lpTitle"
              placeholder="Transforme seu corpo e sua vida"
              {...register("lpTitle")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lpSubtitle">Subtítulo</Label>
            <Input
              id="lpSubtitle"
              placeholder="Personal trainer especializado em..."
              {...register("lpSubtitle")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagem principal (hero)</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={watch("lpHeroImage")}
              readOnly
              placeholder="URL da imagem"
              className="min-w-0 flex-1"
            />
            <ImageUploadButton
              label="Upload"
              isUploading={uploadingField === "lpHeroImage"}
              onUpload={(file) => onImageUpload("lpHeroImage", file)}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="lpAboutTitle">Título da seção "Sobre"</Label>
          <Input id="lpAboutTitle" placeholder="Sobre mim" {...register("lpAboutTitle")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lpAboutText">Texto da seção "Sobre"</Label>
          <Textarea
            id="lpAboutText"
            placeholder="Conte sua história, experiência e metodologia..."
            rows={5}
            {...register("lpAboutText")}
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label>Imagens da galeria</Label>
          {(["lpImage1", "lpImage2", "lpImage3"] as const).map((field, i) => (
            <div key={field} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="shrink-0 text-sm text-muted-foreground sm:w-20">
                Imagem {i + 1}
              </span>
              <Input
                value={watch(field)}
                readOnly
                placeholder="URL da imagem"
                className="min-w-0 flex-1"
              />
              <ImageUploadButton
                label="Upload"
                isUploading={uploadingField === field}
                onUpload={(file) => onImageUpload(field, file)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
