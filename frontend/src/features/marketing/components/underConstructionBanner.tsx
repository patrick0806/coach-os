"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

import { isRegistrationOpen } from "@/lib/featureFlags";

const STORAGE_KEY = "coachos_banner_dismissed";

export function UnderConstructionBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  if (isRegistrationOpen || dismissed) return null;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  }

  return (
    <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/10 px-4 py-2 text-center text-sm text-foreground">
      <span>
        Seja notificado quando o cadastro estiver disponível!{" "}
        <Link
          href="/#lista-de-espera"
          className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
        >
          Inscreva-se na lista de espera
        </Link>
      </span>
      <button
        onClick={handleDismiss}
        className="ml-2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label="Fechar banner"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
