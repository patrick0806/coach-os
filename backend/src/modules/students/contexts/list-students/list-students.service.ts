import { Injectable } from "@nestjs/common";

import { StudentsRepository } from "@shared/repositories/students.repository";
import { IAccessToken } from "@shared/interfaces";

import { ListStudentsResponseDTO } from "./dtos/response.dto";

interface ListStudentsQuery {
  page: number;
  size: number;
  search?: string;
}

@Injectable()
export class ListStudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) {}

  async execute(
    currentUser: IAccessToken,
    query: ListStudentsQuery,
  ): Promise<ListStudentsResponseDTO> {
    return this.studentsRepository.findAll(currentUser.personalId, {
      page: query.page,
      size: query.size,
      search: query.search,
    });
  }
}
