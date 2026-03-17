"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Upload, Loader2, Trash2, ImageIcon } from "lucide-react"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select"
import { useCreateExercise } from "@/features/exercises/hooks/useCreateExercise"
import { useUpdateExercise } from "@/features/exercises/hooks/useUpdateExercise"
import { exercisesService } from "@/features/exercises/services/exercises.service"
import { MUSCLE_GROUPS, type ExerciseItem } from "@/features/exercises/types/exercises.types"

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  muscleGroup: z.string().min(1, "Grupo muscular é obrigatório"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  youtubeUrl: z.string().url("URL inválida").optional().or(z.literal("")),
})

type FormValues = z.infer<typeof schema>

interface ExerciseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise?: ExerciseItem
}

export function ExerciseFormDialog({ open, onOpenChange, exercise }: ExerciseFormDialogProps) {
  const isEdit = !!exercise
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeletingMedia, setIsDeletingMedia] = useState(false)
  // Local preview: tracks the current mediaUrl (existing or just uploaded)
  const [mediaPreview, setMediaPreview] = useState<string | null>(exercise?.mediaUrl ?? null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      muscleGroup: "",
      description: "",
      instructions: "",
      youtubeUrl: "",
    },
  })

  useEffect(() => {
    if (exercise) {
      form.reset({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        description: exercise.description ?? "",
        instructions: exercise.instructions ?? "",
        youtubeUrl: exercise.youtubeUrl ?? "",
      })
      setMediaPreview(exercise.mediaUrl ?? null)
    } else {
      form.reset({
        name: "",
        muscleGroup: "",
        description: "",
        instructions: "",
        youtubeUrl: "",
      })
      setMediaPreview(null)
    }
  }, [exercise, form])

  const createExercise = useCreateExercise({ onOpenChange })
  const updateExercise = useUpdateExercise(exercise?.id ?? "", { onOpenChange })

  async function handleFileUpload(exerciseId: string, file: File) {
    const mimeType = file.type as "image/jpeg" | "image/png" | "image/webp" | "video/mp4"
    setIsUploading(true)
    try {
      const { uploadUrl, fileUrl } = await exercisesService.requestUploadUrl(exerciseId, {
        mimeType,
      })
      await exercisesService.uploadToS3(uploadUrl, file)
      await exercisesService.update(exerciseId, { mediaUrl: fileUrl })
      setMediaPreview(fileUrl)
      toast.success("Mídia enviada com sucesso!")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao enviar mídia")
        : "Erro ao enviar mídia"
      toast.error(message)
    } finally {
      setIsUploading(false)
      // Reset file input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleDeleteMedia(exerciseId: string) {
    setIsDeletingMedia(true)
    try {
      await exercisesService.update(exerciseId, { mediaUrl: null })
      setMediaPreview(null)
      toast.success("Mídia removida com sucesso!")
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Erro ao remover mídia")
        : "Erro ao remover mídia"
      toast.error(message)
    } finally {
      setIsDeletingMedia(false)
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !exercise) return
    await handleFileUpload(exercise.id, file)
  }

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      updateExercise.mutate({
        name: values.name,
        muscleGroup: values.muscleGroup,
        description: values.description || null,
        instructions: values.instructions || null,
        youtubeUrl: values.youtubeUrl || null,
      })
    } else {
      createExercise.mutate({
        name: values.name,
        muscleGroup: values.muscleGroup,
        description: values.description || undefined,
        instructions: values.instructions || undefined,
        youtubeUrl: values.youtubeUrl || undefined,
      })
    }
  }

  const isPending = createExercise.isPending || updateExercise.isPending || isDeletingMedia

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar exercício" : "Novo exercício"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="exercise-name">Nome</FieldLabel>
              <Input
                id="exercise-name"
                placeholder="Ex: Supino reto, Agachamento..."
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="exercise-muscleGroup">Grupo muscular</FieldLabel>
              <Select
                value={form.watch("muscleGroup")}
                onValueChange={(val) => form.setValue("muscleGroup", val, { shouldValidate: true })}
              >
                <SelectTrigger id="exercise-muscleGroup">
                  <SelectValue placeholder="Selecione o grupo muscular" />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.muscleGroup]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="exercise-description">Descrição</FieldLabel>
              <Textarea
                id="exercise-description"
                placeholder="Breve descrição do exercício..."
                rows={2}
                {...form.register("description")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="exercise-instructions">Instruções</FieldLabel>
              <Textarea
                id="exercise-instructions"
                placeholder="Como executar corretamente..."
                rows={3}
                {...form.register("instructions")}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="exercise-youtubeUrl">URL do YouTube</FieldLabel>
              <Input
                id="exercise-youtubeUrl"
                placeholder="https://youtube.com/watch?v=..."
                {...form.register("youtubeUrl")}
              />
              <FieldError errors={[form.formState.errors.youtubeUrl]} />
            </Field>

            {isEdit && (
              <Field>
                <FieldLabel>Mídia (imagem ou vídeo)</FieldLabel>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4"
                  className="hidden"
                  onChange={onFileChange}
                />

                {mediaPreview ? (
                  <div className="relative overflow-hidden rounded-lg border bg-muted">
                    <div className="relative h-40 w-full">
                      <Image
                        src={mediaPreview}
                        alt="Preview da mídia"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t px-3 py-2">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ImageIcon className="size-3.5" />
                        Mídia atual
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading || isDeletingMedia}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {isUploading ? (
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          ) : (
                            <Upload className="mr-1.5 size-3.5" />
                          )}
                          Trocar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading || isDeletingMedia}
                          onClick={() => handleDeleteMedia(exercise!.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          {isDeletingMedia ? (
                            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1.5 size-3.5" />
                          )}
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 size-4" />
                        Enviar mídia
                      </>
                    )}
                  </Button>
                )}
              </Field>
            )}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending || isUploading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || isUploading}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
