"use client";

import { type UseFormReturn } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ProfileFormValues } from "../_types";

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface PersonalDataCardProps {
  form: UseFormReturn<ProfileFormValues>;
  email: string;
}

export function PersonalDataCard({ form, email }: PersonalDataCardProps) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const bio = watch("bio");
  const phoneNumber = watch("phoneNumber");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados pessoais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" {...register("name")} />
          {errors.name ? (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" value={email} disabled readOnly />
          <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Telefone</Label>
          <Input
            id="phoneNumber"
            placeholder="(11) 99999-9999"
            value={maskPhone(phoneNumber)}
            onChange={(e) => setValue("phoneNumber", maskPhone(e.target.value))}
          />
          {errors.phoneNumber ? (
            <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Fale sobre você e sua metodologia de treino..."
            rows={4}
            {...register("bio")}
          />
          <p className="text-xs text-muted-foreground">{bio.length}/500 caracteres</p>
          {errors.bio ? (
            <p className="text-sm text-destructive">{errors.bio.message}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
