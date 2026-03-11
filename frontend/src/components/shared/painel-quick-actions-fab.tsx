"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarPlus2, Plus, UserPlus2, X } from "lucide-react";

import { cn } from "@/lib/utils";

const quickActions = [
  {
    href: "/painel/alunos?action=new-student",
    label: "Novo aluno",
    icon: UserPlus2,
  },
  {
    href: "/painel/treinos?action=new-plan",
    label: "Novo treino",
    icon: Plus,
  },
  {
    href: "/painel/agenda?action=new-session",
    label: "Nova sessão",
    icon: CalendarPlus2,
  },
];

export function PainelQuickActionsFab() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 lg:right-8 lg:bottom-8">
      <div
        className={cn(
          "flex flex-col items-end gap-2 transition-all duration-200",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            onClick={() => setOpen(false)}
            className="premium-glass pointer-events-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-foreground transition-all hover:scale-[1.02]"
          >
            <action.icon className="size-4 text-primary" />
            {action.label}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="premium-highlight pointer-events-auto grid size-14 place-items-center rounded-full text-primary-foreground shadow-[var(--premium-shadow-strong)] transition-transform hover:scale-105"
        aria-label={open ? "Fechar ações rápidas" : "Abrir ações rápidas"}
      >
        {open ? <X className="size-5" /> : <Plus className="size-5" />}
      </button>
    </div>
  );
}
