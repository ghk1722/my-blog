import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DeleteButton from "@/components/DeleteButton";
import { deletePost } from "@/lib/posts";
import { isOwner } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
  const owner = await isOwner();
  const deleteThisPost = deletePost.bind(null, post.id);

  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 border-b border-black/10 pb-5 dark:border-white/10">
        {post.category && (
          <Link
            href={`/?category=${encodeURIComponent(post.category)}`}
            className="w-fit rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-black/60 transition hover:bg-black/10 dark:bg-white/10 dark:text-white/60 dark:hover:bg-white/20"
          >
            {post.category}
          </Link>
        )}
        <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
        <div className="flex items-center justify-between">
          <p className="text-sm text-black/50 dark:text-white/50">
            {formatDate(post.created_at)}
            {post.updated_at !== post.created_at &&
              ` (수정됨: ${formatDate(post.updated_at)})`}
          </p>
          {owner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/posts/${post.id}/edit`}
                className="rounded-md border border-black/15 px-3 py-1.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
              >
                수정
              </Link>
              <DeleteButton action={deleteThisPost} />
            </div>
          )}
        </div>
      </header>

      {post.content ? (
        <div className="prose prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      ) : (
        <p className="text-black/50 dark:text-white/50">(본문이 없습니다.)</p>
      )}

      <div className="pt-4">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 목록으로
        </Link>
      </div>
    </article>
  );
}
