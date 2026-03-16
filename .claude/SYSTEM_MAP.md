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
Responsible for appointment scheduling.

Entities:
- AvailabilityRule
- Appointment
- AppointmentRequest

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
AppointmentRequest
↓
Appointment

Business rule:

A coach cannot have overlapping appointments.

Appointments may be:

- online (meetingUrl required)
- presential (location required)

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

---

## Block Date

Coach blocks a specific date
↓
POST /availability-exceptions

---

## Request Appointment

Student requests appointment
↓
POST /appointment-requests

---

## Approve Appointment

Coach approves request
↓
Appointment created

---

## Coach Creates Appointment

Coach manually schedules appointment
↓
POST /appointments

---

## Cancel Appointment

Student or coach cancels appointment
↓
PATCH /appointments/{id}

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