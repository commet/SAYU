# Mood Atlas API 가이드

> **완성 날짜:** 2025-01-07
> **상태:** ✅ 완전 구현 완료

---

## 🎯 개요

Mood Atlas는 감정 기반 예술 작품 추천 및 일일 감정 기록 시스템입니다.

**핵심 기능:**
- 🎨 AI 기반 작품 추천 (Groq)
- 📝 일일 감정 기록
- 🗺️ 7개 예술 대륙 탐험
- 📊 감정 통계 & 히스토리

---

## 🔑 환경 변수

`.env` 파일에 추가 필요:

```bash
# Groq AI (작품 추천)
GROQ_API_KEY=your_groq_api_key_here

# Supabase (이미 있을 것)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

---

## 📡 API 엔드포인트

### Base URL
```
http://localhost:5001/api/mood-atlas
```

### 인증
모든 엔드포인트는 JWT 인증 필요:
```
Authorization: Bearer <your_jwt_token>
```

---

## 1️⃣ 감정 기록 & 추천

### 1.1 AI 작품 추천

**POST** `/recommend`

감정 색상과 강도를 기반으로 AI가 3개 작품 추천.

**Request Body:**
```json
{
  "emotionColor": "blue",
  "emotionIntensity": 25
}
```

**Parameters:**
- `emotionColor` (required): "blue", "red", "yellow", "purple", "green", "gray"
- `emotionIntensity` (required): 0-100 (숫자)

**Response:**
```json
[
  {
    "artworkId": "the-art-of-painting",
    "title": "The Art of Painting",
    "artist": "Jan Vermeer",
    "year": "",
    "imageUrl": "https://res.cloudinary.com/...",
    "thumbnailUrl": "https://res.cloudinary.com/...",
    "emotionMessage": "차분한 분위기가 마음을 편안하게 해줄 거예요",
    "aiReason": "고요한 색채와 균형 잡힌 구도가 당신의 평온한 마음에 어울려요",
    "score": 87
  },
  // ... 2개 더
]
```

---

### 1.2 일일 감정 기록

**POST** `/entry`

오늘의 감정을 기록하고 타일을 색칠합니다.

**Request Body:**
```json
{
  "emotionColor": "blue",
  "emotionIntensity": 25,
  "isComplex": false,
  "colorSecondary": null,
  "selectedArtworkId": "the-art-of-painting",
  "recommendedArtworks": [...],
  "userMemo": "오늘 회의가 많았지만 차분했다"
}
```

**Response:**
```json
{
  "entry": {
    "id": "uuid",
    "emotion_color": "blue",
    "emotion_intensity": 25,
    "emotion_label": "연한 파랑",
    "selected_artwork_id": "the-art-of-painting",
    "user_memo": "오늘 회의가 많았지만 차분했다",
    "region": "renaissance",
    "tile_number": 1,
    "date": "2025-01-07"
  },
  "progress": {
    "current_streak": 1,
    "total_entries": 1,
    "total_tiles_filled": 1,
    "complex_emotion_unlocked": false
  },
  "rewards": [
    {
      "type": "streak",
      "name": "3일 연속",
      "points": 50
    }
  ]
}
```

---

### 1.3 오늘의 기록 조회

**GET** `/entry/today`

오늘 기록이 있는지 확인.

**Response:**
```json
{
  "id": "uuid",
  "emotion_color": "blue",
  "emotion_intensity": 25,
  "date": "2025-01-07",
  // ...
}
```

또는 기록 없으면: `null`

---

### 1.4 특정 날짜 기록 조회

**GET** `/entry/:date`

**Example:** `/entry/2025-01-07`

**Response:** 위와 동일

---

## 2️⃣ 진행 상황 & 지도

### 2.1 사용자 진행 상황

**GET** `/progress`

현재 진행 상황, 스트릭, 통계 조회.

**Response:**
```json
{
  "user_id": "uuid",
  "current_region": "renaissance",
  "current_day": 1,
  "completed_regions": [],
  "current_streak": 1,
  "longest_streak": 1,
  "total_entries": 1,
  "total_tiles_filled": 1,
  "color_distribution": {
    "blue": 1
  },
  "complex_emotion_unlocked": false,
  "triple_emotion_unlocked": false
}
```

---

### 2.2 전체 지도 데이터

**GET** `/map`

전체 지도와 타일 정보.

**Response:**
```json
{
  "progress": { /* 진행 상황 */ },
  "regions": [
    {
      "id": "renaissance",
      "name_ko": "르네상스 중심",
      "icon": "🏛️",
      "total_tiles": 10,
      "day_start": 1,
      "day_end": 10
    }
    // ... 6개 더
  ],
  "entries": [
    {
      "id": "uuid",
      "region": "renaissance",
      "tile_number": 1,
      "emotion_color": "blue",
      "date": "2025-01-07"
    }
  ]
}
```

---

### 2.3 지역 목록

**GET** `/regions`

7개 예술 대륙 목록.

**Response:**
```json
[
  {
    "id": "renaissance",
    "name_ko": "르네상스 중심",
    "name_en": "Renaissance Plaza",
    "icon": "🏛️",
    "day_start": 1,
    "day_end": 10,
    "total_tiles": 10,
    "featured_artists": ["Leonardo da Vinci", "Michelangelo"],
    "emotion_affinity": ["yellow", "green"],
    "completion_reward": {
      "points": 500,
      "badge": "renaissance-scholar",
      "title": "르네상스인"
    }
  }
  // ... 6개 더
]
```

---

### 2.4 지역 상세 정보

**GET** `/regions/:regionId`

**Example:** `/regions/renaissance`

**Response:** 지역 하나의 상세 정보

---

### 2.5 지역 선택 (분기점)

**POST** `/regions/select`

다음 지역 선택 (Day 11, 31, 81 등).

**Request Body:**
```json
{
  "regionId": "impressionist"
}
```

**Response:**
```json
{
  "current_region": "impressionist",
  "message": "인상주의 해안으로 이동했습니다"
}
```

---

## 3️⃣ 히스토리 & 통계

### 3.1 감정 기록 히스토리

**GET** `/history?limit=30&offset=0`

과거 기록 조회 (페이지네이션).

**Query Parameters:**
- `limit`: 개수 (기본 30)
- `offset`: 건너뛸 개수 (기본 0)

**Response:**
```json
[
  {
    "id": "uuid",
    "emotion_color": "blue",
    "emotion_intensity": 25,
    "emotion_label": "연한 파랑",
    "selected_artwork_data": { /* 작품 정보 */ },
    "user_memo": "오늘은 차분했다",
    "date": "2025-01-07"
  }
  // ...
]
```

---

### 3.2 월별 캘린더

**GET** `/calendar/:year/:month`

**Example:** `/calendar/2025/1`

**Response:**
```json
[
  {
    "date": "2025-01-07",
    "emotion_color": "blue",
    "emotion_intensity": 25,
    "emotion_label": "연한 파랑"
  },
  {
    "date": "2025-01-08",
    "emotion_color": "yellow",
    "emotion_intensity": 60,
    "emotion_label": "중간 노랑"
  }
]
```

---

### 3.3 감정 통계

**GET** `/statistics`

전체 통계 요약.

**Response:**
```json
{
  "totalEntries": 10,
  "currentStreak": 3,
  "longestStreak": 5,
  "totalTilesFilled": 10,
  "colorDistribution": {
    "blue": 4,
    "yellow": 3,
    "red": 2,
    "green": 1
  },
  "completedRegions": ["renaissance"],
  "currentRegion": "impressionist"
}
```

---

## 4️⃣ 작품 정보

### 4.1 작품 상세 정보

**GET** `/artworks/:artworkId`

**Example:** `/artworks/the-art-of-painting`

**Response:**
```json
{
  "id": "the-art-of-painting",
  "title": "The Art of Painting",
  "artist": "Jan Vermeer",
  "year": "",
  "region": "renaissance",
  "image_url": "https://...",
  "thumbnail_url": "https://...",
  "emotions": {
    "blue-light": "차분한 분위기가 마음을 편안하게 해줄 거예요",
    "blue-medium": "...",
    // ... 18가지 감정별 메시지
  },
  "story": "Jan Vermeer의 대표작 중 하나로...",
  "fun_fact": "이 시대를 대표하는 걸작으로...",
  "tags": ["르네상스 중심"]
}
```

---

### 4.2 지역별 작품 목록

**GET** `/regions/:regionId/artworks`

**Example:** `/regions/renaissance/artworks`

**Response:**
```json
[
  { /* 작품 1 */ },
  { /* 작품 2 */ },
  // ... 10개
]
```

---

## 🧪 테스트 시나리오

### 시나리오 1: 첫 기록 만들기

```bash
# 1. AI 추천 받기
curl -X POST http://localhost:5001/api/mood-atlas/recommend \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"emotionColor": "blue", "emotionIntensity": 25}'

# 2. 첫 번째 작품 선택해서 기록
curl -X POST http://localhost:5001/api/mood-atlas/entry \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emotionColor": "blue",
    "emotionIntensity": 25,
    "selectedArtworkId": "the-art-of-painting",
    "userMemo": "첫 기록!"
  }'

# 3. 진행 상황 확인
curl http://localhost:5001/api/mood-atlas/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 시나리오 2: 7일 연속 기록

매일 다른 감정으로 7번 기록 → "꾸준한 기록자" 뱃지 획득

---

### 시나리오 3: 첫 지역 완료

르네상스 중심 10개 타일 모두 색칠 → "르네상스인" 칭호 + 500pt

---

## 🐛 에러 처리

### 일반적인 에러

```json
{
  "error": "Missing required fields: emotionColor, emotionIntensity"
}
```

**Status Codes:**
- `200` - 성공
- `400` - 잘못된 요청
- `401` - 인증 실패
- `404` - 리소스 없음
- `500` - 서버 오류

---

## 📝 체크리스트

### 서버 시작 전

- [ ] DB 마이그레이션 완료 (001, 002, 003 실행)
- [ ] `.env`에 `GROQ_API_KEY` 추가
- [ ] Supabase 연결 확인

### 테스트

- [ ] `/api/mood-atlas/regions` 조회 (인증 없이도 가능한지 확인)
- [ ] `/api/mood-atlas/recommend` 추천 받기
- [ ] `/api/mood-atlas/entry` 기록 생성
- [ ] `/api/mood-atlas/progress` 진행 상황 확인

---

## 🚀 다음 단계

Backend API 완성! 이제:

1. **서버 시작**
   ```bash
   cd backend
   npm run dev
   ```

2. **Postman/Thunder Client로 테스트**

3. **Frontend 구현**
   - `ColorSelector.tsx`
   - `IntensitySlider.tsx`
   - `ArtworkCard.tsx`
   - `TileGrid.tsx`

---

**✨ Backend API 완전 구현 완료!**
