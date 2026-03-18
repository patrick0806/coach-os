import { Suspense } from "react"

import { publicServerFetch } from "@/lib/serverFetch"
import { PublicPageBranded } from "@/features/publicPage/components/publicPageBranded"
import { ResetPasswordForm } from "@/features/auth/components/resetPasswordForm"
import { LoadingState } from "@/shared/components/loadingState"

interface CoachPublicProfile {
  coachName: string
  profilePhoto: string | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function RedefinirSenhaPage({ params }: PageProps) {
  const { slug } = await params
  const coach = await publicServerFetch<CoachPublicProfile>(`/public/${slug}`)

  const coachName = coach?.coachName ?? "Personal Trainer"
  const coachLogoUrl = coach?.profilePhoto ?? null

  return (
    <PublicPageBranded coachName={coachName} coachLogoUrl={coachLogoUrl}>
      <Suspense fallback={<LoadingState variant="card" />}>
        <ResetPasswordForm />
      </Suspense>
    </PublicPageBranded>
  )
}
