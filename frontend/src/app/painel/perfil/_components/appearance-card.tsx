"use client";

import { type UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadButton } from "./image-upload-button";
import { type ImageField, type ProfileFormValues } from "../_types";

interface AppearanceCardProps {
  form: UseFormReturn<ProfileFormValues>;
  profileName?: string;
  uploadingField: ImageField | null;
  onImageUpload: (field: ImageField, file: File) => Promise<void>;
}

export function AppearanceCard({
  form,
  profileName,
  uploadingField,
  onImageUpload,
}: AppearanceCardProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const themeColor = watch("themeColor");
  const profilePhoto = watch("profilePhoto");

  return (
    <Card variant="glass" className="rounded-3xl">
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Foto de perfil</Label>
          <div className="flex items-center gap-4">
            <div className="premium-surface flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full">
              {profilePhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profilePhoto}
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-medium text-muted-foreground">
                  {(profileName ?? "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <ImageUploadButton
              label="Trocar foto"
              isUploading={uploadingField === "profilePhoto"}
              onUpload={(file) => onImageUpload("profilePhoto", file)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="themeColor">Cor do tema</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setValue("themeColor", e.target.value)}
              className="h-10 w-10 cursor-pointer rounded border p-0.5"
              aria-label="Selecionar cor"
            />
            <Input
              id="themeColor"
              {...register("themeColor")}
              maxLength={7}
              className="premium-field w-32 font-mono"
              placeholder="#10b981"
            />
          </div>
          {errors.themeColor ? (
            <p className="text-sm text-destructive">{errors.themeColor.message}</p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            Essa cor será usada na sua página de apresentação.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
