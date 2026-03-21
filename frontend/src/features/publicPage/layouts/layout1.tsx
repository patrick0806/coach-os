import type { PublicProfile } from "@/features/publicPage/types/publicPage.types"
import { PublicHero } from "@/features/publicPage/components/publicHero"
import { PublicAbout } from "@/features/publicPage/components/publicAbout"
import { PublicServicePlans } from "@/features/publicPage/components/publicServicePlans"
import { PublicAvailability } from "@/features/publicPage/components/publicAvailability"
import { PublicStudentArea } from "@/features/publicPage/components/publicStudentArea"

interface Layout1Props {
  profile: PublicProfile
  slug: string
  hrefPrefix?: string
}

// Layout 1 — Classic: centered hero, sections stacked vertically (default)
export function Layout1({ profile, slug, hrefPrefix = "" }: Layout1Props) {
  return (
    <>
      <PublicHero profile={profile} slug={slug} hrefPrefix={hrefPrefix} />
      <PublicAbout profile={profile} />
      <PublicServicePlans plans={profile.servicePlans} phoneNumber={profile.phoneNumber} />
      <PublicAvailability rules={profile.availabilityRules} occupiedSlots={profile.occupiedSlots} />
      <PublicStudentArea slug={slug} hrefPrefix={hrefPrefix} />
    </>
  )
}
