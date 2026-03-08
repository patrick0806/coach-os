"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  type UpdateProfilePayload,
} from "@/services/personals.service";
import { profileFormSchema, type ImageField, type ProfileFormValues } from "./_types";
import { AppearanceCard } from "./_components/appearance-card";
import { LandingPageCard } from "./_components/landing-page-card";
import { PersonalDataCard } from "./_components/personal-data-card";

export default function PerfilPage() {
  const queryClient = useQueryClient();
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);

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

  useEffect(() => {
    if (profile) {
      form.reset({
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
  }, [profile, form]);

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["personals", "me", "profile"], data);
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível salvar as alterações."));
    },
  });

  async function handleImageUpload(field: ImageField, file: File) {
    setUploadingField(field);
    try {
      const { url } = await uploadProfileImage(file, field);
      form.setValue(field, url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao enviar imagem."));
    } finally {
      setUploadingField(null);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Meu Perfil</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas informações e a aparência da sua página de apresentação.
          </p>
        </div>

        {profile?.slug ? (
          <Link href={`/${profile.slug}`} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm" className="gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Ver minha página
            </Button>
          </Link>
        ) : null}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <PersonalDataCard form={form} email={profile?.email ?? ""} />
        <AppearanceCard
          form={form}
          profileName={profile?.name}
          uploadingField={uploadingField}
          onImageUpload={handleImageUpload}
        />
        <LandingPageCard
          form={form}
          uploadingField={uploadingField}
          onImageUpload={handleImageUpload}
        />

        <div className="pb-8">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
