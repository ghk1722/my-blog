import { createClient } from "@supabase/supabase-js";

/**
 * 서버 전용 관리자 클라이언트.
 * service_role 키를 사용하므로 RLS를 우회한다.
 * 반드시 서버(서버 액션 / 라우트 핸들러)에서만, 그리고 패스코드 검증 이후에만 사용할 것.
 *
 * service_role 키가 없으면(로컬 초기 설정 전) anon 키로 폴백한다.
 * → 이 경우 RLS가 잠겨 있으면 쓰기가 실패하므로, 운영에서는 반드시 service_role 키를 설정해야 한다.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(url, serviceKey ?? anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** service_role 키가 설정되어 있는지 (보안 구조가 완전히 활성화됐는지) */
export function hasServiceRole() {
  return !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
