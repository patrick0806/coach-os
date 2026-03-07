"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
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
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  type UpdateProfilePayload,
} from "@/services/personals.service";

const profileFormSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type ImageField =
  | "profilePhoto"
  | "lpHeroImage"
  | "lpImage1"
  | "lpImage2"
  | "lpImage3";

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6)
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface ImageUploadButtonProps {
  label: string;
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

function ImageUploadButton({ label, isUploading, onUpload }: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (file) await onUpload(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? "Enviando..." : label}
      </Button>
    </>
  );
}

export default function PerfilPage() {
  const queryClient = useQueryClient();
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["personals", "me", "profile"],
    queryFn: getMyProfile,
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      bio: "",
      phoneNumber: "",
      themeColor: "#10b981",
      profilePhoto: "",
      lpTitle: "",
      lpSubtitle: "",
      lpHeroImage: "",
      lpAboutTitle: "",
      lpAboutText: "",
      lpImage1: "",
      lpImage2: "",
      lpImage3: "",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        bio: profile.bio ?? "",
        phoneNumber: profile.phoneNumber ?? "",
        themeColor: profile.themeColor,
        profilePhoto: profile.profilePhoto ?? "",
        lpTitle: profile.lpTitle ?? "",
        lpSubtitle: profile.lpSubtitle ?? "",
        lpHeroImage: profile.lpHeroImage ?? "",
        lpAboutTitle: profile.lpAboutTitle ?? "",
        lpAboutText: profile.lpAboutText ?? "",
        lpImage1: profile.lpImage1 ?? "",
        lpImage2: profile.lpImage2 ?? "",
        lpImage3: profile.lpImage3 ?? "",
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["personals", "me", "profile"], data);
      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      setSaveError(getApiErrorMessage(error, "Não foi possível salvar as alterações."));
    },
  });

  async function handleImageUpload(field: ImageField, file: File) {
    setUploadingField(field);
    try {
      const { url } = await uploadProfileImage(file);
      setValue(field, url);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Erro ao enviar imagem."));
    } finally {
      setUploadingField(null);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    setSaveSuccess(false);
    setSaveError(null);

    const or = (v: string) => (v.trim() ? v : undefined);

    const payload: UpdateProfilePayload = {
      name: values.name,
      bio: or(values.bio),
      phoneNumber: or(values.phoneNumber),
      themeColor: values.themeColor,
      profilePhoto: or(values.profilePhoto),
      lpTitle: or(values.lpTitle),
      lpSubtitle: or(values.lpSubtitle),
      lpHeroImage: or(values.lpHeroImage),
      lpAboutTitle: or(values.lpAboutTitle),
      lpAboutText: or(values.lpAboutText),
      lpImage1: or(values.lpImage1),
      lpImage2: or(values.lpImage2),
      lpImage3: or(values.lpImage3),
    };

    await updateMutation.mutateAsync(payload);
  }

  const themeColor = watch("themeColor");
  const profilePhoto = watch("profilePhoto");
  const phoneNumber = watch("phoneNumber");
  const bio = watch("bio");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Meu Perfil</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie suas informações e a aparência da sua página de apresentação.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
        {/* Dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={profile?.email ?? ""} disabled readOnly />
              <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telefone</Label>
              <Input
                id="phoneNumber"
                placeholder="(11) 99999-9999"
                value={maskPhone(phoneNumber)}
                onChange={(e) => setValue("phoneNumber", maskPhone(e.target.value))}
              />
              {errors.phoneNumber ? (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Fale sobre você e sua metodologia de treino..."
                rows={4}
                {...register("bio")}
              />
              <p className="text-xs text-muted-foreground">{bio.length}/500 caracteres</p>
              {errors.bio ? (
                <p className="text-sm text-destructive">{errors.bio.message}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Foto de perfil</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-gray-100">
                  {profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profilePhoto}
                      alt="Foto de perfil"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium text-gray-400">
                      {(profile?.name ?? "?").charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <ImageUploadButton
                  label="Trocar foto"
                  isUploading={uploadingField === "profilePhoto"}
                  onUpload={(file) => handleImageUpload("profilePhoto", file)}
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
                  className="w-32 font-mono"
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

        {/* Landing Page */}
        <Card>
          <CardHeader>
            <CardTitle>Página de apresentação</CardTitle>
            <CardDescription>
              Personalize o conteúdo exibido na sua página pública.
            </CardDescription>
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
                  onUpload={(file) => handleImageUpload("lpHeroImage", file)}
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
                    onUpload={(file) => handleImageUpload(field, file)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex flex-wrap items-center gap-4 pb-8">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>

          {saveSuccess ? (
            <p className="text-sm text-emerald-600">Perfil atualizado com sucesso!</p>
          ) : null}
          {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
        </div>
      </form>
    </div>
  );
}
