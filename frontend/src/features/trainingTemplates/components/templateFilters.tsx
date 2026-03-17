"use client"

import { useEffect, useRef, useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import type { ProgramTemplateStatus } from "@/features/trainingTemplates/types/trainingTemplates.types"

const DEBOUNCE_MS = 400

interface TemplateFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: ProgramTemplateStatus | undefined
  onStatusChange: (value: ProgramTemplateStatus | undefined) => void
}

export function TemplateFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: TemplateFiltersProps) {
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
          data-testid="template-search"
        />
      </div>
      <Select
        value={status ?? "all"}
        onValueChange={(val) =>
          onStatusChange(val === "all" ? undefined : (val as ProgramTemplateStatus))
        }
      >
        <SelectTrigger className="sm:w-48" data-testid="template-status-filter">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="archived">Arquivado</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
