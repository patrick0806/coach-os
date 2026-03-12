import { ApiProperty } from "@nestjs/swagger";

export class TimeSlotDTO {
  @ApiProperty({ example: "07:00" })
  startTime: string;

  @ApiProperty({ example: "08:00" })
  endTime: string;
}

export class AvailableSlotsResponseDTO {
  @ApiProperty({ type: [TimeSlotDTO], description: "Slots livres para novos alunos" })
  freeSlots: TimeSlotDTO[];

  @ApiProperty({ type: [TimeSlotDTO], description: "Slots já ocupados com treinos" })
  occupiedSlots: TimeSlotDTO[];
}
