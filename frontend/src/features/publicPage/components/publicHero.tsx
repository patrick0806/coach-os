import Image from "next/image"
import Link from "next/link"
import { Dumbbell } from "lucide-react"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"

interface PublicHeroProps {
  profile: PublicProfile
  slug: string
}

export function PublicHero({ profile, slug }: PublicHeroProps) {
  const title = profile.lpTitle ?? profile.coachName

  return (
    <section
      className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center"
      style={
        profile.lpHeroImage
          ? {
              backgroundImage: `url(${profile.lpHeroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Overlay for readability when hero image exists */}
      {profile.lpHeroImage && (
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      )}

      {/* Brand-color gradient fallback when no hero image */}
      {!profile.lpHeroImage && (
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Logo or coach photo */}
        {profile.logoUrl ? (
          <div className="h-16 max-w-[200px]">
            <Image
              src={profile.logoUrl}
              alt={`Logo de ${profile.coachName}`}
              width={200}
              height={64}
              className="h-full w-auto object-contain drop-shadow-md"
            />
          </div>
        ) : (
          <div className="size-24 overflow-hidden rounded-full border-4 border-white/30 shadow-lg">
            {profile.profilePhoto ? (
              <Image
                src={profile.profilePhoto}
                alt={profile.coachName}
                width={96}
                height={96}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-muted">
                <Dumbbell className="size-10 text-muted-foreground" />
              </div>
            )}
          </div>
        )}

        <div className="max-w-2xl space-y-3 text-center">
          <h1
            className={`text-4xl font-bold tracking-tight md:text-5xl ${profile.lpHeroImage ? "text-white" : "text-foreground"}`}
          >
            {title}
          </h1>
          {profile.lpSubtitle && (
            <p
              className={`text-lg ${profile.lpHeroImage ? "text-white/80" : "text-muted-foreground"}`}
            >
              {profile.lpSubtitle}
            </p>
          )}
          {profile.specialties && profile.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-1">
              {profile.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    profile.lpHeroImage
                      ? "bg-white/20 text-white backdrop-blur-sm"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#planos"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
          >
            Ver planos
          </a>
          <Link
            href={`/personais/${slug}/login`}
            className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            Entrar como aluno
          </Link>
        </div>
      </div>
    </section>
  )
}
