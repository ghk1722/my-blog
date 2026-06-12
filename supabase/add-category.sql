-- ============================================================
--  My Blog - '분야(category)' 컬럼 추가 마이그레이션
--  Supabase 대시보드 > SQL Editor 에 붙여넣고 실행하세요.
--  (이 SQL을 실행해야 분야별 보기 / 분야 저장이 동작합니다)
-- ============================================================

-- 1) category 컬럼 추가
alter table public.posts
  add column if not exists category text;

-- 2) 기존 시드 글 10개에 분야 채우기 (제목으로 매칭)
update public.posts set category = 'AI'    where title like 'Anthropic%';
update public.posts set category = 'AI'    where title like '플로리다%';
update public.posts set category = 'AI'    where title like '오픈 모델 전쟁%';
update public.posts set category = 'AI'    where title like '텍스트를 넘어 현실로%';
update public.posts set category = 'AI'    where title like 'AI 데이터센터 붐%';
update public.posts set category = 'AI'    where title like '트럼프 AI 행정명령%';
update public.posts set category = '우주'   where title like '제임스 웹%';
update public.posts set category = '우주'   where title like 'NASA, 아르테미스%';
update public.posts set category = '과학'   where title like '성간 우주에서 발견된%';
update public.posts set category = '웹개발' where title like 'Next.js 16 시대%';

-- 3) 혹시 분야가 비어있는 글은 '기타'로
update public.posts set category = '기타' where category is null;
