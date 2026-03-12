import { ApiProperty } from "@nestjs/swagger";
import { TrainingSessionDTO } from "../../../shared/dtos/training-session.dto";

export class CalendarSessionDTO extends TrainingSessionDTO {
  @ApiProperty({ description: "Nome completo do aluno" })
  studentName: string;
}
