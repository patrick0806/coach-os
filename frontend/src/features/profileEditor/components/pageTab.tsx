"use client"

import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { ImageUploadField } from "@/features/profileEditor/components/imageUploadField"
import type { ProfileData, UpdateProfileData } from "@/features/profileEditor/services/profile.service"

interface PageTabProps {
  data: ProfileData
  onChange: (patch: Partial<UpdateProfileData>) => void
  disabled?: boolean
}

export function PageTab({ data, onChange, disabled }: PageTabProps) {
  return (
    <FieldGroup className="gap-5">
      <Field>
        <FieldLabel htmlFor="lpTitle">Título principal</FieldLabel>
        <Input
          id="lpTitle"
          placeholder="Ex: Transforme seu corpo com ciência"
          value={data.lpTitle ?? ""}
          onChange={(e) => onChange({ lpTitle: e.target.value })}
          disabled={disabled}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="lpSubtitle">Subtítulo</FieldLabel>
        <Input
          id="lpSubtitle"
          placeholder="Ex: Treinamento personalizado para seus objetivos"
          value={data.lpSubtitle ?? ""}
          onChange={(e) => onChange({ lpSubtitle: e.target.value })}
          disabled={disabled}
        />
      </Field>

      <ImageUploadField
        label="Imagem de capa (hero)"
        hint="Recomendado: 1920×1080px (16:9). Aparece como fundo da seção principal."
        currentUrl={data.lpHeroImage}
        onUpload={(fileUrl) => onChange({ lpHeroImage: fileUrl })}
        disabled={disabled}
      />

      <Field>
        <FieldLabel htmlFor="lpAboutTitle">Título da seção Sobre</FieldLabel>
        <Input
          id="lpAboutTitle"
          placeholder="Ex: Sobre mim"
          value={data.lpAboutTitle ?? ""}
          onChange={(e) => onChange({ lpAboutTitle: e.target.value })}
          disabled={disabled}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="lpAboutText">Texto da seção Sobre</FieldLabel>
        <Textarea
          id="lpAboutText"
          rows={5}
          placeholder="Conte sua história, formação e método de trabalho..."
          value={data.lpAboutText ?? ""}
          onChange={(e) => onChange({ lpAboutText: e.target.value })}
          disabled={disabled}
        />
      </Field>

      <div className="space-y-2">
        <div>
          <p className="text-sm font-medium">Fotos da seção Sobre (até 3)</p>
          <p className="text-xs text-muted-foreground">Recomendado: 800×800px (quadrado). Exibidas em grid lado a lado.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ImageUploadField
            label="Foto 1"
            currentUrl={data.lpImage1}
            onUpload={(fileUrl) => onChange({ lpImage1: fileUrl })}
            disabled={disabled}
          />
          <ImageUploadField
            label="Foto 2"
            currentUrl={data.lpImage2}
            onUpload={(fileUrl) => onChange({ lpImage2: fileUrl })}
            disabled={disabled}
          />
          <ImageUploadField
            label="Foto 3"
            currentUrl={data.lpImage3}
            onUpload={(fileUrl) => onChange({ lpImage3: fileUrl })}
            disabled={disabled}
          />
        </div>
      </div>
    </FieldGroup>
  )
}
