import Image from "next/image"
import Link from "next/link"
import { Dumbbell, MessageCircle } from "lucide-react"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { PublicAbout } from "@/features/publicPage/components/publicAbout"
import { PublicAvailability } from "@/features/publicPage/components/publicAvailability"
import { PublicStudentArea } from "@/features/publicPage/components/publicStudentArea"

function formatPrice(price: string): string {
  return parseFloat(price).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

interface Layout4Props {
  profile: PublicProfile
  slug: string
}

// Layout 4 — Bold: dark hero with primary color as background, plans with secondary color highlight
export function Layout4({ profile, slug }: Layout4Props) {
  const title = profile.lpTitle ?? profile.coachName

  function buildWhatsappUrl(planName: string): string {
    const phone = (profile.phoneNumber ?? "").replace(/\D/g, "")
    const text = encodeURIComponent(`Olá! Tenho interesse no plano ${planName}.`)
    return `https://wa.me/${phone}?text=${text}`
  }

  return (
    <>
      {/* Hero — dark, primary color as background */}
      <section
        className="relative flex min-h-[75vh] flex-col items-center justify-center px-4 py-20 text-center"
        style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))", color: "var(--brand-text-color, white)" }}
      >
        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center gap-8">
          {profile.logoUrl ? (
            <div className="h-16 max-w-[200px]">
              <Image
                src={profile.logoUrl}
                alt={`Logo de ${profile.coachName}`}
                width={200}
                height={64}
                className="h-full w-auto object-contain brightness-0 invert"
              />
            </div>
          ) : (
            <div className="size-24 overflow-hidden rounded-full border-4 border-white/30 shadow-xl">
              {profile.profilePhoto ? (
                <Image
                  src={profile.profilePhoto}
                  alt={profile.coachName}
                  width={96}
                  height={96}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-white/20">
                  <Dumbbell className="size-10 text-white" />
                </div>
              )}
            </div>
          )}

          <div className="max-w-3xl space-y-4">
            <h1 className="text-5xl font-black tracking-tight md:text-7xl" style={{ color: "var(--brand-text-color, white)" }}>{title}</h1>
            {profile.lpSubtitle && (
              <p className="text-xl opacity-80" style={{ color: "var(--brand-text-color, white)" }}>{profile.lpSubtitle}</p>
            )}
          </div>

          {profile.specialties && profile.specialties.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {profile.specialties.map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="#planos"
              className="inline-flex items-center justify-center rounded-lg bg-white px-8 py-3 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ color: "var(--brand-color, hsl(var(--primary)))" }}
            >
              Ver planos
            </a>
            <Link
              href={`/personais/${slug}/login`}
              className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Entrar como aluno
            </Link>
          </div>
        </div>
      </section>

      <PublicAbout profile={profile} />

      {/* Service plans — with secondary color highlight on featured card */}
      {profile.servicePlans.length > 0 && (
        <section id="planos" className="px-4 py-20">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight">Planos e Serviços</h2>
              <p className="mt-2 text-muted-foreground">Escolha o plano ideal para você</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profile.servicePlans.map((plan, index) => {
                // Highlight the first plan (or middle one for odd counts)
                const isHighlighted = index === Math.floor((profile.servicePlans.length - 1) / 2)
                return (
                  <div
                    key={plan.id}
                    className="relative flex flex-col overflow-hidden rounded-2xl border shadow-sm"
                    style={
                      isHighlighted
                        ? {
                            borderColor: "var(--brand-color-secondary, var(--brand-color, hsl(var(--primary))))",
                            boxShadow: "0 0 0 2px var(--brand-color-secondary, var(--brand-color, hsl(var(--primary))))",
                          }
                        : undefined
                    }
                  >
                    {isHighlighted && (
                      <div
                        className="py-1.5 text-center text-xs font-bold"
                        style={{
                          backgroundColor:
                            "var(--brand-color-secondary, var(--brand-color, hsl(var(--primary))))",
                          color: "var(--brand-text-color-secondary, white)",
                        }}
                      >
                        Mais popular
                      </div>
                    )}

                    <div className="flex flex-1 flex-col p-6 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
                        <span
                          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: "var(--brand-color-secondary, var(--brand-color, hsl(var(--primary))))", color: "var(--brand-text-color-secondary, white)" }}
                        >
                          {plan.attendanceType === "online" ? "Online" : "Presencial"}
                        </span>
                      </div>

                      <p
                        className="text-3xl font-black"
                        style={{ color: "var(--brand-color, hsl(var(--primary)))" }}
                      >
                        {formatPrice(plan.price)}
                        <span className="text-sm font-normal text-muted-foreground">/mês</span>
                      </p>

                      {plan.sessionsPerWeek && (
                        <p className="text-sm text-muted-foreground">{plan.sessionsPerWeek}x por semana</p>
                      )}
                      {plan.durationMinutes && (
                        <p className="text-sm text-muted-foreground">{plan.durationMinutes} minutos por sessão</p>
                      )}
                      {plan.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{plan.description}</p>
                      )}

                      {profile.phoneNumber && (
                        <a
                          href={buildWhatsappUrl(plan.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                          style={{ backgroundColor: "#25D366" }}
                        >
                          <MessageCircle className="size-4" />
                          Contratar via WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      <PublicAvailability rules={profile.availabilityRules} occupiedSlots={profile.occupiedSlots} />
      <PublicStudentArea slug={slug} />
    </>
  )
}
