import Link from "next/link";

export function Footer() {
  return (
    <footer data-slot="footer" className="border-t border-border/40 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
              Coach<span className="text-primary">OS</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              Plataforma para personal trainers online e presencial.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-12 gap-y-6 text-sm">
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Produto</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/#funcionalidades" className="transition-colors hover:text-foreground">Funcionalidades</Link>
                <Link href="/#planos" className="transition-colors hover:text-foreground">Planos</Link>
                <Link href="/faq" className="transition-colors hover:text-foreground">FAQ</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Empresa</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/sobre" className="transition-colors hover:text-foreground">Sobre</Link>
                <Link href="/contato" className="transition-colors hover:text-foreground">Contato</Link>
              </nav>
            </div>
            <div className="space-y-3">
              <p className="font-semibold text-foreground">Legal</p>
              <nav className="flex flex-col gap-2 text-muted-foreground">
                <Link href="/termos" className="transition-colors hover:text-foreground">Termos de Uso</Link>
                <Link href="/privacidade" className="transition-colors hover:text-foreground">Privacidade</Link>
              </nav>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 pt-6 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Coach OS. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
