"use client";

import Link from "next/link";
import { AlertTriangle, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PainelBloqueadoPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl items-center p-4 sm:p-8">
      <Card className="w-full border-amber-300 bg-amber-50/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="size-5 text-amber-600" />
            Acesso temporariamente bloqueado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed text-amber-900/90">
            Seu acesso foi bloqueado por expiração de trial, inadimplência ou assinatura
            inativa. Regularize sua assinatura para voltar a usar o painel completo.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/painel/assinatura">
                <CreditCard className="mr-1.5 size-4" />
                Ir para Assinatura
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
