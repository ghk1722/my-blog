# My Blog

**Next.js + Supabase**로 만든 개인 블로그입니다. 마크다운으로 글을 작성하고, 분야(카테고리)별로 글을 모아 볼 수 있습니다.

> 데모 기준 글 데이터는 2026년 6월 최신 뉴스(AI·우주·과학·웹개발)를 반영한 샘플입니다.

---

## ✨ 주요 기능

- **글 CRUD** — 작성 / 목록 / 상세 / 수정 / 삭제
- **마크다운 본문** — `react-markdown` + `remark-gfm`(표, 체크박스 등 GFM 지원)
- **분야별 보기** — AI / 우주 / 과학 / 웹개발 / 기타 탭으로 필터링
- **로그인(주인 전용 쓰기)** — 이메일+비밀번호 로그인. *현재는 토글로 임시 비활성화* (아래 [로그인 기능](#-로그인-기능-onoff) 참고)
- **다크 모드** — OS 설정에 따라 자동 적용

---

## 🛠 기술 스택

| 구분 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript |
| UI | React 19, Tailwind CSS v4, `@tailwindcss/typography` |
| 백엔드/DB | Supabase (PostgreSQL + Auth) |
| Supabase SDK | `@supabase/supabase-js`, `@supabase/ssr` |
| 마크다운 | `react-markdown`, `remark-gfm` |

---

## 📁 프로젝트 구조

```
MyBlog/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # 공통 레이아웃 + 헤더(로그인 상태별 메뉴)
│  │  ├─ page.tsx                # 홈: 글 목록 + 분야 탭 필터
│  │  ├─ login/page.tsx          # 로그인 페이지
│  │  └─ posts/
│  │     ├─ new/page.tsx         # 새 글 작성
│  │     └─ [id]/
│  │        ├─ page.tsx          # 글 상세 (마크다운 렌더링)
│  │        └─ edit/page.tsx     # 글 수정
│  ├─ components/
│  │  ├─ PostForm.tsx            # 작성/수정 공용 폼 (분야 선택 포함)
│  │  ├─ DeleteButton.tsx        # 삭제 버튼 (확인창)
│  │  └─ LoginForm.tsx           # 로그인 폼
│  ├─ lib/
│  │  ├─ posts.ts                # 글 CRUD 서버 액션
│  │  ├─ auth.ts                 # 로그인/로그아웃 서버 액션
│  │  ├─ session.ts              # 인증 헬퍼 + AUTH_ENABLED 토글
│  │  ├─ categories.ts           # 분야 목록 상수
│  │  ├─ types.ts                # Post 타입
│  │  └─ supabase/
│  │     ├─ server.ts            # 서버용 Supabase 클라이언트
│  │     ├─ client.ts            # 브라우저용 클라이언트
│  │     └─ middleware.ts        # 세션 갱신 로직
│  └─ proxy.ts                   # 요청마다 세션 갱신 (Next 16: 구 middleware)
├─ supabase/
│  ├─ schema.sql                 # 테이블 생성 (최초 1회)
│  ├─ add-category.sql           # 분야 컬럼 추가 + 기존 글 백필
│  └─ auth-policies.sql          # 로그인 적용 시 RLS 정책
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

# 블로그 주인 이메일 (로그인 기능을 켤 때 사용)
OWNER_EMAIL=your-email@example.com
```

> ⚠️ `.env.local`은 `.gitignore`에 포함되어 커밋되지 않습니다.

### 4. 데이터베이스 테이블 생성

Supabase 대시보드 **SQL Editor**에서 아래 파일 내용을 실행합니다.

| 순서 | 파일 | 설명 | 필수 |
|------|------|------|------|
| 1 | `supabase/schema.sql` | `posts` 테이블 생성 | ✅ |
| 2 | `supabase/add-category.sql` | 분야 컬럼 추가 + 샘플 글 백필 | 분야 기능 사용 시 |
| 3 | `supabase/auth-policies.sql` | RLS 정책(주인만 쓰기) | 로그인 켤 때 |

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

### 글 작성
1. 헤더의 **글쓰기** 버튼 클릭 (`/posts/new`)
2. 제목 / 분야 / 본문(마크다운) 입력 후 **발행하기**

### 글 보기 & 분야 필터
- 홈에서 글 목록을 최신순으로 확인
- 상단 **분야 탭**(전체 / AI / 우주 / …)을 눌러 분야별로 필터링
- 글의 분야 배지를 눌러도 해당 분야 목록으로 이동

### 글 수정 / 삭제
- 글 상세 페이지 우상단의 **수정** / **삭제** 버튼 사용
- (로그인 기능을 켠 경우, 주인으로 로그인했을 때만 버튼이 보임)

### 분야 항목 바꾸기
`src/lib/categories.ts`의 `CATEGORIES` 배열을 수정하면 작성 폼의 선택지가 바뀝니다.

```ts
export const CATEGORIES = ["AI", "우주", "과학", "웹개발", "기타"] as const;
```

---

## 🔐 로그인 기능 (ON/OFF)

권한 모델: **읽기는 누구나 / 작성·수정·삭제는 주인(`OWNER_EMAIL`)만**.

현재는 개발 편의를 위해 **임시로 꺼져 있습니다.** 토글은 `src/lib/session.ts`에 있습니다.

```ts
export const AUTH_ENABLED = false; // false: 로그인 없이 누구나 쓰기 가능 (현재)
                                   // true : 주인 로그인해야만 쓰기 가능
```

### 로그인 기능을 켜는 방법

1. `src/lib/session.ts`에서 `AUTH_ENABLED = true`로 변경
2. `.env.local`의 `OWNER_EMAIL`이 주인 이메일과 일치하는지 확인
3. Supabase 대시보드 **Authentication → Users → Add user**로 주인 계정 생성
   - 이메일 = `OWNER_EMAIL` 값, 비밀번호 지정, **Auto Confirm User 체크**
4. `supabase/auth-policies.sql` 실행 (DB 레벨에서도 주인만 쓰기 가능하도록 RLS 적용)
   - ⚠️ `auth-policies.sql` 안의 이메일(`ghk1722@gmail.com`)을 본인 주인 이메일로 맞춰주세요.
5. `/login`에서 로그인

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
| `/login` | 로그인 |

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
2. 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `OWNER_EMAIL`) 등록
3. 배포

> ### ⚠️ 배포 전 보안 체크
> `NEXT_PUBLIC_` 환경변수(anon 키 포함)는 **브라우저에 노출**됩니다.
> 배포한다면 외부에서 DB를 마음대로 수정하지 못하도록 **반드시** 아래를 먼저 적용하세요.
> 1. `AUTH_ENABLED = true` (로그인 켜기)
> 2. `supabase/auth-policies.sql` 실행 (RLS 활성화)
>
> 현재처럼 RLS가 꺼진 상태로 배포하면 anon 키만으로 누구나 글을 쓰거나 지울 수 있습니다.

---

## 📄 라이선스

개인 프로젝트입니다.
