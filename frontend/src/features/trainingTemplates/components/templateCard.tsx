"use client"

import { ClipboardList, Copy, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader } from "@/shared/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import type { ProgramTemplateItem } from "@/features/trainingTemplates/types/trainingTemplates.types"

interface TemplateCardProps {
  template: ProgramTemplateItem
  onEdit: (template: ProgramTemplateItem) => void
  onDelete: (template: ProgramTemplateItem) => void
  onDuplicate: (template: ProgramTemplateItem) => void
}

export function TemplateCard({ template, onEdit, onDelete, onDuplicate }: TemplateCardProps) {
  const isArchived = template.status === "archived"

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-md" data-testid="template-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <Link
                href={`/training-templates/${template.id}`}
                className="block truncate font-medium text-sm hover:underline"
                data-testid="template-name-link"
              >
                {template.name}
              </Link>
              <Badge
                variant="secondary"
                className={
                  isArchived
                    ? "mt-0.5 text-xs bg-muted text-muted-foreground"
                    : "mt-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                }
              >
                {isArchived ? "Arquivado" : "Ativo"}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid="template-actions"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/training-templates/${template.id}`} data-testid="view-template">
                  <ClipboardList className="mr-2 size-4" />
                  Abrir editor
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(template)}
                data-testid="edit-template"
              >
                <Pencil className="mr-2 size-4" />
                Editar informações
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDuplicate(template)}
                data-testid="duplicate-template"
              >
                <Copy className="mr-2 size-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(template)}
                className="text-destructive focus:text-destructive"
                data-testid="delete-template"
              >
                <Trash2 className="mr-2 size-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      {template.description && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
        </CardContent>
      )}
    </Card>
  )
}
