# Reference Parity Checklist

This checklist consolidates required pages and systems from the reference projects provided by the user.

## Reference Sources

- `C:\Users\Heri\Downloads\123tutors-dashboard-backend-main\123tutors-dashboard-backend-main`
- `C:\Users\Heri\Downloads\123bursary-dashboard-main\123bursary-dashboard-main`
- `C:\Users\Heri\Downloads\jiffy-tutors-workflow`
- `C:\Users\Heri\Downloads\123tutors-dashboard-design`
- `C:\Users\Heri\Downloads\landingpage-123tutors-main\landingpage-123tutors-main`

## Backend Systems Required

Reference backend modules discovered:

- `admin`
- `analytics`
- `audit`
- `auth`
- `bank`
- `budget`
- `bursary-names`
- `bursary-students`
- `common`
- `config`
- `courses`
- `invoices`
- `lessons`
- `notifications`
- `promo-codes`
- `school-names`
- `student-lessons`
- `student-progress`
- `tertiary-names`
- `tertiary-programmes`
- `tertiary-specializations`
- `tutor-job-notifications`
- `tutor-requests`
- `tutor-sessions-orders`
- `tutor-student-hours`
- `user-profiles`

Status in current repo:

- Backend module parity is already present in `backend/src`.
- Bubble ETL scripts are present in `backend/scripts/bubble-migration`.
- Remaining blocker is final Supabase load connectivity (pooler-based DB connection required in this environment).

## Frontend Pages Required

### From `123bursary-dashboard-main`

- `/`
- `/onboarding`

### From `jiffy-tutors-workflow` (functional surface)

- `/`
- `/dashboard`
- `/student-dashboard`
- `/student-dashboard/analytics`
- `/student-dashboard/find-tutors`
- `/student-dashboard/my-tutors`
- `/student-dashboard/my-chats`
- `/student-dashboard/rewards`
- `/student-dashboard/my-account`
- `/student-dashboard/become-tutor`
- `/student-dashboard/whatsapp-tutor`
- `/tutor-signup`
- `/tutor-dashboard`
- `/tutor-dashboard/analytics`
- `/tutor-dashboard/courses`
- `/tutor-dashboard/my-students`
- `/tutor-dashboard/my-chats`
- `/tutor-dashboard/rewards`
- `/tutor-dashboard/payouts`
- `/tutor-dashboard/my-account`

### From `123tutors-dashboard-design`

- `/student`
- `/tutor`
- `/tutor/application`
- `/admin`
- `/bursary`
- `/bursary/onboarding`

### From legacy/landing references

- Public marketing-style landing content sections (hero, features, testimonials, how-it-works, bursaries, footer).
- Public request and signup flows.

## Current Migration Frontend Status (`web/`)

Implemented route scaffold:

- `/`
- `/request`
- `/login`
- `/signup/student-parent`
- `/signup/tutor`
- `/signup/bursary`
- `/dashboard`
- `/dashboard/student`
- `/dashboard/tutor`
- `/dashboard/admin`
- `/dashboard/bursary`
- `/dashboard/analytics`
- `/onboarding`

Modern UI shell implemented on:

- Home page
- Auth shell
- Request page
- Dashboard shell wrapper

## Remaining UI Parity Work

1. Add dedicated student and tutor dashboard sub-route trees (`student-dashboard/*`, `tutor-dashboard/*`) mapped to existing backend APIs.
2. Add design-reference alias routes (`/student`, `/tutor`, `/admin`, `/bursary`, `/bursary/onboarding`) with role-aware redirects.
3. Port landing-page sections (features/testimonials/how-it-works) into Next components under `web/components`.
4. Complete role-specific navigation models and guard rules.
5. Run end-to-end parity checks against live workflow behavior.

## Execution Priority

1. Finish Supabase data load (`bubble:load`) using a pooler connection string.
2. Implement student and tutor dashboard route groups.
3. Integrate landing-page public sections.
4. Perform role-by-role smoke tests and visual QA.

