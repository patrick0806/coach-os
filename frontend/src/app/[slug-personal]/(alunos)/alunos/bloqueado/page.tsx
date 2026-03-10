"use client";

import { AlertTriangle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlunoBloqueadoPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-3xl items-center p-4 sm:p-8">
      <Card className="w-full border-amber-300 bg-amber-50/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertTriangle className="size-5 text-amber-600" />
            Portal temporariamente indisponível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-amber-900/90">
            O acesso deste portal está temporariamente bloqueado devido à situação da assinatura
            do personal responsável. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
