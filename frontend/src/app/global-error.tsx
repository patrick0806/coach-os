"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-background">
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center text-foreground">
          <h2 className="text-lg font-semibold">Algo deu errado</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Ocorreu um erro inesperado. Tente novamente.
          </p>
          <button
            className="mt-5 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={reset}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
