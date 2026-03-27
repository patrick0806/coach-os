import { publicServerFetch } from "@/lib/serverFetch"
import { PublicPageBranded } from "@/features/publicPage/components/publicPageBranded"
import { ForgotPasswordForm } from "@/features/auth/components/forgotPasswordForm"

interface CoachPublicProfile {
  coachName: string
  profilePhoto: string | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function EsqueciSenhaPage({ params }: PageProps) {
  const { slug } = await params
  const coach = await publicServerFetch<CoachPublicProfile>(`/v1/public/${slug}`)

  if (!coach) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Treinador não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            O link que você acessou é inválido ou expirou.
          </p>
        </div>
      </div>
    )
  }

  const coachName = coach.coachName
  const coachLogoUrl = coach.profilePhoto ?? null

  return (
    <PublicPageBranded coachName={coachName} coachLogoUrl={coachLogoUrl}>
      <ForgotPasswordForm slug={slug} />
    </PublicPageBranded>
  )
}
