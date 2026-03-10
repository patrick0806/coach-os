export class CreateStudentResponseDTO {
  studentId: string;
  userId: string;
  name: string;
  email: string;
  personalId: string;
  servicePlanId: string;
  servicePlanName: string | null;
  createdAt: Date;
}
