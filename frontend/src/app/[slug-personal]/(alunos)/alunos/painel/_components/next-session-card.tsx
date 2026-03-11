import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Booking } from "@/services/bookings.service";

interface NextSessionCardProps {
  booking: Booking;
  slug: string;
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function NextSessionCard({ booking, slug }: NextSessionCardProps) {
  return (
    <Card variant="premium" className="premium-highlight text-primary-foreground">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-primary-foreground">
          <CalendarClock className="size-4 text-primary-foreground/80" />
          Próxima sessão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="space-y-1.5">
          <p className="text-lg font-semibold text-primary-foreground">{booking.servicePlanName}</p>
          <p className="text-primary-foreground/80">{formatDate(booking.scheduledDate)}</p>
          <p className="text-primary-foreground/80">
            {booking.startTime} - {booking.endTime}
          </p>
        </div>
        <Button
          asChild
          variant="premium-ghost"
          className="w-full border-white/20 bg-white/12 text-primary-foreground hover:bg-white/18 hover:text-primary-foreground"
        >
          <Link href={`/${slug}/alunos/agenda`}>
            Ver agenda
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
