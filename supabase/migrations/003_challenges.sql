-- Phase 5 challenge completion. This is a practice marker, NOT secure grading.
create table if not exists public.challenge_progress (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.students(id) on delete cascade,
 challenge_id text not null check(length(challenge_id) between 1 and 80),
 completed_at timestamptz not null default now(),
 unique(student_id,challenge_id)
);
create index if not exists challenge_progress_student_idx on public.challenge_progress(student_id);
alter table public.challenge_progress enable row level security;
create policy "students_read_challenges" on public.challenge_progress for select to authenticated
using(exists(select 1 from public.students s where s.id=student_id and s.profile_id=auth.uid()));
create policy "teachers_read_challenges" on public.challenge_progress for select to authenticated
using(exists(select 1 from public.students s join public.teachers t on t.id=s.teacher_id where s.id=student_id and t.profile_id=auth.uid()));
create policy "students_save_challenges" on public.challenge_progress for insert to authenticated
with check(exists(select 1 from public.students s join public.student_access a on a.student_id=s.id where s.id=student_id and s.profile_id=auth.uid() and a.status='active' and a.starts_at<=now() and a.expires_at>now()));
