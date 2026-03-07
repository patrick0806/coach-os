import { PainelShell } from "@/components/shared/painel-shell";

interface PainelLayoutProps {
  children: React.ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  return <PainelShell>{children}</PainelShell>;
}
