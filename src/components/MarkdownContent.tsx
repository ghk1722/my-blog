import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getYouTubeId } from "@/lib/youtube";

/**
 * 마크다운 본문 렌더러.
 * - 유튜브 링크(자동링크 포함)는 영상 임베드(iframe)로 표시
 * - 이미지는 둥근 모서리 스타일 적용
 */
export default function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            const id = href ? getYouTubeId(href) : null;
            if (id) {
              // <p> 안에 들어갈 수 있으므로 div 대신 block span 사용 (HTML 중첩 규칙)
              return (
                <span className="my-4 block aspect-video w-full overflow-hidden rounded-lg">
                  <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${id}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </span>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          img({ src, alt }) {
            // 마크다운 이미지(외부/스토리지 URL)는 일반 img로 렌더
            // eslint-disable-next-line @next/next/no-img-element
            return (
              <img
                src={typeof src === "string" ? src : ""}
                alt={alt ?? ""}
                className="rounded-lg"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
