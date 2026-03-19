"use client"

import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { ImageUploadField } from "@/features/profileEditor/components/imageUploadField"
import type { ProfileData, UpdateProfileData } from "@/features/profileEditor/services/profile.service"

// Brazilian phone mask: (XX) XXXXX-XXXX (mobile) or (XX) XXXX-XXXX (landline)
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

interface ProfileTabProps {
  data: ProfileData
  onChange: (patch: Partial<UpdateProfileData>) => void
  disabled?: boolean
}

export function ProfileTab({ data, onChange, disabled }: ProfileTabProps) {
  return (
    <FieldGroup className="gap-5">
      <ImageUploadField
        label="Foto de perfil"
        hint="Recomendado: 400×400px (quadrado). Exibida em círculo na página pública."
        currentUrl={data.profilePhoto}
        onUpload={(fileUrl) => onChange({ profilePhoto: fileUrl })}
        disabled={disabled}
        shape="circle"
      />

      <Field>
        <FieldLabel htmlFor="bio">Bio</FieldLabel>
        <Textarea
          id="bio"
          rows={4}
          placeholder="Escreva sobre você, sua experiência e metodologia..."
          value={data.bio ?? ""}
          onChange={(e) => onChange({ bio: e.target.value })}
          disabled={disabled}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="phoneNumber">Telefone (WhatsApp)</FieldLabel>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="(11) 99999-9999"
          value={data.phoneNumber ?? ""}
          onChange={(e) => onChange({ phoneNumber: formatPhone(e.target.value) })}
          disabled={disabled}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="specialties">Especialidades (separadas por vírgula)</FieldLabel>
        <Input
          id="specialties"
          placeholder="Ex: musculação, emagrecimento, funcional"
          value={(data.specialties ?? []).join(", ")}
          onChange={(e) =>
            onChange({
              specialties: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          disabled={disabled}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="themeColor">Cor primária</FieldLabel>
        <div className="flex items-center gap-3">
          <input
            id="themeColor"
            type="color"
            className="h-10 w-16 cursor-pointer rounded-md border bg-transparent p-1"
            value={data.themeColor ?? "#6366f1"}
            onChange={(e) => onChange({ themeColor: e.target.value })}
            disabled={disabled}
          />
          <Input
            type="text"
            value={data.themeColor ?? ""}
            onChange={(e) => onChange({ themeColor: e.target.value })}
            placeholder="#6366f1"
            className="max-w-32"
            disabled={disabled}
          />
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="themeColorSecondary">Cor secundária (acento)</FieldLabel>
        <div className="flex items-center gap-3">
          <input
            id="themeColorSecondary"
            type="color"
            className="h-10 w-16 cursor-pointer rounded-md border bg-transparent p-1"
            value={data.themeColorSecondary ?? "#a855f7"}
            onChange={(e) => onChange({ themeColorSecondary: e.target.value })}
            disabled={disabled}
          />
          <Input
            type="text"
            value={data.themeColorSecondary ?? ""}
            onChange={(e) => onChange({ themeColorSecondary: e.target.value })}
            placeholder="#a855f7"
            className="max-w-32"
            disabled={disabled}
          />
        </div>
      </Field>
    </FieldGroup>
  )
}
