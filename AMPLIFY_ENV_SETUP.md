# AWS Amplify 환경변수 설정 가이드

## 🚀 Amplify 콘솔에서 설정해야 할 환경변수들

### 1. API 서버 설정
```
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com
NEXT_PUBLIC_WS_BASE_URL=https://api.your-domain.com
```

### 2. 애플리케이션 설정
```
NEXT_PUBLIC_APP_NAME=HowAreYou
NEXT_PUBLIC_APP_VERSION=2.0.0
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_AMPLIFY_ENV=production
```

### 3. 분석 및 모니터링
```
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=true
```

### 4. 보안 설정
```
NEXT_PUBLIC_COOKIE_SECURE=true
NEXT_PUBLIC_COOKIE_SAME_SITE=strict
```

### 5. CORS 설정
```
NEXT_PUBLIC_ALLOWED_ORIGINS=https://your-app.amplifyapp.com,https://your-domain.com
```

## 📍 설정 방법

1. **AWS Amplify 콘솔** 접속
2. **앱 선택** → **환경 변수** 메뉴
3. **환경 변수 추가** 버튼 클릭
4. 위의 키-값 쌍들을 하나씩 추가

## ⚠️ 주의사항

- **Secret이 아닌 환경변수로 설정**: 현재 모든 변수가 `NEXT_PUBLIC_` 접두사를 사용
- **빌드 시점 필요**: 이 값들이 빌드 과정에서 번들에 포함됨
- **민감하지 않은 정보**: API 엔드포인트, 앱 이름 등은 공개되어도 문제없음

## 🔧 추가 설정 (필요시)

### 메모리 제한 설정
- Amplify 콘솔 → 앱 → 빌드 설정
- 메모리 제한: 4096MB (권장)

### 빌드 타임아웃 설정
- 기본값: 30분
- 필요시 60분으로 연장 가능

## 🚨 문제 해결

### 빌드 실패 시 확인사항
1. 환경변수 이름이 정확한지 확인
2. 값에 특수문자가 포함되어 있지 않은지 확인
3. 빌드 로그에서 환경변수 관련 오류 확인

### 성능 최적화
1. `npm ci --prefer-offline --no-audit` 사용
2. 캐시 경로 설정 확인
3. 불필요한 의존성 제거
