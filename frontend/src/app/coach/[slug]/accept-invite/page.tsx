import { Suspense } from "react"

import { publicServerFetch } from "@/lib/serverFetch"
import { PublicPageBranded } from "@/features/publicPage/components/publicPageBranded"
import { AcceptStudentInviteForm } from "@/features/auth/components/acceptStudentInviteForm"
import { LoadingState } from "@/shared/components/loadingState"

interface CoachPublicProfile {
  coachName: string
  profilePhoto: string | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AcceptInvitePage({ params }: PageProps) {
  const { slug } = await params
  const coach = await publicServerFetch<CoachPublicProfile>(`/public/${slug}`)

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

  return (
    <PublicPageBranded coachName={coach.coachName} coachLogoUrl={coach.profilePhoto ?? null}>
      <Suspense fallback={<LoadingState variant="card" />}>
        <AcceptStudentInviteForm slug={slug} />
      </Suspense>
    </PublicPageBranded>
  )
}
