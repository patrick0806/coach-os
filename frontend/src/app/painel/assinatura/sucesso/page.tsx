import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AssinaturaSucessoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="w-full max-w-md rounded-2xl border bg-card p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto mb-4 size-14 text-green-500" />
        <h1 className="text-2xl font-bold tracking-tight">Assinatura confirmada!</h1>
        <p className="mt-3 text-muted-foreground">
          Seu pagamento foi processado com sucesso. Bem-vindo ao Coach OS!
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/painel">
            <Button className="w-full">Ir para o painel</Button>
          </Link>
          <Link href="/painel/assinatura">
            <Button variant="outline" className="w-full">
              Ver minha assinatura
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
