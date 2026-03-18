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
  const coach = await publicServerFetch<CoachPublicProfile>(`/public/${slug}`)

  const coachName = coach?.coachName ?? "Personal Trainer"
  const coachLogoUrl = coach?.profilePhoto ?? null

  return (
    <PublicPageBranded coachName={coachName} coachLogoUrl={coachLogoUrl}>
      <ForgotPasswordForm slug={slug} />
    </PublicPageBranded>
  )
}
