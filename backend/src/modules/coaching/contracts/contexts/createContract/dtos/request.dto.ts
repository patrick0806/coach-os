import { ApiProperty } from "@nestjs/swagger";

export class CreateContractRequestDTO {
  @ApiProperty({ description: "Service plan ID to link to the student" })
  servicePlanId!: string;
}
