import Link from "next/link";
import { categoryOrder } from "@/lib/categories";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/lib/types";

// 글 목록은 항상 최신 데이터를 보여주도록 동적 렌더링
export const dynamic = "force-dynamic";

function isSupabaseConfigured() {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function SetupNotice() {
  return (
    <div className="rounded-lg border border-amber-400/40 bg-amber-50 p-5 text-sm leading-relaxed dark:bg-amber-950/30">
      <p className="font-semibold">⚙️ Supabase 설정이 필요합니다</p>
      <p className="mt-2 text-black/70 dark:text-white/70">
        프로젝트 루트의{" "}
        <code className="rounded bg-black/10 px-1 dark:bg-white/10">.env.local.example</code>
        을 <code className="rounded bg-black/10 px-1 dark:bg-white/10">.env.local</code>로 복사하고,
        Supabase 프로젝트의 URL과 anon key를 채운 뒤{" "}
        <code className="rounded bg-black/10 px-1 dark:bg-white/10">supabase/schema.sql</code>을
        실행해 주세요. 자세한 내용은{" "}
        <code className="rounded bg-black/10 px-1 dark:bg-white/10">README.md</code>를 참고하세요.
      </p>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const ALL = "전체";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <SetupNotice />;
  }

  const { category: selectedRaw } = await searchParams;
  const selected = selectedRaw && selectedRaw.trim() ? selectedRaw : ALL;

  const supabase = await createClient();
  // select("*") 로 가져와 category 컬럼이 아직 없어도 에러 없이 동작
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-lg border border-red-400/40 bg-red-50 p-5 text-sm dark:bg-red-950/30">
        <p className="font-semibold">데이터를 불러오지 못했습니다.</p>
        <p className="mt-2 text-black/70 dark:text-white/70">{error.message}</p>
      </div>
    );
  }

  const posts = (data ?? []) as Post[];

  // 실제 글에 존재하는 분야들 (중복 제거 + 정렬)
  const categories = Array.from(
    new Set(posts.map((p) => p.category).filter((c): c is string => !!c)),
  ).sort((a, b) => categoryOrder(a) - categoryOrder(b));

  // 선택된 분야로 필터
  const visiblePosts =
    selected === ALL
      ? posts
      : posts.filter((p) => p.category === selected);

  const tabs = [ALL, ...categories];

  return (
    <div className="flex flex-col gap-6">
      {/* 분야 탭 (분야가 하나라도 있을 때만 표시) */}
      {categories.length > 0 && (
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const active = tab === selected;
            const href = tab === ALL ? "/" : `/?category=${encodeURIComponent(tab)}`;
            return (
              <Link
                key={tab}
                href={href}
                className={
                  "rounded-full border px-3 py-1.5 text-sm font-medium transition " +
                  (active
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10")
                }
              >
                {tab}
              </Link>
            );
          })}
        </nav>
      )}

      {visiblePosts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-black/60 dark:text-white/60">
            {selected === ALL
              ? "아직 작성된 글이 없습니다."
              : `'${selected}' 분야의 글이 없습니다.`}
          </p>
          <Link
            href="/posts/new"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            글 작성하기
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {visiblePosts.map((post) => (
            <li key={post.id} className="py-5">
              <Link href={`/posts/${post.id}`} className="group block">
                <div className="flex items-center gap-2">
                  {post.category && (
                    <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-medium text-black/60 dark:bg-white/10 dark:text-white/60">
                      {post.category}
                    </span>
                  )}
                  <span className="text-sm text-black/50 dark:text-white/50">
                    {formatDate(post.created_at)}
                  </span>
                </div>
                <h2 className="mt-1 text-xl font-semibold group-hover:text-blue-600">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-black/70 dark:text-white/70">
                  {post.content}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
