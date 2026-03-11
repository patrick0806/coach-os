import type { Metadata } from "next";
import { AdminShell } from "./_components/admin-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
