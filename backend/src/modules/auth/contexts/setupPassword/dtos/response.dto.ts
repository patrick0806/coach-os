import { ApiProperty } from "@nestjs/swagger";

export class SetupPasswordResponseDTO {
  @ApiProperty({ example: "Password set successfully" })
  message: string;
}
