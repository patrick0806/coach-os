import { ApiProperty } from "@nestjs/swagger";

export class GenerateInviteLinkResponseDTO {
  @ApiProperty({ example: "http://localhost:3000/accept-invite?token=abc123" })
  inviteLink: string;
}
