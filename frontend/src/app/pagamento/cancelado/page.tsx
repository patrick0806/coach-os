import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function PagamentoCanceladoPage() {
  return (
    <div className="dark relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6 text-foreground">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/50 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
            Coach OS
          </span>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/40 p-10 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted/30 ring-1 ring-border/60">
            <XCircle className="size-10 text-muted-foreground" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Checkout cancelado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Você cancelou o processo de assinatura. Nenhum valor foi cobrado.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/painel/assinatura">
              <Button className="w-full shadow-lg shadow-primary/20 hover:shadow-primary/30">
                Ver planos disponíveis
              </Button>
            </Link>
            <Link href="/painel">
              <Button variant="outline" className="w-full border-border/60">
                Voltar ao painel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
