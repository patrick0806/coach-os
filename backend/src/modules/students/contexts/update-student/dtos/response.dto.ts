export class UpdateStudentResponseDTO {
  id: string;
  userId: string;
  personalId: string;
  servicePlanId: string;
  servicePlanName: string | null;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
