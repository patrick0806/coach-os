import Image from "next/image"
import Link from "next/link"
import { Dumbbell, MessageCircle } from "lucide-react"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { PublicAbout } from "@/features/publicPage/components/publicAbout"
import { PublicAvailability } from "@/features/publicPage/components/publicAvailability"
import { PublicStudentArea } from "@/features/publicPage/components/publicStudentArea"
import { formatMoney } from "@/lib/formatMoney"

interface Layout2Props {
  profile: PublicProfile
  slug: string
  hrefPrefix?: string
}

// Layout 2 — Split: text left, photo right. No background image in hero.
export function Layout2({ profile, slug, hrefPrefix = "" }: Layout2Props) {
  const title = profile.lpTitle ?? profile.coachName

  function buildWhatsappUrl(planName: string): string {
    const phone = (profile.phoneNumber ?? "").replace(/\D/g, "")
    const text = encodeURIComponent(`Olá! Tenho interesse no plano ${planName}.`)
    return `https://wa.me/${phone}?text=${text}`
  }

  return (
    <>
      {/* Hero — split: left text / right photo */}
      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-12 md:flex-row md:gap-16">
            {/* Left: text */}
            <div className="flex-1 space-y-6 text-left">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                  {title}
                </h1>
                {profile.lpSubtitle && (
                  <p className="text-lg text-muted-foreground md:text-xl">{profile.lpSubtitle}</p>
                )}
              </div>

              {profile.specialties && profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ backgroundColor: "var(--brand-color-secondary, var(--brand-color, hsl(var(--primary))))", color: "var(--brand-text-color-secondary, white)" }}
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <a
                  href="#planos"
                  className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))", color: "var(--brand-text-color, white)" }}
                >
                  Ver planos
                </a>
                <Link
                  href={`${hrefPrefix}/login`}
                  className="inline-flex items-center justify-center rounded-lg border px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Entrar como aluno
                </Link>
              </div>
            </div>

            {/* Right: coach photo */}
            <div className="shrink-0">
              <div className="size-72 overflow-hidden rounded-2xl shadow-xl md:size-96">
                {profile.profilePhoto ? (
                  <Image
                    src={profile.profilePhoto}
                    alt={profile.coachName}
                    width={384}
                    height={384}
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center"
                    style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))", opacity: 0.1 }}
                  >
                    <Dumbbell className="size-24 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicAbout profile={profile} />

      {/* Service plans */}
      {profile.servicePlans.length > 0 && (
        <section id="planos" className="bg-muted/40 px-4 py-16">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="text-left">
              <h2 className="text-3xl font-bold tracking-tight">Planos e Serviços</h2>
              <p className="mt-2 text-muted-foreground">Escolha o plano ideal para você</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profile.servicePlans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-col rounded-xl border bg-background p-6 shadow-sm"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg leading-tight">{plan.name}</h3>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: "var(--brand-color-secondary, var(--brand-color, hsl(var(--primary))))", color: "var(--brand-text-color-secondary, white)" }}
                      >
                        {plan.attendanceType === "online" ? "Online" : "Presencial"}
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: "var(--brand-color, hsl(var(--primary)))" }}>
                      {formatMoney(Number(plan.price))}
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
                  </div>

                  {profile.phoneNumber && (
                    <a
                      href={buildWhatsappUrl(plan.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#25D366" }}
                    >
                      <MessageCircle className="size-4" />
                      Contratar via WhatsApp
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <PublicAvailability workingHours={profile.workingHours} occupiedSlots={profile.occupiedSlots} />
      <PublicStudentArea slug={slug} hrefPrefix={hrefPrefix} />
    </>
  )
}
