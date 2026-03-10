export interface GeneratedAvailabilitySlot {
  startTime: string;
  endTime: string;
}

export function generateAvailabilitySlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  breakStart?: string,
  breakEnd?: string,
): GeneratedAvailabilitySlot[] {
  const slots: GeneratedAvailabilitySlot[] = [];
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const pauseStart = breakStart ? timeToMinutes(breakStart) : null;
  const pauseEnd = breakEnd ? timeToMinutes(breakEnd) : null;

  let current = start;

  while (current + durationMinutes <= end) {
    const currentEnd = current + durationMinutes;

    if (pauseStart !== null && pauseEnd !== null && current < pauseEnd && currentEnd > pauseStart) {
      current = pauseEnd;
      continue;
    }

    slots.push({
      startTime: minutesToTime(current),
      endTime: minutesToTime(currentEnd),
    });

    current += durationMinutes;
  }

  return slots;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours * 60) + minutes;
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}`;
}
