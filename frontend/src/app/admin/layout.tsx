interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <div className="dark min-h-screen bg-background text-foreground">{children}</div>;
}
