"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { syncCheckout } from "@/services/subscriptions.service";

function PagamentoSucessoContent() {
  const searchParams = useSearchParams();
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;

    const sessionId = searchParams.get("session_id");
    if (!sessionId) return;

    // Best-effort sync — webhook will catch up if this call fails
    syncCheckout(sessionId).catch(() => undefined);
  }, [searchParams]);

  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      {/* Background glows */}
      <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
      <div className="absolute -right-20 bottom-1/4 -z-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            Coach OS
          </span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
            <CheckCircle2 className="size-10 text-emerald-400" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Assinatura confirmada!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Seu pagamento foi processado com sucesso. Bem-vindo ao Coach OS!
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/painel">
              <Button className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Ir para o painel
              </Button>
            </Link>
            <Link href="/painel/assinatura">
              <Button variant="outline" className="w-full border-border/60">
                Ver minha assinatura
              </Button>
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Verifique seu e-mail para os detalhes da assinatura.
        </p>
      </div>
    </div>
  );
}

export default function PagamentoSucessoPage() {
  return (
    <Suspense>
      <PagamentoSucessoContent />
    </Suspense>
  );
}
