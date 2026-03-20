import Image from "next/image";
import { Users, Dumbbell, Calendar, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestão de alunos",
    description: "Organize toda a sua base de alunos em um só lugar.",
  },
  {
    icon: Dumbbell,
    title: "Programas personalizados",
    description: "Crie e aplique treinos individualizados com facilidade.",
  },
  {
    icon: Calendar,
    title: "Agenda integrada",
    description: "Controle sua disponibilidade e agende sessões sem conflitos.",
  },
  {
    icon: TrendingUp,
    title: "Acompanhamento de evolução",
    description: "Registre medidas, fotos e progresso dos seus alunos.",
  },
];

export function AuthBrandingPanel() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-background p-10 backdrop-blur-sm">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo & headline */}
      <div className="relative">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/logo_transparent.png" alt="Coach OS" width={40} height={40} />
          <span className="text-xl font-bold tracking-tight">Coach OS</span>
        </div>

        <h2 className="mb-3 text-3xl font-extrabold leading-tight tracking-tight">
          Eleve seu negócio de <br />
          <span className="text-primary">personal trainer</span>
        </h2>
        <p className="text-base text-muted-foreground">
          A plataforma completa para coaches que levam o seu trabalho a sério.
        </p>
      </div>

      {/* Feature list */}
      <ul className="relative flex flex-col gap-5">
        {features.map(({ icon: Icon, title, description }) => (
          <li key={title} className="flex items-start gap-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Testimonial */}
      <blockquote className="relative rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
        <p className="text-sm leading-relaxed text-muted-foreground">
          &ldquo;O Coach OS transformou a forma como gerencio meus alunos.
          Economizo horas por semana e meus clientes adoram o acompanhamento
          profissional.&rdquo;
        </p>
        <footer className="mt-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20" />
          <div>
            <p className="text-xs font-semibold">Mariana Costa</p>
            <p className="text-xs text-muted-foreground">
              Personal Trainer · 47 alunos ativos
            </p>
          </div>
        </footer>
      </blockquote>
    </div>
  );
}
