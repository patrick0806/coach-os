"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { ErrorFallback } from "@/components/shared/error-fallback";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 sm:p-8">
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
