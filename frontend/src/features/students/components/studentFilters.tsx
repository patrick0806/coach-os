"use client"

import { Search } from "lucide-react"

import { Input } from "@/shared/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import type { StudentStatus } from "@/features/students/types/students.types"

interface StudentFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  status: StudentStatus | undefined
  onStatusChange: (value: StudentStatus | undefined) => void
}

const statusTabs: { label: string; value: StudentStatus | "all" }[] = [
  { label: "Todos", value: "all" },
  { label: "Ativos", value: "active" },
  { label: "Pausados", value: "paused" },
  { label: "Arquivados", value: "archived" },
]

export function StudentFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: StudentFiltersProps) {
  const currentTab = status ?? "all"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Tabs
        value={currentTab}
        onValueChange={(val) =>
          onStatusChange(val === "all" ? undefined : (val as StudentStatus))
        }
      >
        <TabsList variant="line">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}
