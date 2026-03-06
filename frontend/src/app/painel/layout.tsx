interface PainelLayoutProps {
  children: React.ReactNode;
}

export default function PainelLayout({ children }: PainelLayoutProps) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>;
}
