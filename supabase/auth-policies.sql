-- ============================================================
--  My Blog - 로그인(인증) 적용 후 RLS 정책
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
--
--  ⚠️ 이 SQL을 실행하면 글 작성/수정/삭제는 아래 주인 이메일로
--      로그인한 경우에만 가능해집니다. (읽기는 누구나 가능)
-- ============================================================

-- RLS 활성화
alter table public.posts enable row level security;

-- 이전 schema.sql 에서 부여한 광범위한 권한 정리
--   (RLS가 켜지면 정책으로만 접근을 통제합니다)
revoke insert, update, delete on public.posts from anon;

-- 혹시 같은 이름의 정책이 이미 있으면 제거 (재실행 안전)
drop policy if exists "posts: public read"   on public.posts;
drop policy if exists "posts: owner insert"  on public.posts;
drop policy if exists "posts: owner update"  on public.posts;
drop policy if exists "posts: owner delete"  on public.posts;

-- 1) 읽기: 누구나 가능
create policy "posts: public read"
  on public.posts for select
  using (true);

-- 2) 작성: 주인 이메일로 로그인한 경우만
create policy "posts: owner insert"
  on public.posts for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'ghk1722@gmail.com');

-- 3) 수정: 주인 이메일로 로그인한 경우만
create policy "posts: owner update"
  on public.posts for update to authenticated
  using ((auth.jwt() ->> 'email') = 'ghk1722@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'ghk1722@gmail.com');

-- 4) 삭제: 주인 이메일로 로그인한 경우만
create policy "posts: owner delete"
  on public.posts for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'ghk1722@gmail.com');
