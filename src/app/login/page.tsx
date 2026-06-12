import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getUser } from "@/lib/session";

export const metadata = {
  title: "로그인 · My Blog",
};

export default async function LoginPage() {
  // 이미 로그인되어 있으면 홈으로
  const user = await getUser();
  if (user) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-bold">로그인</h1>
      <p className="text-sm text-black/60 dark:text-white/60">
        관리자만 글을 작성할 수 있습니다.
      </p>
      <LoginForm />
    </div>
  );
}
