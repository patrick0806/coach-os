"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useAdminPlans } from "../hooks/useAdminPlans";
import { useInviteCoach } from "../hooks/useInviteCoach";

interface InviteCoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteCoachDialog({ open, onOpenChange, onSuccess }: InviteCoachDialogProps) {
  const { data: plans } = useAdminPlans();
  const inviteCoach = useInviteCoach();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("");
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setEmail("");
    setPlanId("");
    setIsWhitelisted(false);
    setError("");
  }

  function handleClose(value: boolean) {
    if (!value) resetForm();
    onOpenChange(value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!planId) {
      setError("Selecione um plano.");
      return;
    }

    try {
      await inviteCoach.mutateAsync({ name, email, planId, isWhitelisted });
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError("Este email já está cadastrado na plataforma.");
      } else {
        setError("Erro ao enviar o convite. Tente novamente.");
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            Convidar Personal
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Nome</Label>
            <Input
              id="invite-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do personal trainer"
              required
              minLength={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-plan">Plano</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger id="invite-plan">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <Checkbox
              id="invite-whitelist"
              checked={isWhitelisted}
              onCheckedChange={(checked) => setIsWhitelisted(checked === true)}
            />
            <div className="space-y-0.5">
              <Label htmlFor="invite-whitelist" className="cursor-pointer font-medium">
                Acesso completo sem assinatura
              </Label>
              <p className="text-xs text-muted-foreground">
                O personal terá acesso ilimitado à plataforma sem necessidade de pagamento.
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={inviteCoach.isPending}>
              {inviteCoach.isPending ? "Enviando..." : "Enviar convite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
