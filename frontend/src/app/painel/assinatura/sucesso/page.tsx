import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AssinaturaSucessoPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="px-10 pb-10 pt-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
            <CheckCircle2 className="size-8 text-emerald-500" />
          </div>

          <h1 className="text-xl font-bold tracking-tight">Assinatura confirmada!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  );
}
