import { publicServerFetch } from "@/lib/serverFetch"
import { StudentLoginForm } from "@/features/studentAuth/components/studentLoginForm"

interface CoachPublicProfile {
  coachName: string
  slug: string
  bio: string | null
  profilePhoto: string | null
  specialties: string[] | null
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function StudentLoginPage({ params }: PageProps) {
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
    <StudentLoginForm
      coachName={coach.coachName}
      coachLogoUrl={coach.profilePhoto}
      slug={slug}
    />
  )
}
