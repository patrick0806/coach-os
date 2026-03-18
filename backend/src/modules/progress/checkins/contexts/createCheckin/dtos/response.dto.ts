import { ApiProperty } from "@nestjs/swagger";

class CheckinRecordDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  metricType: string;

  @ApiProperty()
  value: string;

  @ApiProperty()
  unit: string;

  @ApiProperty({ nullable: true })
  notes: string | null;
}

class CheckinPhotoDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  mediaUrl: string;

  @ApiProperty({ nullable: true })
  notes: string | null;
}

export class CheckinResponseDTO {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  studentId: string;

  @ApiProperty({ example: "2026-01-15" })
  checkinDate: string;

  @ApiProperty({ nullable: true })
  notes: string | null;

  @ApiProperty({ type: [CheckinRecordDTO] })
  records: CheckinRecordDTO[];

  @ApiProperty({ type: [CheckinPhotoDTO] })
  photos: CheckinPhotoDTO[];

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  updatedAt: Date | null;
}
