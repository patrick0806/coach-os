import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="prose prose-invert prose-primary max-w-none prose-h1:text-4xl prose-h1:font-extrabold prose-h2:text-2xl prose-h2:font-bold prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
