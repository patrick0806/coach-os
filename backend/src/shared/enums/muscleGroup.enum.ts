export enum MuscleGroup {
  PEITORAL = "peitoral",
  COSTAS = "costas",
  OMBROS = "ombros",
  BICEPS = "bíceps",
  TRICEPS = "tríceps",
  PERNAS = "pernas",
  GLUTEOS = "glúteos",
  ABDOMEN = "abdômen",
  PANTURRILHA = "panturrilha",
  ANTEBRACO = "antebraço",
  TRAPEZIO = "trapézio",
  FUNCIONAL = "funcional",
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.PEITORAL]: "Peitoral",
  [MuscleGroup.COSTAS]: "Costas",
  [MuscleGroup.OMBROS]: "Ombros",
  [MuscleGroup.BICEPS]: "Bíceps",
  [MuscleGroup.TRICEPS]: "Tríceps",
  [MuscleGroup.PERNAS]: "Pernas",
  [MuscleGroup.GLUTEOS]: "Glúteos",
  [MuscleGroup.ABDOMEN]: "Abdômen",
  [MuscleGroup.PANTURRILHA]: "Panturrilha",
  [MuscleGroup.ANTEBRACO]: "Antebraço",
  [MuscleGroup.TRAPEZIO]: "Trapézio",
  [MuscleGroup.FUNCIONAL]: "Funcional",
};
