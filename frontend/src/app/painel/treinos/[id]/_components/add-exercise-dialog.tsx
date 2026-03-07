"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  type Exercise,
  createExercise,
  listExercises,
  MUSCLE_GROUP_COLORS,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
  type MuscleGroup,
} from "@/services/exercises.service";
import { addExerciseToPlan } from "@/services/workout-plans.service";

// ─── Add exercise to plan form ────────────────────────────────────────────────

const addExerciseSchema = z.object({
  sets: z.coerce.number().int().min(1, "Mínimo 1 série"),
  repetitions: z.coerce.number().int().min(1, "Mínimo 1 repetição"),
  load: z.string().optional(),
  notes: z.string().optional(),
});

type AddExerciseValues = z.infer<typeof addExerciseSchema>;

// ─── Create custom exercise form ──────────────────────────────────────────────

const createExerciseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  muscleGroup: z.enum(["peito", "costas", "ombro", "biceps", "triceps", "perna", "gluteo", "core"], {
    message: "Grupo muscular é obrigatório",
  }),
  description: z.string().optional(),
});

type CreateExerciseValues = z.infer<typeof createExerciseSchema>;

// ─── Component ────────────────────────────────────────────────────────────────

type View = "search" | "create" | "configure";

interface AddExerciseDialogProps {
  open: boolean;
  planId: string;
  currentCount: number;
  onOpenChange: (open: boolean) => void;
  onAdded: () => void;
}

export function AddExerciseDialog({
  open,
  planId,
  currentCount,
  onOpenChange,
  onAdded,
}: AddExerciseDialogProps) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<View>("search");
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
    enabled: open && view === "search",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addForm = useForm<AddExerciseValues, any, AddExerciseValues>({
    resolver: zodResolver(addExerciseSchema) as any,
    defaultValues: { sets: 3, repetitions: 12, load: "", notes: "" },
  });

  const createForm = useForm<CreateExerciseValues>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: { name: search, muscleGroup: undefined, description: "" },
  });

  const addMutation = useMutation({
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

  const createMutation = useMutation({
    mutationFn: (values: CreateExerciseValues) =>
      createExercise({
        name: values.name,
        muscleGroup: values.muscleGroup as MuscleGroup,
        description: values.description || undefined,
      }),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
      toast.success("Exercício criado.");
      setSelected(created);
      setView("configure");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível criar o exercício."));
    },
  });

  function handleSelectExercise(exercise: Exercise) {
    setSelected(exercise);
    setView("configure");
  }

  function handleOpenCreateForm() {
    createForm.reset({ name: search, muscleGroup: undefined, description: "" });
    setView("create");
  }

  function handleClose() {
    setSearch("");
    setMuscleFilter("all");
    setSelected(null);
    setView("search");
    addForm.reset({ sets: 3, repetitions: 12, load: "", notes: "" });
    createForm.reset({ name: "", muscleGroup: undefined, description: "" });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {view === "create" ? "Criar exercício customizado" : "Adicionar exercício"}
          </DialogTitle>
        </DialogHeader>

        {/* ── Configure (set sets/reps after selecting exercise) ── */}
        {view === "configure" && selected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{selected.name}</p>
                <span
                  className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    MUSCLE_GROUP_COLORS[selected.muscleGroup] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {MUSCLE_GROUP_LABELS[selected.muscleGroup]}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelected(null);
                  setView("search");
                }}
                className="size-8 p-0 text-gray-400"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={addForm.handleSubmit((values) => addMutation.mutate(values))}
              className="space-y-4"
              noValidate
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ex-sets">Séries</Label>
                  <Input id="ex-sets" type="number" min={1} {...addForm.register("sets")} />
                  {addForm.formState.errors.sets ? (
                    <p className="text-sm text-destructive">
                      {addForm.formState.errors.sets.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ex-reps">Repetições</Label>
                  <Input
                    id="ex-reps"
                    type="number"
                    min={1}
                    {...addForm.register("repetitions")}
                  />
                  {addForm.formState.errors.repetitions ? (
                    <p className="text-sm text-destructive">
                      {addForm.formState.errors.repetitions.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ex-load">Carga (opcional)</Label>
                <Input
                  id="ex-load"
                  placeholder="ex: 20kg, peso corporal"
                  {...addForm.register("load")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ex-notes">Observações (opcional)</Label>
                <Textarea
                  id="ex-notes"
                  placeholder="ex: Manter escápulas retraídas"
                  rows={2}
                  {...addForm.register("notes")}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        ) : null}

        {/* ── Create custom exercise form ── */}
        {view === "create" ? (
          <form
            onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="ce-name">Nome do exercício</Label>
              <Input
                id="ce-name"
                placeholder="ex: Rosca concentrada"
                {...createForm.register("name")}
              />
              {createForm.formState.errors.name ? (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ce-muscle">Grupo muscular</Label>
              <Select
                onValueChange={(val) =>
                  createForm.setValue("muscleGroup", val as MuscleGroup, { shouldValidate: true })
                }
                value={createForm.watch("muscleGroup")}
              >
                <SelectTrigger id="ce-muscle">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {MUSCLE_GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {MUSCLE_GROUP_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createForm.formState.errors.muscleGroup ? (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.muscleGroup.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ce-desc">Descrição (opcional)</Label>
              <Textarea
                id="ce-desc"
                placeholder="Descreva a execução do exercício..."
                rows={2}
                {...createForm.register("description")}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                className="gap-1.5"
                onClick={() => setView("search")}
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Criando..." : "Criar e selecionar"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {/* ── Search / browse exercises ── */}
        {view === "search" ? (
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
                <div className="flex flex-col items-center py-8 text-center text-sm text-gray-400">
                  <p>Nenhum exercício encontrado.</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1.5"
                    onClick={handleOpenCreateForm}
                  >
                    <Plus className="size-3.5" />
                    Criar exercício customizado
                  </Button>
                </div>
              ) : (
                <ul className="divide-y">
                  {exercises.map((ex) => (
                    <li key={ex.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectExercise(ex)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                          <span
                            className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                              MUSCLE_GROUP_COLORS[ex.muscleGroup] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {MUSCLE_GROUP_LABELS[ex.muscleGroup]}
                          </span>
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

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-500"
                onClick={handleOpenCreateForm}
              >
                <Plus className="size-3.5" />
                Criar exercício customizado
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
