import { createClient } from "@/lib/supabase/server";

/**
 * ⚙️ 로그인 기능 토글.
 *  - false: 로그인 없이 누구나 글 작성/수정/삭제 가능 (현재, 임시)
 *  - true : 주인(OWNER_EMAIL)으로 로그인해야만 글 작성/수정/삭제 가능
 * 로그인 기능을 다시 켜려면 이 값만 true 로 바꾸면 된다.
 */
export const AUTH_ENABLED = false;

/** 블로그 주인(글 작성/수정/삭제 가능) 이메일 */
export const OWNER_EMAIL =
  process.env.OWNER_EMAIL ?? process.env.NEXT_PUBLIC_OWNER_EMAIL ?? "";

/** 현재 로그인한 사용자 (없으면 null) */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 현재 사용자가 글을 쓸 수 있는 권한이 있는지 여부 */
export async function isOwner() {
  // 로그인 기능이 꺼져 있으면 항상 허용 (임시)
  if (!AUTH_ENABLED) return true;

  const user = await getUser();
  return !!user && !!OWNER_EMAIL && user.email === OWNER_EMAIL;
}
