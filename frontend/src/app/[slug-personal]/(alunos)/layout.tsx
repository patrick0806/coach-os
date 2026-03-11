import type { Metadata } from "next";
import { StudentShell } from "./_components/student-shell";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

interface AlunosLayoutProps {
  children: React.ReactNode;
  params: Promise<{ "slug-personal": string }>;
}

export default async function AlunosLayout({ children, params }: AlunosLayoutProps) {
  const resolvedParams = await params;
  const slug = resolvedParams["slug-personal"];

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <StudentShell slug={slug}>{children}</StudentShell>
    </div>
  );
}
