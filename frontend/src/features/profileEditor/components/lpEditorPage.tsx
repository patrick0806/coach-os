"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Eye, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { useGetMyProfile } from "@/features/profileEditor/hooks/useGetMyProfile"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startLandingPageTour } from "@/features/onboarding/tours/landingPage.tour"
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

export function LpEditorPage() {
  const { data: profile, isLoading } = useGetMyProfile()
  const updateProfile = useUpdateProfile()
  const saveLpDraft = useSaveLpDraft()
  const publishLpDraft = usePublishLpDraft()

  const [activeTab, setActiveTab] = useState<"perfil" | "pagina">("perfil")
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
      <PageTourInitializer page="landingPage" startTour={startLandingPageTour} />

      {/* Page header */}
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
          data-tour="view-page-link"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ExternalLink className="size-4" />
          Visualizar página
        </a>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "perfil" | "pagina")}
      >
        {/* Tabs row + context-aware action buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList data-tour="lp-tabs">
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="pagina">Página</TabsTrigger>
          </TabsList>

          {/* Actions — change based on active tab */}
          <div className="flex flex-wrap items-center gap-2">
            {activeTab === "perfil" && (
              <Button
                size="sm"
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-3.5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            )}

            {activeTab === "pagina" && (
              <>
                {hasDraft && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      Rascunho pendente
                    </Badge>
                    <Link
                      href="/pagina-publica/rascunho"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      <Eye className="size-3" />
                      Visualizar rascunho
                    </Link>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saveLpDraft.isPending}
                  data-tour="save-draft-btn"
                >
                  {saveLpDraft.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar rascunho"
                  )}
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={!hasDraft || publishLpDraft.isPending}
                  data-tour="publish-btn"
                >
                  {publishLpDraft.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-3.5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    "Publicar"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        <TabsContent value="perfil" className="mt-6">
          <ProfileTab
            data={profileDraft}
            onChange={handleProfileChange}
            disabled={updateProfile.isPending}
          />
        </TabsContent>
        <TabsContent value="pagina" className="mt-6">
          <PageTab
            data={lpDraft}
            onChange={handleLpChange}
            disabled={saveLpDraft.isPending || publishLpDraft.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
