import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthBrandingPanel } from "@/features/auth/components/authBrandingPanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Branding panel — hidden on mobile */}
      <div className="hidden lg:block">
        <AuthBrandingPanel />
      </div>

      {/* Form area */}
      <div className="flex min-h-screen flex-col px-6 py-12 lg:px-12">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Início
        </Link>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
