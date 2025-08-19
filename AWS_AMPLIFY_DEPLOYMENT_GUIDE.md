# AWS Amplify 배포 가이드

## 📋 개요

이 가이드는 HowAreYou 프로젝트를 AWS Amplify를 사용하여 배포하는 방법을 설명합니다.

## 🚀 배포 단계

### 1. AWS Amplify 콘솔 접속

1. [AWS Amplify 콘솔](https://console.aws.amazon.com/amplify/)에 접속
2. AWS 계정으로 로그인

### 2. 새 앱 생성

1. **"새 앱 호스팅"** 클릭
2. **"GitHub에서 시작"** 선택
3. GitHub 계정 연결 (필요시)

### 3. 저장소 연결

1. **저장소 선택**: `your-username/hay` 또는 해당 저장소
2. **브랜치 선택**: `main` 또는 `master`
3. **"다음"** 클릭

### 4. 빌드 설정

Amplify가 자동으로 `amplify.yml` 파일을 감지합니다:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 5. 환경 변수 설정

**중요**: 빌드 전에 다음 환경 변수를 설정해야 합니다:

#### 필수 환경 변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-api-domain.com` | 백엔드 API 서버 URL |
| `NEXT_PUBLIC_WS_BASE_URL` | `https://your-api-domain.com` | WebSocket 서버 URL |
| `NEXT_PUBLIC_ENVIRONMENT` | `production` | 배포 환경 |

#### 선택적 환경 변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_APP_NAME` | `HowAreYou` | 애플리케이션 이름 |
| `NEXT_PUBLIC_APP_VERSION` | `2.0.0` | 애플리케이션 버전 |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `true` | 분석 활성화 |
| `NEXT_PUBLIC_ENABLE_ERROR_TRACKING` | `true` | 오류 추적 활성화 |

### 6. 환경 변수 설정 방법

1. **빌드 설정** 페이지에서 **"환경 변수"** 섹션으로 스크롤
2. **"환경 변수 추가"** 클릭
3. 각 변수를 추가:
   ```
   키: NEXT_PUBLIC_API_BASE_URL
   값: https://your-api-domain.com
   ```
4. **"저장 후 배포"** 클릭

### 7. 배포 실행

1. **"저장 후 배포"** 클릭
2. 빌드 진행 상황 모니터링
3. 배포 완료 대기 (약 5-10분)

## 🔧 배포 후 설정

### 1. 도메인 설정 (선택사항)

1. **"도메인 관리"** 클릭
2. **"도메인 추가"** 클릭
3. 커스텀 도메인 입력
4. DNS 설정 확인

### 2. HTTPS 설정

- Amplify가 자동으로 SSL 인증서를 제공
- 추가 설정 불필요

### 3. 환경별 배포

#### 개발 환경
- 브랜치: `develop`
- 환경 변수: `NEXT_PUBLIC_ENVIRONMENT=staging`

#### 프로덕션 환경
- 브랜치: `main`
- 환경 변수: `NEXT_PUBLIC_ENVIRONMENT=production`

## 🐛 문제 해결

### 빌드 실패

#### 1. Node.js 버전 문제
```bash
# amplify.yml에 Node.js 버전 지정
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - nvm use 18
        - npm ci
```

#### 2. 메모리 부족
```bash
# amplify.yml에 메모리 설정 추가
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --max-old-space-size=4096
```

#### 3. 타임아웃 문제
- 빌드 시간을 20분으로 설정
- 불필요한 의존성 제거

### 환경 변수 문제

#### 1. 환경 변수가 로드되지 않음
- 변수명이 `NEXT_PUBLIC_`으로 시작하는지 확인
- 빌드 후 앱 재시작

#### 2. API 연결 실패
- CORS 설정 확인
- 백엔드 서버 상태 확인

## 📊 모니터링

### 1. 빌드 로그 확인
- Amplify 콘솔에서 빌드 로그 확인
- 오류 메시지 분석

### 2. 성능 모니터링
- CloudWatch 메트릭 확인
- 사용자 경험 모니터링

### 3. 오류 추적
- 환경 변수 `NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true` 설정
- 오류 로그 확인

## 🔄 자동 배포

### 1. Git 푸시 시 자동 배포
- 기본적으로 활성화됨
- `main` 브랜치에 푸시하면 자동 배포

### 2. 프리뷰 배포
- Pull Request 생성 시 자동으로 프리뷰 배포
- 테스트 후 `main` 브랜치로 머지

### 3. 수동 배포
- Amplify 콘솔에서 **"재배포"** 버튼 클릭

## 🛡️ 보안 고려사항

### 1. 환경 변수 보안
- 민감한 정보는 환경 변수로 관리
- Git에 직접 커밋하지 않음

### 2. API 키 관리
- 백엔드 API 키는 환경 변수로 설정
- 프론트엔드에서 직접 노출하지 않음

### 3. CORS 설정
- 백엔드에서 허용된 도메인만 설정
- 보안 헤더 설정

## 📝 체크리스트

### 배포 전
- [ ] 환경 변수 설정 완료
- [ ] 백엔드 API 서버 실행 중
- [ ] CORS 설정 확인
- [ ] 빌드 테스트 완료

### 배포 후
- [ ] 애플리케이션 접속 확인
- [ ] API 연결 테스트
- [ ] 기능 테스트
- [ ] 성능 확인

## 📞 지원

문제가 발생하면:
1. Amplify 콘솔의 빌드 로그 확인
2. 환경 변수 설정 재확인
3. 백엔드 서버 상태 확인
4. 필요시 AWS 지원팀 문의

## 🔗 유용한 링크

- [AWS Amplify 문서](https://docs.aws.amazon.com/amplify/)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [AWS Amplify 문제 해결](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting.html)
