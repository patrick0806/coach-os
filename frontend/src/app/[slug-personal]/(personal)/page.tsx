import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServicePlan {
  id: string;
  name: string;
  description: string | null;
  sessionsPerWeek: number;
  durationMinutes: number;
  price: string;
}

interface PublicProfile {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  profilePhoto: string | null;
  themeColor: string;
  phoneNumber: string | null;
  lpTitle: string | null;
  lpSubtitle: string | null;
  lpHeroImage: string | null;
  lpAboutTitle: string | null;
  lpAboutText: string | null;
  lpImage1: string | null;
  lpImage2: string | null;
  lpImage3: string | null;
  servicePlans: ServicePlan[];
}

// ─── Data fetching ─────────────────────────────────────────────────────────────

async function fetchPublicProfile(slug: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_URL}/personals/${slug}/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<PublicProfile>;
  } catch {
    return null;
  }
}

// ─── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ "slug-personal": string }>;
}): Promise<Metadata> {
  const { "slug-personal": slug } = await params;
  const profile = await fetchPublicProfile(slug);

  if (!profile) {
    return { title: "Perfil não encontrado" };
  }

  const title = profile.lpTitle ?? profile.name;
  const description =
    profile.bio ?? `Conheça o personal trainer ${profile.name} e seus planos de treino.`;
  const image = profile.lpHeroImage ?? profile.profilePhoto ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function whatsAppUrl(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, "");
  const base = `https://wa.me/55${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

function formatPrice(price: string): string {
  const value = parseFloat(price);
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function HeroSection({ profile }: { profile: PublicProfile }) {
  const ctaUrl = profile.phoneNumber
    ? whatsAppUrl(profile.phoneNumber, `Olá ${profile.name}! Vi seu perfil e gostaria de saber mais.`)
    : null;

  const hasHeroImage = Boolean(profile.lpHeroImage);

  return (
    <section
      className="relative flex min-h-screen items-center justify-center"
      style={
        hasHeroImage
          ? {
              backgroundImage: `url(${profile.lpHeroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : {
              background:
                "linear-gradient(135deg, var(--color-theme) 0%, #111827 100%)",
            }
      }
    >
      {hasHeroImage && <div className="absolute inset-0 bg-black/60" />}

      <div className="relative z-10 flex flex-col items-center gap-8 px-6 py-24 text-center text-white">
        {profile.profilePhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.profilePhoto}
            alt={profile.name}
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white/30 sm:h-36 sm:w-36"
          />
        ) : null}

        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {profile.lpTitle ?? profile.name}
          </h1>
          {profile.lpSubtitle ? (
            <p className="mx-auto max-w-2xl text-lg text-white/80 sm:text-xl">
              {profile.lpSubtitle}
            </p>
          ) : null}
        </div>

        {ctaUrl ? (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-white shadow-lg transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--color-theme)" }}
          >
            <WhatsAppIcon className="size-5" />
            Fale comigo no WhatsApp
          </a>
        ) : null}
      </div>
    </section>
  );
}

function AboutSection({ profile }: { profile: PublicProfile }) {
  const images = [profile.lpImage1, profile.lpImage2, profile.lpImage3].filter(
    (img): img is string => Boolean(img),
  );
  const text = profile.lpAboutText ?? profile.bio;

  if (!text && images.length === 0) return null;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {text ? (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {profile.lpAboutTitle ?? "Sobre mim"}
              </h2>
              <p className="whitespace-pre-line text-lg leading-relaxed text-gray-600">{text}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {profile.lpAboutTitle ?? profile.name}
              </h2>
            </div>
          )}

          {images.length > 0 ? (
            <div
              className={`grid gap-3 ${
                images.length === 1 ? "grid-cols-1" : "grid-cols-2"
              }`}
            >
              {images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`${profile.name} — foto ${i + 1}`}
                  className={`w-full rounded-xl object-cover ${
                    images.length === 3 && i === 0
                      ? "col-span-2 aspect-video"
                      : "aspect-square"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PlansSection({ profile }: { profile: PublicProfile }) {
  if (profile.servicePlans.length === 0) return null;

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Planos e valores</h2>
          <p className="mt-3 text-gray-500">Escolha o plano ideal para seus objetivos</p>
        </div>

        <div
          className={`grid gap-6 ${
            profile.servicePlans.length === 1
              ? "mx-auto max-w-sm"
              : profile.servicePlans.length === 2
                ? "mx-auto max-w-2xl sm:grid-cols-2"
                : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {profile.servicePlans.map((plan) => {
            const planCtaUrl = profile.phoneNumber
              ? whatsAppUrl(
                  profile.phoneNumber,
                  `Olá ${profile.name}! Tenho interesse no plano "${plan.name}".`,
                )
              : null;

            return (
              <div
                key={plan.id}
                className="flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
              >
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    {plan.description ? (
                      <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
                    ) : null}
                  </div>

                  <div>
                    <span
                      className="text-4xl font-extrabold"
                      style={{ color: "var(--color-theme)" }}
                    >
                      {formatPrice(plan.price)}
                    </span>
                    <span className="ml-1 text-sm text-gray-500">/mês</span>
                  </div>

                  <ul className="space-y-2.5">
                    <li className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "var(--color-theme)" }}
                      />
                      {plan.sessionsPerWeek}{" "}
                      {plan.sessionsPerWeek === 1 ? "sessão" : "sessões"} por semana
                    </li>
                    <li className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: "var(--color-theme)" }}
                      />
                      {plan.durationMinutes} minutos por sessão
                    </li>
                  </ul>
                </div>

                {planCtaUrl ? (
                  <a
                    href={planCtaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 block rounded-xl px-6 py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "var(--color-theme)" }}
                  >
                    Quero este plano
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ContactSection({ profile }: { profile: PublicProfile }) {
  if (!profile.phoneNumber) return null;

  const ctaUrl = whatsAppUrl(
    profile.phoneNumber,
    `Olá ${profile.name}! Gostaria de começar a treinar com você.`,
  );

  return (
    <section className="py-20 text-white" style={{ backgroundColor: "var(--color-theme)" }}>
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold">Vamos começar?</h2>
        <p className="mt-4 text-lg text-white/80">
          Entre em contato e dê o primeiro passo rumo aos seus objetivos.
        </p>
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold transition-opacity hover:opacity-90"
          style={{ color: "var(--color-theme)" }}
        >
          <WhatsAppIcon className="size-5" />
          Falar pelo WhatsApp
        </a>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PersonalLandingPageProps {
  params: Promise<{ "slug-personal": string }>;
}

export default async function PersonalLandingPage({ params }: PersonalLandingPageProps) {
  const { "slug-personal": slug } = await params;
  const profile = await fetchPublicProfile(slug);

  if (!profile) {
    notFound();
  }

  return (
    <main>
      <HeroSection profile={profile} />
      <AboutSection profile={profile} />
      <PlansSection profile={profile} />
      <ContactSection profile={profile} />
    </main>
  );
}
