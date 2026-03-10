import { Module } from "@nestjs/common";

import { ExercisesRepository } from "@shared/repositories/exercises.repository";

import { ListExercisesController } from "./exercises/list-exercises/list-exercises.controller";
import { ListExercisesService } from "./exercises/list-exercises/list-exercises.service";
import { CreateExerciseController } from "./exercises/create-exercise/create-exercise.controller";
import { CreateExerciseService } from "./exercises/create-exercise/create-exercise.service";
import { DeleteExerciseController } from "./exercises/delete-exercise/delete-exercise.controller";
import { DeleteExerciseService } from "./exercises/delete-exercise/delete-exercise.service";
import { UpdateYoutubeUrlController } from "./exercises/update-youtube-url/update-youtube-url.controller";
import { UpdateYoutubeUrlService } from "./exercises/update-youtube-url/update-youtube-url.service";

@Module({
  controllers: [
    ListExercisesController,
    CreateExerciseController,
    DeleteExerciseController,
    UpdateYoutubeUrlController,
  ],
  providers: [
    ListExercisesService,
    CreateExerciseService,
    DeleteExerciseService,
    UpdateYoutubeUrlService,
    ExercisesRepository,
  ],
})
export class WorkoutsModule {}
