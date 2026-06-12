"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PASSCODE_COOKIE, makeToken } from "@/lib/session";

export type UnlockState = { error?: string };

/** 6자리 패스코드로 잠금 해제 (useActionState 용 시그니처) */
export async function unlock(
  _prevState: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const code = String(formData.get("passcode") ?? "").trim();
  const expected = process.env.BLOG_PASSCODE ?? "";

  if (!/^\d{6}$/.test(code)) {
    return { error: "6자리 숫자를 입력해 주세요." };
  }
  if (!expected) {
    return {
      error: "서버에 패스코드가 설정되어 있지 않습니다. (.env.local 의 BLOG_PASSCODE)",
    };
  }
  if (code !== expected) {
    return { error: "패스코드가 올바르지 않습니다." };
  }

  const store = await cookies();
  store.set(PASSCODE_COOKIE, makeToken(code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });

  revalidatePath("/", "layout");
  redirect("/");
}

/** 잠금 (쿠키 삭제) */
export async function lock() {
  const store = await cookies();
  store.delete(PASSCODE_COOKIE);
  revalidatePath("/", "layout");
  redirect("/");
}
