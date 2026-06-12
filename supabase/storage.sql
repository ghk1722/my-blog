-- ============================================================
--  권경희의 새로운 세계 - 이미지 저장소(Object Storage) 설정
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
--  (글 본문에 이미지를 업로드하려면 이 SQL을 실행해야 합니다)
-- ============================================================

-- 1) 공개 읽기 가능한 버킷 생성
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- 재실행 안전을 위해 같은 이름 정책 제거
drop policy if exists "post-images: public read"   on storage.objects;
drop policy if exists "post-images: anyone upload"  on storage.objects;
drop policy if exists "post-images: anyone delete"  on storage.objects;

-- 2) 누구나 읽기 (공개 버킷)
create policy "post-images: public read"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- 3) 누구나 업로드 (로그인 기능 OFF 동안)
create policy "post-images: anyone upload"
  on storage.objects for insert
  with check (bucket_id = 'post-images');

-- 4) 누구나 삭제 (로그인 기능 OFF 동안)
create policy "post-images: anyone delete"
  on storage.objects for delete
  using (bucket_id = 'post-images');

-- ============================================================
--  📌 로그인 기능을 켤 때(나중에)는 위 3·4번을 주인만 가능하도록 교체하세요:
--
--  drop policy if exists "post-images: anyone upload" on storage.objects;
--  create policy "post-images: owner upload"
--    on storage.objects for insert to authenticated
--    with check (
--      bucket_id = 'post-images'
--      and (auth.jwt() ->> 'email') = 'ghk1722@gmail.com'
--    );
--  -- delete 정책도 동일하게 to authenticated + 이메일 조건으로 교체
-- ============================================================
