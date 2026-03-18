import { type CSSProperties } from "react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import { publicServerFetch } from "@/lib/serverFetch"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { PublicHero } from "@/features/publicPage/components/publicHero"
import { PublicAbout } from "@/features/publicPage/components/publicAbout"
import { PublicServicePlans } from "@/features/publicPage/components/publicServicePlans"
import { PublicAvailability } from "@/features/publicPage/components/publicAvailability"
import { PublicStudentArea } from "@/features/publicPage/components/publicStudentArea"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await publicServerFetch<PublicProfile>(`/public/${slug}`)

  if (!profile) return { title: "Personal não encontrado" }

  return {
    title: profile.lpTitle ?? profile.coachName,
    description: profile.bio ?? `Conheça o trabalho de ${profile.coachName}`,
    openGraph: {
      images: profile.lpHeroImage ? [{ url: profile.lpHeroImage }] : [],
    },
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params
  const profile = await publicServerFetch<PublicProfile>(`/public/${slug}`)

  if (!profile) notFound()

  return (
    <div
      className="min-h-screen bg-background"
      style={profile.themeColor ? ({ "--brand-color": profile.themeColor } as CSSProperties) : undefined}
    >
      <PublicHero profile={profile} slug={slug} />
      <PublicAbout profile={profile} />
      <PublicServicePlans plans={profile.servicePlans} phoneNumber={profile.phoneNumber} />
      <PublicAvailability rules={profile.availabilityRules} occupiedSlots={profile.occupiedSlots} />
      <PublicStudentArea slug={slug} />
    </div>
  )
}
