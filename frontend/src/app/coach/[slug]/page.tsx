import { type CSSProperties } from "react"
import { type Metadata } from "next"
import { notFound } from "next/navigation"
import { headers } from "next/headers"

import { publicServerFetch } from "@/lib/serverFetch"
import { getContrastColor } from "@/lib/colorContrast"
import { getCoachHrefPrefix } from "@/lib/coachHrefPrefix"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { Layout1 } from "@/features/publicPage/layouts/layout1"
import { Layout2 } from "@/features/publicPage/layouts/layout2"
import { Layout3 } from "@/features/publicPage/layouts/layout3"
import { Layout4 } from "@/features/publicPage/layouts/layout4"

interface PageProps {
  params: Promise<{ slug: string }>
}

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || "coachos.com.br"

function getCanonicalUrl(slug: string): string {
  return `https://${slug}.${BASE_DOMAIN}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const profile = await publicServerFetch<PublicProfile>(`/v1/public/${slug}`, { revalidate: 60 })

  if (!profile) return { title: "Personal não encontrado" }

  const pageUrl = getCanonicalUrl(slug)
  const title = profile.lpTitle
    ? `${profile.lpTitle} | ${profile.coachName}`
    : profile.coachName
  const description = profile.bio ?? `Conheça o trabalho de ${profile.coachName}`
  const image = profile.lpHeroImage ?? profile.profilePhoto

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    icons: profile.logoUrl
      ? { icon: [{ url: profile.logoUrl }], apple: [{ url: profile.logoUrl }] }
      : undefined,
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

export default async function CoachPublicPage({ params }: PageProps) {
  const { slug } = await params
  const profile = await publicServerFetch<PublicProfile>(`/v1/public/${slug}`, { revalidate: 60 })

  if (!profile) notFound()

  const primaryHex = profile.themeColor ?? "#6366f1"
  const secondaryHex = profile.themeColorSecondary ?? primaryHex

  const cssVars: CSSProperties = {
    "--brand-color": primaryHex,
    "--brand-color-secondary": secondaryHex,
    "--brand-text-color": getContrastColor(primaryHex),
    "--brand-text-color-secondary": getContrastColor(secondaryHex),
  } as CSSProperties

  const pageUrl = getCanonicalUrl(slug)
  const host = (await headers()).get("host") ?? ""
  const hrefPrefix = getCoachHrefPrefix(slug, host)

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
        return <Layout2 profile={profile!} slug={slug} hrefPrefix={hrefPrefix} />
      case "3":
        return <Layout3 profile={profile!} slug={slug} hrefPrefix={hrefPrefix} />
      case "4":
        return <Layout4 profile={profile!} slug={slug} hrefPrefix={hrefPrefix} />
      default:
        return <Layout1 profile={profile!} slug={slug} hrefPrefix={hrefPrefix} />
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
