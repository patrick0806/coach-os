interface AlunosLayoutProps {
  children: React.ReactNode;
}

export default function AlunosLayout({ children }: AlunosLayoutProps) {
  return <div className="dark min-h-screen bg-background text-foreground">{children}</div>;
}
