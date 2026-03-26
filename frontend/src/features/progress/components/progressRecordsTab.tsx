"use client"

import { useState } from "react"
import { BarChart3, Pencil, Trash2, Plus } from "lucide-react"

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
import { Card, CardContent } from "@/shared/ui/card"
import { Badge } from "@/shared/ui/badge"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { useProgressRecords } from "@/features/progress/hooks/useProgressRecords"
import { useDeleteProgressRecord } from "@/features/progress/hooks/useDeleteProgressRecord"
import { ProgressRecordFormDialog } from "@/features/progress/components/progressRecordFormDialog"
import { useProgressChartData } from "@/features/progress/hooks/useProgressChartData"
import { ProgressChart } from "@/features/progress/components/progressChart"
import { CombinedProgressChart } from "@/features/progress/components/combinedProgressChart"
import { formatShortDate } from "@/shared/utils/formatDate"
import {
  METRIC_TYPES,
  METRIC_TYPE_LABELS,
  METRIC_TYPE_UNITS,
  type MetricType,
  type ProgressRecord,
} from "@/features/progress/types/progress.types"

interface ProgressRecordsTabProps {
  studentId: string
}

export function ProgressRecordsTab({ studentId }: ProgressRecordsTabProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType | undefined>(undefined)
  const [formOpen, setFormOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProgressRecord | undefined>(undefined)
  const [page, setPage] = useState(0)

  const { data, isLoading } = useProgressRecords(studentId, {
    metricType: selectedMetric,
    page,
    size: 10,
  })

  const chartQuery = useProgressChartData(studentId, selectedMetric)
  const deleteRecord = useDeleteProgressRecord(studentId)

  function handleEdit(record: ProgressRecord) {
    setEditingRecord(record)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditingRecord(undefined)
    setFormOpen(true)
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open)
    if (!open) setEditingRecord(undefined)
  }

  const records = data?.content ?? []
  const hasMore = data ? page + 1 < data.totalPages : false

  return (
    <div className="space-y-4" data-testid="progress-records-tab">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            size="sm"
            variant={selectedMetric === undefined ? "default" : "outline"}
            onClick={() => { setSelectedMetric(undefined); setPage(0) }}
          >
            Todos
          </Button>
          {METRIC_TYPES.map((type) => (
            <Button
              key={type}
              size="sm"
              variant={selectedMetric === type ? "default" : "outline"}
              onClick={() => { setSelectedMetric(type); setPage(0) }}
            >
              {METRIC_TYPE_LABELS[type]}
            </Button>
          ))}
        </div>

        <Button size="sm" onClick={handleCreate} data-testid="add-record-button">
          <Plus className="mr-1.5 size-3.5" />
          Adicionar
        </Button>
      </div>

      {selectedMetric ? (
        <ProgressChart
          data={chartQuery.data ?? []}
          label={METRIC_TYPE_LABELS[selectedMetric]}
          unit={METRIC_TYPE_UNITS[selectedMetric]}
          isLoading={chartQuery.isLoading}
        />
      ) : (
        <CombinedProgressChart
          data={chartQuery.data ?? []}
          isLoading={chartQuery.isLoading}
        />
      )}

      {isLoading ? (
        <LoadingState variant="list" />
      ) : records.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="Nenhum registro encontrado"
          description={
            selectedMetric
              ? `Nenhum registro de ${METRIC_TYPE_LABELS[selectedMetric]} cadastrado.`
              : "Adicione o primeiro registro de progresso do aluno."
          }
          action={
            <Button size="sm" onClick={handleCreate}>
              <Plus className="mr-1.5 size-3.5" />
              Adicionar registro
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Card key={record.id} data-testid="progress-record-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="secondary">
                      {METRIC_TYPE_LABELS[record.metricType as MetricType]}
                    </Badge>
                    <span className="text-lg font-semibold">
                      {record.value} {METRIC_TYPE_UNITS[record.metricType as MetricType]}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatShortDate(record.recordedAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleEdit(record)}
                    >
                      <Pencil className="size-3.5" />
                      <span className="sr-only">Editar</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-destructive hover:text-destructive"
                          data-testid="delete-record-button"
                        >
                          <Trash2 className="size-3.5" />
                          <span className="sr-only">Remover</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover registro</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover este registro de{" "}
                            <strong>{METRIC_TYPE_LABELS[record.metricType as MetricType]}</strong>?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRecord.mutate(record.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                {record.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}

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

      <ProgressRecordFormDialog
        studentId={studentId}
        open={formOpen}
        onOpenChange={handleFormClose}
        record={editingRecord}
      />
    </div>
  )
}
