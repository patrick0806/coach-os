"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createCheckoutSession } from "@/services/subscriptions.service";

const PLAN_STORAGE_KEY = "coach-os:selected-plan";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const planId = searchParams.get("plan") ?? sessionStorage.getItem(PLAN_STORAGE_KEY) ?? null;

    if (!planId) {
      router.replace("/painel/assinatura");
      return;
    }

    async function redirect() {
      try {
        const { checkoutUrl } = await createCheckoutSession(planId as string);
        sessionStorage.removeItem(PLAN_STORAGE_KEY);
        window.location.href = checkoutUrl;
      } catch {
        router.replace("/painel/assinatura?erro=checkout");
      }
    }

    redirect();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Redirecionando para o pagamento seguro...</p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
