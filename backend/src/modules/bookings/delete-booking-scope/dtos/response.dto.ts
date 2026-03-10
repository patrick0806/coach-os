import { ApiProperty } from "@nestjs/swagger";

export class DeleteBookingScopeResponseDTO {
  @ApiProperty({ enum: ["single", "future", "all"] })
  scope: "single" | "future" | "all";

  @ApiProperty({ example: 1 })
  cancelledBookings: number;

  @ApiProperty({ example: false })
  seriesCancelled: boolean;
}
