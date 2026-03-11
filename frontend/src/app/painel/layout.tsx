import type { Metadata } from "next";
import { PainelShell } from "@/components/shared/painel-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface PainelLayoutProps {
  children: React.ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  return <PainelShell>{children}</PainelShell>;
}
