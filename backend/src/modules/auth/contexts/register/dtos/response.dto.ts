import { ApiProperty } from "@nestjs/swagger";

class UserDTO {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() role: string;
}

class PersonalDTO {
  @ApiProperty() id: string;
  @ApiProperty() slug: string;
}

export class RegisterResponseDTO {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserDTO })
  user: UserDTO;

  @ApiProperty({ type: PersonalDTO })
  personal: PersonalDTO;
}
