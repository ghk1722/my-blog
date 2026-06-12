import { redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { createPost } from "@/lib/posts";
import { isOwner } from "@/lib/session";

export const metadata = {
  title: "새 글 작성 · 권경희의 새로운 세계",
};

export default async function NewPostPage() {
  if (!(await isOwner())) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">새 글 작성</h1>
      <PostForm action={createPost} submitLabel="발행하기" cancelHref="/" />
    </div>
  );
}
