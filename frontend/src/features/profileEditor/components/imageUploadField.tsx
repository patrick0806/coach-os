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
}

export function ImageUploadField({ label, hint, currentUrl, onUpload, disabled }: ImageUploadFieldProps) {
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
      )}
    </div>
  )
}
