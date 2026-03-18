"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Camera, X, Plus } from "lucide-react"
import Image from "next/image"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { useProgressPhotos } from "@/features/progress/hooks/useProgressPhotos"
import { useDeleteProgressPhoto } from "@/features/progress/hooks/useDeleteProgressPhoto"
import { UploadProgressPhotoDialog } from "@/features/progress/components/uploadProgressPhotoDialog"
import type { ProgressPhoto } from "@/features/progress/types/progress.types"

interface ProgressPhotosTabProps {
  studentId: string
}

export function ProgressPhotosTab({ studentId }: ProgressPhotosTabProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deletingPhoto, setDeletingPhoto] = useState<ProgressPhoto | null>(null)
  const [page, setPage] = useState(0)

  const { data, isLoading } = useProgressPhotos(studentId, { page, size: 12 })
  const deletePhoto = useDeleteProgressPhoto(studentId)

  function handleDelete() {
    if (!deletingPhoto) return
    deletePhoto.mutate(deletingPhoto.id, {
      onSuccess: () => setDeletingPhoto(null),
    })
  }

  const photos = data?.content ?? []
  const hasMore = data ? page + 1 < data.totalPages : false

  return (
    <div className="space-y-4" data-testid="progress-photos-tab">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={() => setUploadOpen(true)} data-testid="add-photo-button">
          <Plus className="mr-1.5 size-3.5" />
          Adicionar foto
        </Button>
      </div>

      {isLoading ? (
        <LoadingState variant="card" />
      ) : photos.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="Nenhuma foto ainda"
          description="Adicione fotos para acompanhar a evolução visual do aluno."
          action={
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="mr-1.5 size-3.5" />
              Adicionar foto
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative overflow-hidden rounded-lg border bg-muted"
                data-testid="progress-photo-card"
              >
                <div className="relative aspect-square">
                  <Image
                    src={photo.mediaUrl}
                    alt="Foto de progresso"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-7 opacity-0 group-hover:opacity-100 bg-black/50 text-white hover:bg-black/70 hover:text-white transition-opacity"
                      onClick={() => setDeletingPhoto(photo)}
                      data-testid="delete-photo-button"
                    >
                      <X className="size-3.5" />
                      <span className="sr-only">Remover foto</span>
                    </Button>
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(photo.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                  {photo.notes && (
                    <p className="text-xs text-foreground mt-0.5 truncate">{photo.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setPage((p) => p + 1)}
            >
              Carregar mais
            </Button>
          )}
        </div>
      )}

      <UploadProgressPhotoDialog
        studentId={studentId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      <AlertDialog
        open={!!deletingPhoto}
        onOpenChange={(open) => { if (!open) setDeletingPhoto(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover foto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta foto de progresso? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePhoto.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deletePhoto.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePhoto.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
