export class StudentItemDTO {
  id: string;
  userId: string;
  personalId: string;
  servicePlanId: string;
  servicePlanName: string | null;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
}

export class ListStudentsResponseDTO {
  content: StudentItemDTO[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
