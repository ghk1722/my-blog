/** 글 분야(카테고리) 목록 — 새 글 작성 시 선택지 */
export const CATEGORIES = ["AI", "우주", "과학", "웹개발", "기타"] as const;

export type Category = (typeof CATEGORIES)[number];

/** CATEGORIES 순서대로 정렬하기 위한 헬퍼 (목록에 없으면 맨 뒤) */
export function categoryOrder(name: string): number {
  const idx = (CATEGORIES as readonly string[]).indexOf(name);
  return idx === -1 ? CATEGORIES.length : idx;
}
