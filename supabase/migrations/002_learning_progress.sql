-- Phase 4: Grade-level lesson completion (3 missions per assigned grade).
create table if not exists public.student_progress (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.students(id) on delete cascade,
 lesson_key text not null check (length(lesson_key) between 1 and 160),
 completed_at timestamptz not null default now(),
 unique(student_id, lesson_key)
);
create index if not exists idx_student_progress_student on public.student_progress(student_id);
alter table public.student_progress enable row level security;

-- Students can only read their own progress; teachers can read assigned students.
create policy "students_read_own_progress" on public.student_progress for select to authenticated
 using (exists(select 1 from public.students s where s.id=student_id and s.profile_id=auth.uid()));
create policy "teachers_read_assigned_progress" on public.student_progress for select to authenticated
 using (exists(select 1 from public.students s join public.teachers t on t.id=s.teacher_id where s.id=student_id and t.profile_id=auth.uid()));
create policy "students_insert_own_progress" on public.student_progress for insert to authenticated
 with check (exists(select 1 from public.students s join public.student_access a on a.student_id=s.id
 where s.id=student_id and s.profile_id=auth.uid() and a.status='active' and a.starts_at<=now() and a.expires_at>now()));
create policy "students_update_own_progress" on public.student_progress for update to authenticated
 using (exists(select 1 from public.students s join public.student_access a on a.student_id=s.id
 where s.id=student_id and s.profile_id=auth.uid() and a.status='active' and a.starts_at<=now() and a.expires_at>now()))
 with check (exists(select 1 from public.students s join public.student_access a on a.student_id=s.id
 where s.id=student_id and s.profile_id=auth.uid() and a.status='active' and a.starts_at<=now() and a.expires_at>now()));
