"use client"

import { CalendarEvent } from "./calendarEvent"
import type { UnifiedCalendarEntry, WorkingHoursItem } from "@/features/scheduling/types/scheduling.types"

const HOUR_START = 6
const HOUR_END = 22
const TOTAL_HOURS = HOUR_END - HOUR_START
const HOUR_HEIGHT_PX = 60

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function isoToMinutes(isoString: string): number {
  const d = new Date(isoString)
  return d.getUTCHours() * 60 + d.getUTCMinutes()
}

function getTopPx(minutes: number): number {
  const baseMinutes = HOUR_START * 60
  return ((minutes - baseMinutes) / 60) * HOUR_HEIGHT_PX
}

function getHeightPx(startMinutes: number, endMinutes: number): number {
  const diff = endMinutes - startMinutes
  const minHeight = (30 / 60) * HOUR_HEIGHT_PX
  return Math.max((diff / 60) * HOUR_HEIGHT_PX, minHeight)
}

interface MinuteRange {
  start: number
  end: number
}

function subtractRanges(base: MinuteRange, occupied: MinuteRange[]): MinuteRange[] {
  const sorted = [...occupied]
    .filter((o) => o.start < base.end && o.end > base.start)
    .sort((a, b) => a.start - b.start)

  const gaps: MinuteRange[] = []
  let cursor = base.start

  for (const o of sorted) {
    const oStart = Math.max(o.start, base.start)
    const oEnd = Math.min(o.end, base.end)
    if (oStart > cursor) {
      gaps.push({ start: cursor, end: oStart })
    }
    cursor = Math.max(cursor, oEnd)
  }

  if (cursor < base.end) {
    gaps.push({ start: cursor, end: base.end })
  }

  return gaps
}

function detectOverlaps(entries: UnifiedCalendarEntry[]): Set<string> {
  const overlapping = new Set<string>()

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i]
      const b = entries[j]
      const aStart = isoToMinutes(a.startAt)
      const aEnd = isoToMinutes(a.endAt)
      const bStart = isoToMinutes(b.startAt)
      const bEnd = isoToMinutes(b.endAt)
      if (aStart < bEnd && aEnd > bStart) {
        overlapping.add(a.id)
        overlapping.add(b.id)
      }
    }
  }

  return overlapping
}

interface CalendarDayColumnProps {
  entries: UnifiedCalendarEntry[]
  workingHours?: WorkingHoursItem[]
  onEventClick?: (entry: UnifiedCalendarEntry) => void
}

export function CalendarDayColumn({
  entries,
  workingHours = [],
  onEventClick,
}: CalendarDayColumnProps) {
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT_PX
  const overlapping = detectOverlaps(entries)

  return (
    <div className="relative flex-1 min-w-0">
      <div className="relative" style={{ height: totalHeight }}>
        {/* Working hours zones (subtracted around booking entries) */}
        {workingHours.map((wh) => {
          const clampedStart = Math.max(timeToMinutes(wh.startTime), HOUR_START * 60)
          const clampedEnd = Math.min(timeToMinutes(wh.endTime), HOUR_END * 60)
          if (clampedEnd <= clampedStart) return null

          const occupiedRanges: MinuteRange[] = entries
            .filter((e) => e.type === "booking" && e.status !== "cancelled")
            .map((e) => ({ start: isoToMinutes(e.startAt), end: isoToMinutes(e.endAt) }))

          const fragments = subtractRanges({ start: clampedStart, end: clampedEnd }, occupiedRanges)

          return fragments.map((frag, i) => (
            <div
              key={`${wh.id}-${i}`}
              className="absolute left-0 right-0 bg-emerald-500/[0.08] dark:bg-emerald-500/10 border-l-2 border-emerald-500/40 pointer-events-none z-0"
              style={{ top: getTopPx(frag.start), height: getHeightPx(frag.start, frag.end) }}
            />
          ))
        })}

        {entries.map((entry) => {
          if (entry.status === "cancelled") return null
          const startMin = isoToMinutes(entry.startAt)
          const endMin = isoToMinutes(entry.endAt)
          const top = getTopPx(startMin)
          const height = getHeightPx(startMin, endMin)

          return (
            <CalendarEvent
              key={entry.id}
              entry={entry}
              hasOverlap={overlapping.has(entry.id)}
              style={{ top, height, minHeight: 20 }}
              onClick={() => onEventClick?.(entry)}
            />
          )
        })}
      </div>
    </div>
  )
}

export { HOUR_START, HOUR_END, TOTAL_HOURS, HOUR_HEIGHT_PX }
