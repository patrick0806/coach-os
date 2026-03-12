import { ApiProperty } from "@nestjs/swagger";

export class TimeSlotDTO {
    @ApiProperty({ example: "08:00" })
    startTime: string;

    @ApiProperty({ example: "09:00" })
    endTime: string;
}

export class DayAvailabilityDTO {
    @ApiProperty({ example: 1, description: "Monday is 1, Sunday is 0" })
    dayOfWeek: number;

    @ApiProperty({ type: [TimeSlotDTO] })
    freeSlots: TimeSlotDTO[];

    @ApiProperty({ type: [TimeSlotDTO] })
    occupiedSlots: TimeSlotDTO[];
}

export class WeeklyAvailabilityResponseDTO {
    @ApiProperty({ type: [DayAvailabilityDTO] })
    days: DayAvailabilityDTO[];
}
