-- ============================================================
--  My Blog - 데이터베이스 스키마
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
-- ============================================================

-- UUID 생성 함수 (Supabase에는 보통 기본 설치되어 있음)
create extension if not exists "pgcrypto";

-- 블로그 글 테이블
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  content    text not null default '',
  category   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 최신 글 정렬용 인덱스
create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

-- ------------------------------------------------------------
--  ⚠️ 로그인 기능 추가 전까지는 누구나 글을 작성/수정/삭제할 수 있도록
--      RLS(행 수준 보안)를 끈 상태로 둡니다.
--      anon(비로그인) 역할에 권한을 직접 부여합니다.
-- ------------------------------------------------------------
alter table public.posts disable row level security;

grant select, insert, update, delete on public.posts to anon, authenticated;

-- ============================================================
--  📌 로그인 기능을 붙일 때 (나중에) 아래로 교체하세요:
--
--  alter table public.posts add column author_id uuid
--    references auth.users(id) default auth.uid();
--
--  alter table public.posts enable row level security;
--
--  -- 누구나 읽기 가능
--  create policy "posts are viewable by everyone"
--    on public.posts for select using (true);
--
--  -- 작성/수정/삭제는 본인만
--  create policy "users can insert their own posts"
--    on public.posts for insert with check (auth.uid() = author_id);
--  create policy "users can update their own posts"
--    on public.posts for update using (auth.uid() = author_id);
--  create policy "users can delete their own posts"
--    on public.posts for delete using (auth.uid() = author_id);
-- ============================================================
