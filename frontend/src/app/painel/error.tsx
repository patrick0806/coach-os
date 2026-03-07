"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface PainelErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PainelError({ error, reset }: PainelErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 sm:p-8">
      <ErrorFallback
        mode="light"
        onRetry={() => {
          reset();
          router.refresh();
        }}
      />
    </div>
  );
}
