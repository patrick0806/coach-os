import Image from "next/image"
import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"

interface PublicAboutProps {
  profile: PublicProfile
}

export function PublicAbout({ profile }: PublicAboutProps) {
  const hasContent =
    profile.lpAboutTitle ||
    profile.lpAboutText ||
    profile.lpImage1 ||
    profile.lpImage2 ||
    profile.lpImage3

  if (!hasContent) return null

  const images = [profile.lpImage1, profile.lpImage2, profile.lpImage3].filter(Boolean) as string[]

  return (
    <section id="sobre" className="px-4 py-16">
      <div className="mx-auto max-w-5xl space-y-10">
        {(profile.lpAboutTitle || profile.lpAboutText) && (
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            {profile.lpAboutTitle && (
              <h2 className="text-3xl font-bold tracking-tight">{profile.lpAboutTitle}</h2>
            )}
            {profile.lpAboutText && (
              <p className="text-muted-foreground leading-relaxed">{profile.lpAboutText}</p>
            )}
          </div>
        )}

        {images.length > 0 && (
          <div
            className={`grid gap-4 ${
              images.length === 1
                ? "grid-cols-1 max-w-md mx-auto"
                : images.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-3"
            }`}
          >
            {images.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-xl">
                <Image
                  src={src}
                  alt={`Foto ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
