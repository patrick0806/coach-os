"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  onRetry: () => void;
  mode?: "light" | "dark";
}

export function ErrorFallback({ onRetry, mode = "light" }: ErrorFallbackProps) {
  const isDark = mode === "dark";

  return (
    <div
      className={`rounded-xl border px-4 py-10 text-center sm:px-6 ${isDark
          ? "border-border bg-card text-foreground"
          : "border-gray-200 bg-white text-gray-900"
        }`}
    >
      <AlertTriangle
        className={`mx-auto mb-3 size-7 ${isDark ? "text-amber-400" : "text-amber-500"}`}
      />
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p
        className={`mx-auto mt-1 max-w-md text-sm ${isDark ? "text-muted-foreground" : "text-gray-600"
          }`}
      >
        Ocorreu um erro inesperado ao carregar esta página. Tente novamente.
      </p>
      <Button className="mt-5" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
