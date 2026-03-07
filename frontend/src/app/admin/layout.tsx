import { AdminShell } from "./_components/admin-shell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
