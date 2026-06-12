"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { CATEGORIES } from "@/lib/categories";
import MarkdownEditor from "@/components/MarkdownEditor";

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

      <MarkdownEditor name="content" defaultValue={defaultValues?.content} />

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
