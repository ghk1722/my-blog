"use client";

type DeleteButtonProps = {
  action: () => void | Promise<void>;
};

export default function DeleteButton({ action }: DeleteButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("이 글을 정말 삭제하시겠습니까?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-500/40 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
      >
        삭제
      </button>
    </form>
  );
}
