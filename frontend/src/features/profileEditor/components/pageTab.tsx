"use client"

import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Field, FieldLabel } from "@/shared/ui/field"
import { ImageUploadField } from "@/features/profileEditor/components/imageUploadField"
import type { LpDraftData } from "@/features/profileEditor/services/profile.service"

const LAYOUTS = [
  {
    id: "1",
    name: "Conversão",
    description: "Ideal para captar leads com CTA em destaque",
    thumbnail: (
      <div className="space-y-1.5 pt-1">
        <div className="mx-auto h-3 w-3 rounded-full bg-current opacity-50" />
        <div className="h-3.5 w-full rounded bg-current opacity-40" />
        <div className="h-2 w-3/4 mx-auto rounded bg-current opacity-20" />
        <div className="mx-auto h-4 w-2/3 rounded bg-current opacity-30" />
      </div>
    ),
  },
  {
    id: "2",
    name: "Autoridade",
    description: "Hero dividido: credibilidade com texto + foto",
    thumbnail: (
      <div className="flex gap-1.5 items-center h-12">
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-full rounded bg-current opacity-40" />
          <div className="h-1.5 w-3/4 rounded bg-current opacity-20" />
          <div className="h-3 w-1/2 rounded bg-current opacity-30" />
        </div>
        <div className="size-9 rounded bg-current opacity-20 shrink-0" />
      </div>
    ),
  },
  {
    id: "3",
    name: "Minimalista",
    description: "Tipografia ampla e espaço branco elegante",
    thumbnail: (
      <div className="space-y-2 pt-1">
        <div className="h-4 w-full rounded bg-current opacity-40" />
        <div className="h-2 w-2/3 mx-auto rounded bg-current opacity-20" />
        <div className="flex justify-center gap-1.5">
          <div className="h-1.5 w-8 rounded-full border border-current opacity-40" />
          <div className="h-1.5 w-8 rounded-full border border-current opacity-40" />
        </div>
      </div>
    ),
  },
  {
    id: "4",
    name: "Impacto",
    description: "Visual escuro e marcante para presença forte",
    thumbnail: (
      <div className="space-y-1.5">
        <div className="h-7 w-full rounded bg-current opacity-60" />
        <div className="h-1.5 w-2/3 mx-auto rounded bg-current opacity-20" />
        <div className="flex gap-1">
          <div className="h-4 flex-1 rounded bg-current opacity-10" />
          <div className="h-4 flex-1 rounded border border-current opacity-40" />
          <div className="h-4 flex-1 rounded bg-current opacity-10" />
        </div>
      </div>
    ),
  },
]

interface PageTabProps {
  data: LpDraftData & { lpLayout?: string }
  onChange: (patch: Partial<LpDraftData>) => void
  disabled?: boolean
}

export function PageTab({ data, onChange, disabled }: PageTabProps) {
  const currentLayout = data.lpLayout ?? "1"

  return (
    <div className="space-y-5">
      <div className="flex w-full flex-col gap-5">
        {/* Layout picker */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Template da página</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LAYOUTS.map((layout) => {
              const isActive = currentLayout === layout.id
              return (
                <button
                  key={layout.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ lpLayout: layout.id })}
                  className={`flex flex-col gap-2 rounded-xl border-2 p-3 text-left transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-muted-foreground/40"
                  } disabled:pointer-events-none disabled:opacity-50`}
                >
                  <div className="w-full">{layout.thumbnail}</div>
                  <div>
                    <p className="text-xs font-semibold leading-tight">{layout.name}</p>
                    <p className="text-[10px] leading-tight opacity-70">{layout.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

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
            <p className="text-xs text-muted-foreground">
              Recomendado: 800×800px (quadrado). Exibidas em grid lado a lado.
            </p>
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
      </div>
    </div>
  )
}
