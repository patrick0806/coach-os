"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface AlunosErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AlunosError({ error, reset }: AlunosErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-8">
      <ErrorFallback
        mode="dark"
        onRetry={() => {
          reset();
          router.refresh();
        }}
      />
    </div>
  );
}
