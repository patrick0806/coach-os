"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { PainelSidebar } from "@/components/shared/painel-sidebar";

interface PainelShellProps {
  children: React.ReactNode;
}

export function PainelShell({ children }: PainelShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar — only on desktop */}
      <div className="hidden lg:flex lg:h-screen lg:shrink-0">
        <PainelSidebar />
      </div>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div className="relative z-50 flex h-full w-64 flex-col shadow-xl">
            <PainelSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top header */}
        <header className="flex h-14 shrink-0 items-center border-b bg-white px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="ml-3 text-base font-bold tracking-tight text-gray-900">Coach OS</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
