import { type CSSProperties } from "react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import { publicServerFetch } from "@/lib/serverFetch"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { Layout1 } from "@/features/publicPage/layouts/layout1"
import { Layout2 } from "@/features/publicPage/layouts/layout2"
import { Layout3 } from "@/features/publicPage/layouts/layout3"
import { Layout4 } from "@/features/publicPage/layouts/layout4"

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

  const cssVars: CSSProperties = {
    "--brand-color": profile.themeColor ?? "#6366f1",
    ...(profile.themeColorSecondary
      ? { "--brand-color-secondary": profile.themeColorSecondary }
      : {}),
  } as CSSProperties

  function renderLayout() {
    switch (profile!.lpLayout) {
      case "2":
        return <Layout2 profile={profile!} slug={slug} />
      case "3":
        return <Layout3 profile={profile!} slug={slug} />
      case "4":
        return <Layout4 profile={profile!} slug={slug} />
      default:
        return <Layout1 profile={profile!} slug={slug} />
    }
  }

  return (
    <div className="min-h-screen bg-background" style={cssVars}>
      {renderLayout()}
    </div>
  )
}
