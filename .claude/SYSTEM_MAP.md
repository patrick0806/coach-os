# SYSTEM_MAP.md — Coach OS

This document describes the system architecture and the main system flows.

The purpose of this document is to help AI agents understand how the system
is structured before modifying or implementing new features.

---

# System Overview

Coach OS is a multi-tenant SaaS platform designed for coaches to manage:

- students
- training programs
- appointments
- online coaching services

Each coach has access to:

- a management dashboard
- a public professional page
- a student base
- customizable training programs

---

# High Level Architecture

Coach OS is composed of two main applications.

Frontend (Next.js)
↓
REST API
↓
Backend (NestJS)
↓
PostgreSQL database

External services:

- Stripe (billing)
- AWS S3 (media storage)
- Resend (emails)

---

# Backend Domain Contexts

The backend is divided into logical domains.

platform/
Responsible for SaaS and multi-tenant infrastructure.

Entities:
- Tenant
- User
- Subscription

training/
Responsible for training programs and workout tracking.

Entities:
- Exercise
- ProgramTemplate
- StudentProgram
- WorkoutSession

scheduling/
Responsible for appointment scheduling, availability management, and training schedule integration.

Entities:
- AvailabilityRule
- AvailabilityException
- TrainingSchedule
- Appointment
- AppointmentRequest

Shared utilities:
- conflictDetection.util.ts (pure function detecting 4 conflict types)

coaching/
Responsible for coach-student relationships.

Entities:
- CoachStudentRelation
- ServicePlan
- CoachingContract
- Notes
- ProgressPhotos

---

# Training Architecture

Training is separated into templates and student-specific programs.

Template Layer

ProgramTemplate
↓
WorkoutTemplate
↓
ExerciseTemplate

Student Layer

StudentProgram
↓
StudentWorkout
↓
StudentExercise

Execution Layer

WorkoutSession
↓
ExerciseExecution
↓
ExerciseSet

Important rule:

Student programs are snapshots of templates.

Once assigned, student programs must not change when templates change.

---

# Multi Tenant Model

The system is multi-tenant.

Each workspace is identified by:

tenantId

Mandatory rules:

- every database query must include tenantId filtering
- cross-tenant data access is strictly forbidden

---

# Scheduling Model

Coach availability is defined using recurring rules.

AvailabilityRule
↓
AvailabilityException
↓
TrainingSchedule (recurring presential training blocks)
↓
AppointmentRequest
↓
Appointment

Conflict detection model (SOFT):

When creating an appointment, the system checks for conflicts against:
1. Availability exceptions (blocked dates)
2. Availability rules (outside available hours)
3. Existing appointments (time overlap)
4. Training schedules (recurring training blocks)

Conflicts are warnings — coach can override with forceCreate: true.

Business rules:

- Appointments may be online (meetingUrl required) or presential (location required)
- Training schedules are deactivated when linked program finishes or is cancelled
- Calendar view merges appointments, training schedules, and exceptions into unified timeline

---

# Main System Flows

---

# Authentication

## User Registration

User selects plan
↓
Registration form submitted
↓
POST /auth/register
↓
Account created (User + Personal + Stripe customer)
↓
Stripe subscription created
↓
JWT + refresh token returned

---

## Login

User submits credentials
↓
POST /auth/login
↓
JWT returned
↓
Frontend stores session

---

## Request Password Reset

User submits email
↓
POST /auth/password-reset/request
↓
Previous tokens invalidated
↓
Token generated (hash stored, raw sent via email)
↓
Always returns 200 (anti-enumeration — no leak if email not found)

---

## Reset Password

User submits token + new password
↓
POST /auth/password-reset/confirm
↓
Token hash verified (exists, not expired, not used)
↓
Password updated with argon2id + pepper
↓
Token marked as used
↓
Refresh token invalidated (force re-login)

---

## Setup Password (invited users)

Student clicks invite link with token
↓
POST /auth/password-setup
↓
Token hash verified (exists, not expired, not used)
↓
Password set with argon2id + pepper
↓
Token marked as used

---

# Training Template Flows

## Create Program Template

Coach creates template
↓
POST /program-templates
↓
ProgramTemplate created

---

## Add Workout To Template

Coach adds workout
↓
POST /program-templates/{id}/workouts
↓
WorkoutTemplate created

---

## Add Exercise To Workout Template

Coach selects exercise
↓
POST /workout-templates/{id}/exercises
↓
ExerciseTemplate created

---

## Edit Program Template

Coach edits template
↓
PUT /program-templates/{id}
↓
Template updated

Important rule:

Updating templates must NOT affect existing student programs.

---

# Exercise Library

## Create Private Exercise

Coach creates custom exercise
↓
POST /exercises
↓
Exercise stored with createdByCoachId

Rule:

Private exercises are visible only to their creator.

---

# Student Training Flows

## Assign Program To Student

Coach assigns template
↓
POST /students/{id}/programs
↓
StudentProgram snapshot created

---

## Customize Student Workout

Coach edits student workout
↓
PUT /student-workouts/{id}
↓
StudentWorkout updated

---

## Customize Student Exercise

Coach adjusts parameters
↓
PUT /student-exercises/{id}
↓
Weight / reps / rest updated

---

# Workout Execution

## Start Workout

Student starts workout
↓
POST /workout-sessions
↓
WorkoutSession created

---

## Execute Exercise

Student performs exercise
↓
POST /exercise-executions
↓
ExerciseExecution created

---

## Record Exercise Set

Student completes set
↓
POST /exercise-sets
↓
ExerciseSet recorded

---

## Finish Workout

Student finishes workout
↓
PATCH /workout-sessions/{id}
↓
Session marked as finished

---

# Scheduling Flows

## Define Availability

Coach defines recurring schedule
↓
POST /availability-rules
↓
AvailabilityRule created (dayOfWeek + startTime/endTime)

---

## Update Availability

Coach updates availability rule
↓
PUT /availability-rules/{id}
↓
Rule updated (tenant isolation enforced)

---

## Delete Availability

Coach removes availability rule
↓
DELETE /availability-rules/{id}

---

## Block Date

Coach blocks a specific date
↓
POST /availability-exceptions
↓
AvailabilityException created (date + optional reason)

Rule: cannot block past dates.

---

## List Availability Exceptions

Coach views blocked dates
↓
GET /availability-exceptions?startDate&endDate
↓
Filtered by date range

---

## Delete Availability Exception

Coach unblocks a date
↓
DELETE /availability-exceptions/{id}

---

# Training Schedule Flows

## Create Training Schedule

Coach sets recurring training time for student
↓
POST /students/{studentId}/training-schedules
↓
TrainingSchedule created (dayOfWeek + startTime/endTime + optional location)
↓
Blocks coach calendar on that day/time

---

## List Training Schedules

Coach or student views training schedules
↓
GET /students/{studentId}/training-schedules
↓
Returns active schedules only

---

## Update Training Schedule

Coach updates training time
↓
PUT /training-schedules/{id}

---

## Delete Training Schedule

Coach removes training schedule
↓
DELETE /training-schedules/{id}

---

## Auto-Deactivate Training Schedules

Student program status changes to finished or cancelled
↓
PATCH /student-programs/{id}/status
↓
All training schedules linked to that program are deactivated

---

# Appointment Flows

## Coach Creates Appointment

Coach manually schedules appointment
↓
POST /appointments
↓
Conflict detection runs (checks availability rules, exceptions, existing appointments, training schedules)
↓
If conflicts found → returns conflict list (unless forceCreate: true)
↓
Appointment created with status "scheduled"

Rule: online type requires meetingUrl, presential requires location.

---

## List Appointments

Coach views appointments
↓
GET /appointments?startDate&endDate&status&studentId
↓
Paginated with filters

---

## Get Appointment

Coach or student views appointment details
↓
GET /appointments/{id}

---

## Cancel Appointment

Coach or student cancels appointment
↓
PATCH /appointments/{id}/cancel

---

## Complete Appointment

Coach marks appointment as completed
↓
PATCH /appointments/{id}/complete

---

## Request Appointment

Student requests appointment
↓
POST /appointment-requests
↓
AppointmentRequest created with status "pending"

---

## Approve Appointment Request

Coach approves request
↓
PATCH /appointment-requests/{id}/approve
↓
Conflict detection runs
↓
Request status updated to "approved"
↓
Appointment created automatically

---

## Reject Appointment Request

Coach rejects request
↓
PATCH /appointment-requests/{id}/reject
↓
Request status updated to "rejected"

---

# Calendar Flow

## Get Calendar

Coach views unified calendar
↓
GET /calendar?startDate&endDate
↓
Merges: appointments + training schedules (expanded by dayOfWeek) + availability exceptions
↓
Sorted by date and startTime

---

# Coaching Relationship Flows

## Create Coach-Student Relation

Coach invites student
↓
POST /coach-student-relations

---

## Create Service Plan

Coach defines service
↓
POST /service-plans

---

## Create Coaching Contract

Student subscribes to service
↓
POST /coaching-contracts

---

# Student Tracking

## Create Note

Coach records note
↓
POST /students/:studentId/notes

---

## Upload Progress Photo
Frontend requests upload URL
↓
Backend generates presigned URL
↓
Frontend uploads file directly to S3
↓
Frontend sends final file URL to backend
↓
Backend stores metadata

---

# Student Invitation Flows

## Invite Student By Email

Coach submits student email
↓
POST /students/invite
↓
Invitation token created (expires in 48h)
↓
Email sent via Resend with invite link

---

## Generate Shareable Invite Link

Coach requests link for WhatsApp sharing
↓
POST /students/invite-link
↓
Shareable link returned with embedded token

---

## Accept Student Invitation

Student clicks invite link
↓
POST /students/accept-invite
↓
Token validated (not expired, not used)
↓
User + Student created
↓
Coach-student relation established
↓
Token marked as used

Business rule:

Student limit must be checked against plan.maxStudents before accepting.

---

# Subscription Lifecycle Flows

## Stripe Webhook

Stripe sends event
↓
POST /webhooks/stripe
↓
Subscription status updated on personal record

Events handled:

- subscription.updated
- subscription.deleted
- invoice.paid

---

## Change Subscription Plan

Coach requests plan change
↓
PATCH /subscriptions/plan
↓
Stripe subscription updated
↓
Local subscription record updated

---

## Cancel Subscription

Coach cancels subscription
↓
POST /subscriptions/cancel
↓
Stripe subscription cancelled
↓
Local status updated

---

# Onboarding Flow

## Coach Onboarding

After registration
↓
Complete profile (bio, photo, specialties)
↓
Create first student
↓
Create first training program
↓
Invite student
↓
onboardingCompleted set to true

---

# Business Rules

- All timestamps must be stored in UTC
- Student limit enforcement: check plan.maxStudents when creating or inviting students
- Cross-tenant data access is strictly forbidden
- Every database query must filter by tenantId