import { ApiProperty } from "@nestjs/swagger";

export class ContactSupportResponseDTO {
  @ApiProperty({ example: "Sua mensagem foi enviada com sucesso." })
  message: string;
}
