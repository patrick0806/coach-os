"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { PlanSelector } from "@/features/auth/components/planSelector";
import { RegisterForm } from "@/features/auth/components/registerForm";
import { scaleIn } from "@/lib/animations";
import type { Plan } from "@/features/marketing/services/plans.service";

interface RegisterStepperProps {
  plans: Plan[];
  preselectedPlanId?: string | null;
}

type Step = "plan" | "form";

export function RegisterStepper({
  plans,
  preselectedPlanId,
}: RegisterStepperProps) {
  const [step, setStep] = useState<Step>(
    preselectedPlanId ? "form" : "plan"
  );
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    preselectedPlanId ? (plans.find((p) => p.id === preselectedPlanId) ?? null) : null
  );

  function handleSelect(planId: string) {
    setSelectedPlan(plans.find((p) => p.id === planId) ?? null);
  }

  return (
    <AnimatePresence mode="wait">
      {step === "plan" ? (
        <motion.div
          key="plan"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <PlanSelector
            plans={plans}
            selectedPlanId={selectedPlan?.id ?? null}
            onSelect={handleSelect}
            onContinue={() => setStep("form")}
          />
        </motion.div>
      ) : (
        <motion.div
          key="form"
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <RegisterForm
            planId={selectedPlan?.id ?? null}
            selectedPlan={selectedPlan ?? undefined}
            onBack={() => setStep("plan")}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
