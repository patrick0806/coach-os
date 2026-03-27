"use client"

import { startTransition, useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Eye, Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Badge } from "@/shared/ui/badge"
import { Input } from "@/shared/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import { Field, FieldLabel } from "@/shared/ui/field"
import { useGetMyProfile } from "@/features/profileEditor/hooks/useGetMyProfile"
import { PageTourInitializer } from "@/features/onboarding/components/pageTourInitializer"
import { startLandingPageTour } from "@/features/onboarding/tours/landingPage.tour"
import { useUpdateProfile } from "@/features/profileEditor/hooks/useUpdateProfile"
import { useSaveLpDraft } from "@/features/profileEditor/hooks/useSaveLpDraft"
import { usePublishLpDraft } from "@/features/profileEditor/hooks/usePublishLpDraft"
import { ProfileTab } from "@/features/profileEditor/components/profileTab"
import { PageTab } from "@/features/profileEditor/components/pageTab"
import { ImageUploadField } from "@/features/profileEditor/components/imageUploadField"
import { formatPhone } from "@/shared/utils/formatPhone"
import type {
  ProfileData,
  UpdateProfileData,
  LpDraftData,
} from "@/features/profileEditor/services/profile.service"

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coachos.com.br"

function getPublicPageUrl(slug: string): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname
    if (hostname.endsWith(BASE_DOMAIN)) {
      return `https://${slug}.${BASE_DOMAIN}`
    }
  }
  return `/coach/${slug}`
}

export function LpEditorPage() {
  const { data: profile, isLoading } = useGetMyProfile()
  const updateProfile = useUpdateProfile()
  const saveLpDraft = useSaveLpDraft()
  const publishLpDraft = usePublishLpDraft()

  const [profileDraft, setProfileDraft] = useState<ProfileData | null>(null)
  const [lpDraft, setLpDraft] = useState<LpDraftData | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [slug, setSlug] = useState("")

  useEffect(() => {
    if (profile && !profileDraft) {
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
      startTransition(() => {
        setProfileDraft(profile)
        setLpDraft(initialLpDraft)
        setLogoUrl(profile.logoUrl ?? null)
        setProfilePhoto(profile.profilePhoto ?? null)
        setPhoneNumber(profile.phoneNumber ?? "")
        setSlug(profile.slug)
      })
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
      specialties: profileDraft.specialties ?? undefined,
      themeColor: profileDraft.themeColor ?? undefined,
      themeColorSecondary: profileDraft.themeColorSecondary ?? undefined,
      logoUrl: logoUrl ?? undefined,
      profilePhoto: profilePhoto ?? undefined,
      phoneNumber: phoneNumber || undefined,
      slug: slug || undefined,
    }

    try {
      await updateProfile.mutateAsync(payload)
      toast.success("Aparência atualizada com sucesso!")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao salvar aparência")
        : "Erro ao salvar aparência"
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
            Configure a aparência e conteúdo da sua página pública.
          </p>
        </div>
        <a
          href={getPublicPageUrl(slug || profileDraft.slug)}
          target="_blank"
          rel="noopener noreferrer"
          data-tour="view-page-link"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ExternalLink className="size-4" />
          Visualizar página
        </a>
      </div>

      {/* Section 1: Aparência */}
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUploadField
            label="Foto de perfil"
            hint="Recomendado: 400x400px (quadrado). Exibida na página pública."
            currentUrl={profilePhoto}
            onUpload={(fileUrl) => setProfilePhoto(fileUrl)}
            disabled={updateProfile.isPending}
            shape="circle"
          />

          <ImageUploadField
            label="Logo"
            hint="Exibido no portal do aluno e como favicon da sua página pública."
            currentUrl={logoUrl}
            onUpload={(fileUrl) => setLogoUrl(fileUrl)}
            disabled={updateProfile.isPending}
            shape="banner"
          />

          <Field>
            <FieldLabel htmlFor="lp-phone">Telefone (WhatsApp)</FieldLabel>
            <Input
              id="lp-phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
              disabled={updateProfile.isPending}
              data-testid="lp-phone-input"
            />
          </Field>

          <ProfileTab
            data={profileDraft}
            onChange={handleProfileChange}
            disabled={updateProfile.isPending}
          />

          <Field>
            <FieldLabel htmlFor="slug">Endereço da página</FieldLabel>
            <div className="flex items-center gap-0">
              <Input
                id="slug"
                placeholder="meu-nome"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                disabled={updateProfile.isPending}
                className="rounded-r-none"
                data-testid="slug-input"
              />
              <span className="inline-flex h-9 items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground whitespace-nowrap">
                .coachos.com.br
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Apenas letras minúsculas, números e hífens. Mínimo 3 caracteres.
            </p>
          </Field>

          <Button
            onClick={handleSaveProfile}
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar aparência"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Section 2: Conteúdo da Página */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Conteúdo da Página</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PageTab
            data={lpDraft}
            onChange={handleLpChange}
            disabled={saveLpDraft.isPending || publishLpDraft.isPending}
          />
        </CardContent>
      </Card>
    </div>
  )
}
