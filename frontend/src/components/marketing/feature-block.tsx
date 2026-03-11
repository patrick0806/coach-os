import { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface FeatureBlockProps {
  title: string;
  description: string;
  icon: LucideIcon;
  imageAlt: string;
  imageSrc?: string; // Placeholder por enquanto
  reverse?: boolean;
  features?: string[];
}

export function FeatureBlock({
  title,
  description,
  icon: Icon,
  imageAlt,
  reverse = false,
  features,
}: FeatureBlockProps) {
  return (
    <div className="py-20 md:py-28 overflow-hidden">
      <div
        className={cn(
          "mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 md:flex-row lg:gap-20",
          reverse && "md:flex-row-reverse"
        )}
      >
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
            <Icon className="size-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>

          {features && (
            <ul className="space-y-4 pt-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground/90 font-medium">
                  <div className="size-1.5 rounded-full bg-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Image / Mockup Placeholder */}
        <div className="relative flex-1">
          <div className="relative aspect-[4/3] w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-muted/40 p-4 shadow-2xl">
            <div className="h-full w-full rounded-xl bg-gradient-to-br from-primary/10 via-background to-muted/80 flex items-center justify-center border border-border/40">
              <span className="text-sm font-medium text-muted-foreground italic">
                [Mockup de {imageAlt}]
              </span>
            </div>
            {/* Visual Decorative Blobs */}
            <div className="absolute -right-10 -top-10 -z-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 -z-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
