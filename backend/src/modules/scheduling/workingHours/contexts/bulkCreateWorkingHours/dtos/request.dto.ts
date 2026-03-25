import { ApiProperty } from "@nestjs/swagger";
import { CreateWorkingHoursRequestDTO } from "../../createWorkingHours/dtos/request.dto";

export class BulkCreateWorkingHoursRequestDTO {
  @ApiProperty({
    type: [CreateWorkingHoursRequestDTO],
    description: "Array of working hours to create",
  })
  items: CreateWorkingHoursRequestDTO[];
}
