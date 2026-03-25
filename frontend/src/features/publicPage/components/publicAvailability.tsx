import { DAY_OF_WEEK_LABELS } from "@/features/scheduling/types/scheduling.types"
import type { PublicWorkingHours, OccupiedSlot } from "@/features/publicPage/types/publicPage.types"

interface PublicAvailabilityProps {
  workingHours: PublicWorkingHours[]
  occupiedSlots: OccupiedSlot[]
}

// Ordered Mon→Sun for display
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

type Range = { startTime: string; endTime: string }

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function toTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

// Merge overlapping or adjacent ranges into the smallest set of non-overlapping ranges
function mergeRanges(ranges: Range[]): Range[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
  const merged: Range[] = [{ ...sorted[0] }]
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1]
    if (toMinutes(sorted[i].startTime) <= toMinutes(last.endTime)) {
      if (toMinutes(sorted[i].endTime) > toMinutes(last.endTime)) {
        last.endTime = sorted[i].endTime
      }
    } else {
      merged.push({ ...sorted[i] })
    }
  }
  return merged
}

// Subtract occupied ranges from free ranges — handles any combination of sizes
function subtractRanges(freeRanges: Range[], occupiedRanges: Range[]): Range[] {
  let result = [...freeRanges]
  for (const occ of occupiedRanges) {
    const next: Range[] = []
    const occStart = toMinutes(occ.startTime)
    const occEnd = toMinutes(occ.endTime)
    for (const free of result) {
      const freeStart = toMinutes(free.startTime)
      const freeEnd = toMinutes(free.endTime)
      if (occEnd <= freeStart || occStart >= freeEnd) {
        // No overlap — keep as is
        next.push(free)
      } else {
        // Partial overlap — keep the parts outside the occupied range
        if (occStart > freeStart) next.push({ startTime: free.startTime, endTime: toTime(occStart) })
        if (occEnd < freeEnd) next.push({ startTime: toTime(occEnd), endTime: free.endTime })
        // If fully covered, nothing is added (slot disappears)
      }
    }
    result = next
  }
  return result
}

function getFreeRangesForDay(
  day: number,
  workingHours: PublicWorkingHours[],
  occupiedSlots: OccupiedSlot[],
): Range[] {
  const dayRules = workingHours.filter((r) => r.dayOfWeek === day)
  if (dayRules.length === 0) return []

  const availability = mergeRanges(
    dayRules.map((r) => ({ startTime: r.startTime, endTime: r.endTime })),
  )
  const occupied = occupiedSlots
    .filter((s) => s.dayOfWeek === day)
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }))

  return subtractRanges(availability, occupied)
}

export function PublicAvailability({ workingHours, occupiedSlots }: PublicAvailabilityProps) {
  if (!workingHours?.length) return null

  const freeByDay = DAY_ORDER.reduce<Record<number, Range[]>>((acc, day) => {
    const ranges = getFreeRangesForDay(day, workingHours, occupiedSlots ?? [])
    if (ranges.length > 0) acc[day] = ranges
    return acc
  }, {})

  const days = DAY_ORDER.filter((d) => freeByDay[d])

  if (days.length === 0) return null

  return (
    <section id="horarios" className="px-4 py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Horários Disponíveis</h2>
          <p className="mt-2 text-muted-foreground">Dias e horários de atendimento</p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => (
            <div key={day} className="rounded-xl border bg-muted/30 p-4 space-y-3">
              <span
                className="inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: "var(--brand-color, hsl(var(--primary)))" }}
              >
                {DAY_OF_WEEK_LABELS[day]}
              </span>

              <div className="flex flex-wrap gap-2">
                {freeByDay[day].map((range, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-md border bg-background px-2.5 py-1 text-xs font-medium tabular-nums"
                  >
                    {range.startTime} – {range.endTime}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
