import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AssinaturaCanceladoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-10 text-center shadow-sm">
        <XCircle className="mx-auto mb-4 size-14 text-muted-foreground" />
        <h1 className="text-2xl font-bold tracking-tight">Checkout cancelado</h1>
        <p className="mt-3 text-muted-foreground">
          Você cancelou o processo de assinatura. Nenhum valor foi cobrado.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/painel/assinatura">
            <Button className="w-full">Ver planos disponíveis</Button>
          </Link>
          <Link href="/painel">
            <Button variant="outline" className="w-full">
              Voltar ao painel
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
