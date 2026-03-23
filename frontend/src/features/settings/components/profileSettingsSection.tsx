"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Field, FieldLabel } from "@/shared/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
import { ImageUploadField } from "@/features/profileEditor/components/imageUploadField"
import { useGetMyProfile } from "@/features/profileEditor/hooks/useGetMyProfile"
import { useUpdateProfile } from "@/features/profileEditor/hooks/useUpdateProfile"
import { formatPhone } from "@/shared/utils/formatPhone"

export function ProfileSettingsSection() {
  const { data: profile, isLoading } = useGetMyProfile()
  const updateProfile = useUpdateProfile()

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")

  useEffect(() => {
    if (profile) {
      setProfilePhoto(profile.profilePhoto ?? null)
      setPhoneNumber(profile.phoneNumber ?? "")
    }
  }, [profile])

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        profilePhoto: profilePhoto ?? undefined,
        phoneNumber: phoneNumber || undefined,
      })
      toast.success("Perfil atualizado com sucesso!")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao salvar perfil")
        : "Erro ao salvar perfil"
      toast.error(message)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[200px] items-center justify-center">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="profile-settings-section">
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>Informações pessoais da sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5 max-w-sm">
          {profile?.coachName && (
            <Field>
              <FieldLabel>Nome</FieldLabel>
              <p className="text-sm text-foreground">{profile.coachName}</p>
            </Field>
          )}

          <ImageUploadField
            label="Foto de perfil"
            hint="Recomendado: 400x400px (quadrado). Exibida em circulo na pagina publica."
            currentUrl={profilePhoto}
            onUpload={(fileUrl) => setProfilePhoto(fileUrl)}
            disabled={updateProfile.isPending}
            shape="circle"
          />

          <Field>
            <FieldLabel htmlFor="settings-phone">Telefone (WhatsApp)</FieldLabel>
            <Input
              id="settings-phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
              disabled={updateProfile.isPending}
              data-testid="phone-input"
            />
          </Field>

          <Button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            data-testid="save-profile-button"
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
        </div>
      </CardContent>
    </Card>
  )
}
