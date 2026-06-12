# 권경희의 새로운 세계

**Next.js + Supabase**로 만든 개인 블로그입니다. 마크다운으로 글을 작성하고, 이미지를 업로드하며, 분야(카테고리)별로 글을 모아 볼 수 있습니다.

> 데모 기준 글 데이터는 2026년 6월 최신 뉴스(AI·우주·과학·웹개발)를 반영한 샘플입니다.

---

## ✨ 주요 기능

- **글 CRUD** — 작성 / 목록 / 상세 / 수정 / 삭제
- **패스코드 잠금** — 6자리 숫자 패스코드로 잠금을 해제해야 글 작성·수정·삭제 가능
- **마크다운 에디터** — 서식 툴바(굵게·기울임·제목·목록·인용·코드·링크) + **쓰기/미리보기** 탭
- **마크다운 본문** — `react-markdown` + `remark-gfm`(표, 체크박스 등 GFM 지원)
- **이미지(OSS)** — 파일 업로드(Supabase Storage) 또는 URL로 본문에 이미지 삽입
- **유튜브 임베드** — 본문에 유튜브 URL을 넣으면 상세 페이지에서 영상이 바로 재생
- **분야별 보기** — AI / 우주 / 과학 / 웹개발 / 기타 탭으로 필터링
- **다크 모드** — OS 설정에 따라 자동 적용

---

## 🛠 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript |
| UI | React 19, Tailwind CSS v4, `@tailwindcss/typography` |
| 백엔드/DB | Supabase (PostgreSQL + Auth + Storage) |
| Supabase SDK | `@supabase/supabase-js`, `@supabase/ssr` |
| 마크다운 | `react-markdown`, `remark-gfm` |

---

## 📁 프로젝트 구조

```
MyBlog/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # 공통 레이아웃 + 헤더(잠금 상태별 메뉴)
│  │  ├─ page.tsx                # 홈: 글 목록 + 분야 탭 필터
│  │  ├─ login/page.tsx          # 잠금 해제(패스코드) 페이지
│  │  └─ posts/
│  │     ├─ new/page.tsx         # 새 글 작성
│  │     └─ [id]/
│  │        ├─ page.tsx          # 글 상세 (마크다운/유튜브 렌더링)
│  │        └─ edit/page.tsx     # 글 수정
│  ├─ app/api/upload/route.ts    # 이미지 업로드(서버 경유, 패스코드+service_role)
│  ├─ components/
│  │  ├─ PostForm.tsx            # 작성/수정 공용 폼 (제목·분야·에디터)
│  │  ├─ MarkdownEditor.tsx      # 마크다운 에디터 (툴바·미리보기·미디어 삽입)
│  │  ├─ MarkdownContent.tsx     # 마크다운 + 유튜브 임베드 렌더러
│  │  ├─ DeleteButton.tsx        # 삭제 버튼 (확인창)
│  │  └─ PasscodeForm.tsx        # 6자리 패스코드 입력 폼
│  ├─ lib/
│  │  ├─ posts.ts                # 글 CRUD 서버 액션 (admin 클라이언트로 쓰기)
│  │  ├─ auth.ts                 # 패스코드 잠금 해제/잠금 서버 액션
│  │  ├─ session.ts              # 패스코드 검증 헬퍼(isOwner)
│  │  ├─ categories.ts           # 분야 목록 상수
│  │  ├─ youtube.ts              # 유튜브 URL → 영상 ID 추출
│  │  ├─ types.ts                # Post 타입
│  │  └─ supabase/
│  │     ├─ server.ts            # 서버용 Supabase 클라이언트(anon, 읽기)
│  │     ├─ admin.ts             # 서버 전용 admin 클라이언트(service_role, 쓰기)
│  │     ├─ client.ts            # 브라우저용 클라이언트
│  │     └─ middleware.ts        # 세션 갱신 로직
│  └─ proxy.ts                   # 요청마다 세션 갱신 (Next 16: 구 middleware)
├─ supabase/
│  ├─ schema.sql                 # 테이블 생성 (최초 1회)
│  ├─ add-category.sql           # 분야 컬럼 추가 + 기존 글 백필
│  ├─ storage.sql                # 이미지 저장소(버킷 + 정책)
│  ├─ secure-policies.sql        # 보안 구조(읽기만 공개, 쓰기는 서버 전용)
│  └─ auth-policies.sql          # (대안) 이메일 로그인 기반 RLS
├─ scripts/
│  └─ seed-posts.mjs             # 샘플 글 10개 삽입 스크립트
└─ .env.local                    # 환경변수 (git 제외)
```

---

## 🚀 시작하기

### 1. 클론 & 설치

```bash
git clone https://github.com/ghk1722/my-blog.git
cd my-blog
npm install
```

### 2. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. **Project Settings → API** 에서 다음 두 값을 확인
   - Project URL
   - `anon` / `publishable` key

### 3. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 값을 채웁니다.

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-PUBLIC-KEY

# 글 작성/수정/삭제 잠금 해제용 6자리 패스코드 (본인 코드로 변경!)
BLOG_PASSCODE=000000

# (보안 구조) 서버 전용 service_role 키 — Supabase > Settings > API
# secure-policies.sql 적용 시 필수. 절대 NEXT_PUBLIC_ 접두사 금지(브라우저 노출).
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-SECRET-KEY
```

> 패스코드는 `BLOG_PASSCODE` 환경변수로 관리합니다. `NEXT_PUBLIC_` 접두사가 **없으므로 서버에서만** 읽히고 브라우저에 노출되지 않습니다. 입력한 코드는 쿠키에 해시(SHA-256)로 저장됩니다.

> ⚠️ `.env.local`은 `.gitignore`에 포함되어 커밋되지 않습니다.

### 4. 데이터베이스 테이블 생성

Supabase 대시보드 **SQL Editor**에서 아래 파일 내용을 실행합니다.

| 순서 | 파일 | 설명 | 필수 |
|------|------|------|------|
| 1 | `supabase/schema.sql` | `posts` 테이블 생성 | ✅ |
| 2 | `supabase/storage.sql` | 이미지 저장소 버킷(`post-images`) + 정책 | 이미지 업로드 사용 시 |
| 3 | `supabase/add-category.sql` | 분야 컬럼 추가 + 샘플 글 백필 | 분야 기능 사용 시 |
| 4 | `supabase/secure-policies.sql` | **보안 구조**(읽기만 공개, 쓰기는 서버 전용) | **공개 배포 시 권장** |

> `schema.sql`에 이미 `category` 컬럼이 포함되어 있으므로, **새로 시작하는 경우 1번만 실행**하면 됩니다. `add-category.sql`은 기존에 `category` 없이 만든 DB를 업데이트할 때 쓰는 마이그레이션입니다.

### 5. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 접속.

### 6. (선택) 샘플 글 넣기

뉴스 기반 샘플 글 10개를 한 번에 넣습니다.

```bash
node scripts/seed-posts.mjs
```

> ⚠️ 이 스크립트는 **재실행 시 같은 글이 중복 삽입**됩니다. 한 번만 실행하세요.

---

## 📜 사용 방법

### 잠금 해제 (글 작성 전)
1. 헤더 우측의 **🔓 잠금 해제** 클릭 (`/login`)
2. 6자리 패스코드 입력 → 해제되면 헤더에 **글쓰기 / 🔒 잠금** 표시
3. 해제 상태는 쿠키로 30일간 유지. **🔒 잠금**을 누르면 다시 잠깁니다.

### 글 작성
1. 헤더의 **글쓰기** 버튼 클릭 (`/posts/new`)
2. 제목 / 분야 입력
3. **에디터**로 본문 작성
   - 툴바: 제목 `H` / 굵게 `B` / 기울임 `I` / 인용 / 목록 / 코드 / 링크
   - **쓰기 / 미리보기** 탭으로 렌더 결과 확인
   - 🖼 이미지(업로드) / 🔗 이미지 URL / 🎬 유튜브 삽입
4. **발행하기**

### 이미지 넣기 (OSS)
본문 영역 우측 도구로 두 가지 방법 지원 — 선택 시 **커서 위치에 자동 삽입**됩니다.

- **🖼 이미지 업로드** — 파일 선택 → Supabase Storage(`post-images`)에 업로드 후 `![이미지](공개URL)` 삽입
- **🔗 이미지 URL** — 외부 이미지 주소를 입력 → `![이미지](URL)` 삽입

> 파일 업로드를 쓰려면 사전에 `supabase/storage.sql`을 실행해야 합니다.

### 유튜브 영상 넣기
- 본문 도구의 **🎬 유튜브** 클릭 → 영상 URL 입력
- 본문에는 URL만 들어가고, 상세 페이지에서 **영상 플레이어(iframe)로 자동 렌더링**됩니다.
- 지원 형식: `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`, `youtube.com/embed/`

### 글 보기 & 분야 필터
- 홈에서 글 목록을 최신순으로 확인
- 상단 **분야 탭**(전체 / AI / 우주 / …)을 눌러 분야별로 필터링
- 글의 분야 배지를 눌러도 해당 분야 목록으로 이동

### 글 수정 / 삭제
- 글 상세 페이지 우상단의 **수정** / **삭제** 버튼 사용
- 잠금이 해제된 상태(패스코드 입력 완료)에서만 버튼이 보입니다.

### 분야 항목 바꾸기
`src/lib/categories.ts`의 `CATEGORIES` 배열을 수정하면 작성 폼의 선택지가 바뀝니다.

```ts
export const CATEGORIES = ["AI", "우주", "과학", "웹개발", "기타"] as const;
```

---

## 🔐 패스코드 잠금

권한 모델: **읽기는 누구나 / 작성·수정·삭제는 패스코드 해제자만**.

- 패스코드는 `.env.local`의 `BLOG_PASSCODE`(6자리 숫자)로 설정합니다.
- `/login`에서 패스코드를 맞히면 httpOnly 쿠키가 발급되어 30일간 해제 상태가 유지됩니다.
- 쿠키에는 원본 코드가 아닌 **SHA-256 해시**가 저장됩니다 (`src/lib/session.ts`).
- 잠금 해제 여부 판별: `isOwner()` / 서버 액션 진입 시 `assertOwner()`로 검증.

```
패스코드 변경:  .env.local 의 BLOG_PASSCODE 값을 수정 → 서버 재시작
```

> **참고:** 이 패스코드는 **앱 레벨** 보호입니다. DB(RLS)는 별개이며, 더 강력한 DB 레벨 보호가 필요하면 `supabase/auth-policies.sql`(이메일 로그인 기반)을 적용하는 방식도 있습니다.

---

## 🗄 데이터 모델

`posts` 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid | 기본키 (자동 생성) |
| `title` | text | 제목 |
| `content` | text | 본문 (마크다운) |
| `category` | text | 분야 (nullable) |
| `created_at` | timestamptz | 작성일 |
| `updated_at` | timestamptz | 수정일 |

---

## 🧭 라우트

| 경로 | 설명 |
|------|------|
| `/` | 글 목록 + 분야 필터 (`/?category=AI`) |
| `/posts/new` | 새 글 작성 |
| `/posts/[id]` | 글 상세 |
| `/posts/[id]/edit` | 글 수정 |
| `/login` | 잠금 해제 (패스코드 입력) |

---

## 📦 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 검사 |
| `node scripts/seed-posts.mjs` | 샘플 글 10개 삽입 |

---

## ☁️ 배포 (Vercel)

1. [Vercel](https://vercel.com)에 이 저장소 import
2. **환경변수 4개** 등록 (Production/Preview/Development 모두):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `BLOG_PASSCODE`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Supabase에서 `supabase/secure-policies.sql` 실행
4. 배포(또는 Redeploy)

> ⚠️ 환경변수는 **빌드 시 적용**되므로, 추가/변경 후 반드시 **Redeploy** 해야 합니다.

---

## 🛡 보안 구조

| 동작 | 사용 키 | 보호 방식 |
|------|---------|-----------|
| 읽기(목록/상세) | anon (공개) | RLS `select` 허용 |
| 쓰기(작성/수정/삭제) | **service_role (서버 전용)** | 패스코드 검증 후 서버에서만 실행 |
| 이미지 업로드 | **service_role (서버 전용)** | `/api/upload`에서 패스코드 검증 후 실행 |

- 브라우저에 노출되는 `anon` 키로는 **쓰기/업로드가 불가능**합니다 (RLS로 차단).
- 모든 쓰기는 `BLOG_PASSCODE` 검증을 통과한 **서버**에서 `service_role` 키로만 수행됩니다.
- `secure-policies.sql`을 실행하지 않으면(또는 `SUPABASE_SERVICE_ROLE_KEY` 미설정 시) admin 클라이언트가 anon 키로 폴백하므로 로컬 개발은 되지만, **공개 배포 시에는 반드시 적용**해야 안전합니다.

---

## 📄 라이선스

개인 프로젝트입니다.
