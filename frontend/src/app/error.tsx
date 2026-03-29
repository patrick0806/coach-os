"use client";

import { useEffect } from "react";

import { ErrorFallback } from "@/shared/components/errorFallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return <ErrorFallback onRetry={reset} />;
}
