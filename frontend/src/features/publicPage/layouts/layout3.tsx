import Image from "next/image"
import Link from "next/link"
import { Dumbbell, MessageCircle } from "lucide-react"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { PublicAvailability } from "@/features/publicPage/components/publicAvailability"
import { PublicStudentArea } from "@/features/publicPage/components/publicStudentArea"

function formatPrice(price: string): string {
  return parseFloat(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

interface Layout3Props {
  profile: PublicProfile
  slug: string
}

// Layout 3 — Minimal: clean hero, light background, large typography, plans as list
export function Layout3({ profile, slug }: Layout3Props) {
  const title = profile.lpTitle ?? profile.coachName
  const images = [profile.lpImage1, profile.lpImage2, profile.lpImage3].filter(Boolean) as string[]

  function buildWhatsappUrl(planName: string): string {
    const phone = (profile.phoneNumber ?? "").replace(/\D/g, "")
    const text = encodeURIComponent(`Olá! Tenho interesse no plano ${planName}.`)
    return `https://wa.me/${phone}?text=${text}`
  }

  return (
    <>
      {/* Hero — minimal, no background */}
      <section className="px-4 pb-20 pt-24">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          {profile.logoUrl ? (
            <div className="mx-auto h-14 max-w-[180px]">
              <Image
                src={profile.logoUrl}
                alt={`Logo de ${profile.coachName}`}
                width={180}
                height={56}
                className="h-full w-auto object-contain"
              />
            </div>
          ) : (
            <div className="mx-auto size-20 overflow-hidden rounded-full border-2">
              {profile.profilePhoto ? (
                <Image
                  src={profile.profilePhoto}
                  alt={profile.coachName}
                  width={80}
                  height={80}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted">
                  <Dumbbell className="size-8 text-muted-foreground" />
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h1 className="text-5xl font-extrabold tracking-tighter md:text-7xl">{title}</h1>
            {profile.lpSubtitle && (
              <p className="text-xl text-muted-foreground">{profile.lpSubtitle}</p>
            )}
          </div>

          {profile.specialties && profile.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {profile.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full border px-3 py-1 text-xs font-medium"
                  style={{
                    borderColor: "var(--brand-color, hsl(var(--primary)))",
                    color: "var(--brand-color, hsl(var(--primary)))",
                  }}
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#planos"
              className="inline-flex items-center justify-center rounded-full px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
            >
              Ver planos
            </a>
            <Link
              href={`/personais/${slug}/login`}
              className="inline-flex items-center justify-center rounded-full border px-8 py-3 text-sm font-semibold transition-colors hover:bg-muted"
            >
              Entrar como aluno
            </Link>
          </div>
        </div>
      </section>

      {/* About — minimal, side-by-side on large screens */}
      {(profile.lpAboutTitle || profile.lpAboutText || images.length > 0) && (
        <section id="sobre" className="bg-muted/30 px-4 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col gap-12 md:flex-row md:items-center md:gap-16">
              {(profile.lpAboutTitle || profile.lpAboutText) && (
                <div className="flex-1 space-y-4">
                  {profile.lpAboutTitle && (
                    <h2 className="text-3xl font-bold tracking-tight">{profile.lpAboutTitle}</h2>
                  )}
                  {profile.lpAboutText && (
                    <p className="text-muted-foreground leading-relaxed">{profile.lpAboutText}</p>
                  )}
                </div>
              )}
              {images.length > 0 && (
                <div className="shrink-0">
                  <div className="size-64 overflow-hidden rounded-2xl shadow-md md:size-80">
                    <Image
                      src={images[0]}
                      alt="Foto do coach"
                      width={320}
                      height={320}
                      className="size-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Service plans — list style */}
      {profile.servicePlans.length > 0 && (
        <section id="planos" className="px-4 py-20">
          <div className="mx-auto max-w-3xl space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Planos e Serviços</h2>

            <div className="divide-y rounded-xl border">
              {profile.servicePlans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between gap-6 p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{plan.name}</h3>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                        style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
                      >
                        {plan.attendanceType === "online" ? "Online" : "Presencial"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {[
                        plan.sessionsPerWeek && `${plan.sessionsPerWeek}x/semana`,
                        plan.durationMinutes && `${plan.durationMinutes}min`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    )}
                  </div>

                  <div className="shrink-0 space-y-2 text-right">
                    <p className="text-xl font-bold" style={{ color: "var(--brand-color, hsl(var(--primary)))" }}>
                      {formatPrice(plan.price)}
                      <span className="text-xs font-normal text-muted-foreground">/mês</span>
                    </p>
                    {profile.phoneNumber && (
                      <a
                        href={buildWhatsappUrl(plan.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: "#25D366" }}
                      >
                        <MessageCircle className="size-3" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicAvailability rules={profile.availabilityRules} occupiedSlots={profile.occupiedSlots} />
      <PublicStudentArea slug={slug} />
    </>
  )
}
