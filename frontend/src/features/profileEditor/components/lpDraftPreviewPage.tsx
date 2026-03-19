"use client"

import { type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import { Button } from "@/shared/ui/button"
import { useGetMyProfile } from "@/features/profileEditor/hooks/useGetMyProfile"
import { usePublishLpDraft } from "@/features/profileEditor/hooks/usePublishLpDraft"
import { Layout1 } from "@/features/publicPage/layouts/layout1"
import { Layout2 } from "@/features/publicPage/layouts/layout2"
import { Layout3 } from "@/features/publicPage/layouts/layout3"
import { Layout4 } from "@/features/publicPage/layouts/layout4"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { api } from "@/lib/axios"

export function LpDraftPreviewPage() {
  const router = useRouter()
  const { data: profile, isLoading: isLoadingProfile } = useGetMyProfile()
  const publishLpDraft = usePublishLpDraft()

  const slug = profile?.slug

  const { data: publicProfile, isLoading: isLoadingPublic } = useQuery({
    queryKey: ["public-profile", slug],
    queryFn: () => api.get<PublicProfile>(`/public/${slug}`).then((r) => r.data),
    enabled: !!slug,
  })

  async function handlePublish() {
    try {
      await publishLpDraft.mutateAsync()
      toast.success("Página publicada com sucesso!")
      router.push("/pagina-publica")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao publicar página")
        : "Erro ao publicar página"
      toast.error(message)
    }
  }

  if (isLoadingProfile || isLoadingPublic || !profile || !publicProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!profile.lpDraftData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Nenhum rascunho salvo ainda.</p>
        <Button variant="outline" onClick={() => router.push("/pagina-publica")}>
          <ArrowLeft className="mr-2 size-4" />
          Voltar ao editor
        </Button>
      </div>
    )
  }

  // Merge draft fields over the published public profile
  const draft = profile.lpDraftData
  const previewProfile: PublicProfile = {
    ...publicProfile,
    lpLayout: draft.lpLayout ?? publicProfile.lpLayout,
    lpTitle: draft.lpTitle ?? publicProfile.lpTitle,
    lpSubtitle: draft.lpSubtitle ?? publicProfile.lpSubtitle,
    lpHeroImage: draft.lpHeroImage ?? publicProfile.lpHeroImage,
    lpAboutTitle: draft.lpAboutTitle ?? publicProfile.lpAboutTitle,
    lpAboutText: draft.lpAboutText ?? publicProfile.lpAboutText,
    lpImage1: draft.lpImage1 ?? publicProfile.lpImage1,
    lpImage2: draft.lpImage2 ?? publicProfile.lpImage2,
    lpImage3: draft.lpImage3 ?? publicProfile.lpImage3,
  }

  const cssVars: CSSProperties = {
    "--brand-color": publicProfile.themeColor ?? "#6366f1",
    ...(publicProfile.themeColorSecondary
      ? { "--brand-color-secondary": publicProfile.themeColorSecondary }
      : {}),
  } as CSSProperties

  function renderLayout() {
    switch (previewProfile.lpLayout) {
      case "2":
        return <Layout2 profile={previewProfile} slug={slug!} />
      case "3":
        return <Layout3 profile={previewProfile} slug={slug!} />
      case "4":
        return <Layout4 profile={previewProfile} slug={slug!} />
      default:
        return <Layout1 profile={previewProfile} slug={slug!} />
    }
  }

  return (
    <div className="relative min-h-screen bg-background" style={cssVars}>
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b bg-amber-50 px-4 py-2.5 text-sm dark:bg-amber-950/30">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <Eye className="size-4 shrink-0" />
          <span className="font-medium">Pré-visualização do rascunho</span>
          <span className="hidden text-amber-600/70 sm:inline dark:text-amber-400/70">
            — Esta é uma prévia. A página pública não foi alterada.
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => router.push("/pagina-publica")}
          >
            <ArrowLeft className="mr-1.5 size-3" />
            Voltar
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={handlePublish}
            disabled={publishLpDraft.isPending}
          >
            {publishLpDraft.isPending ? (
              <>
                <Loader2 className="mr-1.5 size-3 animate-spin" />
                Publicando...
              </>
            ) : (
              "Publicar"
            )}
          </Button>
        </div>
      </div>

      {renderLayout()}
    </div>
  )
}
