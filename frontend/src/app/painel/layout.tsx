import { PainelSidebar } from "@/components/shared/painel-sidebar";

interface PainelLayoutProps {
  children: React.ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <PainelSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
