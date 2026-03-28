"use client"

import { useRef, useState } from "react"
import { Upload, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { profileService } from "@/features/profileEditor/services/profile.service"

interface ImageUploadFieldProps {
  label: string
  hint?: string
  currentUrl: string | null | undefined
  onUpload: (fileUrl: string) => void
  disabled?: boolean
  /** "circle" renders a fixed-size circle preview; "banner" (default) renders a full-width rectangle; "logo" renders a compact rectangle (200x64) */
  shape?: "circle" | "banner" | "logo"
}

export function ImageUploadField({ label, hint, currentUrl, onUpload, disabled, shape = "banner" }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const { uploadUrl, fileUrl } = await profileService.requestPhotoUpload(file.type)
      await profileService.uploadToS3(uploadUrl, file)
      onUpload(fileUrl)
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? `Erro ao fazer upload de ${label}`)
        : `Erro ao fazer upload de ${label}`
      toast.error(message)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const isDisabled = disabled || isUploading

  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={isDisabled}
      />

      {currentUrl ? (
        shape === "circle" ? (
          <div className="flex items-center gap-4">
            <div className="size-24 shrink-0 overflow-hidden rounded-full border-4 border-border shadow-md">
              <Image
                src={currentUrl}
                alt={label}
                width={96}
                height={96}
                className="size-full object-cover"
                unoptimized
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : "Trocar foto"}
            </Button>
          </div>
        ) : shape === "logo" ? (
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-[200px] shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
              <Image
                src={currentUrl}
                alt={label}
                width={200}
                height={64}
                className="h-full w-auto object-contain"
                unoptimized
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDisabled}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : "Trocar"}
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-muted">
            <div className="relative h-32 w-full">
              <Image
                src={currentUrl}
                alt={label}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ImageIcon className="size-3.5" />
                Imagem atual
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDisabled}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : "Trocar"}
              </Button>
            </div>
          </div>
        )
      ) : (
        shape === "circle" ? (
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={isDisabled}
              onClick={() => fileInputRef.current?.click()}
              className="flex size-24 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-border bg-muted transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              ) : (
                <Upload className="size-6 text-muted-foreground" />
              )}
            </button>
            <p className="text-xs text-muted-foreground">
              {isUploading ? "Enviando..." : "Clique no círculo para selecionar"}
            </p>
          </div>
        ) : shape === "logo" ? (
          <button
            type="button"
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-16 w-[200px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Upload className="size-4" />
                Selecionar logo
              </div>
            )}
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full h-24 border-dashed"
            disabled={isDisabled}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {isUploading ? "Enviando..." : "Selecionar imagem"}
          </Button>
        )
      )}
    </div>
  )
}
