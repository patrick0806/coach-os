import { CalendarClock } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/services/bookings.service";

interface NextSessionCardProps {
  booking: Booking;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function NextSessionCard({ booking }: NextSessionCardProps) {
  return (
    <Card className="border-primary/30 bg-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="size-4 text-primary" />
          Próxima sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm">
        <p className="font-medium text-foreground">{booking.servicePlanName}</p>
        <p className="text-muted-foreground">{formatDate(booking.scheduledDate)}</p>
        <p className="text-muted-foreground">
          {booking.startTime} - {booking.endTime}
        </p>
      </CardContent>
    </Card>
  );
}
