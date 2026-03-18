"use client"

import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { useEnumMuscleGroups } from "@/features/shared/hooks/useEnumMuscleGroups"

const DEBOUNCE_MS = 400

interface ExerciseFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  muscleGroup: string | undefined
  onMuscleGroupChange: (value: string | undefined) => void
}

export function ExerciseFilters({
  search,
  onSearchChange,
  muscleGroup,
  onMuscleGroupChange,
}: ExerciseFiltersProps) {
  const { data: muscleGroups } = useEnumMuscleGroups()
  const [inputValue, setInputValue] = useState(search)

  const onSearchChangeRef = useRef(onSearchChange)
  onSearchChangeRef.current = onSearchChange

  useEffect(() => {
    if (inputValue === search) return
    const timer = setTimeout(() => {
      onSearchChangeRef.current(inputValue)
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [inputValue, search])

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={muscleGroup ?? "all"}
        onValueChange={(val) => onMuscleGroupChange(val === "all" ? undefined : val)}
      >
        <SelectTrigger className="sm:w-48" data-testid="muscle-group-filter">
          <SelectValue placeholder="Grupo muscular" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os grupos</SelectItem>
          {muscleGroups?.map((g) => (
            <SelectItem key={g.value} value={g.value}>
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
