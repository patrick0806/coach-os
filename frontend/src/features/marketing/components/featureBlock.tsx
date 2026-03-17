import type { LucideIcon } from "lucide-react";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface FeatureBlockProps {
  title: string;
  description: string;
  icon: LucideIcon;
  imageAlt: string;
  features: string[];
  reverse?: boolean;
}

export function FeatureBlock({
  title,
  description,
  icon: Icon,
  features,
  reverse,
}: FeatureBlockProps) {
  return (
    <div
      data-slot="feature-block"
      className={cn(
        "mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-2",
        reverse && "lg:[&>:first-child]:order-2"
      )}
    >
      <div className="space-y-6">
        <div className="inline-flex rounded-xl bg-primary/10 p-3">
          <Icon className="size-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-lg text-muted-foreground">{description}</p>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-sm">
              <Check className="size-4 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex aspect-video items-center justify-center rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">Preview</p>
      </div>
    </div>
  );
}
