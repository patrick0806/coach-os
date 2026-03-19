"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Loader2, Save } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { useGetMyProfile } from "@/features/profileEditor/hooks/useGetMyProfile"
import { useUpdateProfile } from "@/features/profileEditor/hooks/useUpdateProfile"
import { ProfileTab } from "@/features/profileEditor/components/profileTab"
import { PageTab } from "@/features/profileEditor/components/pageTab"
import type { ProfileData, UpdateProfileData } from "@/features/profileEditor/services/profile.service"

export function LpEditorPage() {
  const { data: profile, isLoading } = useGetMyProfile()
  const updateProfile = useUpdateProfile()

  const [draft, setDraft] = useState<ProfileData | null>(null)

  useEffect(() => {
    if (profile && !draft) {
      setDraft(profile)
    }
  }, [profile, draft])

  function handleChange(patch: Partial<UpdateProfileData>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  async function handleSave() {
    if (!draft) return

    const payload: UpdateProfileData = {
      bio: draft.bio ?? undefined,
      phoneNumber: draft.phoneNumber ?? undefined,
      specialties: draft.specialties ?? undefined,
      themeColor: draft.themeColor ?? undefined,
      profilePhoto: draft.profilePhoto ?? undefined,
      logoUrl: draft.logoUrl ?? undefined,
      lpTitle: draft.lpTitle ?? undefined,
      lpSubtitle: draft.lpSubtitle ?? undefined,
      lpHeroImage: draft.lpHeroImage ?? undefined,
      lpAboutTitle: draft.lpAboutTitle ?? undefined,
      lpAboutText: draft.lpAboutText ?? undefined,
      lpImage1: draft.lpImage1 ?? undefined,
      lpImage2: draft.lpImage2 ?? undefined,
      lpImage3: draft.lpImage3 ?? undefined,
      lpLayout: draft.lpLayout ?? undefined,
      themeColorSecondary: draft.themeColorSecondary ?? undefined,
    }

    try {
      await updateProfile.mutateAsync(payload)
      toast.success("Perfil atualizado com sucesso!")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao salvar perfil")
        : "Erro ao salvar perfil"
      toast.error(message)
    }
  }

  if (isLoading || !draft) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isPending = updateProfile.isPending

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Página Pública</h1>
          <p className="text-sm text-muted-foreground">
            Configure seu perfil e sua landing page profissional.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/personais/${draft.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <ExternalLink className="size-4" />
            Visualizar página
          </a>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="pagina">Página</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil" className="mt-6">
          <ProfileTab data={draft} onChange={handleChange} disabled={isPending} />
        </TabsContent>
        <TabsContent value="pagina" className="mt-6">
          <PageTab data={draft} onChange={handleChange} disabled={isPending} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
