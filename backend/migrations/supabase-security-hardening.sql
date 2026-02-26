-- Supabase security hardening for migrated 123Tutors tables
-- Run in Supabase SQL Editor after validating application behavior.

begin;

-- 1) Enable and force RLS on all public app tables.
alter table public.bank enable row level security;
alter table public.bursary_names enable row level security;
alter table public.courses enable row level security;
alter table public.school_names enable row level security;
alter table public.tertiary_names enable row level security;
alter table public.tertiary_programmes enable row level security;
alter table public.tertiary_specializations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.tutor_requests enable row level security;

alter table public.bank force row level security;
alter table public.bursary_names force row level security;
alter table public.courses force row level security;
alter table public.school_names force row level security;
alter table public.tertiary_names force row level security;
alter table public.tertiary_programmes force row level security;
alter table public.tertiary_specializations force row level security;
alter table public.user_profiles force row level security;
alter table public.tutor_requests force row level security;

-- 2) Revoke direct table access from anon/authenticated roles.
revoke all on table public.bank from anon, authenticated;
revoke all on table public.bursary_names from anon, authenticated;
revoke all on table public.courses from anon, authenticated;
revoke all on table public.school_names from anon, authenticated;
revoke all on table public.tertiary_names from anon, authenticated;
revoke all on table public.tertiary_programmes from anon, authenticated;
revoke all on table public.tertiary_specializations from anon, authenticated;
revoke all on table public.user_profiles from anon, authenticated;
revoke all on table public.tutor_requests from anon, authenticated;

commit;

select 'Supabase security hardening applied: RLS enabled + anon/authenticated revoked.' as status;

