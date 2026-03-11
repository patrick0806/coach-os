"use client";

import { useMemo, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit2, FileText, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createStudentNote,
  deleteStudentNote,
  listStudentNotes,
  updateStudentNote,
  type StudentNote,
} from "@/services/student-notes.service";

interface StudentNotesTimelineProps {
  studentId: string;
}

const PAGE_SIZE = 10;

function formatNoteDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function StudentNotesTimeline({ studentId }: StudentNotesTimelineProps) {
  const queryClient = useQueryClient();
  const [noteText, setNoteText] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [deletingNote, setDeletingNote] = useState<StudentNote | null>(null);

  const notesQuery = useInfiniteQuery({
    queryKey: ["student-notes", studentId],
    initialPageParam: 1,
    queryFn: ({ pageParam }) => listStudentNotes(studentId, { page: pageParam, size: PAGE_SIZE }),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.size;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
  });

  const notes = useMemo(
    () => notesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [notesQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: () => createStudentNote(studentId, { note: noteText.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notes", studentId] });
      setNoteText("");
      toast.success("Nota adicionada.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível adicionar a nota."));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ noteId, note }: { noteId: string; note: string }) =>
      updateStudentNote(noteId, { note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notes", studentId] });
      setEditingNoteId(null);
      setEditingText("");
      toast.success("Nota atualizada.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar a nota."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => deleteStudentNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-notes", studentId] });
      setDeletingNote(null);
      toast.success("Nota removida.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível remover a nota."));
    },
  });

  const total = notesQuery.data?.pages[0]?.total ?? 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="size-4 text-muted-foreground" />
            Notas do aluno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              placeholder="Registre observações privadas sobre este aluno..."
              maxLength={2000}
              rows={4}
            />
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {noteText.length}/2000 caracteres
              </p>
              <Button
                size="sm"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || noteText.trim().length === 0}
              >
                {createMutation.isPending ? "Adicionando..." : "Adicionar nota"}
              </Button>
            </div>
          </div>

          {notesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 rounded-lg border p-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : notesQuery.isError ? (
            <p className="text-sm text-destructive">
              Não foi possível carregar as notas.
            </p>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma nota registrada ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="relative rounded-xl border bg-card p-4">
                  <div className="absolute left-0 top-6 h-full w-px translate-x-[-17px] bg-border last:hidden" />
                  <div className="absolute left-[-24px] top-6 size-3 rounded-full bg-primary" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formatNoteDate(note.createdAt)}
                      </p>
                      <p className="mt-1 text-xs font-medium text-foreground">
                        Você
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingText(note.note);
                        }}
                      >
                        <Edit2 className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingNote(note)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="mt-3 space-y-3">
                      <Textarea
                        value={editingText}
                        onChange={(event) => setEditingText(event.target.value)}
                        maxLength={2000}
                        rows={4}
                      />
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs text-muted-foreground">
                          {editingText.length}/2000 caracteres
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingNoteId(null);
                              setEditingText("");
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            disabled={updateMutation.isPending || editingText.trim().length === 0}
                            onClick={() =>
                              updateMutation.mutate({
                                noteId: note.id,
                                note: editingText.trim(),
                              })
                            }
                          >
                            {updateMutation.isPending ? "Salvando..." : "Salvar"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                      {note.note}
                    </p>
                  )}
                </div>
              ))}

              {notes.length < total ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => notesQuery.fetchNextPage()}
                  disabled={notesQuery.isFetchingNextPage}
                >
                  {notesQuery.isFetchingNextPage ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Carregar mais"
                  )}
                </Button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deletingNote)} onOpenChange={(open) => !open && setDeletingNote(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover nota</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover esta nota do histórico do aluno?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending || !deletingNote}
              onClick={() => deletingNote && deleteMutation.mutate(deletingNote.id)}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
