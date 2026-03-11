import { Injectable, NotFoundException } from "@nestjs/common";

import { IAccessToken } from "@shared/interfaces";
import { BookingsRepository, PaginatedBookings } from "@shared/repositories/bookings.repository";
import { StudentsRepository } from "@shared/repositories/students.repository";

@Injectable()
export class GetStudentBookingsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly bookingsRepository: BookingsRepository,
  ) {}

  async execute(
    studentId: string,
    currentUser: IAccessToken,
  ): Promise<PaginatedBookings> {
    const personalId = currentUser.personalId as string;
    const student = await this.studentsRepository.findById(studentId, personalId);

    if (!student) {
      throw new NotFoundException("Aluno não encontrado");
    }

    return this.bookingsRepository.findByStudent(studentId, personalId, {
      page: 1,
      size: 100,
    });
  }
}
