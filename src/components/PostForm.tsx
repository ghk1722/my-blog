"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CATEGORIES } from "@/lib/categories";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "post-images";

type PostFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: { title?: string; content?: string; category?: string | null };
  submitLabel: string;
  cancelHref: string;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

export default function PostForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: PostFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  /** 커서 위치(또는 끝)에 텍스트 삽입 (textarea는 비제어 컴포넌트) */
  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? ta.value.length;
    const end = ta.selectionEnd ?? ta.value.length;
    ta.value = ta.value.slice(0, start) + text + ta.value.slice(end);
    const pos = start + text.length;
    ta.focus();
    ta.setSelectionRange(pos, pos);
  }

  async function handleImageUpload(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    try {
      const supabase = createClient();
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
      const rand = Math.random().toString(36).slice(2, 10);
      const path = `${Date.now()}-${rand}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) throw error;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const alt = file.name.replace(/\.[^.]+$/, "");
      insertAtCursor(`\n![${alt}](${data.publicUrl})\n`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(
        `이미지 업로드 실패: ${msg} (Supabase에 supabase/storage.sql 을 실행했는지 확인하세요)`,
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={defaultValues?.title}
          placeholder="글 제목을 입력하세요"
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-white/20"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="category" className="text-sm font-medium">
          분야
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultValues?.category ?? CATEGORIES[0]}
          className="rounded-md border border-black/15 bg-transparent px-3 py-2 text-base outline-none focus:border-blue-500 dark:border-white/20"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="text-black">
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor="content" className="text-sm font-medium">
            본문 <span className="text-black/50 dark:text-white/50">(마크다운 지원)</span>
          </label>

          {/* 이미지 업로드 버튼 */}
          <label
            className={
              "cursor-pointer rounded-md border border-black/15 px-3 py-1.5 text-xs font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10 " +
              (uploading ? "pointer-events-none opacity-50" : "")
            }
          >
            {uploading ? "업로드 중..." : "🖼 이미지 추가"}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </label>
        </div>

        <textarea
          ref={textareaRef}
          id="content"
          name="content"
          rows={16}
          defaultValue={defaultValues?.content}
          placeholder={"# 제목\n\n내용을 마크다운으로 작성하세요.\n\n이미지는 위 '이미지 추가' 버튼으로 업로드하면 커서 위치에 자동 삽입됩니다."}
          className="resize-y rounded-md border border-black/15 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 dark:border-white/20"
        />

        {uploadError && (
          <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <Link
          href={cancelHref}
          className="rounded-md px-4 py-2 text-sm font-medium text-black/60 transition hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          취소
        </Link>
      </div>
    </form>
  );
}
