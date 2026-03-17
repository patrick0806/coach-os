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

**Attributes:**

-   logoUrl (white-label branding)
-   onboardingCompleted (tracks onboarding wizard completion)
-   specialties (displayed on public page)

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

**Attributes:**

-   status (`active` | `paused` | `archived`)
-   phoneNumber
-   goal
-   observations
-   physicalRestrictions

**Capabilities:**

-   access assigned training programs
-   execute workouts
-   track progress
-   request appointments
-   cancel appointments

Students belong to a tenant.

Students may have relationships with one or more coaches.

------------------------------------------------------------------------

## StudentInvitationToken

Represents a token used to invite a student to the platform.

**Attributes:**

-   tenantId
-   email
-   tokenHash
-   expiresAt
-   usedAt
-   createdAt

**Business rules:**

-   tokens expire after 48 hours
-   tokens are single-use (usedAt is set on acceptance)
-   tokenHash is stored instead of the raw token for security
-   only one active (unused, non-expired) token per email per tenant

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

**Attributes:**

-   tenantId
-   dayOfWeek (0=Sunday...6=Saturday)
-   startTime (HH:MM format)
-   endTime (HH:MM format)
-   isActive

Examples:

-   Monday 08:00--12:00
-   Wednesday 14:00--18:00

**Business rules:**

-   startTime must be before endTime
-   no overlapping rules on the same day

------------------------------------------------------------------------

## AvailabilityException

Represents a date when the coach is not available.

**Attributes:**

-   tenantId
-   date (YYYY-MM-DD)
-   reason (optional)

Examples:

-   vacation
-   holidays
-   blocked schedule

**Business rules:**

-   cannot create exceptions for past dates

------------------------------------------------------------------------

## TrainingSchedule

Represents a recurring presential training schedule for a student.

Bridges the training and scheduling domains — allows training schedules
to block coach availability without manual appointment creation.

**Attributes:**

-   tenantId
-   studentId
-   studentProgramId (optional, links to active program)
-   dayOfWeek (0=Sunday...6=Saturday)
-   startTime (HH:MM format)
-   endTime (HH:MM format)
-   location (optional)
-   isActive

**Business rules:**

-   deactivated automatically when linked student program is finished or cancelled
-   appears as blocking entries in conflict detection
-   expanded into calendar entries by dayOfWeek within date ranges

------------------------------------------------------------------------

## AppointmentRequest

Represents a request created by a student for an appointment.

**Attributes:**

-   tenantId
-   studentId
-   requestedStartAt (UTC timestamp)
-   requestedEndAt (UTC timestamp)
-   type (online or presential)
-   status (pending, approved, rejected)
-   notes (optional)

Used when students request sessions with the coach.

**Business rules:**

-   only pending requests can be approved or rejected
-   approving a request creates an appointment automatically

------------------------------------------------------------------------

## Appointment

Represents a confirmed meeting between coach and student.

**Attributes:**

-   tenantId
-   studentId
-   startAt (UTC timestamp)
-   endAt (UTC timestamp)
-   type (online or presential)
-   status (scheduled, completed, cancelled)

Online appointments include:

-   meetingUrl

Presential appointments include:

-   location

**Business rules:**

-   Conflict detection checks: existing appointments, training schedules, availability rules, and exceptions
-   Conflicts are SOFT — coach is warned but can override with forceCreate
-   Coaches cannot have overlapping appointments (unless forced)

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
     ├ AvailabilityExceptions
     ├ Appointments
     ├ TrainingSchedules
     ├ ServicePlans
     └ StudentInvitationTokens

    Student
     ├ StudentPrograms
     ├ WorkoutSessions
     ├ ProgressRecords
     ├ ProgressPhotos
     ├ TrainingSchedules
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
-   A coach cannot have overlapping appointments (soft conflict model — override with forceCreate).
-   Private exercises are visible only to their creator.
-   Students may have historical relationships with multiple coaches.
-   Training schedules are deactivated when their linked program is finished or cancelled.
-   Conflict detection checks availability rules, exceptions, appointments, and training schedules.
