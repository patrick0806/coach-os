"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

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
  listExercises,
  MUSCLE_GROUP_LABELS,
  MUSCLE_GROUPS,
} from "@/services/exercises.service";
import { addExerciseToPlan } from "@/services/workout-plans.service";

const addExerciseSchema = z.object({
  sets: z.coerce.number().int().min(1, "Mínimo 1 série"),
  repetitions: z.coerce.number().int().min(1, "Mínimo 1 repetição"),
  load: z.string().optional(),
  notes: z.string().optional(),
});

type AddExerciseValues = z.infer<typeof addExerciseSchema>;

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
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border bg-gray-50 px-4 py-3">
              <div>
                <p className="font-medium text-gray-900">{selected.name}</p>
                <p className="text-sm text-gray-500">{MUSCLE_GROUP_LABELS[selected.muscleGroup]}</p>
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
                    <p className="text-sm text-destructive">{form.formState.errors.sets.message}</p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ex-reps">Repetições</Label>
                  <Input id="ex-reps" type="number" min={1} {...form.register("repetitions")} />
                  {form.formState.errors.repetitions ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.repetitions.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ex-load">Carga (opcional)</Label>
                <Input
                  id="ex-load"
                  placeholder="ex: 20kg, peso corporal"
                  {...form.register("load")}
                />
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
