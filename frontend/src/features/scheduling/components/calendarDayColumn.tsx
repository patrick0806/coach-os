"use client"

import { CalendarEvent } from "./calendarEvent"
import type { AvailabilityRuleItem, CalendarEntry } from "@/features/scheduling/types/scheduling.types"

const HOUR_START = 6
const HOUR_END = 22
const TOTAL_HOURS = HOUR_END - HOUR_START
const HOUR_HEIGHT_PX = 60

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getTopPx(time: string): number {
  const minutes = timeToMinutes(time)
  const baseMinutes = HOUR_START * 60
  return ((minutes - baseMinutes) / 60) * HOUR_HEIGHT_PX
}

function getHeightPx(startTime: string, endTime: string): number {
  const diff = timeToMinutes(endTime) - timeToMinutes(startTime)
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

function minutesToTimeStr(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

function detectOverlaps(entries: CalendarEntry[]): Set<string> {
  const overlapping = new Set<string>()
  const timed = entries.filter((e) => e.startTime && e.endTime)

  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i]
      const b = timed[j]
      const aStart = timeToMinutes(a.startTime!)
      const aEnd = timeToMinutes(a.endTime!)
      const bStart = timeToMinutes(b.startTime!)
      const bEnd = timeToMinutes(b.endTime!)
      if (aStart < bEnd && aEnd > bStart) {
        overlapping.add(a.sourceId)
        overlapping.add(b.sourceId)
      }
    }
  }

  return overlapping
}

interface CalendarDayColumnProps {
  entries: CalendarEntry[]
  availabilityRules?: AvailabilityRuleItem[]
  isExceptionDay?: boolean
  onEventClick?: (entry: CalendarEntry) => void
}

export function CalendarDayColumn({
  entries,
  availabilityRules = [],
  isExceptionDay = false,
  onEventClick,
}: CalendarDayColumnProps) {
  const totalHeight = TOTAL_HOURS * HOUR_HEIGHT_PX
  const overlapping = detectOverlaps(entries)

  const allDayEntries = entries.filter((e) => !e.startTime || !e.endTime)
  const timedEntries = entries.filter((e) => e.startTime && e.endTime)

  return (
    <div className="relative flex-1 min-w-0">
      {/* All-day events (exceptions without time) */}
      {allDayEntries.map((entry) => (
        <CalendarEvent
          key={entry.sourceId}
          entry={entry}
          hasOverlap={overlapping.has(entry.sourceId)}
          style={{ position: "relative", marginBottom: 2 }}
          onClick={() => onEventClick?.(entry)}
        />
      ))}

      {/* Timed events + availability zones */}
      <div className="relative" style={{ height: totalHeight }}>
        {/* Exception day — full-day blocked background */}
        {isExceptionDay && (
          <div
            className="absolute inset-0 bg-destructive/8 border-l-2 border-destructive/20 pointer-events-none z-0"
          />
        )}

        {/* Availability rule zones (subtracted around training schedules) */}
        {!isExceptionDay && availabilityRules.map((rule) => {
          const clampedStart = Math.max(timeToMinutes(rule.startTime), HOUR_START * 60)
          const clampedEnd = Math.min(timeToMinutes(rule.endTime), HOUR_END * 60)
          if (clampedEnd <= clampedStart) return null

          const occupiedRanges: MinuteRange[] = timedEntries
            .filter((e) => e.type === "training_schedule" && e.startTime && e.endTime)
            .map((e) => ({ start: timeToMinutes(e.startTime!), end: timeToMinutes(e.endTime!) }))

          const fragments = subtractRanges({ start: clampedStart, end: clampedEnd }, occupiedRanges)

          return fragments.map((frag, i) => {
            const fragStartStr = minutesToTimeStr(frag.start)
            const fragEndStr = minutesToTimeStr(frag.end)
            const top = getTopPx(fragStartStr)
            const height = getHeightPx(fragStartStr, fragEndStr)
            return (
              <div
                key={`${rule.id}-${i}`}
                className="absolute left-0 right-0 bg-emerald-500/[0.08] dark:bg-emerald-500/10 border-l-2 border-emerald-500/40 pointer-events-none z-0"
                style={{ top, height }}
              />
            )
          })
        })}

        {timedEntries.map((entry) => {
          const top = getTopPx(entry.startTime!)
          const height = getHeightPx(entry.startTime!, entry.endTime!)

          return (
            <CalendarEvent
              key={entry.sourceId}
              entry={entry}
              hasOverlap={overlapping.has(entry.sourceId)}
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
