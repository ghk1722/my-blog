import { notFound, redirect } from "next/navigation";
import PostForm from "@/components/PostForm";
import { updatePost } from "@/lib/posts";
import { isOwner } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "글 수정 · My Blog",
};

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isOwner())) {
    redirect("/login");
  }

  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const post = data as Post;
  const updateThisPost = updatePost.bind(null, post.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">글 수정</h1>
      <PostForm
        action={updateThisPost}
        defaultValues={{
          title: post.title,
          content: post.content,
          category: post.category,
        }}
        submitLabel="수정 완료"
        cancelHref={`/posts/${post.id}`}
      />
    </div>
  );
}
