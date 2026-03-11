import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/80 bg-background px-6 py-12 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="size-5 text-primary-foreground" />
              </div>
              <span>Coach OS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              O sistema profissional definitivo para personal trainers que desejam
              escalar seu atendimento com tecnologia e eficiência.
            </p>
          </div>

          {/* Links Col 1 - Produto */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Produto
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/funcionalidades"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Funcionalidades
                </Link>
              </li>
              <li>
                <Link
                  href="/#planos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 - Empresa */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Atendimento
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Empresa
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 3 - Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">
              Legal
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Coach OS. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Desenvolvido para profissionais de Educação Física.
          </p>
        </div>
      </div>
    </footer>
  );
}
