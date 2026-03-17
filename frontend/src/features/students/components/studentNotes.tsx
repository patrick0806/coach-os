"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { FileText, Pencil, Trash2, X, Check } from "lucide-react"

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
import { Textarea } from "@/shared/ui/textarea"
import { EmptyState } from "@/shared/components/emptyState"
import { LoadingState } from "@/shared/components/loadingState"
import { useStudentNotes } from "@/features/students/hooks/useStudentNotes"
import { useCreateNote } from "@/features/students/hooks/useCreateNote"
import { useUpdateNote } from "@/features/students/hooks/useUpdateNote"
import { useDeleteNote } from "@/features/students/hooks/useDeleteNote"

interface StudentNotesProps {
  studentId: string
}

export function StudentNotes({ studentId }: StudentNotesProps) {
  const [newNote, setNewNote] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")

  const { data: notes, isLoading } = useStudentNotes(studentId)
  const createNote = useCreateNote(studentId)
  const updateNote = useUpdateNote(studentId)
  const deleteNote = useDeleteNote(studentId)

  function handleCreate() {
    if (!newNote.trim()) return
    createNote.mutate(
      { note: newNote.trim() },
      { onSuccess: () => setNewNote("") }
    )
  }

  function handleEditStart(id: string, text: string) {
    setEditingId(id)
    setEditingText(text)
  }

  function handleEditCancel() {
    setEditingId(null)
    setEditingText("")
  }

  function handleEditSave(id: string) {
    if (!editingText.trim()) return
    updateNote.mutate(
      { id, data: { note: editingText.trim() } },
      { onSuccess: () => { setEditingId(null); setEditingText("") } }
    )
  }

  if (isLoading) {
    return <LoadingState variant="list" />
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Adicionar nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
        />
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={!newNote.trim() || createNote.isPending}
        >
          {createNote.isPending ? "Salvando..." : "Adicionar nota"}
        </Button>
      </div>

      {!notes?.length ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma nota ainda"
          description="Adicione observações sobre o aluno."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-lg border border-border bg-card p-4 space-y-2"
            >
              {editingId === note.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEditSave(note.id)}
                      disabled={!editingText.trim() || updateNote.isPending}
                    >
                      <Check className="mr-1 size-3.5" />
                      Confirmar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleEditCancel}>
                      <X className="mr-1 size-3.5" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm whitespace-pre-wrap">{note.note}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(note.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleEditStart(note.id, note.note)}
                      >
                        <Pencil className="size-3.5" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive">
                            <Trash2 className="size-3.5" />
                            <span className="sr-only">Deletar</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover nota</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover esta nota? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteNote.mutate(note.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
