import Link from "next/link"
import { LogIn, KeyRound } from "lucide-react"

interface PublicStudentAreaProps {
  slug: string
}

export function PublicStudentArea({ slug }: PublicStudentAreaProps) {
  return (
    <section className="bg-muted/40 px-4 py-16">
      <div className="mx-auto max-w-md text-center space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Área do Aluno</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Acesse seus treinos, acompanhe seu progresso e veja sua agenda.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href={`/personais/${slug}/login`}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
          >
            <LogIn className="size-4" />
            Entrar na área do aluno
          </Link>

          <Link
            href={`/personais/${slug}/esqueci-senha`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            <KeyRound className="inline size-3.5 mr-1" />
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </section>
  )
}
