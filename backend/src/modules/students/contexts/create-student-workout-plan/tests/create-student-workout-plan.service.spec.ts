import { BadRequestException, NotFoundException } from "@nestjs/common";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { CreateStudentWorkoutPlanService } from "../create-student-workout-plan.service";

describe("CreateStudentWorkoutPlanService", () => {
    let service: CreateStudentWorkoutPlanService;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let studentsRepository: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let workoutPlansRepository: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let workoutPlanStudentsRepository: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let drizzle: any;

    beforeEach(() => {
        studentsRepository = { findById: vi.fn() };
        workoutPlansRepository = { create: vi.fn() };
        workoutPlanStudentsRepository = { assign: vi.fn() };
        drizzle = {
            db: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                transaction: vi.fn().mockImplementation(async (cb: any) => cb("tx")),
            },
        };

        service = new CreateStudentWorkoutPlanService(
            studentsRepository,
            workoutPlansRepository,
            workoutPlanStudentsRepository,
            drizzle,
        );
    });

    describe("execute", () => {
        it("should create student workout plan successfully", async () => {
            studentsRepository.findById.mockResolvedValue({ id: "student-1", name: "John Doe" });
            workoutPlansRepository.create.mockResolvedValue({ id: "plan-1", name: "Treino A" });

            const result = await service.execute(
                "student-1",
                { name: "Treino A", description: "Foco hipertrofia" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { personalId: "personal-1" } as any,
            );

            expect(studentsRepository.findById).toHaveBeenCalledWith("student-1", "personal-1");
            expect(workoutPlansRepository.create).toHaveBeenCalledWith(
                {
                    personalId: "personal-1",
                    name: "Treino A",
                    description: "Foco hipertrofia",
                    planKind: "student",
                    sourceTemplateId: null,
                },
                "tx",
            );
            expect(workoutPlanStudentsRepository.assign).toHaveBeenCalledWith("plan-1", "student-1", "tx");
            expect(result).toMatchObject({ id: "plan-1", studentNames: ["John Doe"] });
        });

        it("should throw NotFoundException if student not found", async () => {
            studentsRepository.findById.mockResolvedValue(null);

            await expect(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                service.execute("student-1", { name: "A" }, { personalId: "p1" } as any),
            ).rejects.toThrow(NotFoundException);
        });

        it("should throw BadRequestException if name is invalid", async () => {
            await expect(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                service.execute("student-1", { name: "" }, { personalId: "p1" } as any),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
