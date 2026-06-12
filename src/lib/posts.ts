"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/session";

function parseForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() || null;
  return { title, content, category };
}

/** 글 쓰기 권한이 없으면 에러 (패스코드로 잠금 해제 필요) */
async function assertOwner() {
  if (!(await isOwner())) {
    throw new Error("권한이 없습니다. 패스코드로 잠금을 해제해 주세요.");
  }
}

/** 새 글 작성 */
export async function createPost(formData: FormData) {
  await assertOwner();
  const { title, content, category } = parseForm(formData);
  if (!title) {
    throw new Error("제목을 입력해 주세요.");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("posts")
    .insert({ title, content, category })
    .select("id")
    .single();

  if (error) {
    throw new Error(`글 작성에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/");
  redirect(`/posts/${data.id}`);
}

/** 글 수정 — id를 bind 해서 form action으로 사용한다 */
export async function updatePost(id: string, formData: FormData) {
  await assertOwner();
  const { title, content, category } = parseForm(formData);
  if (!title) {
    throw new Error("제목을 입력해 주세요.");
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("posts")
    .update({ title, content, category, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(`글 수정에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
  redirect(`/posts/${id}`);
}

/** 글 삭제 — id를 bind 해서 form action으로 사용한다 */
export async function deletePost(id: string) {
  await assertOwner();
  const supabase = createAdminClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  if (error) {
    throw new Error(`글 삭제에 실패했습니다: ${error.message}`);
  }

  revalidatePath("/");
  redirect("/");
}
