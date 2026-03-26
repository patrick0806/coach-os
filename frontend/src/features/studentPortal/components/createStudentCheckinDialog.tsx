"use client"

import { useRef, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Plus, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover"
import { Textarea } from "@/shared/ui/textarea"
import {
  METRIC_TYPES,
  METRIC_TYPE_LABELS,
  METRIC_TYPE_UNITS,
  type MetricType,
} from "@/features/progress/types/progress.types"
import { studentPortalCheckinsService } from "@/features/studentPortal/services/studentPortalCheckins.service"
import { useCreateMyCheckin } from "@/features/studentPortal/hooks/useCreateMyCheckin"
import { formatLongDate } from "@/shared/utils/formatDate"

interface PhotoPreview {
  file: File
  previewUrl: string
  notes: string
}

interface CreateStudentCheckinDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateStudentCheckinDialog({
  open,
  onOpenChange,
}: CreateStudentCheckinDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [notes, setNotes] = useState("")
  const [metrics, setMetrics] = useState<Record<MetricType, string>>(
    {} as Record<MetricType, string>,
  )
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const createCheckin = useCreateMyCheckin(() => handleClose())

  function handleClose() {
    onOpenChange(false)
    setSelectedDate(new Date())
    setCalendarOpen(false)
    setNotes("")
    setMetrics({} as Record<MetricType, string>)
    setPhotos([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleMetricChange(type: MetricType, value: string) {
    setMetrics((prev) => ({ ...prev, [type]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newPreviews: PhotoPreview[] = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      notes: "",
    }))
    setPhotos((prev) => [...prev, ...newPreviews])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function updatePhotoNotes(index: number, photoNotes: string) {
    setPhotos((prev) =>
      prev.map((p, i) => (i === index ? { ...p, notes: photoNotes } : p)),
    )
  }

  const records = METRIC_TYPES.filter((type) => {
    const val = metrics[type]
    return val !== undefined && val !== ""
  }).map((type) => ({
    metricType: type,
    value: parseFloat(metrics[type]),
    unit: METRIC_TYPE_UNITS[type],
  }))

  const hasData = records.length > 0 || photos.length > 0
  const isPending = isUploading || createCheckin.isPending

  async function handleSubmit() {
    if (!hasData) {
      toast.error("Adicione pelo menos uma métrica ou foto")
      return
    }

    setIsUploading(true)
    try {
      const uploadedPhotos = await Promise.all(
        photos.map(async (p) => {
          const { uploadUrl, fileUrl } =
            await studentPortalCheckinsService.requestPhotoUploadUrl(p.file.type)
          await studentPortalCheckinsService.uploadToS3(uploadUrl, p.file)
          return { mediaUrl: fileUrl, notes: p.notes.trim() || undefined }
        }),
      )

      createCheckin.mutate({
        checkinDate: format(selectedDate, "yyyy-MM-dd"),
        notes: notes.trim() || undefined,
        records,
        photos: uploadedPhotos,
      })
    } catch {
      toast.error("Erro ao fazer upload das fotos")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Evolução</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date + notes */}
          <FieldGroup>
            <Field>
              <FieldLabel>Data</FieldLabel>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    disabled={isPending}
                  >
                    <CalendarIcon className="mr-2 size-4 shrink-0" />
                    {formatLongDate(selectedDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date)
                        setCalendarOpen(false)
                      }
                    }}
                    locale={ptBR}
                    disabled={{ after: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="checkin-notes">Observações gerais</FieldLabel>
              <Textarea
                id="checkin-notes"
                placeholder="Ex: Semana de adaptação concluída..."
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>

          {/* Metrics */}
          <div>
            <p className="text-sm font-medium mb-3">Métricas</p>
            <div className="grid grid-cols-2 gap-3">
              {METRIC_TYPES.map((type) => (
                <Field key={type}>
                  <FieldLabel htmlFor={`metric-${type}`}>
                    {METRIC_TYPE_LABELS[type]} ({METRIC_TYPE_UNITS[type]})
                  </FieldLabel>
                  <Input
                    id={`metric-${type}`}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="—"
                    value={metrics[type] ?? ""}
                    onChange={(e) => handleMetricChange(type, e.target.value)}
                    disabled={isPending}
                  />
                </Field>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div>
            <p className="text-sm font-medium mb-3">Fotos</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {photos.length > 0 && (
              <div className="space-y-3 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="relative size-16 rounded-md overflow-hidden border bg-muted shrink-0">
                      <Image
                        src={photo.previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Observação (opcional)"
                        value={photo.notes}
                        onChange={(e) => updatePhotoNotes(index, e.target.value)}
                        disabled={isPending}
                        className="text-sm"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      disabled={isPending}
                      onClick={() => removePhoto(index)}
                    >
                      <X className="size-3.5" />
                      <span className="sr-only">Remover foto</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="mr-2 size-4" />
              Adicionar fotos
            </Button>
          </div>
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
            disabled={!hasData || isPending}
            data-testid="submit-checkin-button"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Registrar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
