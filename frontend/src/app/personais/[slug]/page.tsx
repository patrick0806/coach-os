import { type CSSProperties } from "react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"

import { publicServerFetch } from "@/lib/serverFetch"
import { getContrastColor } from "@/lib/colorContrast"
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

  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/personais/${slug}`
  const title = profile.lpTitle
    ? `${profile.lpTitle} | ${profile.coachName}`
    : profile.coachName
  const description = profile.bio ?? `Conheça o trabalho de ${profile.coachName}`
  const image = profile.lpHeroImage ?? profile.profilePhoto

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "profile",
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params
  const profile = await publicServerFetch<PublicProfile>(`/public/${slug}`)

  if (!profile) notFound()

  const primaryHex = profile.themeColor ?? "#6366f1"
  const secondaryHex = profile.themeColorSecondary ?? primaryHex

  const cssVars: CSSProperties = {
    "--brand-color": primaryHex,
    "--brand-color-secondary": secondaryHex,
    "--brand-text-color": getContrastColor(primaryHex),
    "--brand-text-color-secondary": getContrastColor(secondaryHex),
  } as CSSProperties

  const pageUrl = `${process.env.NEXT_PUBLIC_APP_URL}/personais/${slug}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.coachName,
    description: profile.bio ?? undefined,
    url: pageUrl,
    image: profile.profilePhoto ?? undefined,
    telephone: profile.phoneNumber ?? undefined,
  }

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {renderLayout()}
    </div>
  )
}
