"use client";

import { useEffect, useRef, useState } from "react";
import MarkdownContent from "@/components/MarkdownContent";
import { getYouTubeId } from "@/lib/youtube";

type MarkdownEditorProps = {
  name: string;
  defaultValue?: string;
};

type ToolbarButton = {
  label: string;
  title: string;
  run: () => void;
};

export default function MarkdownEditor({
  name,
  defaultValue = "",
}: MarkdownEditorProps) {
  const [content, setContent] = useState(defaultValue);
  const [mode, setMode] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 다음 렌더 후 복원할 커서/선택 범위
  const pendingSelection = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (pendingSelection.current && textareaRef.current) {
      const [s, e] = pendingSelection.current;
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(s, e);
      pendingSelection.current = null;
    }
  }, [content]);

  function getSelection(): [number, number] {
    const ta = textareaRef.current;
    if (!ta) return [content.length, content.length];
    return [ta.selectionStart ?? content.length, ta.selectionEnd ?? content.length];
  }

  /** 커서 위치에 텍스트 삽입 */
  function insertAtCursor(text: string) {
    const [start, end] = getSelection();
    const next = content.slice(0, start) + text + content.slice(end);
    pendingSelection.current = [start + text.length, start + text.length];
    setContent(next);
    setMode("write");
  }

  /** 선택 영역을 before/after로 감싸기 (선택이 없으면 placeholder 삽입) */
  function wrapSelection(before: string, after: string, placeholder = "") {
    const [start, end] = getSelection();
    const selected = content.slice(start, end) || placeholder;
    const next =
      content.slice(0, start) + before + selected + after + content.slice(end);
    const selStart = start + before.length;
    pendingSelection.current = [selStart, selStart + selected.length];
    setContent(next);
    setMode("write");
  }

  /** 선택된 줄(들) 맨 앞에 prefix 추가 */
  function prefixLines(prefix: string) {
    const [start, end] = getSelection();
    const lineStart = content.lastIndexOf("\n", start - 1) + 1;
    const before = content.slice(0, lineStart);
    const target = content.slice(lineStart, end);
    const after = content.slice(end);
    const replaced = target
      .split("\n")
      .map((line) => prefix + line)
      .join("\n");
    const next = before + replaced + after;
    pendingSelection.current = [
      lineStart + prefix.length,
      end + (replaced.length - target.length),
    ];
    setContent(next);
    setMode("write");
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "업로드 실패");
      const alt = file.name.replace(/\.[^.]+$/, "");
      insertAtCursor(`\n![${alt}](${json.url})\n`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleImageUrl() {
    setError("");
    const url = window.prompt("이미지 URL을 입력하세요");
    if (!url || !url.trim()) return;
    insertAtCursor(`\n![이미지](${url.trim()})\n`);
  }

  function handleYouTube() {
    setError("");
    const url = window.prompt("유튜브 영상 URL을 입력하세요");
    if (!url || !url.trim()) return;
    if (!getYouTubeId(url.trim())) {
      setError("유효한 유튜브 URL이 아닙니다.");
      return;
    }
    insertAtCursor(`\n${url.trim()}\n`);
  }

  const formatButtons: ToolbarButton[] = [
    { label: "H", title: "제목", run: () => prefixLines("## ") },
    { label: "B", title: "굵게", run: () => wrapSelection("**", "**", "굵게") },
    { label: "I", title: "기울임", run: () => wrapSelection("*", "*", "기울임") },
    { label: "“ ”", title: "인용", run: () => prefixLines("> ") },
    { label: "•", title: "목록", run: () => prefixLines("- ") },
    { label: "</>", title: "코드", run: () => wrapSelection("`", "`", "code") },
    {
      label: "🔗",
      title: "링크",
      run: () => wrapSelection("[", "](https://)", "링크텍스트"),
    },
  ];

  const toolBtnClass =
    "rounded-md border border-black/15 px-2.5 py-1.5 text-xs font-medium transition hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">
          본문 <span className="text-black/50 dark:text-white/50">(마크다운)</span>
        </span>
        {/* 쓰기 / 미리보기 탭 */}
        <div className="flex gap-1 rounded-md bg-black/5 p-0.5 dark:bg-white/10">
          <button
            type="button"
            onClick={() => setMode("write")}
            className={
              "rounded px-3 py-1 text-xs font-medium transition " +
              (mode === "write" ? "bg-white shadow dark:bg-black" : "")
            }
          >
            쓰기
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={
              "rounded px-3 py-1 text-xs font-medium transition " +
              (mode === "preview" ? "bg-white shadow dark:bg-black" : "")
            }
          >
            미리보기
          </button>
        </div>
      </div>

      {/* 툴바 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {formatButtons.map((b) => (
          <button
            key={b.title}
            type="button"
            title={b.title}
            onClick={b.run}
            className={toolBtnClass}
          >
            {b.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-black/15 dark:bg-white/20" />

        <label
          className={
            "cursor-pointer " +
            toolBtnClass +
            (uploading ? " pointer-events-none opacity-50" : "")
          }
        >
          {uploading ? "업로드 중..." : "🖼 이미지"}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
        <button type="button" onClick={handleImageUrl} className={toolBtnClass}>
          🔗 이미지 URL
        </button>
        <button type="button" onClick={handleYouTube} className={toolBtnClass}>
          🎬 유튜브
        </button>
      </div>

      {/* 본문 입력은 항상 form에 제출되도록 유지 (미리보기 때는 숨김) */}
      <textarea
        ref={textareaRef}
        name={name}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={16}
        placeholder={"# 제목\n\n내용을 마크다운으로 작성하세요.\n\n툴바로 서식·이미지·유튜브를 삽입할 수 있습니다."}
        className={
          "resize-y rounded-md border border-black/15 bg-transparent px-3 py-2 font-mono text-sm outline-none focus:border-blue-500 dark:border-white/20 " +
          (mode === "preview" ? "hidden" : "")
        }
      />

      {mode === "preview" && (
        <div className="min-h-[16rem] rounded-md border border-black/15 px-4 py-3 dark:border-white/20">
          {content.trim() ? (
            <MarkdownContent content={content} />
          ) : (
            <p className="text-sm text-black/40 dark:text-white/40">
              미리볼 내용이 없습니다.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
