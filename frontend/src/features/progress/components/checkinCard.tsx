"use client"

import { Trash2 } from "lucide-react"
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
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import {
  METRIC_TYPE_LABELS,
  METRIC_TYPE_UNITS,
  type MetricType,
} from "@/features/progress/types/progress.types"
import type { ProgressCheckin } from "@/features/progress/types/progressCheckins.types"
import { formatLongDate } from "@/shared/utils/formatDate"

interface CheckinCardProps {
  checkin: ProgressCheckin
  onDelete: (id: string) => void
}

export function CheckinCard({ checkin, onDelete }: CheckinCardProps) {
  const formattedDate = formatLongDate(checkin.checkinDate)

  return (
    <Card data-testid="checkin-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="font-medium text-sm">{formattedDate}</span>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-destructive hover:text-destructive"
              data-testid="delete-checkin-button"
            >
              <Trash2 className="size-3.5" />
              <span className="sr-only">Remover</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover registro de evolução</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o registro de <strong>{formattedDate}</strong>?
                Todos os dados (métricas e fotos) serão removidos. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(checkin.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>

      <CardContent className="space-y-3">
        {checkin.records.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {checkin.records.map((record) => (
              <Badge key={record.id} variant="secondary">
                {METRIC_TYPE_LABELS[record.metricType as MetricType] ?? record.metricType}:{" "}
                {record.value}{" "}
                {METRIC_TYPE_UNITS[record.metricType as MetricType] ?? record.unit}
              </Badge>
            ))}
          </div>
        )}

        {checkin.photos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {checkin.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative size-16 rounded-md overflow-hidden border bg-muted shrink-0"
              >
                <Image
                  src={photo.mediaUrl}
                  alt="Foto de progresso"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        )}

        {checkin.notes && (
          <p className="text-sm text-muted-foreground">{checkin.notes}</p>
        )}
      </CardContent>
    </Card>
  )
}
