# Bubble to Backend Parity Map

This map helps migration from Bubble object types to this repo's API/domain model.

## Public Bubble `api/1.1/meta` Types -> Nest Modules

| Bubble Type | Nest Module / Table Direction |
| --- | --- |
| `user` | `user-profiles` |
| `tutorrequestsdb` | `tutor-requests` |
| `courses_db` | `courses` |
| `bank_db` | `bank` |
| `bursary_names_db` | `bursary-names` |
| `school_names_db` | `school-names` |
| `tertiary_names_db` | `tertiary-names` |
| `tertiary_programmes_db` | `tertiary-programmes` |
| `tertiary_specializations_db` | `tertiary-specializations` |
| `tutor_courses_db` | primarily `courses` + tutor profile course lists (field mapping needed) |
| `school_syllabus_db` | syllabus fields handled in request/course/profile models (no standalone module) |

## Related Backend Modules (Parity Extensions)

These modules extend behavior beyond Bubble object exposure and are used by the Next dashboard:

- `bursary-students`
- `student-lessons`
- `student-progress`
- `invoices`
- `lessons`
- `analytics`
- `audit`
- `notifications`
- `tutor-job-notifications`
- `tutor-sessions-orders`
- `tutor-student-hours`

## Migration Guidance

1. Use Bubble exports as source data.
2. Keep Bubble IDs in a `legacy_id` column or import log table for traceability.
3. Transform field names from Bubble labels to backend DTO/entity names during import.
4. Validate counts per object before and after import.
