import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * 서버 컴포넌트 / 서버 액션에서 사용하는 Supabase 클라이언트.
 * 쿠키 기반 세션을 읽고 쓰므로 이후 로그인 기능을 붙일 때도 그대로 사용할 수 있다.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // 서버 컴포넌트에서 set 호출 시 발생할 수 있는 에러는 무시한다.
            // (미들웨어에서 세션을 갱신하면 문제없음 — 로그인 단계에서 추가 예정)
          }
        },
      },
    },
  );
}
