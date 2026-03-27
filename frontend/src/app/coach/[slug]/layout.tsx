import type { CSSProperties } from "react"

import { publicServerFetch } from "@/lib/serverFetch"
import { getContrastColor } from "@/lib/colorContrast"

interface CoachTheme {
  themeColor: string | null
  themeColorSecondary: string | null
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function CoachSlugLayout({ children, params }: LayoutProps) {
  const { slug } = await params

  // Fetch only what we need for the theme — short revalidation so color changes reflect quickly
  const profile = await publicServerFetch<CoachTheme>(`/v1/public/${slug}`, { revalidate: 60 })

  const primaryHex = profile?.themeColor ?? "#6366f1"
  const secondaryHex = profile?.themeColorSecondary ?? primaryHex

  const cssVars: CSSProperties = {
    "--brand-color": primaryHex,
    "--brand-color-secondary": secondaryHex,
    "--brand-text-color": getContrastColor(primaryHex),
    "--brand-text-color-secondary": getContrastColor(secondaryHex),
    // Override Tailwind primary so bg-primary/text-primary respect the coach brand color
    "--color-primary": primaryHex,
    "--color-primary-foreground": getContrastColor(primaryHex),
  } as CSSProperties

  return (
    <div style={cssVars}>
      {children}
    </div>
  )
}
