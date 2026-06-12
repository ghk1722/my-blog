import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isOwner } from "@/lib/session";

const BUCKET = "post-images";

/**
 * 이미지 업로드 (서버 경유, 보안).
 * - 패스코드로 잠금 해제된 경우에만 허용 (isOwner)
 * - 실제 업로드는 service_role 키로 수행 → 브라우저에 쓰기 키 노출 없음
 */
export async function POST(request: NextRequest) {
  if (!(await isOwner())) {
    return NextResponse.json(
      { error: "권한이 없습니다. 패스코드로 잠금을 해제해 주세요." },
      { status: 401 },
    );
  }

  let file: FormDataEntryValue | null = null;
  try {
    const formData = await request.formData();
    file = formData.get("file");
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 },
    );
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "이미지 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const rand = Math.random().toString(36).slice(2, 10);
  const path = `${Date.now()}-${rand}.${ext}`;

  const supabase = createAdminClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    return NextResponse.json(
      { error: `업로드 실패: ${error.message}` },
      { status: 500 },
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
