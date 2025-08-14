# Hay v2 - 언어 학습 플랫폼

이 프로젝트는 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)으로 부트스트랩된 [Next.js](https://nextjs.org) 프로젝트입니다.

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18.0 이상
- npm, yarn, pnpm 또는 bun

### 설치 방법

1. **저장소 클론**
   ```bash
   git clone <your-repository-url>
   cd hay_v2
   ```

2. **의존성 설치**
   ```bash
   npm install
   # 또는
   yarn install
   # 또는
   pnpm install
   # 또는
   bun install
   ```

3. **환경 변수 설정**
   
   루트 디렉토리에 `.env.local` 파일을 생성하세요:
   ```bash
   cp .env.example .env.local
   # 또는 수동으로 생성
   touch .env.local
   ```
   
   `.env.local`에 다음 환경 변수들을 추가하세요:
   ```env
   # 데이터베이스
   DATABASE_URL=your_database_connection_string
   
   # 인증
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   
   # 외부 API (필요한 경우)
   OPENAI_API_KEY=your_openai_api_key
   
   # 기타 서비스
   REDIS_URL=your_redis_url
   ```

4. **개발 서버 실행**
   ```bash
   npm run dev
   # 또는
   yarn dev
   # 또는
   pnpm dev
   # 또는
   bun dev
   ```

5. **브라우저 열기**
   
   [http://localhost:3000](http://localhost:3000)으로 이동하여 애플리케이션을 확인하세요.

## 📁 프로젝트 구조

```
hay_v2/
├── app/                    # Next.js 앱 디렉토리
│   ├── auth/              # 인증 페이지
│   ├── chat/              # 채팅 기능
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── explore/           # 탐색/발견 페이지
│   ├── me/                # 사용자 프로필 및 설정
│   └── wordbook/          # 어휘 관리
├── lib/                   # 유틸리티 라이브러리
│   ├── hooks/             # 커스텀 React 훅
│   ├── services/          # API 서비스
│   ├── stores/            # 상태 관리
│   └── types/             # TypeScript 타입 정의
└── docs/                  # 문서
```

## 🛠️ 사용 가능한 스크립트

- `npm run dev` - 개발 서버 시작
- `npm run build` - 프로덕션용 빌드
- `npm run start` - 프로덕션 서버 시작
- `npm run lint` - ESLint 실행
- `npm run type-check` - TypeScript 타입 검사 실행

## 🔧 설정

### 환경 변수

다음 환경 변수들이 필요합니다:

| 변수 | 설명 | 필수 여부 |
|------|------|-----------|
| `DATABASE_URL` | 데이터베이스 연결 문자열 | 예 |
| `NEXTAUTH_SECRET` | NextAuth.js 시크릿 키 | 예 |
| `NEXTAUTH_URL` | 애플리케이션 URL | 예 |

### 데이터베이스 설정

1. 데이터베이스가 실행 중이고 접근 가능한지 확인
2. `.env.local` 파일에서 `DATABASE_URL` 업데이트
3. 해당하는 경우 데이터베이스 마이그레이션 실행

## 🚨 문제 해결

### 자주 발생하는 문제

1. **포트가 이미 사용 중**
   ```bash
   # 포트 3000을 사용하는 프로세스 종료
   lsof -ti:3000 | xargs kill -9
   ```

2. **의존성을 찾을 수 없음**
   ```bash
   # 캐시 삭제 후 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **환경 변수가 로드되지 않음**
   - `.env.local`이 루트 디렉토리에 있는지 확인
   - 변수 추가 후 개발 서버 재시작

### 도움 받기

문제가 발생하면:

1. [Next.js 문서](https://nextjs.org/docs) 확인
2. 프로젝트의 이슈 트래커 검토
3. 모든 환경 변수가 올바르게 설정되었는지 확인

## 📚 더 알아보기

Next.js에 대해 더 자세히 알아보려면 다음 리소스를 참고하세요:

- [Next.js 문서](https://nextjs.org/docs) - Next.js 기능과 API에 대해 알아보기
- [Next.js 학습하기](https://nextjs.org/learn) - 인터랙티브 Next.js 튜토리얼

[Next.js GitHub 저장소](https://github.com/vercel/next.js)도 확인해보세요 - 여러분의 피드백과 기여를 환영합니다!

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 작성
4. 풀 리퀘스트 제출

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.
