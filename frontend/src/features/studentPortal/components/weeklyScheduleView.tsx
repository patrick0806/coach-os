"use client"

import { MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"
import type { StudentTrainingSchedule } from "@/features/studentPortal/types/studentPortalSchedule.types"

interface WeeklyScheduleViewProps {
  schedules: StudentTrainingSchedule[]
}

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

export function WeeklyScheduleView({ schedules }: WeeklyScheduleViewProps) {
  // Group schedules by day of week
  const byDay = schedules.reduce<Record<number, StudentTrainingSchedule[]>>(
    (acc, schedule) => {
      const day = schedule.dayOfWeek
      if (!acc[day]) acc[day] = []
      acc[day].push(schedule)
      return acc
    },
    {},
  )

  // Sort days that have schedules
  const activeDays = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className="space-y-2" data-testid="weekly-schedule-view">
      {activeDays.map((day) => (
        <Card key={day} data-testid="schedule-day-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-medium text-primary">
              {DAY_LABELS[day]}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-0">
            <div className="space-y-1.5">
              {byDay[day].map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between"
                  data-testid="schedule-item"
                >
                  <span className="text-sm">
                    {schedule.startTime} – {schedule.endTime}
                  </span>
                  {schedule.location && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{schedule.location}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
