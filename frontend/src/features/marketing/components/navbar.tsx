"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/shared/ui/sheet";

export function Navbar() {
  return (
    <header
      data-slot="navbar"
      className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <Image src="/logo_transparent.png" alt="Coach OS" width={28} height={28} />
          Coach<span className="text-primary">OS</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link
            href="#funcionalidades"
            className="transition-colors hover:text-foreground"
          >
            Funcionalidades
          </Link>
          <Link
            href="#como-funciona"
            className="transition-colors hover:text-foreground"
          >
            Como funciona
          </Link>
          <Link
            href="#planos"
            className="transition-colors hover:text-foreground"
          >
            Planos
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:block"
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Começar grátis
          </Link>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-card/40 md:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex h-full flex-col px-6 py-8">
                <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold tracking-tight">
                  <Image src="/logo_transparent.png" alt="Coach OS" width={28} height={28} />
                  Coach<span className="text-primary">OS</span>
                </Link>

                <nav className="flex flex-col gap-1">
                  <Link
                    href="#funcionalidades"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Funcionalidades
                  </Link>
                  <Link
                    href="#como-funciona"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Como funciona
                  </Link>
                  <Link
                    href="#planos"
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Planos
                  </Link>
                </nav>

                <div className="mt-auto flex flex-col gap-2 border-t border-border/60 pt-6">
                  <Link
                    href="/login"
                    className="rounded-lg border border-border px-4 py-2.5 text-center text-sm font-medium transition-colors hover:bg-accent"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/cadastro"
                    className="rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Começar grátis
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
