# SAYU UI/UX Redesign Implementation Guide

> 이 문서는 SAYU의 모든 페이지를 통일된 디자인 시스템으로 리뉴얼하기 위한 상세 가이드입니다.
> 다른 AI나 개발자가 이 문서만 보고 정확하게 구현할 수 있도록 작성되었습니다.

---

## 📋 목차

1. [디자인 철학](#디자인-철학)
2. [디자인 시스템 구조](#디자인-시스템-구조)
3. [핵심 원칙](#핵심-원칙)
4. [컴포넌트 사용법](#컴포넌트-사용법)
5. [페이지별 리뉴얼 가이드](#페이지별-리뉴얼-가이드)
6. [금지 사항](#금지-사항)

---

## 🎨 디자인 철학

### **컨셉**
- **깔끔한 미술관 스타일** (Met Museum, MoMA, SFMOMA 참고)
- **기능성 우선, 감각적 포인트 추가**
- **명확한 가독성** (절대 회색 텍스트 금지!)
- **단순하면서 재미있는 레이아웃**

### **타겟 사용자**
- 20-40대, 미술/문화 감각 있는 사람들
- 시각적 미학에 민감함
- 기능성과 아름다움 둘 다 중요

---

## 🏗️ 디자인 시스템 구조

### **파일 위치**
```
frontend/
├── lib/design-system/
│   ├── colors.ts          # 색상 팔레트
│   ├── typography.ts      # 폰트, 사이즈
│   ├── spacing.ts         # 간격 시스템
│   ├── shadows.ts         # 그림자
│   └── index.ts           # 통합 export
│
└── components/design-system/
    ├── Card.tsx           # 카드 컴포넌트
    ├── Button.tsx         # 버튼 컴포넌트
    ├── Typography.tsx     # 텍스트 컴포넌트
    ├── Container.tsx      # 레이아웃 컨테이너
    └── index.ts
```

### **색상 팔레트**

```typescript
// 기본 색상
white: '#FFFFFF'           // 주 배경
offWhite: '#FAFAF9'       // 섹션 구분
lightGray: '#F5F5F4'      // 카드 배경 (필요시)

// 텍스트 (가독성 최우선!)
black: '#000000'           // 헤딩 (pure black!)
darkGray: '#1A1A1A'       // 본문
midGray: '#525252'        // 부가 정보
lightGrayText: '#737373'  // 캡션만 (최소 사용)

// 테두리
border: '#E5E5E5'
borderLight: '#F5F5F4'

// Accent (아직 확정 아님 - 고민 중)
accent: '#D97706'         // Amber (현재 사용)
accentWarm: '#EA580C'     // Orange
accentCool: '#0369A1'     // Sky blue
```

**⚠️ 중요: Accent 색상은 변경 가능성 있음!**
- 현재는 Amber/Orange 사용
- 더 세련된 색으로 바뀔 수 있음
- Button 등에서 accent 사용 시 변수로 관리

---

## ✅ 핵심 원칙

### **1. 텍스트 가독성 (최우선!)**

```tsx
// ✅ 올바른 예시
<h1 className="text-black">제목</h1>
<p className="text-black">본문</p>
<span className="text-neutral-600">부가 정보</span>

// ❌ 절대 금지!
<p className="text-gray-400">...</p>        // 너무 연함
<p className="opacity-60">...</p>           // 회색으로 보임
<Text color="secondary">...</Text>          // 회색일 수 있음
```

**규칙:**
- 헤딩: `text-black` 또는 `style={{ color: '#000000' }}`
- 본문: `text-black`
- 부가 정보: `text-neutral-600` 최대
- `opacity` 사용 금지!

### **2. 배경**

```tsx
// 기본 배경
<div className="bg-white">

// 섹션 구분용
<section className="bg-neutral-50">

// 강조용 (최소 사용)
<div className="bg-neutral-100">
```

**금지:**
- ❌ Gradient 배경 (`from-purple-900 via-...` 등)
- ❌ Glass morphism (`backdrop-blur-md`, `bg-white/10` 등)
- ❌ 어두운 배경 (특별한 경우 제외)

### **3. 간격 (Spacing)**

```tsx
// 섹션 간격
<section className="py-32">              // 기본
<section className="py-20">              // 작은 간격
<section className="py-16">              // 최소 간격

// 요소 간격
<div className="mb-8">                   // 큰 간격
<div className="mb-6">                   // 중간
<div className="mb-4">                   // 작음
```

### **4. Typography**

```tsx
// 헤딩
<h1 className="text-6xl font-bold text-black">       // Hero
<h2 className="text-5xl font-bold text-black">       // Section
<h3 className="text-4xl font-bold text-black">       // Sub-section

// 본문
<p className="text-xl text-black">                   // Large
<p className="text-base text-black">                 // Normal
<p className="text-sm text-neutral-600">             // Small
```

### **5. 카드 스타일**

```tsx
// 기본 카드
<Card className="p-8 hover:shadow-lg transition-shadow">
  ...
</Card>

// 금지!
❌ 둥근 테두리 과다 (rounded-2xl)
❌ Glass effect
❌ 그림자 너무 강함
```

---

## 🔧 컴포넌트 사용법

### **Button**

```tsx
// Primary (Amber accent)
<Button variant="primary" size="lg" onClick={...}>
  시작하기
</Button>

// Outline (검은색 테두리)
<Button variant="outline" onClick={...}>
  자세히 보기
</Button>

// Ghost
<Button variant="ghost" size="sm">
  로그인
</Button>
```

### **Card**

```tsx
// 기본
<Card className="p-8">
  <h3>제목</h3>
  <p>내용</p>
</Card>

// Hover 효과
<Card className="p-8 hover:shadow-lg transition-shadow">
  ...
</Card>
```

### **Container**

```tsx
<Container size="2xl">
  {/* 컨텐츠 */}
</Container>
```

---

## 📄 페이지별 리뉴얼 가이드

### **공통 레이아웃 구조**

```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200">
        <Container size="2xl">
          <div className="flex items-center justify-between h-20">
            <button className="text-2xl font-bold text-black">SAYU</button>
            {/* Nav items */}
            <Button variant="primary">CTA</Button>
          </div>
        </Container>
      </nav>

      {/* Main content */}
      <main className="pt-20">
        {/* Sections */}
      </main>
    </div>
  );
}
```

---

### **1. Quiz Results Page 리뉴얼**

**현재 문제:**
- 보라색 gradient 배경 (`from-purple-900 via-blue-900 to-indigo-900`)
- 모든 카드가 glass morphism
- 텍스트 대비 부족

**리뉴얼 방향:**

```tsx
export default function QuizResults() {
  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero Section - 결과 발표 */}
      <section className="py-32 bg-neutral-50">
        <Container size="xl">
          <div className="text-center">
            {/* APT 타입 배지 */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-full mb-8">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-bold">LAEF</span>
            </div>

            {/* 타입 이름 */}
            <h1 className="text-6xl font-bold mb-6 text-black">
              감성 탐험가
            </h1>

            {/* 설명 */}
            <p className="text-xl text-black max-w-2xl mx-auto">
              당신은 감성적이고 직관적인 예술 감상자입니다.
            </p>
          </div>
        </Container>
      </section>

      {/* 특징 섹션 */}
      <section className="py-20">
        <Container size="xl">
          <h2 className="text-4xl font-bold mb-12 text-black">당신의 특징</h2>

          <div className="grid grid-cols-2 gap-8">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-black">강점</h3>
              <ul className="space-y-3">
                <li className="text-black">• 깊은 감정 이입</li>
                <li className="text-black">• 직관적 이해</li>
              </ul>
            </Card>

            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-black">선호 작품</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-neutral-100 text-black rounded-full text-sm">
                  인상주의
                </span>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      {/* 추천 작품 */}
      <section className="py-20 bg-neutral-50">
        <Container size="xl">
          <h2 className="text-4xl font-bold mb-12 text-black">추천 작품</h2>

          <div className="grid grid-cols-3 gap-8">
            {artworks.map(artwork => (
              <div key={artwork.id}>
                <div className="relative aspect-[3/4] bg-neutral-200 mb-4">
                  <Image src={artwork.image} fill className="object-cover" />
                </div>
                <p className="font-bold text-black">{artwork.title}</p>
                <p className="text-sm text-neutral-600">{artwork.artist}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Container size="xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6 text-black">
              다음 단계
            </h2>
            <div className="flex gap-4 justify-center">
              <Button variant="primary" size="lg">
                갤러리 탐험하기
              </Button>
              <Button variant="outline" size="lg">
                결과 공유하기
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
```

**핵심 변경사항:**
- ✅ 흰색 배경
- ✅ 검은색 텍스트
- ✅ Glass morphism 제거
- ✅ 보라색 완전 제거
- ✅ 깔끔한 섹션 구분

---

### **2. Dashboard Page 리뉴얼**

**현재 상태:**
- 어두운 배경 이미지 + glass cards (이건 괜찮음)
- 하지만 통일성 위해 조정 필요

**리뉴얼 방향:**

**Option A: 완전히 밝게 (추천)**

```tsx
<div className="min-h-screen bg-white">
  {/* Navigation */}
  <nav className="border-b border-neutral-200 bg-white">
    ...
  </nav>

  {/* Welcome Section */}
  <section className="py-20 bg-neutral-50">
    <Container size="2xl">
      <h1 className="text-5xl font-bold text-black mb-4">
        안녕하세요, {username}님
      </h1>
      <p className="text-xl text-black">
        오늘도 새로운 예술을 발견해보세요
      </p>
    </Container>
  </section>

  {/* Stats */}
  <section className="py-20">
    <Container size="2xl">
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-8 text-center">
          <Eye className="w-8 h-8 mx-auto mb-4 text-black" />
          <div className="text-3xl font-bold text-black">{stats.viewed}</div>
          <p className="text-sm text-neutral-600">감상한 작품</p>
        </Card>
        {/* More stats... */}
      </div>
    </Container>
  </section>

  {/* Recommendations */}
  <section className="py-20 bg-neutral-50">
    <Container size="2xl">
      <h2 className="text-4xl font-bold mb-8 text-black">오늘의 추천</h2>
      <div className="grid grid-cols-3 gap-8">
        {/* Artwork cards */}
      </div>
    </Container>
  </section>
</div>
```

**Option B: 배경 이미지 유지하되 개선**

```tsx
<div
  className="min-h-screen relative"
  style={{ backgroundImage: 'url(...)' }}
>
  {/* White overlay for readability */}
  <div className="absolute inset-0 bg-white/90" />

  <div className="relative z-10">
    {/* Content with high contrast */}
  </div>
</div>
```

---

### **3. Gallery Page 리뉴얼**

**현재 문제:**
- 복잡한 레이아웃 옵션 (masonry/grid/list)
- 배경 불명확

**리뉴얼:**

```tsx
<div className="min-h-screen bg-white">
  {/* Header */}
  <section className="py-20 border-b border-neutral-200">
    <Container size="2xl">
      <h1 className="text-6xl font-bold text-black mb-4">Gallery</h1>
      <p className="text-xl text-black">10,234개의 큐레이션된 작품</p>
    </Container>
  </section>

  {/* Filter Bar */}
  <div className="sticky top-20 z-40 bg-white border-b border-neutral-200">
    <Container size="2xl">
      <div className="flex items-center gap-6 py-4">
        <button className="text-black hover:text-neutral-600">전체</button>
        <button className="text-neutral-600 hover:text-black">회화</button>
        <button className="text-neutral-600 hover:text-black">조각</button>
      </div>
    </Container>
  </div>

  {/* Grid */}
  <section className="py-12">
    <Container size="2xl">
      <div className="grid grid-cols-4 gap-6">
        {artworks.map(artwork => (
          <div key={artwork.id} className="group cursor-pointer">
            <div className="relative aspect-[3/4] bg-neutral-200 mb-3 overflow-hidden">
              <Image
                src={artwork.image}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <p className="font-bold text-black">{artwork.title}</p>
            <p className="text-sm text-neutral-600">{artwork.artist}</p>
          </div>
        ))}
      </div>
    </Container>
  </section>
</div>
```

**핵심:**
- Masonry 제거 → 단순 grid
- 깔끔한 필터 바
- 둥근 테두리 없음
- Hover 효과만 약간

---

### **4. Exhibitions Page**

**현재 상태:**
- 이미 light 테마라 괜찮음
- 스타일만 통일

```tsx
<div className="min-h-screen bg-white">
  {/* Hero */}
  <section className="py-20 bg-neutral-50">
    <Container size="2xl">
      <h1 className="text-6xl font-bold text-black mb-4">Exhibitions</h1>
      <p className="text-xl text-black">진행 중인 전시 156개</p>
    </Container>
  </section>

  {/* List */}
  <section className="py-12">
    <Container size="2xl">
      <div className="space-y-6">
        {exhibitions.map(ex => (
          <Card key={ex.id} className="p-8 hover:shadow-lg transition-shadow">
            <div className="flex gap-8">
              <div className="w-48 h-64 bg-neutral-200">
                <Image src={ex.image} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-black mb-2">{ex.title}</h3>
                <p className="text-lg text-neutral-600 mb-4">{ex.venue}</p>
                <p className="text-black">{ex.description}</p>
                <Button variant="outline" className="mt-6">
                  자세히 보기
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  </section>
</div>
```

---

### **5. Community Page**

**현재 문제:**
- Glass UI → 가시성 낮음

**리뉴얼:**

```tsx
<div className="min-h-screen bg-white">
  {/* Header */}
  <section className="py-20 bg-neutral-50">
    <Container size="2xl">
      <h1 className="text-6xl font-bold text-black mb-4">Community</h1>
      <p className="text-xl text-black">같은 취향의 사람들과 연결되세요</p>
    </Container>
  </section>

  {/* User Cards */}
  <section className="py-12">
    <Container size="2xl">
      <div className="grid grid-cols-3 gap-8">
        {users.map(user => (
          <Card key={user.id} className="p-8">
            <div className="w-20 h-20 bg-neutral-200 rounded-full mb-4" />
            <h3 className="text-xl font-bold text-black mb-2">{user.name}</h3>
            <p className="text-sm text-neutral-600 mb-4">{user.aptType}</p>
            <Button variant="outline" fullWidth>
              프로필 보기
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  </section>
</div>
```

---

### **6. Profile Page**

**현재 문제:**
- Gradient 과다

**리뉴얼:**

```tsx
<div className="min-h-screen bg-white">
  {/* Header */}
  <section className="py-20 bg-neutral-50">
    <Container size="xl">
      <div className="flex items-start gap-8">
        <div className="w-32 h-32 bg-neutral-200 rounded-full" />
        <div className="flex-1">
          <h1 className="text-5xl font-bold text-black mb-2">{user.name}</h1>
          <p className="text-xl text-neutral-600 mb-4">{user.aptType}</p>
          <div className="flex gap-3">
            <Button variant="primary">프로필 수정</Button>
            <Button variant="outline">공유</Button>
          </div>
        </div>
      </div>
    </Container>
  </section>

  {/* Stats Grid */}
  <section className="py-12">
    <Container size="xl">
      <div className="grid grid-cols-4 gap-6">
        {/* Stat cards */}
      </div>
    </Container>
  </section>

  {/* Collections */}
  <section className="py-12 bg-neutral-50">
    <Container size="xl">
      <h2 className="text-4xl font-bold mb-8 text-black">내 컬렉션</h2>
      {/* Grid */}
    </Container>
  </section>
</div>
```

---

### **7. Art Counselor Page**

**현재 문제:**
- Neon/pastel 혼합
- Garbled text

**리뉴얼:**

```tsx
<div className="min-h-screen bg-white">
  {/* Hero */}
  <section className="py-32">
    <Container size="xl">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-6xl font-bold text-black mb-6">
          AI Art Counselor
        </h1>
        <p className="text-xl text-black mb-10">
          당신의 감정에 맞는 작품을 추천해드립니다
        </p>
        <Button variant="primary" size="lg">
          상담 시작하기
        </Button>
      </div>
    </Container>
  </section>

  {/* Session UI */}
  <section className="py-20 bg-neutral-50">
    <Container size="lg">
      <Card className="p-12">
        {/* Chat interface */}
      </Card>
    </Container>
  </section>
</div>
```

---

### **8. MMCA Pages**

**현재 상태:**
- 급조됨, 스타일 부족

**리뉴얼:**

```tsx
<div className="min-h-screen bg-white">
  {/* Exhibition Header */}
  <section className="py-20">
    <Container size="2xl">
      <div className="grid grid-cols-2 gap-16">
        <div>
          <h1 className="text-6xl font-bold text-black mb-6">
            김창열: 물방울
          </h1>
          <p className="text-xl text-black mb-8">
            국립현대미술관 서울
          </p>
          <Button variant="primary" size="lg">
            전시 둘러보기
          </Button>
        </div>
        <div className="aspect-[4/3] bg-neutral-200">
          <Image src="..." fill className="object-cover" />
        </div>
      </div>
    </Container>
  </section>

  {/* Works Grid */}
  <section className="py-20 bg-neutral-50">
    <Container size="2xl">
      <h2 className="text-4xl font-bold mb-12 text-black">주요 작품</h2>
      <div className="grid grid-cols-3 gap-8">
        {/* Artwork cards */}
      </div>
    </Container>
  </section>
</div>
```

---

## ❌ 금지 사항

### **절대 사용 금지:**

1. **보라색 계열**
   ```tsx
   ❌ purple-900, purple-500, indigo-900, pink-500
   ❌ from-purple-900 via-blue-900 to-indigo-900
   ```

2. **Glass Morphism**
   ```tsx
   ❌ backdrop-blur-md
   ❌ bg-white/10
   ❌ bg-black/40
   ```

3. **회색 텍스트**
   ```tsx
   ❌ text-gray-400
   ❌ opacity-60 (텍스트에)
   ❌ text-white/80
   ```

4. **과도한 애니메이션**
   ```tsx
   ❌ initial={{ opacity: 0, y: 20, scale: 0.8 }}
   ❌ transition={{ duration: 0.8, delay: 0.3 }}
   ```

5. **둥근 테두리 과다**
   ```tsx
   ❌ rounded-3xl (카드에)
   ❌ rounded-full (버튼에, 배지는 OK)
   ```

---

## 📝 체크리스트

페이지 리뉴얼 시 다음을 확인:

- [ ] 모든 텍스트가 `text-black` 또는 `text-neutral-600`인가?
- [ ] `opacity-60` 같은 거 없는가?
- [ ] 배경이 흰색/neutral-50인가?
- [ ] 보라색이 없는가?
- [ ] Glass effect가 없는가?
- [ ] 카드 테두리가 둥글지 않은가?
- [ ] Button outline이 검은색인가?
- [ ] 간격이 적절한가? (py-32, py-20, py-16)
- [ ] Image에 둥근 테두리가 없는가?
- [ ] Hover 효과가 subtle한가?

---

## 🎯 우선순위

1. **Quiz Results** (높은 트래픽)
2. **Dashboard** (사용자 retention)
3. **Gallery** (핵심 기능)
4. **Exhibitions** (핵심 기능)
5. **Community** (가시성 문제)
6. **Profile**
7. **Art Counselor**
8. **MMCA Pages**

---

## 💡 팁

- **섹션 구분**: `bg-neutral-50` 교차 사용
- **강조**: 검은 배경 섹션 (최소 사용)
- **CTA**: Primary button 사용
- **Card hover**: `hover:shadow-lg transition-shadow`
- **Image hover**: `group-hover:scale-105 transition-transform duration-500`

---

## 🚀 시작하기

1. 디자인 시스템 파일 확인 (`lib/design-system/`)
2. Home page (`app/page.tsx`) 참고
3. 위 가이드에 따라 페이지별 리뉴얼
4. 로컬 테스트 (`npm run dev`)
5. 커밋 & 푸시

---

**작성일:** 2025-01-08
**작성자:** Claude Code
**버전:** 1.0
