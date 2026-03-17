import Link from "next/link";

export function Footer() {
  return (
    <footer data-slot="footer" className="border-t border-border/40 px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
        <p>
          &copy; {new Date().getFullYear()} Coach OS. Todos os direitos
          reservados.
        </p>
        <div className="flex gap-6">
          <Link href="/termos" className="transition-colors hover:text-foreground">
            Termos
          </Link>
          <Link href="/privacidade" className="transition-colors hover:text-foreground">
            Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
}
