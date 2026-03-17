import Link from "next/link";

export function Navbar() {
  return (
    <header
      data-slot="navbar"
      className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Coach<span className="text-primary">OS</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="#funcionalidades" className="transition-colors hover:text-foreground">
            Funcionalidades
          </Link>
          <Link href="#planos" className="transition-colors hover:text-foreground">
            Planos
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Começar grátis
          </Link>
        </div>
      </nav>
    </header>
  );
}
