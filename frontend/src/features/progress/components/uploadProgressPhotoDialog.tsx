"use client"

import { useRef, useState } from "react"
import { Upload, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Textarea } from "@/shared/ui/textarea"
import { progressService } from "@/features/progress/services/progress.service"
import { useSaveProgressPhoto } from "@/features/progress/hooks/useSaveProgressPhoto"

interface UploadProgressPhotoDialogProps {
  studentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UploadProgressPhotoDialog({
  studentId,
  open,
  onOpenChange,
}: UploadProgressPhotoDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const savePhoto = useSaveProgressPhoto(studentId, () => {
    handleClose()
  })

  function handleClose() {
    onOpenChange(false)
    setSelectedFile(null)
    setPreview(null)
    setNotes("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  async function handleSubmit() {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const { uploadUrl, fileUrl } = await progressService.requestPhotoUploadUrl(
        studentId,
        selectedFile.type,
      )
      await progressService.uploadToS3(uploadUrl, selectedFile)
      savePhoto.mutate({ mediaUrl: fileUrl, notes: notes.trim() || undefined })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao fazer upload da foto")
        : "Erro ao fazer upload da foto"
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const isPending = isUploading || savePhoto.isPending

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar foto de progresso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Foto</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {preview ? (
                <div className="relative overflow-hidden rounded-lg border bg-muted">
                  <div className="relative h-48 w-full">
                    <Image
                      src={preview}
                      alt="Preview da foto"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ImageIcon className="size-3.5" />
                      {selectedFile?.name}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Trocar
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-32 border-dashed"
                  disabled={isPending}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mr-2 size-4" />
                  Selecionar foto
                </Button>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="photo-notes">Observações</FieldLabel>
              <Textarea
                id="photo-notes"
                placeholder="Ex: Vista frontal, mês 3..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar foto"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
