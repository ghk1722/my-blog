-- ============================================================
--  권경희의 새로운 세계 - 보안 구조 적용 (권장: 공개 배포 전 실행)
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
--
--  구조: 읽기는 누구나(anon), 쓰기/업로드는 service_role(서버)만.
--        → 브라우저에 노출되는 anon 키로는 DB/스토리지에 쓰기 불가.
--        → 서버(패스코드 검증 통과)에서 service_role 키로만 쓰기 수행.
--
--  ⚠️ 실행 전 반드시:
--     1) Supabase > Settings > API 에서 service_role(secret) 키 복사
--     2) .env.local 과 Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY 등록
--     (등록 없이 이 SQL만 실행하면 글 작성/수정/삭제가 막힙니다)
-- ============================================================

-- ---------- posts 테이블 ----------
alter table public.posts enable row level security;

-- anon/authenticated 의 쓰기 권한 회수 (읽기만 남김)
revoke insert, update, delete on public.posts from anon, authenticated;

-- 기존 정책 정리 (재실행 안전)
drop policy if exists "posts: public read"   on public.posts;
drop policy if exists "posts: owner insert"  on public.posts;
drop policy if exists "posts: owner update"  on public.posts;
drop policy if exists "posts: owner delete"  on public.posts;

-- 읽기: 누구나
create policy "posts: public read"
  on public.posts for select
  using (true);

-- 쓰기 정책은 만들지 않음 → anon/authenticated 는 insert/update/delete 불가.
-- service_role 키는 RLS를 우회하므로 서버에서 정상 동작.

-- ---------- storage(post-images 버킷) ----------
-- 버킷이 없다면 먼저 생성 (공개 읽기)
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- 기존 정책 정리
drop policy if exists "post-images: public read"  on storage.objects;
drop policy if exists "post-images: anyone upload" on storage.objects;
drop policy if exists "post-images: anyone delete" on storage.objects;

-- 읽기: 누구나 (공개 버킷)
create policy "post-images: public read"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- 업로드/삭제 정책 없음 → anon 업로드 불가.
-- 업로드는 서버(/api/upload)에서 service_role 키로만 수행.
