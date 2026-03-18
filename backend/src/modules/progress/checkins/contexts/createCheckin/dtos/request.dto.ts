import { ApiProperty } from "@nestjs/swagger";

class RecordInputDTO {
  @ApiProperty({ example: "weight" })
  metricType: string;

  @ApiProperty({ example: 80.5 })
  value: number;

  @ApiProperty({ example: "kg" })
  unit: string;

  @ApiProperty({ example: "After morning fast", required: false })
  notes?: string;
}

class PhotoInputDTO {
  @ApiProperty({ example: "https://bucket.s3.amazonaws.com/photo.jpg" })
  mediaUrl: string;

  @ApiProperty({ required: false })
  notes?: string;
}

export class CreateCheckinRequestDTO {
  @ApiProperty({ example: "2026-01-15" })
  checkinDate: string;

  @ApiProperty({ required: false })
  notes?: string;

  @ApiProperty({ type: [RecordInputDTO], default: [] })
  records: RecordInputDTO[];

  @ApiProperty({ type: [PhotoInputDTO], default: [] })
  photos: PhotoInputDTO[];
}
