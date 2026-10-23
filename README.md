# Sparkora Code Lab — Kids Edition 🌈

**Palette:** Green, Blue, Teal, Soft Pink.

This is a full source-code project for Grades 1–8, with a playful multi-page interface, Python playground, teacher/student areas, Supabase SQL and student-access renewal flow.

**Setup:** `npm install` then copy `.env.example` to `.env` and enter your Supabase credentials. Apply `supabase/migrations/001_initial.sql` and deploy the `create-student` Edge Function, then run `npm run dev`.

**Note:** This is a starter/MVP. Teacher account provisioning, Supabase setup and production security review are required. It has not been fully integration-tested against a live Supabase instance.

# Sparkora Code Lab — Grades 1–8

A multi-page React + TypeScript + Vite coding platform with a teacher portal, student portal, Python playground, and Supabase-backed time-limited access.

## Quick start

1. Install Node.js 20+.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and enter your Supabase project URL and public anon key.
4. Create a Supabase project and execute `supabase/migrations/001_initial.sql` in the SQL editor.
5. Deploy the `create-student` Edge Function using Supabase CLI: `supabase functions deploy create-student` (leave JWT verification **enabled**). Service-role secrets must only be present on the Supabase server.
6. Provision a teacher using the procedure below.
7. Run `npm run dev` and open http://localhost:5173.

## Provision the first teacher

There is deliberately **no public teacher sign-up**. In Supabase Dashboard > Authentication > Users, create a teacher email/password user. Copy their UUID, then run in SQL editor (replace UUID/name/username):

```sql
insert into public.profiles(id,full_name,username,role)
values ('TEACHER_AUTH_USER_UUID','Sparkora Teacher','teacher01','teacher');
insert into public.teachers(profile_id) values ('TEACHER_AUTH_USER_UUID');
```

Log in with the teacher's email and password. Add student accounts from Teacher > Add Student. Students log in using their **email and password**, not their username. Student usernames are displayed for teacher administration.

## Features

- Minimal landing page, Courses and About pages.
- Teacher overview, student list, account creation, suspend/revoke/renew, renewal approvals.
- Student dashboard, expiry status and renewal request.
- Python Playground: Pyodide Web Worker, run/reset, line-based beginner explanations.
- Grade 1–8 course cards and curriculum database schema.
- Role-checked routes and database Row Level Security policies.

## Important limitations / production notes

- This is a **starter MVP**, not an audited production SaaS. Set up a real Supabase project, verify all RLS policies and flows, and test security before enrolling children.
- The browser-side access guard is for UX. Database records and renewal operations are server-enforced, but the downloaded JavaScript/Pyodide runtime cannot be technically revoked once cached on a user's device. For stronger restrictions, move protected resources and execution behind a backend.
- Code explanation is **line-based rule logic**, not a complete Python token parser. No external AI API is used.
- Course catalog is grade-organized; detailed lesson authoring and progress tracking UI are not yet implemented.
- There is no automatic billing/payment processing. Teachers renew access manually.
- Pyodide loads from a public CDN; first load requires internet. The worker uses a 12-second timeout that restarts the worker for long-running programs.
- Supabase RLS protects student access records, but the browser cannot instantly force-log-out on expiration without a periodic server refresh. Protect all future paid backend APIs with `has_active_access()` and verify expiry server-side.
- Add parental consent, data minimization, privacy policies and appropriate child-safety controls before collecting real children's information.
- Consider rate limiting and CAPTCHA on account endpoints, stronger auditing, CSP, deployment monitoring, and transactional account creation before production.

## Deployment

Deploy the Vite frontend to Vercel. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables. Configure allowed URLs in Supabase Auth. **Never** put `SUPABASE_SERVICE_ROLE_KEY` in Vite/Vercel client environment variables.

## What's new in this expanded edition
- Twelve ready-to-use coding missions across Grades 1–8, in a dedicated Lessons page.
- Lesson selection and copy-to-playground workflow.
- Student playground explanations now receive the student's actual grade rather than a hardcoded default.
- Green, blue, teal, and soft pink child-friendly styling.

## Honest completion status
This is a substantial **source-code MVP**, not a fully production-certified product. Lessons are bundled in frontend code and are not yet a teacher-authored CMS. Authentication, account creation, renewals and teacher permissions require your own Supabase deployment. Build/integration testing against Supabase has not been completed here. Browser-side Pyodide cannot be made fully inaccessible to a determined user who already downloaded it.


## Phase 2 update (October 2026)
- Refreshes authenticated profile/access from Supabase every 30 seconds while the tab is visible, and on window focus. This makes teacher suspensions and renewals visible without a manual refresh.
- Protects the detailed Lessons route behind sign-in and student access checks.
- Corrects bundled lesson code examples to contain real newline characters rather than literal `\\n`.
- Keeps the existing database-backed student creation and teacher renewal functions.

### End-to-end verification checklist (requires your own Supabase project)
1. Apply `supabase/migrations/001_initial.sql` once to a **new** Supabase project. Do not reapply it blindly to an existing populated database.
2. Deploy the `create-student` Edge Function with JWT verification enabled.
3. Provision the first teacher following the instructions above.
4. Sign in as teacher, add a student with a unique email, and set 7 days.
5. In a private browser window, sign in as that student and verify grade-specific lessons and Python Playground.
6. Suspend student in teacher window; within ~30 seconds the student should be redirected to Access Expired on their next navigation.
7. From the student window, request renewal; approve from the teacher portal.
8. Verify the student regains access after refreshing/focusing the student tab.
9. Try changing `student_access` directly using the student session; RLS must reject the update.
10. Verify students cannot access `/teacher` and other students' data.

**Not a substitute for security review:** In-browser Python execution is inherently downloadable; a cached Pyodide runtime cannot be fully revoked. Real paid execution restrictions require server-side execution. Live Supabase integration testing was not possible without project credentials.

## Phase 3 — Teacher classroom operations
- Teacher Students page now has status filtering (active, expired, suspended, revoked).
- Download student roster as a CSV for offline classroom administration.
- Spreadsheet formula-injection precautions are applied to exported CSV cells.
- Access shown as expired when the timestamp has passed, even if the stored status still says active.

### Before real-world use
Run `npm install && npm run build`, deploy your own Supabase database and Edge Function, and test role policies. No live Supabase credentials were available during packaging. Never publish CSV exports containing student information.


## Phase 4 — Learning Progress & Stars
- Student can mark each grade-appropriate coding mission complete and earn one star.
- Progress persists in Supabase `student_progress` (one record per student and mission).
- Student dashboard shows stars out of three grade-level missions.
- Teacher `/teacher/progress` lists completion counts for assigned students.
- Run `supabase/migrations/002_learning_progress.sql` **after** `001_initial.sql`.
- Progress tracking is self-reported (Mark Mission Complete); it does **not** validate Python output.
- This is an MVP: there is no independent code-submission grading or reward redemption.
- Supabase project and deployment are required; end-to-end live database tests are not verified.


## Phase 5 — Interactive Python Challenges
- 8 grade-grouped coding missions across Grades 1–8.
- Run and check code with the existing Pyodide Web Worker.
- Output comparison, hints, reset button, coding stars and saved completions.
- Run `supabase/migrations/003_challenges.sql` after earlier migrations.
- The output checker is **client-side practice feedback**, not secure automatic grading: a student could bypass the browser checker. Do not use it for exams or verified assessment.
- Daily streaks and teacher challenge analytics are **not implemented yet**.
- The ZIP has not been verified against a live Supabase deployment.
