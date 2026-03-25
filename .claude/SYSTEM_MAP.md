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
Responsible for calendar management, working hours, recurring slots, and calendar events.

Entities:
- WorkingHours (coach availability windows with versioning)
- RecurringSlot (recurring bookings or blocks with versioning)
- CalendarEvent (one-off events, overrides, and blocks)

Shared utilities:
- calendarPipeline.util.ts (expands recurring slots + applies overrides)
- availabilityComputation.util.ts (working hours - occupied = free slots)
- conflictDetectionV2.util.ts (overlap detection with soft model)

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

The scheduling system uses 3 tables as a single source of truth.

WorkingHours (coach availability windows)
↓
RecurringSlots (recurring bookings or blocks)
↓
CalendarEvents (one-off events, overrides, blocks)

Calendar pipeline (on-demand generation):
1. Expand recurring_slots by dayOfWeek within date range (respecting effectiveFrom/To)
2. Apply override events (replace or cancel specific occurrences via recurringSlotId + originalStartAt)
3. Add one_off and block events
4. Sort by startAt

Availability computation:
1. Expand working_hours by dayOfWeek within date range
2. Subtract: recurring_slots + calendar_events
3. Return free windows

Conflict detection model (SOFT):
- Checks overlap with existing calendar entries + outside working_hours
- Conflicts are warnings — coach can override with forceCreate: true

Business rules:

- CalendarEvents may be online (meetingUrl required) or presential (location required)
- RecurringSlots are deactivated when linked program finishes or is cancelled
- Calendar view is generated on-demand from recurring_slots + calendar_events

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

## Working Hours

### Create Working Hours

Coach defines availability window
↓
POST /v1/working-hours
↓
WorkingHours created (dayOfWeek + startTime/endTime + effectiveFrom)

### Bulk Create Working Hours

Coach defines multiple availability windows at once (onboarding wizard)
↓
POST /v1/working-hours/bulk
↓
Validates each item, detects overlaps (existing DB + intra-batch)
↓
Returns { created: [], errors: [] }

### Update Working Hours

Coach updates availability window (versioned: sets effectiveTo on old, creates new)
↓
PATCH /v1/working-hours/:id

### Delete Working Hours

Coach removes availability window (sets effectiveTo = today)
↓
DELETE /v1/working-hours/:id

---

## Recurring Slots

### Create Recurring Slot

Coach creates recurring booking or block
↓
POST /v1/recurring-slots
↓
RecurringSlot created (type=booking with studentId, or type=block)
↓
Conflict detection runs (soft model)

### List Recurring Slots

Coach views recurring slots
↓
GET /v1/recurring-slots?studentId=

### Update Recurring Slot

Coach updates recurring slot (versioned)
↓
PATCH /v1/recurring-slots/:id

### Delete Recurring Slot

Coach removes recurring slot
↓
DELETE /v1/recurring-slots/:id

### Auto-Deactivate Recurring Slots

Student program status changes to finished or cancelled
↓
PATCH /student-programs/{id}/status
↓
All recurring slots linked to that program are deactivated (effectiveTo = today, isActive = false)

### Student Views Recurring Slots

Student views their recurring training schedule
↓
GET /v1/me/recurring-slots

---

## Calendar Events

### Create Event

Coach creates one-off event, override, or block
↓
POST /v1/events
↓
type: one_off | override | block
↓
For overrides: recurringSlotId + originalStartAt to replace specific occurrence
↓
Conflict detection runs (soft model)

### Update Event

Coach updates event details
↓
PATCH /v1/events/:id

### Cancel Event

Coach cancels event
↓
PATCH /v1/events/:id/cancel
↓
Status set to cancelled, cancelledAt + cancellationReason recorded

### Complete Event

Coach marks event as completed
↓
PATCH /v1/events/:id/complete

### Student Views Events

Student views their events
↓
GET /v1/me/events

---

## Calendar

### Get Calendar

Coach views unified calendar (generated on-demand)
↓
GET /v2/calendar?start=&end=
↓
Pipeline: expand recurring_slots + apply overrides + add one_off/block events
↓
Sorted by startAt

### Get Availability

Coach or public page views free time slots
↓
GET /v2/availability?start=&end=
↓
Computation: expand working_hours - (recurring_slots + calendar_events) = free windows

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

## Get Progress Chart Data (Coach)

Coach selects metric type on student progress page
↓
GET /students/{studentId}/progress-records/chart?metricType=weight&startDate=&endDate=
↓
metricType is optional — when omitted, returns all metrics with metricType field
↓
Returns unpaginated array sorted by recordedAt ASC: [{ recordedAt, value, unit, metricType? }]
↓
Frontend renders: single metric → LineChart, all metrics → CombinedProgressChart (mini-charts stacked)

---

## Get Progress Chart Data (Student)

Student selects metric type on their progress page
↓
GET /me/progress-records/chart?metricType=weight
↓
metricType is optional — when omitted, returns all metrics
↓
Uses profileId from JWT as studentId
↓
Returns same format as coach endpoint

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

## Save LP Draft

Coach saves LP content as draft (page not affected)
↓
PUT /profile/lp-draft
↓
Data stored in lpDraftData column only

---

## Publish LP Draft

Coach publishes draft to live page
↓
POST /profile/lp/publish
↓
lpDraftData copied to lp* columns
↓
lpDraftData set to null

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

# Admin Flows

## Get Dashboard Stats

Admin views platform stats
↓
GET /admin/stats
↓
Returns: totalCoaches, payingCoaches, newThisMonth, totalStudents, whitelistedCoaches

---

## List Plans (Admin)

Admin views all plans including inactive
↓
GET /admin/plans
↓
Returns all plans ordered by order field

---

## Create / Update / Delete Plan (Admin)

Admin manages SaaS plans
↓
POST /admin/plans | PUT /admin/plans/:id | DELETE /admin/plans/:id
↓
Delete is soft (isActive = false)

---

## Manage Whitelist

Admin adds/removes coaches from whitelist
↓
POST /admin/whitelist/:personalId | DELETE /admin/whitelist/:personalId
↓
Sets personal.isWhitelisted = true/false

---

## Manage Admins

Admin creates/deletes other admins
↓
POST /admin/admins | DELETE /admin/admins/:id
↓
Cannot delete own account

---

## List Tenants (Admin)

Admin views all coaches with pagination and search
↓
GET /admin/tenants?page&size&search
↓
Returns paginated list

---

## Get Tenant (Admin)

Admin views tenant details
↓
GET /admin/tenants/:id
↓
Returns full tenant detail with subscription info

---

## Update Tenant Status (Admin)

Admin changes tenant access status
↓
PATCH /admin/tenants/:id/status
↓
Updates personal.accessStatus

---

# Business Rules

- All timestamps must be stored in UTC
- Student limit enforcement: check plan.maxStudents when creating or inviting students
- Cross-tenant data access is strictly forbidden
- Every database query must filter by tenantId