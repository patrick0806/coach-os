import { type LucideIcon } from "lucide-react";

interface InstitutionalHeroProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function InstitutionalHero({ icon: Icon, title, description }: InstitutionalHeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-32">
      <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/12 blur-[120px]" />
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm">
          <Icon className="size-6 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
