"use client";

import { useState } from "react";
import { Mail, Clock, CheckCircle2, MessageSquare } from "lucide-react";

import { Navbar } from "@/features/marketing/components/navbar";
import { Footer } from "@/features/marketing/components/footer";
import { InstitutionalHero } from "@/features/marketing/components/institutionalHero";

type FormState = "idle" | "submitting" | "success";

export default function ContatoPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState<FormState>("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");

    const body = encodeURIComponent(
      `Nome: ${form.name}\nEmail: ${form.email}\n\n${form.message}`,
    );
    const subject = encodeURIComponent(form.subject || "Contato via Coach OS");

    // Open mail client as fallback — replace with API call when backend route exists
    window.location.href = `mailto:suporte@coachos.com.br?subject=${subject}&body=${body}`;

    setTimeout(() => setState("success"), 800);
  }

  const isValid = form.name.trim() && form.email.trim() && form.message.trim();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <InstitutionalHero
        icon={Mail}
        title="Fale com a gente"
        description="Tem dúvidas, sugestões ou precisa de ajuda? A equipe do Coach OS responde em até 24 horas úteis."
      />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <div className="rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur-sm">
            {state === "success" ? (
              <div className="flex flex-col items-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
                  <CheckCircle2 className="size-8 text-success" />
                </div>
                <h2 className="text-xl font-bold">Mensagem enviada!</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Recebemos seu contato e responderemos em até 24 horas úteis no
                  e-mail <span className="font-medium text-foreground">{form.email}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium">
                      Nome <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium">
                      E-mail <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="seu@email.com"
                      className="w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-sm font-medium">
                    Assunto
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione um assunto</option>
                    <option value="Dúvida sobre planos">Dúvida sobre planos</option>
                    <option value="Suporte técnico">Suporte técnico</option>
                    <option value="Sugestão de melhoria">Sugestão de melhoria</option>
                    <option value="Cancelamento">Cancelamento</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium">
                    Mensagem <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Como podemos ajudar?"
                    className="w-full resize-none rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isValid || state === "submitting"}
                  className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30 disabled:pointer-events-none disabled:opacity-50"
                >
                  {state === "submitting" ? "Enviando..." : "Enviar mensagem"}
                </button>
              </form>
            )}
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background">
                <Mail className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold">E-mail</h3>
              <p className="mt-1 text-sm text-muted-foreground">suporte@coachos.com.br</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background">
                <Clock className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold">Tempo de resposta</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Respondemos em até <span className="font-medium text-foreground">24 horas úteis</span>.
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background">
                <MessageSquare className="size-4 text-primary" />
              </div>
              <h3 className="font-semibold">FAQ</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Confira as{" "}
                <a href="/faq" className="font-medium text-primary hover:underline">
                  perguntas frequentes
                </a>{" "}
                — talvez sua dúvida já esteja respondida.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
