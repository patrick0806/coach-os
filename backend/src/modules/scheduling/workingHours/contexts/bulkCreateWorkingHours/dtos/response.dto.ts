import { ApiProperty } from "@nestjs/swagger";

import { CreateWorkingHoursResponseDTO } from "../../createWorkingHours/dtos/response.dto";

class BulkCreateErrorDTO {
  @ApiProperty({ example: 0 })
  index: number;

  @ApiProperty({ example: "Overlaps with existing working hours" })
  message: string;
}

export class BulkCreateWorkingHoursResponseDTO {
  @ApiProperty({ type: [CreateWorkingHoursResponseDTO] })
  created: CreateWorkingHoursResponseDTO[];

  @ApiProperty({ type: [BulkCreateErrorDTO] })
  errors: BulkCreateErrorDTO[];
}
