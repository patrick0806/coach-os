"use client"

import { useState } from "react"
import { Input } from "@/shared/ui/input"
import { Field, FieldLabel } from "@/shared/ui/field"
import type { ProfileData, UpdateProfileData } from "@/features/profileEditor/services/profile.service"

interface ProfileTabProps {
  data: ProfileData
  onChange: (patch: Partial<UpdateProfileData>) => void
  disabled?: boolean
}

export function ProfileTab({ data, onChange, disabled }: ProfileTabProps) {
  const [specialtiesText, setSpecialtiesText] = useState(
    () => (data.specialties ?? []).join(", ")
  )

  return (
    <div className="space-y-5">
      <div className="flex w-full flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="specialties">Especialidades (separadas por virgula)</FieldLabel>
          <Input
            id="specialties"
            placeholder="Ex: musculacao, emagrecimento, funcional"
            value={specialtiesText}
            onChange={(e) => setSpecialtiesText(e.target.value)}
            onBlur={() =>
              onChange({
                specialties: specialtiesText
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            disabled={disabled}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="themeColor">Cor primaria</FieldLabel>
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
          <FieldLabel htmlFor="themeColorSecondary">Cor secundaria (acento)</FieldLabel>
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
      </div>
    </div>
  )
}
