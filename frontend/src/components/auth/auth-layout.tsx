"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  sideTitle?: string;
  sideDescription?: string;
  sideContent?: ReactNode;
  showBackButton?: boolean;
}

export function AuthLayout({
  children,
  title,
  description,
  sideTitle,
  sideDescription,
  sideContent,
  showBackButton = true,
}: AuthLayoutProps) {
  return (
    <main className="dark relative min-h-screen overflow-hidden bg-background font-sans text-foreground selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 bg-primary/10 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-[400px] w-[600px] bg-primary/5 blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Header / Logo */}
        <div className="mb-8 flex w-full max-w-md flex-col items-center gap-6 md:mb-12 md:max-w-5xl md:flex-row md:justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold tracking-tight transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Sparkles className="size-6 text-primary-foreground" />
            </div>
            <span>Coach OS</span>
          </Link>

          {showBackButton && (
            <Link
              href="/"
              className="group hidden items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:flex"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
              Voltar para home
            </Link>
          )}
        </div>

        <div className="grid w-full max-w-md items-center gap-12 md:max-w-5xl md:grid-cols-2">
          {/* Content Left (Side Info) */}
          <section className="hidden space-y-8 md:block">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl lg:leading-[1.1]">
                {sideTitle || title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {sideDescription || description}
              </p>
            </div>

            {sideContent}

            <div className="flex items-center gap-4 border-t border-border/40 pt-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-background bg-muted ring-2 ring-primary/10"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-foreground font-bold">+500 personals</span> já utilizam
              </p>
            </div>
          </section>

          {/* Form Content */}
          <div className="relative w-full">
            {/* Form Background Glow */}
            <div className="absolute -inset-4 -z-10 bg-primary/5 blur-2xl md:hidden" />
            
            <div className="mb-8 md:hidden text-center">
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
              <p className="text-muted-foreground">{description}</p>
            </div>

            <div className="rounded-3xl border border-border/50 bg-card/50 p-1 shadow-2xl backdrop-blur-xl">
               <div className="rounded-[22px] bg-card p-6 md:p-8">
                  {children}
               </div>
            </div>

            {showBackButton && (
              <div className="mt-8 text-center md:hidden">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
