<p align="center">
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue" alt="Platform" />
  <img src="https://img.shields.io/badge/Framework-Expo%20SDK%2054-blueviolet" alt="Expo SDK" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6" alt="TypeScript" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

# 🌸 오카야마 쓰레기통 MapWiki

> **여행 중에, 오카야마를 조금 더 깨끗하게.**
>
> 오카야마 시내를 걷는 여행자와 지역 주민이 거리에서 발견한 쓰레기통의 위치를 사진·위치정보·분리수거 정보와 함께 등록하고, 모두가 공유할 수 있는 커뮤니티형 지도 앱입니다.

🌐 **Language / 言語**: [🇯🇵 日本語](README.md) | **🇰🇷 한국어**

---

## 📖 목차

- [앱 개요](#-앱-개요)
- [주요 기능](#-주요-기능)
- [화면 구성](#-화면-구성)
- [기술 스택](#-기술-스택)
- [아키텍처 설계](#-아키텍처-설계)
- [디자인 시스템](#-디자인-시스템)
- [디렉토리 구조](#-디렉토리-구조)
- [데이터 모델](#-데이터-모델)
- [설정 및 실행 방법](#-설정-및-실행-방법)
- [향후 개발 계획](#-향후-개발-계획)
- [라이선스](#-라이선스)

---

## 🗺️ 앱 개요

| 항목 | 내용 |
|------|------|
| **앱 이름** | 오카야마 쓰레기통 MapWiki |
| **컨셉** | 오카야마를 여행하며 거리를 조금 더 깨끗하게 만드는 지도 앱 |
| **대상 사용자** | 오카야마 시내를 걷는 여행자·지역 주민 |
| **테마** | Sakura Travel Clean Map (벚꽃 여행 × 청결감 × 지역 공헌) |

### 컨셉

쓰레기통 앱이지만, "지저분한" 인상을 주지 않는 설계 철학을 채택했습니다. 봄의 오카야마를 걷는 듯한, 깨끗하고 따뜻한 여행 앱으로서의 UX를 목표로 하고 있습니다.

사용자가 **"귀엽다", "편리하다", "지역에 도움이 된다"** 라고 느낄 수 있는 UI를 구현합니다.

---

## ✨ 주요 기능

### 🗺️ 지도 탐색
- 오카야마 시내의 쓰레기통을 지도 위에 실시간 표시
- 카테고리별 필터링 (타는 쓰레기 / 페트병 / 캔 / 병 / 플라스틱 / 종이 / 기타)
- 검색바를 통한 지역 검색
- 현재 위치로 원탭 이동

### 📷 사진 촬영
- 카메라를 이용한 쓰레기통 촬영
- 라이브러리에서 사진 선택
- 촬영 가이드 프레임 표시

### 📝 쓰레기통 등록
- 사진 + 위치정보 + 분리수거 카테고리 일괄 등록
- 지도에서 위치 미세 조정 (모달 맵)
- 청결도·찾기 쉬움 3단계 평가
- 이용 가능 시간 설정
- AI를 통한 사진 자동 분석 (목업 구현)

### 📋 상세 표시 & 편집
- 쓰레기통 상세 정보 표시 (지도 + 사진 포함)
- "도움이 됐어요!" 버튼
- 정보 편집 제안·문제 신고
- 쓰레기통 삭제 기능

---

## 📱 화면 구성

본 앱은 다음 **5개 화면**으로 구성되어 있습니다.

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│              │    │              │    │              │
│  1. 지도     │───▶│  2. 카메라    │───▶│  3. 등록     │
│   (index)    │    │   (camera)   │    │  (register)  │
│              │    │              │    │              │
└──────┬───────┘    └──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐
│              │    │              │
│  4. 상세     │───▶│  5. 편집     │
│   (detail)   │    │    (edit)    │
│              │    │              │
└──────────────┘    └──────────────┘
```

| # | 화면명 | 파일 | 역할 |
|---|--------|------|------|
| 1 | **메인 (지도)** | `src/app/index.tsx` | 지도에서 쓰레기통을 찾고 선택 |
| 2 | **카메라** | `src/app/camera.tsx` | 쓰레기통 사진 촬영 |
| 3 | **쓰레기통 등록** | `src/app/register.tsx` | 촬영한 사진과 정보를 입력하여 등록 |
| 4 | **쓰레기통 상세** | `src/app/detail.tsx` | 선택한 쓰레기통의 상세 정보 확인 |
| 5 | **쓰레기통 편집** | `src/app/edit.tsx` | 기존 쓰레기통 정보 수정 |

---

## 🛠️ 기술 스택

| 카테고리 | 기술 | 버전 |
|----------|------|------|
| **프레임워크** | Expo | SDK 54 |
| **언어** | TypeScript | ~6.0.3 |
| **UI 프레임워크** | React Native | 0.81.5 |
| **라우팅** | Expo Router | ~6.0.24 (파일 기반) |
| **지도** | react-native-maps | 1.20.1 |
| **카메라** | expo-camera | ~17.0.10 |
| **이미지 선택** | expo-image-picker | ~17.0.11 |
| **위치 정보** | expo-location | ~19.0.8 |
| **이미지 표시** | expo-image | ~3.0.11 |
| **로컬 스토리지** | @react-native-async-storage/async-storage | 2.2.0 |
| **애니메이션** | react-native-reanimated | ~4.1.1 |
| **제스처** | react-native-gesture-handler | ~2.28.0 |
| **컴파일러** | React Compiler | 활성화 |

---

## 🏗️ 아키텍처 설계

### 전체 구성

```
┌─────────────────────────────────────────────┐
│                  Expo Router                 │
│              (파일 기반 라우팅)                │
├─────────────────────────────────────────────┤
│                                             │
│   Screen Layer (화면 컴포넌트)                │
│   ┌────────┐ ┌────────┐ ┌────────┐         │
│   │ index  │ │ camera │ │register│ ...      │
│   └───┬────┘ └───┬────┘ └───┬────┘         │
│       │          │          │               │
├───────┼──────────┼──────────┼───────────────┤
│       ▼          ▼          ▼               │
│           Context Layer (상태 관리)           │
│   ┌─────────────────────────────────┐       │
│   │         BinContext              │       │
│   │  (쓰레기통 데이터 중앙 관리)       │       │
│   │  - bins[]  - selectedBin        │       │
│   │  - capturedImage                │       │
│   │  - addBin / updateBin / remove  │       │
│   └──────────────┬──────────────────┘       │
│                  │                          │
├──────────────────┼──────────────────────────┤
│                  ▼                          │
│           Storage Layer (영속화)              │
│   ┌─────────────────────────────────┐       │
│   │       AsyncStorage              │       │
│   │   @trash_bins_v1                │       │
│   └─────────────────────────────────┘       │
│                                             │
├─────────────────────────────────────────────┤
│         Native APIs (네이티브 연동)           │
│   ┌────────┐ ┌────────┐ ┌──────────┐       │
│   │ Camera │ │Location│ │ImagePicker│       │
│   └────────┘ └────────┘ └──────────┘       │
└─────────────────────────────────────────────┘
```

### 상태 관리

**React Context** (`BinContext`)를 이용한 심플한 상태 관리를 채택하고 있습니다.

```typescript
// 주요 상태
bins: TrashBin[]            // 전체 쓰레기통 데이터
selectedBin: TrashBin | null // 선택 중인 쓰레기통
capturedImage: string | null // 촬영된 이미지 URI

// 조작 함수
addBin()    → 신규 등록 + AsyncStorage 영속화
updateBin() → 정보 업데이트 + AsyncStorage 영속화
removeBin() → 삭제 + AsyncStorage 영속화
```

### 라우팅

Expo Router의 파일 기반 라우팅을 채택. `src/app/` 디렉토리 구조가 그대로 URL 경로에 대응합니다.

```
src/app/
├── _layout.tsx   → 루트 레이아웃 (BinProvider로 래핑)
├── index.tsx     → / (지도 화면)
├── camera.tsx    → /camera (모달 표시)
├── register.tsx  → /register
├── detail.tsx    → /detail
└── edit.tsx      → /edit
```

---

## 🎨 디자인 시스템

### 테마명: **Sakura Travel Clean Map**

#### 목표 이미지
🌸 벚꽃 ・ 🚶 봄 여행 ・ 🏯 오카야마 산책 ・ ✨ 청결감 ・ 🤝 지역 공헌 ・ 😊 친근함

#### 피해야 할 이미지
❌ 지저분함 ・ ❌ 어두움 ・ ❌ 무거움 ・ ❌ 업무용 앱 느낌 ・ ❌ 원색 과다

### 컬러 팔레트

| 용도 | 색상명 | HEX | 미리보기 |
|------|--------|-----|---------|
| **Primary** | Sakura Pink | `#F58FB2` | 🩷 |
| **Primary Light** | Sakura Mist | `#FFE6EF` | 🌸 |
| **Accent** | Okayama Peach | `#FFB6A3` | 🍑 |
| **Clean Accent** | Fresh Leaf | `#7CCFA6` | 🌿 |
| **Map Accent** | Setouchi Sky | `#8ECDF8` | 🌊 |
| **Background** | Warm Cream | `#FFF8F4` | 🤍 |
| **Surface** | White | `#FFFFFF` | ⬜ |
| **Text Main** | Charcoal | `#30323A` | ⬛ |
| **Text Sub** | Soft Gray | `#8A8F98` | ◽ |
| **Border** | Pale Rose Border | `#F3D8E2` | 🌷 |
| **Shadow** | Pink Shadow | `rgba(245,143,178,0.15)` | - |

### 배색 규칙

- **Primary**는 반드시 Sakura Pink `#F58FB2`
- **배경**은 Warm Cream `#FFF8F4`을 기본
- **카드**는 흰색 `#FFFFFF`으로 통일
- **CTA 버튼**은 벚꽃 핑크 기준
- **녹색**은 성공·청결·확인 완료 상태에만 사용
- **그림자**는 연한 핑크 계열로 부드럽게 (검고 무거운 그림자 금지)

### UI 스타일

| 요소 | 사양 |
|------|------|
| **모서리 둥글기 (카드)** | 24px |
| **모서리 둥글기 (버튼)** | 999px (완전 원형) / 18~24px |
| **모서리 둥글기 (입력란)** | 16px |
| **모서리 둥글기 (사진 카드)** | 24px |
| **모서리 둥글기 (하단 시트)** | 상단 32px |
| **아이콘** | 둥근 아웃라인으로 통일 |
| **폰트** | 가독성이 좋은 둥근 고딕체 |

---

## 📂 디렉토리 구조

```
trush-app/
├── 📁 src/
│   ├── 📁 app/                    # 화면 컴포넌트 (Expo Router)
│   │   ├── _layout.tsx            #   루트 레이아웃 & BinProvider
│   │   ├── index.tsx              #   지도 화면 (메인)
│   │   ├── camera.tsx             #   카메라 촬영 화면
│   │   ├── register.tsx           #   쓰레기통 등록 화면
│   │   ├── detail.tsx             #   쓰레기통 상세 화면
│   │   └── edit.tsx               #   쓰레기통 편집 화면
│   ├── 📁 components/             # 재사용 컴포넌트
│   │   ├── animated-icon.tsx      #   애니메이션 아이콘
│   │   ├── app-tabs.tsx           #   탭 내비게이션
│   │   ├── external-link.tsx      #   외부 링크
│   │   ├── hint-row.tsx           #   힌트 행
│   │   ├── themed-view.tsx        #   테마 대응 View
│   │   ├── web-badge.tsx          #   웹 배지
│   │   └── 📁 ui/                 #   기본 UI 컴포넌트
│   ├── 📁 constants/              # 상수 정의
│   │   └── theme.ts               #   컬러 팔레트 & 디자인 토큰
│   ├── 📁 contexts/               # React Context
│   │   └── BinContext.tsx          #   쓰레기통 데이터 상태 관리
│   ├── 📁 hooks/                  # 커스텀 훅
│   │   ├── use-color-scheme.ts    #   컬러 스킴 감지
│   │   └── use-theme.ts           #   테마 훅
│   └── global.css                 # 글로벌 스타일
├── 📁 app-detail/                 # 앱 사양서
│   └── app-detail.txt             #   상세 사양 (디자인·UI 문구)
├── 📁 assets/                     # 정적 에셋 (이미지·폰트 등)
├── 📁 scripts/                    # 유틸리티 스크립트
├── app.json                       # Expo 설정
├── package.json                   # 의존성 관리
├── tsconfig.json                  # TypeScript 설정
└── LICENSE                        # MIT License
```

---

## 📊 데이터 모델

### TrashBin (쓰레기통)

```typescript
interface TrashBin {
  id: string;                    // 고유 식별자
  latitude: number;              // 위도
  longitude: number;             // 경도
  title: string;                 // 장소명 (예: "오카야마역 동쪽 출구 벤치 옆")
  distance?: number;             // 현재 위치로부터의 거리 (m)
  categories: BinCategory[];     // 분리수거 카테고리 (복수 선택 가능)
  cleanliness: Cleanliness;      // 청결도 (3단계)
  visibility: Visibility;        // 찾기 쉬움 (3단계)
  availableTime?: AvailableTime; // 이용 가능 시간
  memo: string;                  // 메모
  helpfulCount: number;          // "도움이 됐어요!" 수
  lastChecked: string;           // 최종 확인일
  imageUrl?: string;             // 쓰레기통 사진 URL
  isMine?: boolean;              // 본인이 등록했는지 여부
}
```

### 타입 정의

```typescript
// 분리수거 카테고리
type BinCategory = '燃えるごみ' | 'ペットボトル' | '缶' | 'ビン'
                 | 'プラスチック' | '紙' | 'その他';
// (타는 쓰레기 | 페트병 | 캔 | 병 | 플라스틱 | 종이 | 기타)

// 청결도
type Cleanliness = 'きれい' | '普通' | '少し注意';
// (깨끗함 | 보통 | 약간 주의)

// 찾기 쉬움
type Visibility = 'すぐ見つかる' | '少し探す' | '目印が必要';
// (바로 찾을 수 있음 | 조금 찾아야 함 | 표지가 필요)

// 이용 가능 시간
type AvailableTime = '24時間利用可' | '施設の営業時間のみ' | 'その他（メモに記載）';
// (24시간 이용 가능 | 시설 영업시간만 | 기타(메모 참조))
```

### 데이터 영속화

- **메인 저장소**: FastAPI backend (`/api/v1/containers`)
- **캐시**: AsyncStorage
- **키**: `@trash_bins_v1`
- **형식**: JSON 배열
- **API 연결 실패 시**: 캐시 또는 더미 데이터 1건(오카야마역 동쪽 출구 벤치 옆)을 표시

---

## 🚀 설정 및 실행 방법

### 사전 요구사항

- **Node.js** v18 이상
- **npm** 또는 **yarn**
- **Expo Go** 앱 (iOS / Android)

### 설치

```bash
# 리포지토리 클론
git clone https://github.com/OkayamaWasteContainerExpedition/trash-app.git
cd trash-app

# 의존성 설치
npm install
```

### 실행

백엔드를 먼저 실행한 뒤, 다른 터미널에서 앱을 실행합니다.

```bash
# ../backend/backend 에서 실행
../.venv/bin/python -m app
```

필요하면 `app/.env`에 API URL을 지정할 수 있습니다. 실제 기기에서 Expo Go로 확인할 때는 PC의 LAN IP를 넣어주세요.

```bash
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

```bash
# 개발 서버 시작
npm run start
```

실행 후, 다음 중 하나로 확인할 수 있습니다:

| 방법 | 설명 |
|------|------|
| **Expo Go** | QR코드 스캔 (iOS / Android) |
| **iOS Simulator** | `i` 키 누르기 |
| **Android Emulator** | `a` 키 누르기 |

### 사용 가능한 스크립트

```bash
npm run start      # Expo 개발 서버 시작
npm run ios        # iOS 시뮬레이터에서 실행
npm run android    # Android 에뮬레이터에서 실행
npm run web        # 웹 브라우저에서 실행
npm run lint       # ESLint 실행
```

---

## 🗓️ 향후 개발 계획

- [ ] 백엔드 API 연동 (Firebase / Supabase)
- [ ] 사용자 인증 기능
- [ ] "도움이 됐어요!" 버튼 카운트 구현
- [ ] 푸시 알림 (근처 쓰레기통 알림)
- [ ] AI 이미지 인식을 통한 자동 분리수거 카테고리 판별
- [ ] 다국어 지원 (영어 / 중국어 / 한국어)
- [ ] 오프라인 지도 대응
- [ ] 다크 모드

---

## 📄 라이선스

이 프로젝트는 [MIT License](LICENSE) 하에 공개되어 있습니다.

---

<p align="center">
  <strong>🌸 발견한 쓰레기통이 다음 여행자의 이정표가 됩니다. 🌸</strong><br>
  <em>당신의 등록이 누군가의 "도움이 됐어요"가 됩니다.</em>
</p>
