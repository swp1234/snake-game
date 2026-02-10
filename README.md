# Snake Classic 🐍

클래식 뱀 게임의 현대적 리메이크입니다. 2026년 UI/UX 트렌드를 적용하여 네온 스타일, 부드러운 애니메이션, 모바일 최적화를 제공합니다.

## 기능

### 게임 플레이
- **Canvas 기반 렌더링**: 60fps 부드러운 애니메이션
- **두 가지 게임 모드**:
  - 벽 모드: 벽에 부딪히면 게임오버
  - 무한 모드: 벽을 통과하여 반대편으로 나옴
- **다양한 먹이 종류**:
  - 🍎 기본 사과 (점수 +10)
  - ⭐ 보너스 (점수 +50, 5초 지속)
  - 💎 다이아몬드 (점수 +100, 3초 지속)

### 조작 방법
- **데스크톱**: 방향키 또는 WASD 키
- **모바일**: 화면 스와이프
- **일시정지**: 스페이스바

### 시각 효과
- 네온 그라데이션 뱀 그래픽
- 먹이 먹을 때 파티클 이펙트
- 부드러운 펄스 애니메이션
- 그리드 배경 패턴
- 네온 글로우 효과

### 오디오
- Web Audio API 기반 사운드 효과
- 먹이 먹을 때 긍정적인 소리
- 충돌/게임오버 부정적인 소리
- 음향 토글 버튼

### 다국어 지원
12개 언어 완벽 지원:
- 한국어 (기본)
- English, 中文, हिन्दी, Русский
- 日本語, Español, Português
- Bahasa Indonesia, Türkçe, Deutsch, Français

### 데이터 저장
- localStorage를 통한 최고 기록 저장
- 게임 통계 (플레이 횟수, 총 점수, 먹이 개수, 생존 시간)

### PWA 기능
- Service Worker 오프라인 지원
- 앱으로 설치 가능
- 홈 화면 추가 가능
- 네이티브 앱처럼 동작

### SEO & 소셜 공유
- Open Graph 메타태그
- Twitter Card 설정
- Schema.org 구조화된 데이터
- 결과 공유 기능

### 광고 통합
- AdSense 배너 광고 영역
- AdMob 전면 광고 플레이스홀더
- 보상형 광고 (부활 기능)

## 파일 구조

```
snake-game/
├── index.html          # 메인 HTML (GA4, AdSense, PWA 설정 포함)
├── manifest.json       # PWA 설정
├── sw.js               # Service Worker (오프라인 지원)
├── css/
│   └── style.css       # 다크모드 우선, 반응형 스타일
├── js/
│   ├── app.js          # 게임 엔진 (Canvas, 로직, 렌더링)
│   ├── i18n.js         # 다국어 지원 모듈
│   ├── sound-engine.js # Web Audio API 사운드 엔진
│   └── locales/        # 12개 언어 JSON
│       ├── ko.json
│       ├── en.json
│       ├── zh.json
│       ├── hi.json
│       ├── ru.json
│       ├── ja.json
│       ├── es.json
│       ├── pt.json
│       ├── id.json
│       ├── tr.json
│       ├── de.json
│       └── fr.json
├── icon-192.svg        # PWA 아이콘 (192x192)
├── icon-512.svg        # PWA 아이콘 (512x512)
└── README.md           # 이 파일
```

## 기술 스택

- **HTML5**: 시맨틱 마크업, PWA 메타태그
- **CSS3**: Glassmorphism, 그라데이션, 애니메이션, 반응형 디자인
- **Vanilla JavaScript**: Canvas API, Web Audio API, LocalStorage
- **Canvas**: 게임 렌더링 (부드러운 60fps)
- **Service Worker**: 오프라인 지원, 캐싱 전략

## 설치 및 실행

### 로컬 테스트
```bash
cd projects/snake-game
python -m http.server 8000
# http://localhost:8000 에서 접속
```

### 배포
1. `/snake-game/` 디렉토리 전체를 웹 서버에 업로드
2. HTTPS 필수 (Service Worker, PWA 설치 기능 사용)
3. AdSense/AdMob 설정 확인

## 설계 원칙

### 2026 UI/UX 트렌드
1. **Glassmorphism 2.0** - 함수형 블러 효과
2. **Microinteractions** - 부드러운 호버, 탭 애니메이션
3. **Dark Mode First** - 어두운 배경이 기본
4. **Minimalist Flow** - 화면당 하나의 액션
5. **Progress & Statistics** - 데이터 시각화

### 디자인 색상
- **Primary (Main)**: #2ecc71 (네온 그린)
- **Primary Light**: #3bd882 (밝은 그린)
- **Secondary**: #27ae60 (짙은 그린)
- **Accent**: #f1c40f (골드)
- **Danger**: #e74c3c (빨강)
- **Background**: #0f0f23 (매우 어두운 파란색)

### 접근성
- 44px+ 터치 타겟 크기
- 충분한 색상 대비
- 키보드 네비게이션 지원
- ARIA 라벨 포함

## 성능 최적화

- Canvas 렌더링으로 DOM 최소화
- requestAnimationFrame으로 부드러운 60fps
- 캐시 전략으로 로딩 시간 단축
- 이미지 대신 SVG 아이콘 사용 (가볍고 확장 가능)

## 브라우저 지원

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- iOS Safari 12+
- 안드로이드 Chrome 60+

## 수익화 전략

### AdSense/AdMob 배치
1. 상단 배너 (메뉴, 게임오버)
2. 하단 배너 (게임오버)
3. 전면 광고 (부활 기능)
4. 보상형 광고 (향후 확장)

### 인앱 결제 (향후)
- 광고 제거 (₩3,900)
- 스킨/테마 언락

## 향후 계획

- [ ] 스킨/색상 커스터마이징
- [ ] 리더보드 시스템
- [ ] 멀티플레이어 모드
- [ ] 데일리 챌린지
- [ ] 업적/배지 시스템
- [ ] 소셜 공유 확대

## 라이선스

Copyright © 2026 DopaBrain. All rights reserved.

## 문의

- 웹사이트: https://dopabrain.com/
- 이메일: support@dopabrain.com
