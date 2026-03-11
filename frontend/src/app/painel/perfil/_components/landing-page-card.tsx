"use client";

import { type UseFormReturn } from "react-hook-form";
import { ImageIcon, Loader2 } from "lucide-react";

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

export function LandingPageCard({
  form,
  uploadingField,
  onImageUpload,
}: LandingPageCardProps) {
  const { register, watch } = form;

  const lpHeroImage = watch("lpHeroImage");

  return (
    <Card variant="glass" className="rounded-3xl">
      <CardHeader>
        <CardTitle>Página de apresentação</CardTitle>
        <CardDescription>
          Personalize o conteúdo exibido na sua página pública.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <Separator />

        <div className="space-y-4">
          <Label>Imagem principal (hero)</Label>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="premium-surface relative aspect-video w-full overflow-hidden rounded-2xl sm:w-64">
              {lpHeroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lpHeroImage}
                  alt="Hero"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 opacity-20" />
                  <span className="text-xs">Sem imagem</span>
                </div>
              )}
              {uploadingField === "lpHeroImage" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                Recomendado: 1920x1080px (16:9).
              </p>
              <ImageUploadButton
                label={lpHeroImage ? "Trocar imagem" : "Fazer upload"}
                isUploading={uploadingField === "lpHeroImage"}
                onUpload={(file) => onImageUpload("lpHeroImage", file)}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="lpAboutTitle">Título da seção &quot;Sobre&quot;</Label>
          <Input
            id="lpAboutTitle"
            placeholder="Sobre mim"
            {...register("lpAboutTitle")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lpAboutText">Texto da seção &quot;Sobre&quot;</Label>
          <Textarea
            id="lpAboutText"
            placeholder="Conte sua história, experiência e metodologia..."
            rows={5}
            {...register("lpAboutText")}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <Label>Imagens da galeria</Label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(["lpImage1", "lpImage2", "lpImage3"] as const).map((field, i) => {
              const imageUrl = watch(field);
              return (
                  <div key={field} className="space-y-3">
                  <div className="premium-surface relative aspect-square w-full overflow-hidden rounded-2xl">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={`Galeria ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <ImageIcon className="h-6 w-6 opacity-20" />
                        <span className="text-[10px]">Imagem {i + 1}</span>
                      </div>
                    )}
                    {uploadingField === field && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <ImageUploadButton
                    label={imageUrl ? "Trocar" : "Upload"}
                    isUploading={uploadingField === field}
                    onUpload={(file) => onImageUpload(field, file)}
                  />
                  {/*className="w-full"*/}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
