"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  type Exercise,
  listExercises,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
  type MuscleGroup,
} from "@/services/exercises.service";
import {
  addExerciseToPlan,
  deleteWorkoutPlan,
  getWorkoutPlan,
  removeExerciseFromPlan,
  reorderExercises,
  updateWorkoutPlan,
  type WorkoutExercise,
} from "@/services/workout-plans.service";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const editPlanSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

type EditPlanValues = z.infer<typeof editPlanSchema>;

const addExerciseSchema = z.object({
  sets: z.coerce.number().int().min(1, "Mínimo 1 série"),
  repetitions: z.coerce.number().int().min(1, "Mínimo 1 repetição"),
  load: z.string().optional(),
  notes: z.string().optional(),
});

type AddExerciseValues = z.infer<typeof addExerciseSchema>;

// ─── Add Exercise Dialog ───────────────────────────────────────────────────────

interface AddExerciseDialogProps {
  open: boolean;
  planId: string;
  currentCount: number;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

function AddExerciseDialog({
  open,
  planId,
  currentCount,
  onOpenChange,
  onAdded,
}: AddExerciseDialogProps) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Exercise | null>(null);

  const { data: exercises = [], isLoading: loadingExercises } = useQuery({
    queryKey: ["exercises", { search, muscleGroup: muscleFilter }],
    queryFn: () =>
      listExercises({
        search: search || undefined,
        muscleGroup: muscleFilter !== "all" ? muscleFilter : undefined,
      }),
    enabled: open,
  });

  const form = useForm<AddExerciseValues>({
    resolver: zodResolver(addExerciseSchema),
    defaultValues: { sets: 3, repetitions: 12, load: "", notes: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: AddExerciseValues) =>
      addExerciseToPlan(planId, {
        exerciseId: selected!.id,
        sets: values.sets,
        repetitions: values.repetitions,
        load: values.load || undefined,
        notes: values.notes || undefined,
        order: currentCount,
      }),
    onSuccess: () => {
      toast.success("Exercício adicionado.");
      onAdded();
      handleClose();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível adicionar o exercício."));
    },
  });

  function handleClose() {
    setSearch("");
    setMuscleFilter("all");
    setSelected(null);
    form.reset({ sets: 3, repetitions: 12, load: "", notes: "" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Adicionar exercício</DialogTitle>
        </DialogHeader>

        {selected ? (
          // Step 2: configure sets/reps for selected exercise
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{selected.name}</p>
                <p className="text-sm text-gray-500">
                  {MUSCLE_GROUP_LABELS[selected.muscleGroup]}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(null)}
                className="size-8 p-0 text-gray-400"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ex-sets">Séries</Label>
                  <Input id="ex-sets" type="number" min={1} {...form.register("sets")} />
                  {form.formState.errors.sets ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.sets.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ex-reps">Repetições</Label>
                  <Input
                    id="ex-reps"
                    type="number"
                    min={1}
                    {...form.register("repetitions")}
                  />
                  {form.formState.errors.repetitions ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.repetitions.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ex-load">Carga (opcional)</Label>
                <Input id="ex-load" placeholder="ex: 20kg, peso corporal" {...form.register("load")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ex-notes">Observações (opcional)</Label>
                <Textarea
                  id="ex-notes"
                  placeholder="ex: Manter escápulas retraídas"
                  rows={2}
                  {...form.register("notes")}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : (
          // Step 1: search and select exercise
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar exercício..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={muscleFilter} onValueChange={setMuscleFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {MUSCLE_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {MUSCLE_GROUP_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="max-h-72 overflow-y-auto rounded-lg border">
              {loadingExercises ? (
                <div className="py-8 text-center text-sm text-gray-400">Carregando...</div>
              ) : exercises.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  Nenhum exercício encontrado.
                </div>
              ) : (
                <ul className="divide-y">
                  {exercises.map((ex) => (
                    <li key={ex.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(ex)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                          <p className="text-xs text-gray-500">
                            {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                          </p>
                        </div>
                        {ex.isGlobal ? null : (
                          <Badge variant="secondary" className="text-xs">
                            Personalizado
                          </Badge>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Exercise Row ──────────────────────────────────────────────────────────────

interface ExerciseRowProps {
  exercise: WorkoutExercise;
  isFirst: boolean;
  isLast: boolean;
  planId: string;
  onReorder: (id: string, direction: "up" | "down") => void;
  onRemoved: () => void;
}

function ExerciseRow({
  exercise,
  isFirst,
  isLast,
  planId,
  onReorder,
  onRemoved,
}: ExerciseRowProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const removeMutation = useMutation({
    mutationFn: () => removeExerciseFromPlan(planId, exercise.id),
    onSuccess: () => {
      toast.success("Exercício removido.");
      onRemoved();
      setConfirmOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível remover o exercício."));
    },
  });

  return (
    <>
      <div className="flex items-center gap-3 rounded-lg border bg-white p-3">
        {/* Order controls */}
        <div className="flex flex-col gap-0.5">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onReorder(exercise.id, "up")}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          >
            <ArrowUp className="size-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onReorder(exercise.id, "down")}
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:opacity-30"
          >
            <ArrowDown className="size-3.5" />
          </button>
        </div>

        {/* Exercise info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-gray-900 text-sm">{exercise.exerciseName}</span>
            <Badge variant="secondary" className="text-xs">
              {MUSCLE_GROUP_LABELS[exercise.muscleGroup as MuscleGroup] ?? exercise.muscleGroup}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            {exercise.sets} séries × {exercise.repetitions} reps
            {exercise.load ? ` — ${exercise.load}` : ""}
          </p>
          {exercise.notes ? (
            <p className="mt-0.5 text-xs text-gray-400 italic">{exercise.notes}</p>
          ) : null}
        </div>

        {/* Remove */}
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover exercício</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{exercise.exerciseName}</strong> deste plano?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
            >
              {removeMutation.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface TreinoDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TreinoDetailPage({ params }: TreinoDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: plan, isLoading } = useQuery({
    queryKey: ["workout-plan", id],
    queryFn: () => getWorkoutPlan(id),
  });

  const editForm = useForm<EditPlanValues>({
    resolver: zodResolver(editPlanSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (plan) {
      editForm.reset({ name: plan.name, description: plan.description ?? "" });
    }
  }, [plan, editForm]);

  const updateMutation = useMutation({
    mutationFn: (values: EditPlanValues) =>
      updateWorkoutPlan(id, {
        name: values.name,
        description: values.description || undefined,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(["workout-plan", id], updated);
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Plano atualizado.");
      setEditOpen(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível atualizar o plano."));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteWorkoutPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] });
      toast.success("Plano excluído.");
      router.push("/painel/treinos");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível excluir o plano."));
    },
  });

  async function handleReorder(exerciseId: string, direction: "up" | "down") {
    if (!plan) return;

    const sorted = [...plan.exercises].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((e) => e.id === exerciseId);
    if (idx === -1) return;

    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;

    const items = sorted.map((e, i) => {
      if (i === idx) return { id: e.id, order: sorted[targetIdx].order };
      if (i === targetIdx) return { id: e.id, order: sorted[idx].order };
      return { id: e.id, order: e.order };
    });

    // Optimistic update
    queryClient.setQueryData(["workout-plan", id], {
      ...plan,
      exercises: plan.exercises.map((e) => {
        const found = items.find((it) => it.id === e.id);
        return found ? { ...e, order: found.order } : e;
      }),
    });

    try {
      await reorderExercises(id, items);
    } catch {
      queryClient.invalidateQueries({ queryKey: ["workout-plan", id] });
      toast.error("Não foi possível reordenar os exercícios.");
    }
  }

  function handleExerciseMutated() {
    queryClient.invalidateQueries({ queryKey: ["workout-plan", id] });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-muted-foreground">Plano não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/painel/treinos")}>
          Voltar para treinos
        </Button>
      </div>
    );
  }

  const sortedExercises = [...plan.exercises].sort((a, b) => a.order - b.order);

  return (
    <>
      <div className="mx-auto max-w-3xl p-4 sm:p-8">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-4 gap-1.5 text-gray-500"
          onClick={() => router.push("/painel/treinos")}
        >
          <ArrowLeft className="size-4" />
          Treinos
        </Button>

        {/* Header */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-gray-900">{plan.name}</h1>
            {plan.description ? (
              <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setEditOpen(true)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Exercises */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">
              Exercícios{" "}
              <span className="ml-1 text-sm font-normal text-gray-400">
                ({sortedExercises.length})
              </span>
            </CardTitle>
            <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="size-3.5" />
              Adicionar
            </Button>
          </CardHeader>

          <Separator />

          <CardContent className="pt-4">
            {sortedExercises.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center text-gray-400">
                <p className="text-sm">Nenhum exercício neste plano.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => setAddOpen(true)}
                >
                  Adicionar exercício
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedExercises.map((ex, idx) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    isFirst={idx === 0}
                    isLast={idx === sortedExercises.length - 1}
                    planId={id}
                    onReorder={handleReorder}
                    onRemoved={handleExerciseMutated}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit plan dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => !v && setEditOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plano</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={editForm.handleSubmit((values) => updateMutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input id="edit-name" {...editForm.register("name")} />
              {editForm.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-desc">Descrição (opcional)</Label>
              <Textarea id="edit-desc" rows={3} {...editForm.register("description")} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add exercise dialog */}
      <AddExerciseDialog
        open={addOpen}
        planId={id}
        currentCount={sortedExercises.length}
        onOpenChange={setAddOpen}
        onAdded={handleExerciseMutated}
      />

      {/* Delete plan confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir plano de treino</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{plan.name}</strong>? Esta ação não pode ser
              desfeita e o plano será removido de todos os alunos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
