import { ApiProperty } from "@nestjs/swagger";

export class CancelEventRequestDTO {
  @ApiProperty({ example: "Student requested cancellation", required: false })
  cancellationReason?: string;
}
