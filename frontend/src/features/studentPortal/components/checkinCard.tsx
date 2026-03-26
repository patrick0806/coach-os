"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, ImageIcon } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import type { StudentCheckin } from "@/features/studentPortal/types/studentPortalCheckins.types"
import { METRIC_TYPE_LABELS } from "@/features/progress/types/progress.types"
import { formatLongDate } from "@/shared/utils/formatDate"

function formatMetricLabel(metricType: string): string {
  return METRIC_TYPE_LABELS[metricType as keyof typeof METRIC_TYPE_LABELS] ?? metricType
}

interface CheckinCardProps {
  checkin: StudentCheckin
}

export function CheckinCard({ checkin }: CheckinCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formattedDate = formatLongDate(checkin.checkinDate)

  const totalItems = checkin.records.length + checkin.photos.length

  return (
    <Card data-testid="checkin-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{formattedDate}</p>
            {checkin.notes && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {checkin.notes}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="shrink-0">
            {totalItems} registro{totalItems !== 1 ? "s" : ""}
          </Badge>
        </div>

        {/* Summary line */}
        {checkin.records.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {checkin.records
              .slice(0, 3)
              .map((r) => `${formatMetricLabel(r.metricType)}: ${r.value}${r.unit}`)
              .join(" · ")}
            {checkin.records.length > 3 && " · ..."}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          {checkin.photos.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              <span>{checkin.photos.length} foto{checkin.photos.length !== 1 ? "s" : ""}</span>
            </div>
          )}
          {totalItems > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 gap-1 text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="expand-checkin"
            >
              {isExpanded ? (
                <>Fechar <ChevronUp className="h-3.5 w-3.5" /></>
              ) : (
                <>Ver detalhes <ChevronDown className="h-3.5 w-3.5" /></>
              )}
            </Button>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-3 space-y-3 border-t pt-3">
            {checkin.records.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Métricas</p>
                <div className="space-y-1">
                  {checkin.records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-1.5"
                    >
                      <span className="text-xs text-muted-foreground">
                        {formatMetricLabel(record.metricType)}
                      </span>
                      <span className="text-xs font-medium">
                        {record.value} {record.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {checkin.photos.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Fotos</p>
                <div className="grid grid-cols-3 gap-2">
                  {checkin.photos.map((photo) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={photo.id}
                      src={photo.mediaUrl}
                      alt="Foto de progresso"
                      className="aspect-square w-full rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
