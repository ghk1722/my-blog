import { redirect } from "next/navigation";
import PasscodeForm from "@/components/PasscodeForm";
import { isOwner } from "@/lib/session";

export const metadata = {
  title: "잠금 해제 · 권경희의 새로운 세계",
};

export default async function LoginPage() {
  // 이미 잠금 해제되어 있으면 홈으로
  if (await isOwner()) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-bold">잠금 해제</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        글을 작성·수정·삭제하려면 6자리 패스코드를 입력하세요.
      </p>
      <PasscodeForm />
    </div>
  );
}
