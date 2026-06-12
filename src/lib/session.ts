import { cookies } from "next/headers";
import { createHash } from "node:crypto";

/** 패스코드 인증 쿠키 이름 */
export const PASSCODE_COOKIE = "blog_passcode";

/** 패스코드를 해시 토큰으로 변환 (쿠키에는 원본 코드 대신 해시를 저장) */
export function makeToken(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

function expectedToken(): string {
  const code = process.env.BLOG_PASSCODE ?? "";
  return code ? makeToken(code) : "";
}

/**
 * 현재 요청이 글을 작성/수정/삭제할 권한이 있는지 여부.
 * = 올바른 6자리 패스코드로 잠금 해제(쿠키 보유)했는지.
 */
export async function isOwner(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false; // 서버에 패스코드 미설정 → 항상 잠금

  const store = await cookies();
  const token = store.get(PASSCODE_COOKIE)?.value;
  return !!token && token === expected;
}
