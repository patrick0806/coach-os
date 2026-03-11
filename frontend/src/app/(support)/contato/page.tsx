"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, LifeBuoy, Mail, MessageSquareText, Rocket } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { contactSupport } from "@/services/support.service";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome"),
  email: z.email("Informe um e-mail válido"),
  subject: z.string().trim().min(3, "Informe o assunto"),
  message: z.string().trim().min(10, "Descreva melhor sua mensagem"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: contactSupport,
    onSuccess: (data) => {
      toast.success(data.message);
      form.reset();
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Não foi possível enviar sua mensagem."));
    },
  });

  function onSubmit(values: ContactFormValues) {
    mutation.mutate(values);
  }

  return (
    <div className="pb-20">
      <section className="relative overflow-hidden px-6 py-20 md:py-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
        <div className="absolute right-0 top-12 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-[130px]" />

        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-4 py-1.5 text-xs uppercase tracking-[0.24em] text-muted-foreground backdrop-blur">
              <Mail className="size-3.5 text-primary" />
              Suporte e atendimento
            </p>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
              Um canal direto para dúvidas técnicas, comerciais e onboarding
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Mantivemos o contato simples: você envia a mensagem, nosso time recebe no canal
              interno e responde com o contexto necessário para avançar.
            </p>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              {[
                {
                  icon: LifeBuoy,
                  title: "Suporte técnico",
                  description: "Dúvidas sobre uso da plataforma, fluxo operacional ou comportamento da interface.",
                },
                {
                  icon: Rocket,
                  title: "Pré-venda e implantação",
                  description: "Entenda aderência ao seu modelo de atendimento antes de decidir.",
                },
                {
                  icon: MessageSquareText,
                  title: "Resposta objetiva",
                  description: "O formulário foi pensado para reduzir troca dispersa e concentrar o contexto em um único envio.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm"
                >
                  <item.icon className="size-6 text-primary" />
                  <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}

              <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card/80 to-primary/10 p-6">
                <p className="text-sm font-medium text-primary">Antes de abrir contato</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Veja também o FAQ</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Se a sua dúvida for mais direta, a central de perguntas frequentes pode acelerar a resposta.
                </p>
                <Link
                  href="/faq"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  Abrir FAQ
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            <Card className="rounded-3xl border border-border/70 bg-card/75 shadow-2xl shadow-black/20 backdrop-blur">
              <CardHeader className="px-6 pt-6">
                <CardTitle className="text-2xl font-bold">Envie sua mensagem</CardTitle>
                <CardDescription>
                  Preencha os campos abaixo e nossa equipe receberá o contato no canal interno.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form className="space-y-5" noValidate onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Nome</Label>
                    <Input id="contact-name" placeholder="João Silva" {...form.register("name")} />
                    {form.formState.errors.name ? (
                      <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">E-mail</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="joao@exemplo.com"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email ? (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Assunto</Label>
                    <Input
                      id="contact-subject"
                      placeholder="Ex: Quero entender como funciona a agenda"
                      {...form.register("subject")}
                    />
                    {form.formState.errors.subject ? (
                      <p className="text-sm text-destructive">{form.formState.errors.subject.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Mensagem</Label>
                    <Textarea
                      id="contact-message"
                      rows={7}
                      placeholder="Descreva sua dúvida, contexto e o que você precisa resolver."
                      {...form.register("message")}
                    />
                    {form.formState.errors.message ? (
                      <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
                    ) : null}
                  </div>

                  <Button className="w-full" disabled={mutation.isPending} type="submit">
                    {mutation.isPending ? "Enviando..." : "Enviar mensagem"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
