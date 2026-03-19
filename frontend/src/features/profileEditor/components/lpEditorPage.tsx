"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { useGetMyProfile } from "@/features/profileEditor/hooks/useGetMyProfile"
import { useUpdateProfile } from "@/features/profileEditor/hooks/useUpdateProfile"
import { useSaveLpDraft } from "@/features/profileEditor/hooks/useSaveLpDraft"
import { usePublishLpDraft } from "@/features/profileEditor/hooks/usePublishLpDraft"
import { ProfileTab } from "@/features/profileEditor/components/profileTab"
import { PageTab } from "@/features/profileEditor/components/pageTab"
import type {
  ProfileData,
  UpdateProfileData,
  LpDraftData,
} from "@/features/profileEditor/services/profile.service"
import { Loader2 } from "lucide-react"

export function LpEditorPage() {
  const { data: profile, isLoading } = useGetMyProfile()
  const updateProfile = useUpdateProfile()
  const saveLpDraft = useSaveLpDraft()
  const publishLpDraft = usePublishLpDraft()

  const [profileDraft, setProfileDraft] = useState<ProfileData | null>(null)
  const [lpDraft, setLpDraft] = useState<LpDraftData | null>(null)

  useEffect(() => {
    if (profile && !profileDraft) {
      setProfileDraft(profile)

      // Initialize LP draft from lpDraftData if it exists, otherwise from live lp* fields
      const initialLpDraft: LpDraftData = profile.lpDraftData ?? {
        lpLayout: profile.lpLayout,
        lpTitle: profile.lpTitle ?? undefined,
        lpSubtitle: profile.lpSubtitle ?? undefined,
        lpHeroImage: profile.lpHeroImage ?? undefined,
        lpAboutTitle: profile.lpAboutTitle ?? undefined,
        lpAboutText: profile.lpAboutText ?? undefined,
        lpImage1: profile.lpImage1 ?? undefined,
        lpImage2: profile.lpImage2 ?? undefined,
        lpImage3: profile.lpImage3 ?? undefined,
      }
      setLpDraft(initialLpDraft)
    }
  }, [profile, profileDraft])

  function handleProfileChange(patch: Partial<UpdateProfileData>) {
    setProfileDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  function handleLpChange(patch: Partial<LpDraftData>) {
    setLpDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  async function handleSaveProfile() {
    if (!profileDraft) return

    const payload: UpdateProfileData = {
      bio: profileDraft.bio ?? undefined,
      phoneNumber: profileDraft.phoneNumber ?? undefined,
      specialties: profileDraft.specialties ?? undefined,
      themeColor: profileDraft.themeColor ?? undefined,
      themeColorSecondary: profileDraft.themeColorSecondary ?? undefined,
      profilePhoto: profileDraft.profilePhoto ?? undefined,
      logoUrl: profileDraft.logoUrl ?? undefined,
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

  async function handleSaveDraft() {
    if (!lpDraft) return

    try {
      await saveLpDraft.mutateAsync(lpDraft)
      toast.success("Rascunho salvo! A página pública não foi alterada.")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao salvar rascunho")
        : "Erro ao salvar rascunho"
      toast.error(message)
    }
  }

  async function handlePublish() {
    try {
      await publishLpDraft.mutateAsync()
      toast.success("Página publicada com sucesso!")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao publicar página")
        : "Erro ao publicar página"
      toast.error(message)
    }
  }

  if (isLoading || !profileDraft || !lpDraft) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const hasDraft = !!profile?.lpDraftData

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Página Pública</h1>
          <p className="text-sm text-muted-foreground">
            Configure seu perfil e sua landing page profissional.
          </p>
        </div>
        <a
          href={`/personais/${profileDraft.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ExternalLink className="size-4" />
          Visualizar página
        </a>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="pagina">Página</TabsTrigger>
        </TabsList>
        <TabsContent value="perfil" className="mt-6">
          <ProfileTab
            data={profileDraft}
            onChange={handleProfileChange}
            disabled={updateProfile.isPending}
            onSave={handleSaveProfile}
            isSaving={updateProfile.isPending}
          />
        </TabsContent>
        <TabsContent value="pagina" className="mt-6">
          <PageTab
            data={lpDraft}
            onChange={handleLpChange}
            disabled={saveLpDraft.isPending || publishLpDraft.isPending}
            hasDraft={hasDraft}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isSavingDraft={saveLpDraft.isPending}
            isPublishing={publishLpDraft.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
