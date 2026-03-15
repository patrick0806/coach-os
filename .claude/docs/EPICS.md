# EPICS.md — Coach OS

---

## 1. Authentication & Onboarding

**Description:**
User registration, login, password management, and guided first-use experience for new coaches.

**Includes:**
- Coach registration with plan selection
- Login and session management
- Password recovery and reset
- Onboarding wizard (complete profile, create first student, create first workout, invite student)

**Goal:**
Enable coaches to securely access the platform and get productive quickly through a guided setup flow.

---

## 2. SaaS Plans & Billing

**Description:**
Subscription management with tiered plans that define feature access and student limits.

**Includes:**
- Plan catalog (Basic, Pro, Elite)
- Subscription creation and management via Stripe
- Student limit enforcement per plan
- Plan upgrades and downgrades
- Trial period support

**Goal:**
Monetize the platform through recurring subscriptions while providing clear value tiers for different coach needs.

---

## 3. Platform Administration

**Description:**
Administrative capabilities for managing the platform, tenants, and global resources.

**Includes:**
- Tenant management
- Subscription oversight
- Coach account management
- Platform configuration
- Global exercise library management

**Goal:**
Give platform operators full visibility and control over the SaaS infrastructure and its tenants.

---

## 4. Student Management

**Description:**
Complete lifecycle management of students within a coach's workspace.

**Includes:**
- Create students manually
- Invite students via email or shareable link (WhatsApp compatible)
- Student profiles (name, email, phone, goals, restrictions, notes)
- Student status management (active, paused, archived)
- Coach-student relationship tracking with history

**Goal:**
Allow coaches to efficiently manage their client base and maintain organized student records.

---

## 5. Exercise Library

**Description:**
Centralized catalog of exercises available for building training programs.

**Includes:**
- Global exercises provided by the platform
- Private exercises created by individual coaches
- Exercise attributes (name, muscle groups, description, instructions)
- Media attachments (images and videos)
- Visibility rules (private exercises visible only to their creator)

**Goal:**
Provide coaches with a rich, extensible exercise catalog to build diverse training programs.

---

## 6. Training Program Templates

**Description:**
Reusable program structures that coaches can design, duplicate, and apply to students.

**Includes:**
- Program template creation and editing
- Workout templates within programs
- Exercise configuration within workouts (sets, reps, rest, duration)
- Template duplication
- Progression logic definition

**Goal:**
Enable coaches to build reusable training blueprints that save time when onboarding new students or cycling programs.

---

## 7. Student Training Programs

**Description:**
Individual training programs assigned to students, derived from templates but fully customizable.

**Includes:**
- Assign program template to a student (creates independent snapshot)
- Customize student exercises (weight, reps, rest, duration)
- Workout day organization (Workout A, B, C)
- Program status management (active, finished, cancelled)
- Template independence (changes to template do not affect assigned programs)

**Goal:**
Deliver personalized training plans to each student while preserving coach flexibility to adjust on a per-student basis.

---

## 8. Workout Execution

**Description:**
Real-time workout tracking allowing students to record their training sessions.

**Includes:**
- Start and finish workout sessions
- Record exercise sets (reps performed, weight used)
- Track completion status per exercise
- Session timing (total duration)
- Session states (started, paused, finished, skipped)

**Goal:**
Give students an interactive training experience and generate structured execution data for coach review.

---

## 9. Student Progress Tracking

**Description:**
Tools for monitoring and visualizing student evolution over time.

**Includes:**
- Record body metrics (weight, body fat, measurements)
- Upload progress photos
- Historical data visualization (graphs, timelines)
- Chronological photo ordering
- Coach notes and observations per student

**Goal:**
Provide coaches and students with clear, measurable evidence of training outcomes to improve motivation and retention.

---

## 10. Scheduling & Appointments

**Description:**
Appointment management system for both online and in-person coaching sessions.

**Includes:**
- Coach availability rules (recurring weekly schedule)
- Availability exceptions (vacations, holidays, blocked dates)
- Student appointment requests
- Coach appointment approval and manual creation
- Appointment types (online with meeting URL, in-person with location)
- Cancellation and rescheduling
- Overlap prevention for coaches

**Goal:**
Streamline session scheduling between coaches and students, eliminating back-and-forth communication.

---

## 11. Coaching Services & Contracts

**Description:**
Service plan definition and formal agreements between coaches and students.

**Includes:**
- Service plan creation (attendance type, sessions per week, price)
- Coaching contract management (start date, end date, billing cycle)
- Support for online and in-person service types
- Active service tracking and limits

**Goal:**
Formalize the coach-student business relationship and enable structured service offerings.

---

## 12. Student Portal

**Description:**
Dedicated access area for students to interact with their training, progress, and schedule.

**Includes:**
- Student login
- View current training program and exercises
- Execute workouts and record loads
- View progress history and graphs
- View scheduled appointments

**Goal:**
Empower students with self-service access to their training data, increasing engagement and reducing coach workload.

---

## 13. Coach Public Page & Branding

**Description:**
Public-facing professional page and basic white-label customization for coaches.

**Includes:**
- Public profile page (photo, bio, specialties, WhatsApp button)
- Custom URL per coach (app.com/personal/name)
- Logo and primary color customization
- Branding applied to student portal and public pages

**Goal:**
Help coaches project a professional image and attract new clients through a branded online presence.

---

## 14. Notifications

**Description:**
Automated communication to keep coaches and students informed and engaged.

**Includes:**
- Workout reminders
- Session reminders
- Missed workout alerts
- Email-based delivery (initial phase)

**Goal:**
Reduce no-shows and improve training consistency through timely, automated nudges.

---

# Epic Dependencies (suggested order)

```
1. Authentication & Onboarding
2. SaaS Plans & Billing
3. Platform Administration
4. Student Management
5. Exercise Library
6. Training Program Templates
7. Student Training Programs
8. Workout Execution
9. Student Progress Tracking
10. Scheduling & Appointments
11. Coaching Services & Contracts
12. Student Portal
13. Coach Public Page & Branding
14. Notifications
```

This ordering reflects the PRD roadmap phases and natural domain dependencies.
