# 전시 기록 시스템 로드맵 📋

> SAYU 전시 관람 기록 시스템의 향후 개발 계획 및 작업 가이드

**현재 상태**: Phase 1 MVP 완료 ✅
**마지막 업데이트**: 2025-12-30

---

## 📍 현재 완료 상태

### ✅ Phase 1: MVP (완료)
- [x] 데이터베이스 스키마 (3개 테이블)
- [x] TypeScript 타입 정의
- [x] Zustand 상태 관리
- [x] API Routes (4개)
- [x] UI 컴포넌트 (6개)
- [x] 전시 상세 페이지 통합
- [x] Git 커밋 (commit: 1718587)

---

## 🚨 즉시 해야 할 작업 (우선순위: HIGH)

### 1. 테스트 데이터 추가 및 동작 확인

**예상 소요 시간**: 30분

**체크리스트**:
```sql
-- [ ] 1. Supabase에서 전시 목록 확인
SELECT id, title, venue FROM exhibitions LIMIT 10;

-- [ ] 2. 전시 하나 선택해서 샘플 작품 추가
SELECT insert_sample_exhibition_artworks('전시-UUID-여기', 10);

-- [ ] 3. 작품 목록 확인
SELECT id, title, artist FROM exhibition_artworks LIMIT 10;
```

**테스트 시나리오**:
- [ ] 전시 상세 페이지 접속
- [ ] "관람 시작하기" 버튼 클릭 → 성공 확인
- [ ] 플로팅 "+" 버튼 클릭
- [ ] 작품 검색 (샘플 작품 이름 입력)
- [ ] 작품 선택 → 감정 선택 → 기록 완료
- [ ] 헤더에서 "N개 작품 기록됨" 표시 확인
- [ ] 추가로 2-3개 작품 더 기록
- [ ] "관람 종료" 버튼 클릭
- [ ] 데이터베이스에서 기록 확인

**확인 쿼리**:
```sql
-- 방문 기록 확인
SELECT * FROM exhibition_visits ORDER BY started_at DESC LIMIT 5;

-- 작품 기록 확인
SELECT
    ar.emotions,
    ea.title as artwork_title,
    ea.artist
FROM artwork_records ar
JOIN exhibition_artworks ea ON ar.artwork_id = ea.id
ORDER BY ar.recorded_at DESC;
```

---

### 2. 버그 수정 및 에러 핸들링 강화

**예상 소요 시간**: 2시간

#### 2.1 인증 에러 처리

**문제**: 로그인하지 않은 사용자가 관람 시작 시도 시 에러
**위치**: `frontend/components/exhibition/StartVisitButton.tsx`

**해결 방법**:
```typescript
// Before
const handleStart = async () => {
  // 바로 API 호출
}

// After
const handleStart = async () => {
  // 1. 인증 확인
  const { user } = useAuth(); // 또는 Supabase auth 확인

  if (!user) {
    // 로그인 모달 표시 또는 로그인 페이지로 리다이렉트
    alert('로그인이 필요합니다.');
    router.push('/login');
    return;
  }

  // 2. API 호출
  // ...
}
```

**작업**:
- [ ] `StartVisitButton`에 인증 체크 추가
- [ ] 로그인 모달 또는 리다이렉트 구현
- [ ] Toast 알림으로 사용자 피드백 개선

---

#### 2.2 네트워크 에러 핸들링

**위치**: 모든 API 호출 부분

**개선 사항**:
```typescript
// 현재
try {
  const response = await fetch('/api/visits/start', { ... });
  const data = await response.json();

  if (data.success) {
    // 성공 처리
  } else {
    alert(`에러: ${data.error}`); // 너무 단순
  }
} catch (error) {
  console.error(error); // 사용자에게 피드백 없음
}

// 개선
import { toast } from 'react-hot-toast';

try {
  const response = await fetch('/api/visits/start', { ... });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.success) {
    toast.success('관람을 시작했습니다!');
    // 성공 처리
  } else {
    throw new Error(data.error);
  }
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    toast.error('네트워크 연결을 확인해주세요');
  } else {
    toast.error(error.message || '알 수 없는 오류가 발생했습니다');
  }
  console.error('Start visit error:', error);
}
```

**작업**:
- [ ] `react-hot-toast` 또는 `sonner` 설치 (이미 설치되어 있음)
- [ ] 모든 컴포넌트에 Toast 알림 추가
- [ ] 네트워크 타임아웃 처리 (10초)
- [ ] 재시도 로직 구현 (선택사항)

---

#### 2.3 데이터 검증

**위치**: API Routes

**개선 사항**:
```typescript
// /api/visits/start/route.ts
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { exhibitionId, deviceInfo } = body;

    // 검증 강화
    if (!exhibitionId || typeof exhibitionId !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Invalid exhibition ID',
      }, { status: 400 });
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(exhibitionId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid UUID format',
      }, { status: 400 });
    }

    // ...
  }
}
```

**작업**:
- [ ] 모든 API에 입력 검증 추가
- [ ] Zod 스키마 활용 (선택사항)
- [ ] 에러 메시지 한글화

---

### 3. 성능 최적화

**예상 소요 시간**: 1시간

#### 3.1 컴포넌트 최적화

**파일**: `frontend/components/exhibition/ArtworkSearchModal.tsx`

```typescript
// 현재: 매번 모든 결과 렌더링
{searchResults.map((artwork) => (
  <ArtworkCard key={artwork.id} artwork={artwork} />
))}

// 개선: React.memo로 불필요한 리렌더링 방지
const ArtworkCard = React.memo(({ artwork, onClick }) => (
  <button onClick={() => onClick(artwork)}>
    {/* ... */}
  </button>
));

// 개선: 가상 스크롤링 (결과가 100개 이상일 때)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={400}
  itemCount={searchResults.length}
  itemSize={80}
>
  {({ index, style }) => (
    <div style={style}>
      <ArtworkCard artwork={searchResults[index]} />
    </div>
  )}
</FixedSizeList>
```

**작업**:
- [ ] 주요 컴포넌트에 `React.memo` 적용
- [ ] 검색 결과 100개 이상일 때 가상 스크롤링 적용
- [ ] 이미지 lazy loading 추가

---

#### 3.2 API 응답 캐싱

**파일**: `frontend/app/api/artworks/search/route.ts`

```typescript
// Next.js 캐시 적용
export async function GET(request: NextRequest) {
  // ...

  return NextResponse.json(
    { success: true, data: artworks },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
      },
    }
  );
}
```

**작업**:
- [ ] 검색 API에 캐싱 헤더 추가
- [ ] React Query로 클라이언트 캐싱 (선택사항)

---

### 4. UI/UX 개선

**예상 소요 시간**: 2시간

#### 4.1 로딩 상태 개선

**현재 문제**:
- 검색 중 로딩 표시가 너무 작음
- 기록 저장 중 피드백 부족

**개선**:
```typescript
// EmotionSelector.tsx
const [isSubmitting, setIsSubmitting] = useState(false);

<button
  onClick={handleSubmit}
  disabled={isSubmitting || selectedEmotions.length === 0}
  className="relative"
>
  {isSubmitting ? (
    <>
      <Loader2 className="animate-spin mr-2" size={20} />
      저장 중...
    </>
  ) : (
    '기록 완료'
  )}
</button>
```

**작업**:
- [ ] 모든 비동기 작업에 로딩 상태 추가
- [ ] Skeleton UI 추가 (검색 결과 로딩 시)
- [ ] 성공/실패 애니메이션 추가

---

#### 4.2 모바일 최적화

**파일**: 모든 모달 컴포넌트

```css
/* 현재: 데스크톱만 고려 */
.modal {
  max-width: 600px;
}

/* 개선: 모바일 전체 화면 */
@media (max-width: 768px) {
  .modal {
    position: fixed;
    inset: 0;
    max-width: 100%;
    border-radius: 0;
  }
}
```

**작업**:
- [ ] 모달을 모바일에서 전체 화면으로 표시
- [ ] 터치 제스처 개선 (스와이프 닫기)
- [ ] 가상 키보드 대응

---

#### 4.3 접근성 개선

**작업**:
- [ ] 모든 버튼에 `aria-label` 추가
- [ ] 키보드 네비게이션 지원 (Tab, Enter, Esc)
- [ ] 스크린 리더 테스트
- [ ] 색상 대비 WCAG AA 준수 확인

---

## 🎯 Phase 2: 사진 인식 (우선순위: MEDIUM)

**예상 소요 시간**: 2주

### 목표
사용자가 작품을 촬영하면 자동으로 작품을 인식하여 기록 가능

---

### 2.1 기술 선택

#### 옵션 A: Perceptual Hashing (추천)

**장점**:
- ✅ 빠름 (밀리초 단위)
- ✅ 오프라인 가능
- ✅ 비용 없음
- ✅ 조명/각도 변화에 강건함

**단점**:
- ❌ 전시별 사전 데이터 구축 필요
- ❌ 인식률 80-85% (Cloud Vision보다 낮음)

**필요 라이브러리**:
```bash
npm install sharp imghash
```

**구현 예시**:
```typescript
// lib/image-recognition.ts
import sharp from 'sharp';
import { imageHash } from 'image-hash';

export async function calculatePHash(imagePath: string): Promise<string> {
  const buffer = await sharp(imagePath)
    .resize(256, 256, { fit: 'cover' })
    .grayscale()
    .raw()
    .toBuffer();

  return imageHash({
    data: buffer,
    width: 256,
    height: 256,
  }, 16); // 16-bit hash
}

export async function findSimilarArtworks(
  targetHash: string,
  exhibitionId: string
): Promise<Array<{ artworkId: string; similarity: number }>> {
  // Hamming distance 계산
  const artworks = await supabase
    .from('exhibition_artworks')
    .select('id, image_hash')
    .eq('exhibition_id', exhibitionId)
    .not('image_hash', 'is', null);

  const results = artworks.map(artwork => ({
    artworkId: artwork.id,
    similarity: calculateHammingDistance(targetHash, artwork.image_hash),
  }));

  return results
    .sort((a, b) => a.similarity - b.similarity)
    .slice(0, 3);
}

function calculateHammingDistance(hash1: string, hash2: string): number {
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}
```

---

#### 옵션 B: Google Cloud Vision API

**장점**:
- ✅ 높은 인식률 (90%+)
- ✅ 사전 데이터 구축 불필요

**단점**:
- ❌ 비용 발생 ($1.5/1000 requests)
- ❌ 오프라인 불가
- ❌ API 의존성

**필요**:
```bash
npm install @google-cloud/vision
```

---

### 2.2 구현 단계

#### Step 1: 카메라 인터페이스 구현

**파일**: `frontend/components/exhibition/CameraCapture.tsx`

```typescript
'use client';

import { useRef, useState } from 'react';
import { Camera as CameraIcon } from 'lucide-react';

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 1920, height: 1080 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStream(mediaStream);
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('카메라 권한이 필요합니다.');
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'artwork.jpg', { type: 'image/jpeg' });
      onCapture(file);

      // 카메라 종료
      stream?.getTracks().forEach(track => track.stop());
    }, 'image/jpeg', 0.9);
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={capturePhoto}
          className="w-16 h-16 rounded-full bg-white border-4 border-neutral-300"
        >
          <CameraIcon size={32} />
        </button>
      </div>
    </div>
  );
}
```

**작업**:
- [ ] `CameraCapture` 컴포넌트 생성
- [ ] 카메라 권한 요청 처리
- [ ] 촬영 가이드라인 표시
- [ ] 이미지 품질 체크 (흐림, 너무 어두움 등)

---

#### Step 2: 이미지 업로드 API

**파일**: `frontend/app/api/artworks/recognize/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { calculatePHash, findSimilarArtworks } from '@/lib/image-recognition';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const exhibitionId = formData.get('exhibitionId') as string;

    if (!image || !exhibitionId) {
      return NextResponse.json({
        success: false,
        error: 'Image and exhibition ID required',
      }, { status: 400 });
    }

    // 1. 이미지를 임시 저장
    const buffer = Buffer.from(await image.arrayBuffer());
    const tempPath = `/tmp/${Date.now()}-${image.name}`;
    await fs.promises.writeFile(tempPath, buffer);

    // 2. pHash 계산
    const hash = await calculatePHash(tempPath);

    // 3. 유사한 작품 검색
    const matches = await findSimilarArtworks(hash, exhibitionId);

    // 4. 작품 정보 가져오기
    const artworks = await supabase
      .from('exhibition_artworks')
      .select('*')
      .in('id', matches.map(m => m.artworkId));

    // 5. 신뢰도와 함께 반환
    const results = matches.map((match, index) => ({
      artwork: artworks.data?.find(a => a.id === match.artworkId),
      confidence: Math.max(0, 100 - (match.similarity * 5)), // Hamming distance → %
    }));

    // 6. 임시 파일 삭제
    await fs.promises.unlink(tempPath);

    return NextResponse.json({
      success: true,
      data: { matches: results },
    });
  } catch (error) {
    console.error('Recognition error:', error);
    return NextResponse.json({
      success: false,
      error: 'Recognition failed',
    }, { status: 500 });
  }
}
```

**작업**:
- [ ] 이미지 업로드 엔드포인트 생성
- [ ] pHash 계산 로직 구현
- [ ] 유사도 검색 알고리즘 구현
- [ ] 응답 형식 정의

---

#### Step 3: 전시별 작품 이미지 수집 및 인덱싱

**스크립트**: `backend/scripts/index-exhibition-artworks.ts`

```typescript
import { supabase } from '../lib/supabase';
import { calculatePHash } from '../lib/image-recognition';
import axios from 'axios';

async function indexExhibitionArtworks(exhibitionId: string) {
  console.log(`Indexing artworks for exhibition: ${exhibitionId}`);

  // 1. 전시의 모든 작품 가져오기
  const { data: artworks } = await supabase
    .from('exhibition_artworks')
    .select('id, image_url')
    .eq('exhibition_id', exhibitionId)
    .not('image_url', 'is', null);

  console.log(`Found ${artworks?.length} artworks with images`);

  // 2. 각 작품 이미지 다운로드 및 해시 계산
  for (const artwork of artworks || []) {
    try {
      // 이미지 다운로드
      const response = await axios.get(artwork.image_url, {
        responseType: 'arraybuffer',
      });

      const tempPath = `/tmp/${artwork.id}.jpg`;
      await fs.promises.writeFile(tempPath, response.data);

      // pHash 계산
      const hash = await calculatePHash(tempPath);

      // DB 업데이트
      await supabase
        .from('exhibition_artworks')
        .update({ image_hash: hash })
        .eq('id', artwork.id);

      console.log(`✓ Indexed: ${artwork.id}`);

      // 임시 파일 삭제
      await fs.promises.unlink(tempPath);
    } catch (error) {
      console.error(`✗ Failed to index ${artwork.id}:`, error);
    }
  }

  console.log('Indexing complete!');
}

// 실행
const exhibitionId = process.argv[2];
if (!exhibitionId) {
  console.error('Usage: ts-node index-exhibition-artworks.ts <exhibition-id>');
  process.exit(1);
}

indexExhibitionArtworks(exhibitionId);
```

**작업**:
- [ ] 이미지 수집 스크립트 작성
- [ ] 크롤링 또는 수동 업로드 프로세스 구축
- [ ] 배치 인덱싱 자동화 (cron job)

---

#### Step 4: UI 통합

**파일**: `frontend/components/exhibition/ArtworkSearchModal.tsx`

기존 검색 모달에 "📷 사진으로 찾기" 옵션 추가:

```typescript
const [captureMode, setCaptureMode] = useState<'search' | 'camera'>('search');

{captureMode === 'search' ? (
  <SearchInterface />
) : (
  <CameraCapture
    onCapture={async (file) => {
      setIsRecognizing(true);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('exhibitionId', exhibitionId);

      const response = await fetch('/api/artworks/recognize', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.data.matches.length > 0) {
        setRecognitionResults(data.data.matches);
        setIsRecognizing(false);
      } else {
        toast.error('작품을 찾지 못했습니다');
        setCaptureMode('search');
      }
    }}
  />
)}
```

**작업**:
- [ ] 사진 모드 UI 추가
- [ ] 인식 결과 (3개 후보) 표시
- [ ] 신뢰도 표시
- [ ] "찾는 작품이 없어요" → 검색 모드 전환

---

### 2.3 테스트

**체크리스트**:
- [ ] 조명이 좋은 환경에서 테스트
- [ ] 조명이 나쁜 환경에서 테스트
- [ ] 각도를 다르게 해서 촬영
- [ ] 부분만 촬영했을 때
- [ ] 반사광이 있을 때
- [ ] 인식률 80% 이상 달성 확인

---

## 🌐 Phase 3: 오프라인 지원 (우선순위: LOW)

**예상 소요 시간**: 1주

### 목표
네트워크 없이도 작품 기록 가능, 재연결 시 자동 동기화

---

### 3.1 Service Worker 설정

**파일**: `frontend/public/sw.js`

```javascript
const CACHE_NAME = 'sayu-exhibition-v1';
const OFFLINE_CACHE = 'sayu-offline-v1';

// 캐시할 정적 파일
const STATIC_FILES = [
  '/',
  '/exhibitions',
  '/manifest.json',
  '/favicon.ico',
];

// 설치
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    })
  );
});

// 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== OFFLINE_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch 인터셉트
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // API 요청 처리
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 성공 시 캐시 저장
          const clonedResponse = response.clone();
          caches.open(OFFLINE_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          // 실패 시 캐시에서 가져오기
          return caches.match(request);
        })
    );
  } else {
    // 정적 파일 처리
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
  }
});
```

**작업**:
- [ ] Service Worker 파일 생성
- [ ] 등록 스크립트 작성
- [ ] 캐싱 전략 구현
- [ ] Background Sync API 통합

---

### 3.2 IndexedDB 통합

**파일**: `frontend/lib/offline-db.ts`

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  visits: {
    key: string;
    value: LocalVisitState;
  };
  pending_sync: {
    key: string;
    value: {
      id: string;
      type: 'visit_start' | 'visit_end' | 'artwork_record';
      data: any;
      timestamp: string;
    };
  };
}

let db: IDBPDatabase<OfflineDB>;

export async function initDB() {
  db = await openDB<OfflineDB>('sayu-offline', 1, {
    upgrade(db) {
      db.createObjectStore('visits', { keyPath: 'visitId' });
      db.createObjectStore('pending_sync', { keyPath: 'id' });
    },
  });
  return db;
}

export async function saveVisit(visit: LocalVisitState) {
  const db = await initDB();
  await db.put('visits', visit);
}

export async function getVisit(visitId: string) {
  const db = await initDB();
  return db.get('visits', visitId);
}

export async function addPendingSync(item: {
  type: string;
  data: any;
}) {
  const db = await initDB();
  await db.add('pending_sync', {
    id: crypto.randomUUID(),
    type: item.type,
    data: item.data,
    timestamp: new Date().toISOString(),
  });
}

export async function syncPendingItems() {
  const db = await initDB();
  const items = await db.getAll('pending_sync');

  for (const item of items) {
    try {
      // API 호출
      const response = await fetch(`/api/${item.type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.data),
      });

      if (response.ok) {
        // 성공 시 삭제
        await db.delete('pending_sync', item.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
```

**작업**:
- [ ] IndexedDB 스키마 정의
- [ ] CRUD 함수 구현
- [ ] 동기화 로직 구현
- [ ] 충돌 해결 전략

---

### 3.3 오프라인 감지 UI

**파일**: `frontend/components/OfflineIndicator.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center z-50">
      <WifiOff className="inline mr-2" size={16} />
      오프라인 모드 - 기록은 로컬에 저장되며 연결 시 자동 동기화됩니다
    </div>
  );
}
```

**작업**:
- [ ] 오프라인 표시기 구현
- [ ] 재연결 시 자동 동기화 트리거
- [ ] 동기화 진행률 표시

---

## 🤖 Phase 4: AI 분석 (우선순위: LOW)

**예상 소요 시간**: 2주

### 목표
관람 종료 후 AI가 자동으로 인사이트 생성

---

### 4.1 데이터 분석 API

**파일**: `frontend/app/api/visits/[id]/analyze/route.ts`

```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: visitId } = await params;

  // 1. 방문 데이터 가져오기
  const { data: visit } = await supabase
    .from('exhibition_visits')
    .select(`
      *,
      records:artwork_records(
        emotions,
        emotion_text,
        artwork:exhibition_artworks(title, artist, medium)
      )
    `)
    .eq('id', visitId)
    .single();

  // 2. 분석 프롬프트 생성
  const prompt = `
다음은 사용자의 전시 관람 데이터입니다:

관람 시간: ${visit.duration_minutes}분
기록한 작품 수: ${visit.total_artworks_recorded}개

작품별 감정:
${visit.records.map(r => `
- ${r.artwork.title} (${r.artwork.artist})
  감정: ${r.emotions.join(', ')}
  ${r.emotion_text ? `추가 메모: ${r.emotion_text}` : ''}
`).join('\n')}

이 사용자의 관람 패턴을 분석하여 다음을 제공하세요:
1. 전체적인 감정 여정 (3-4문장)
2. 가장 공감한 작품과 그 이유
3. 다음 추천 전시 3가지 (구체적인 이유 포함)
4. 이 사용자의 미술 취향 프로필

JSON 형식으로 응답하세요.
`;

  // 3. GPT 호출
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      { role: 'system', content: 'You are an art curator and psychologist.' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  const analysis = JSON.parse(completion.choices[0].message.content);

  // 4. 분석 결과 저장
  await supabase
    .from('exhibition_visits')
    .update({ ai_analysis: analysis })
    .eq('id', visitId);

  return NextResponse.json({
    success: true,
    data: analysis,
  });
}
```

**작업**:
- [ ] GPT-4 API 연동
- [ ] 프롬프트 엔지니어링
- [ ] 분석 결과 저장
- [ ] 한국어 응답 최적화

---

### 4.2 인사이트 UI

**파일**: `frontend/app/exhibitions/history/[visitId]/page.tsx`

```typescript
'use client';

export default function VisitAnalysisPage({ params }) {
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    const response = await fetch(`/api/visits/${params.visitId}/analyze`, {
      method: 'POST',
    });
    const data = await response.json();
    setAnalysis(data.data);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">관람 인사이트</h1>

      {/* 감정 여정 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">감정 여정</h2>
        <p className="text-neutral-700 leading-relaxed">
          {analysis?.emotion_journey}
        </p>
      </section>

      {/* 가장 공감한 작품 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">가장 공감한 작품</h2>
        <div className="bg-neutral-50 p-6 rounded-xl">
          <h3 className="font-medium">{analysis?.most_resonant_artwork?.title}</h3>
          <p className="text-sm text-neutral-600">{analysis?.most_resonant_artwork?.reason}</p>
        </div>
      </section>

      {/* 추천 전시 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">다음 추천 전시</h2>
        <div className="grid gap-4">
          {analysis?.recommended_exhibitions?.map((rec, i) => (
            <div key={i} className="border border-neutral-200 p-4 rounded-xl">
              <h3 className="font-medium">{rec.title}</h3>
              <p className="text-sm text-neutral-600 mt-2">{rec.reason}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 미술 취향 프로필 */}
      <section>
        <h2 className="text-xl font-semibold mb-4">미술 취향 프로필</h2>
        <div className="space-y-2">
          {analysis?.art_profile?.preferences?.map((pref, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black"></span>
              <span>{pref}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

**작업**:
- [ ] 분석 결과 페이지 생성
- [ ] 시각화 추가 (차트, 그래프)
- [ ] 공유 기능 추가

---

## 🔧 추가 개선사항

### 1. 통계 대시보드

**파일**: `frontend/app/dashboard/exhibitions/page.tsx`

**기능**:
- 총 관람 시간
- 가장 많이 본 작가
- 감정 분포 차트
- 월별 관람 추이

**사용 라이브러리**:
```bash
npm install recharts
```

---

### 2. 소셜 기능

#### 2.1 기록 공유

```typescript
// /api/visits/[id]/share
export async function POST(request, { params }) {
  const { id: visitId } = params;

  // 공개 링크 생성
  const shareToken = crypto.randomUUID();

  await supabase
    .from('exhibition_visits')
    .update({ share_token: shareToken, is_public: true })
    .eq('id', visitId);

  return NextResponse.json({
    success: true,
    data: {
      shareUrl: `${process.env.NEXT_PUBLIC_URL}/shared/${shareToken}`,
    },
  });
}
```

#### 2.2 친구 기록 보기

```typescript
// 친구의 공개 기록 조회
const { data: friendVisits } = await supabase
  .from('exhibition_visits')
  .select(`
    *,
    user:profiles(username, avatar),
    records:artwork_records(*)
  `)
  .eq('is_public', true)
  .in('user_id', friendIds)
  .order('created_at', { ascending: false });
```

---

### 3. 알림 시스템

**기능**:
- 관람 중인 전시가 곧 종료될 때 알림
- 친구가 같은 전시 방문 시 알림
- 추천 전시 알림

**구현**: Firebase Cloud Messaging 또는 Web Push API

---

### 4. 성능 모니터링

**설치**:
```bash
npm install @vercel/analytics
```

**추적 항목**:
- 페이지 로딩 시간
- API 응답 시간
- 에러율
- 사용자 플로우 (Funnel)

---

## 📝 체크리스트 요약

### 즉시 (이번 주)
- [ ] 테스트 데이터 추가
- [ ] 기본 동작 테스트
- [ ] 버그 수정 (인증, 에러 핸들링)
- [ ] Toast 알림 추가
- [ ] 모바일 최적화

### 단기 (1-2주)
- [ ] 성능 최적화
- [ ] UI/UX 개선
- [ ] 접근성 개선
- [ ] 통계 대시보드 구현

### 중기 (1개월)
- [ ] Phase 2: 사진 인식 구현
- [ ] 소셜 기능 추가
- [ ] 알림 시스템 구현

### 장기 (2-3개월)
- [ ] Phase 3: 오프라인 지원
- [ ] Phase 4: AI 분석
- [ ] 국제화 (i18n)
- [ ] 프리미엄 기능

---

## 📚 참고 자료

### 라이브러리 문서
- [Framer Motion](https://www.framer.com/motion/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Sharp](https://sharp.pixelplumbing.com/)
- [IndexedDB (idb)](https://github.com/jakearchibald/idb)

### API 문서
- [Google Cloud Vision](https://cloud.google.com/vision/docs)
- [OpenAI GPT-4](https://platform.openai.com/docs)
- [Supabase](https://supabase.com/docs)

### 디자인 참고
- [Dribbble - Museum Apps](https://dribbble.com/search/museum-app)
- [Behance - Exhibition Design](https://www.behance.net/search/projects?search=exhibition%20app)

---

## 🎯 목표 지표

### 사용성
- 평균 기록 시간: **< 10초**
- 전시당 평균 기록 작품: **> 5개**
- 기록 완료율: **> 80%**

### 기술
- 페이지 로딩: **< 2초**
- API 응답: **< 500ms**
- 사진 인식: **< 3초**
- 인식 정확도: **> 80%**

### 비즈니스
- 월간 활성 사용자: **1,000명**
- 월간 기록 수: **10,000개**
- 평균 재방문율: **> 30%**

---

**마지막 업데이트**: 2025-12-30
**다음 리뷰**: 2025-01-13

---

이 로드맵은 지속적으로 업데이트됩니다. 새로운 아이디어나 피드백이 있으면 이 파일을 수정하세요! 🚀
