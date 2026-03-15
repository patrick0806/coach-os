# DOMAIN_MAP.md --- Coach OS

This document describes the core domain entities and relationships of
the Coach OS platform.

Coach OS is a **multi-tenant SaaS platform** that allows coaches to
manage students, training programs, appointments, and online consulting
services.

------------------------------------------------------------------------

# Core Actors

## Plan

Represents a SaaS plan.

**Attributes:**

-   name
-   price
-   features
-   limitOfStudents
-   hasTrial
-   highlighted

------------------------------------------------------------------------

## Tenant

Represents an isolated workspace.

All platform data belongs to a tenant.

Tenant isolation must always be enforced.

Each tenant has a subscription.

------------------------------------------------------------------------

## Subscription

Represents the SaaS billing plan used by a tenant.

Managed through Stripe.

**Attributes:**

-   tenantId
-   planId
-   status
-   startedAt
-   expiresAt

Defines limits such as:

-   number of students

------------------------------------------------------------------------

## Admin

Represents the platform administrator.

**Capabilities:**

-   manage tenants
-   manage subscriptions
-   manage coaches
-   manage billing
-   manage platform configuration

------------------------------------------------------------------------

# Users

## Coach

Represents a professional using the platform.

**Capabilities:**

-   manage students
-   create training program templates
-   assign programs to students
-   manage appointments
-   define availability
-   create service plans
-   create notes about students
-   upload student progress photos
-   manage public profile page
-   create private exercises

Each coach belongs to a tenant.

------------------------------------------------------------------------

## Student

Represents a client using the platform.

**Capabilities:**

-   access assigned training programs
-   execute workouts
-   track progress
-   request appointments
-   cancel appointments

Students belong to a tenant.

Students may have relationships with one or more coaches.

------------------------------------------------------------------------

## CoachStudentRelation

Represents the professional relationship between a coach and a student.

**Attributes:**

-   coachId
-   studentId
-   status
-   startDate
-   endDate

Used to support:

-   coach changes
-   service relationships
-   historical tracking

------------------------------------------------------------------------

# Training System

The training system separates reusable templates from student-specific
programs.

------------------------------------------------------------------------

## Exercise

Represents an exercise in the exercise library.

**Attributes:**

-   name
-   description
-   muscleGroups
-   instructions
-   media (image or video)

Exercises can be:

-   global exercises (created by the platform)
-   private exercises (created by a coach)

**Business rules:**

-   private exercises are visible only to the coach who created them
-   global exercises are visible to all coaches

------------------------------------------------------------------------

## ProgramTemplate

Reusable training program created by a coach.

Defines the structure of workouts and exercises.

Contains:

-   workout templates
-   progression logic

------------------------------------------------------------------------

## WorkoutTemplate

Represents a workout inside a program template.

**Attributes:**

-   programTemplateId
-   name
-   order

Contains:

-   exercise templates

------------------------------------------------------------------------

## ExerciseTemplate

Represents an exercise configuration inside a workout template.

Defines default parameters such as:

-   sets
-   repetitions
-   rest time
-   duration

------------------------------------------------------------------------

# Student Training Programs

## StudentProgram

Represents a program assigned to a student.

Created from a program template but becomes independent.

Each student program can be customized individually.

**Attributes:**

-   studentId
-   programTemplateId
-   status
-   startedAt

Contains:

-   workout days

------------------------------------------------------------------------

## WorkoutDay

Represents a day of training inside a student program.

Example:

    Workout A
    Workout B
    Workout C

**Attributes:**

-   studentProgramId
-   name
-   order
-   description

Contains:

-   student exercises

------------------------------------------------------------------------

## StudentExercise

Represents an exercise assigned to a student.

Attributes may differ from the template.

Examples:

-   plannedWeight
-   repetitions
-   rest time
-   duration

------------------------------------------------------------------------

# Workout Execution

## WorkoutSession

Represents a workout session executed by a student.

**Attributes:**

-   studentId
-   workoutDayId
-   startedAt
-   finishedAt
-   status

**States:**

-   started
-   paused
-   finished
-   skipped

------------------------------------------------------------------------

## ExerciseExecution

Represents an exercise performed during a workout session.

Tracks the real execution of the exercise.

**Attributes:**

-   workoutSessionId
-   exerciseId

------------------------------------------------------------------------

## ExerciseSet

Represents the execution of a set during an exercise.

**Attributes:**

-   setNumber
-   plannedReps
-   performedReps
-   plannedWeight
-   usedWeight
-   restSeconds
-   completionStatus

------------------------------------------------------------------------

# Student Progress Tracking

## ProgressRecord

Represents a measurable progress record for a student.

Examples:

-   weight
-   body fat
-   waist measurement
-   chest measurement

**Attributes:**

-   studentId
-   metricType
-   value
-   unit
-   recordedAt
-   notes

------------------------------------------------------------------------

## ProgressPhoto

Photos uploaded to track student progress.

**Attributes:**

-   studentId
-   mediaUrl
-   createdAt

Photos are ordered chronologically.

------------------------------------------------------------------------

# Scheduling System

## AvailabilityRule

Represents recurring availability for a coach.

Examples:

-   Monday 08:00--12:00
-   Wednesday 14:00--18:00

------------------------------------------------------------------------

## AvailabilityException

Represents a date when the coach is not available.

Examples:

-   vacation
-   holidays
-   blocked schedule

------------------------------------------------------------------------

## AppointmentRequest

Represents a request created by a student for an appointment.

**Attributes:**

-   studentId
-   coachId
-   requestedTime
-   status

Used when students request sessions with the coach.

------------------------------------------------------------------------

## Appointment

Represents a confirmed meeting between coach and student.

**Attributes:**

-   startAt
-   endAt
-   type (online or presential)
-   status

Online appointments include:

-   meetingUrl

Presential appointments include:

-   location

**Business rule:**

Coaches cannot have overlapping appointments.

------------------------------------------------------------------------

# Coaching Services

## ServicePlan

Represents a service offered by a coach.

**Attributes:**

-   attendanceType (online or presential)
-   sessionsPerWeek
-   price

Examples:

-   Online consulting
-   In-person training

------------------------------------------------------------------------

## CoachingContract

Represents a service agreement between coach and student.

**Attributes:**

-   coachId
-   studentId
-   servicePlanId
-   startDate
-   endDate

Used to track:

-   active coaching services
-   billing cycles
-   service limits

------------------------------------------------------------------------

# Student Tracking

## Note

Notes created by a coach about a student.

Used for:

-   observations
-   training strategy
-   injury history
-   behavior tracking

Notes are ordered chronologically.

------------------------------------------------------------------------

# Entity Relationships

    Tenant
     ├ Coaches
     ├ Students
     └ Data isolation boundary

    Coach
     ├ CoachStudentRelations
     ├ ProgramTemplates
     ├ Exercises (private)
     ├ AvailabilityRules
     ├ Appointments
     └ ServicePlans

    Student
     ├ StudentPrograms
     ├ WorkoutSessions
     ├ ProgressRecords
     ├ ProgressPhotos
     ├ AppointmentRequests
     └ Notes

    ProgramTemplate
     └ WorkoutTemplates
          └ ExerciseTemplates

    StudentProgram
     └ WorkoutDays
          └ StudentExercises

    WorkoutSession
     └ ExerciseExecutions
          └ ExerciseSets

------------------------------------------------------------------------

# Domain Rules

-   A student program is independent from the template used to create
    it.
-   A coach cannot have overlapping appointments.
-   Private exercises are visible only to their creator.
-   Students may have historical relationships with multiple coaches.
