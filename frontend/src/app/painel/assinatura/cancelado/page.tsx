import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AssinaturaCanceladoPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-sm">
        <CardContent className="px-10 pb-10 pt-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 ring-1 ring-border">
            <XCircle className="size-8 text-muted-foreground" />
          </div>

          <h1 className="text-xl font-bold tracking-tight">Checkout cancelado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
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
        </CardContent>
      </Card>
    </div>
  );
}
