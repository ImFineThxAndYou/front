# HowAreYou - 언어 학습 플랫폼

Next.js 15 기반의 현대적인 언어 학습 웹 애플리케이션입니다.

## 🚀 주요 기능

- **퀴즈 시스템**: 랜덤/데일리 퀴즈로 단어 학습
- **실시간 채팅**: 언어 교환을 위한 채팅 기능
- **단어장 관리**: 개인화된 단어장 시스템
- **다국어 지원**: 한국어/영어 지원
- **반응형 디자인**: 모바일/데스크톱 최적화

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 15.3.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Internationalization**: i18next
- **HTTP Client**: Axios
- **Real-time**: WebSocket (STOMP)

### Backend
- **Framework**: Spring Boot (Java)
- **Database**: PostgreSQL
- **Authentication**: JWT + OAuth2
- **Real-time**: SSE (Server-Sent Events)

## 📦 설치 및 실행

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env.local
```

### 2. 개발 서버 실행

```bash
# 개발 모드
npm run dev

# 타입 체크
npm run type-check

# 린트 검사
npm run lint
```

### 3. 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 분석
npm run build:analyze

# 프로덕션 서버 실행
npm start
```

## 🌍 환경 변수

### 필수 환경 변수

```env
# API 서버 URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# WebSocket 서버 URL
NEXT_PUBLIC_WS_BASE_URL=http://localhost:8080

# 애플리케이션 설정
NEXT_PUBLIC_APP_NAME=HowAreYou
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_ENVIRONMENT=development
```

### 프로덕션 환경 변수

```env
# 프로덕션 API 서버
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🚀 배포

### AWS Amplify 배포

1. **GitHub 저장소 연결**
   - AWS Amplify 콘솔에서 새 앱 생성
   - GitHub 저장소 연결

2. **빌드 설정**
   - `amplify.yml` 파일이 자동으로 사용됨
   - 환경 변수 설정 필요

3. **환경 변수 설정**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
   NEXT_PUBLIC_WS_BASE_URL=https://your-api-domain.com
   NEXT_PUBLIC_ENVIRONMENT=production
   ```

### 수동 배포

```bash
# 프로덕션 빌드
npm run build

# 정적 파일 생성 (필요시)
npm run export

# 서버 배포
npm start
```

## 📁 프로젝트 구조

```
hay_v2/
├── app/                    # Next.js App Router
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── quiz/              # 퀴즈 관련 페이지
│   ├── chat/              # 채팅 관련 페이지
│   └── wordbook/          # 단어장 관련 페이지
├── lib/                   # 유틸리티 및 설정
│   ├── services/          # API 서비스
│   ├── stores/            # Zustand 스토어
│   ├── hooks/             # 커스텀 훅
│   └── i18n/              # 국제화 설정
├── public/                # 정적 파일
└── docs/                  # 문서
```

## 🔧 개발 가이드

### 코드 스타일

- **Import 경로**: 절대 경로 사용 (`@/lib/services/...`)
- **TypeScript**: 엄격한 타입 체크 활성화
- **컴포넌트**: 함수형 컴포넌트 + TypeScript
- **상태 관리**: Zustand 사용

### API 통신

```typescript
// 서비스 레이어 사용
import { quizService } from '@/lib/services/quizService';

const quizzes = await quizService.getMyQuizzes(0, 20);
```

### 국제화

```typescript
// 번역 훅 사용
import { useTranslation } from '@/lib/hooks/useTranslation';

const { t } = useTranslation(['quiz', 'common']);
const message = t('quiz.history');
```

## 🐛 문제 해결

### 빌드 오류

1. **TypeScript 오류**
   ```bash
   npm run type-check
   ```

2. **캐시 정리**
   ```bash
   npm run clean
   ```

3. **의존성 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### 환경 변수 문제

- `.env.local` 파일이 올바르게 설정되었는지 확인
- 환경 변수 이름이 `NEXT_PUBLIC_`으로 시작하는지 확인

## 📝 변경 사항

### v2.0.0 (2025-01-19)
- Next.js 15 업그레이드
- TypeScript 설정 개선
- AWS Amplify 배포 설정 추가
- 코드 일관성 개선
- 에러 처리 강화

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 지원

문제가 발생하거나 질문이 있으시면 이슈를 생성해 주세요.
