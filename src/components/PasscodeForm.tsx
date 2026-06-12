"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { unlock, type UnlockState } from "@/lib/auth";

const initialState: UnlockState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "확인 중..." : "잠금 해제"}
    </button>
  );
}

export default function PasscodeForm() {
  const [state, formAction] = useActionState(unlock, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="passcode" className="text-sm font-medium">
          패스코드 (숫자 6자리)
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          required
          maxLength={6}
          pattern="\d{6}"
          placeholder="••••••"
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-center text-2xl tracking-[0.5em] outline-none focus:border-blue-500 dark:border-white/20"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
