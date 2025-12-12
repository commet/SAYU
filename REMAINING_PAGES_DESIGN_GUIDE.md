# SAYU - Remaining Pages Design Guide
> Professional Gallery Curator Style
>
> **For**: Exhibition, Community, Profile 페이지 개선
> **Design Reference**: Gallery & Dashboard 페이지의 새로운 스타일 적용

---

## 📐 Design System Summary

### Typography Rules

```css
/* Headings */
- Section Title: text-sm uppercase tracking-widest text-neutral-900 font-medium
- Large Title: text-5xl font-light text-black tracking-tight
- Subtitle: text-lg text-neutral-500 font-light

/* Body */
- Label: text-xs uppercase tracking-wider text-neutral-500
- Description: text-sm text-neutral-500 font-light
- Number/Stats: text-4xl font-light text-black tracking-tight

/* Avoid */
❌ text-2xl font-bold (너무 무거움)
❌ text-lg font-semibold (일반적)
✅ text-sm uppercase tracking-widest font-medium (전문적)
```

### Color Palette

```css
/* Primary */
--text-primary: text-black / text-neutral-900
--text-secondary: text-neutral-500
--text-tertiary: text-neutral-400

/* Borders */
--border-default: border-neutral-200
--border-hover: border-neutral-900
--border-subtle: border-neutral-100

/* Backgrounds */
--bg-default: bg-white
--bg-subtle: bg-neutral-50
--bg-hover: bg-black/5

/* Avoid */
❌ bg-blue-500, text-green-600 (화려한 색상)
❌ rounded-2xl (너무 둥근 모서리)
✅ border-neutral-200 (미묘한 구분)
✅ 정사각형 또는 rounded-sm (미니멀)
```

### Effects & Animations

```css
/* Grayscale First (핵심!) */
grayscale group-hover:grayscale-0 transition-all duration-700

/* Hover States */
hover:border-neutral-900
hover:bg-black/5
hover:y--2 (Framer Motion)

/* Transitions */
transition-all duration-700 (이미지 컬러 전환)
transition-colors (일반 상태 변화)
```

### Layout Patterns

```tsx
/* Section Header */
<div className="flex items-baseline gap-3 mb-6">
  <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">
    Section Title
  </h2>
  <div className="h-px flex-1 bg-neutral-200" />
  <span className="text-xs text-neutral-400">Optional Label</span>
</div>

/* Stat Card */
<div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
  <p className="text-4xl font-light text-black tracking-tight">123</p>
  <p className="text-xs uppercase tracking-wider text-neutral-500">Label</p>
</div>

/* Image Card */
<div className="aspect-square border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden">
  <Image
    src={url}
    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
  />
</div>
```

---

## 🎨 Page-by-Page Guide

### 1. Exhibition Page

**Current Issues**:
- 화려한 색상의 카드들
- 이모지 과다 사용
- 둥근 모서리 (rounded-2xl)
- 일반적인 폰트 스타일

**Target Style**:
- Grayscale 전시 포스터 → 호버 시 컬러
- 미니멀한 타이포그래피
- 정제된 레이아웃

#### Step 1: Page Header

**Before**:
```tsx
<h1 className="text-4xl font-bold text-black mb-4">전시 둘러보기</h1>
<p className="text-lg text-neutral-600 mb-8">지금 열리고 있는 전시들</p>
```

**After**:
```tsx
<div className="py-8">
  <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">
    Exhibitions
  </p>
  <h1 className="text-5xl font-light text-black mb-3 tracking-tight">
    Current Exhibitions
  </h1>
  <p className="text-lg text-neutral-500 font-light max-w-2xl">
    Discover curated exhibitions happening now
  </p>
</div>
```

#### Step 2: Filter Tabs

**Before**:
```tsx
<button className="px-4 py-2 rounded-lg bg-black text-white">전체</button>
<button className="px-4 py-2 rounded-lg bg-neutral-100">진행중</button>
```

**After**:
```tsx
<div className="border-b border-neutral-200 mb-8">
  <div className="flex gap-12">
    <button className="pb-4 text-sm uppercase tracking-widest text-black font-medium relative">
      All
      <motion.div className="absolute bottom-0 left-0 right-0 h-px bg-black" />
    </button>
    <button className="pb-4 text-sm uppercase tracking-widest text-neutral-400 font-light hover:text-neutral-600">
      Ongoing
    </button>
    <button className="pb-4 text-sm uppercase tracking-widest text-neutral-400 font-light hover:text-neutral-600">
      Upcoming
    </button>
  </div>
</div>
```

#### Step 3: Exhibition Cards

**Before**:
```tsx
<div className="bg-white rounded-2xl border-2 border-purple-500 overflow-hidden hover:shadow-xl">
  <div className="aspect-[4/3] relative">
    <Image src={poster} className="object-cover group-hover:scale-105" />
  </div>
  <div className="p-6">
    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs">진행중</span>
    <h3 className="text-xl font-bold mt-3">{title}</h3>
    <p className="text-neutral-600">{museum}</p>
  </div>
</div>
```

**After**:
```tsx
<motion.div
  whileHover={{ y: -4 }}
  className="group cursor-pointer"
>
  {/* Poster - Grayscale Effect */}
  <div className="aspect-[3/4] border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden mb-4">
    <Image
      src={poster}
      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
    />
  </div>

  {/* Info */}
  <div className="space-y-2">
    <p className="text-xs uppercase tracking-wider text-neutral-400">
      {status} · {dates}
    </p>
    <h3 className="text-base font-medium text-black line-clamp-2">
      {title}
    </h3>
    <p className="text-sm text-neutral-500">
      {museum}
    </p>
    <p className="text-xs text-neutral-400">
      {location}
    </p>
  </div>

  {/* Accent line on hover */}
  <div className="h-px bg-neutral-900 mt-3 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
</motion.div>
```

#### Step 4: Featured Exhibition (Hero)

**After**:
```tsx
<div className="space-y-6 mb-12">
  <div className="flex items-baseline gap-3">
    <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Featured</h2>
    <div className="h-px flex-1 bg-neutral-200" />
  </div>

  <div className="relative aspect-[21/9] border border-neutral-200 overflow-hidden group cursor-pointer">
    <Image
      src={featuredPoster}
      className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 p-10">
      <p className="text-xs uppercase tracking-widest text-white/60 mb-3">Featured Exhibition</p>
      <h2 className="text-4xl font-light text-white mb-2 tracking-tight">{title}</h2>
      <p className="text-white/90 text-sm uppercase tracking-wider mb-4">{museum}</p>
      <p className="text-white/70 text-sm font-light">{dates}</p>
    </div>
  </div>
</div>
```

---

### 2. Community Page

**Current State**: 이미 좋은 디자인이지만 상단과 일부 정렬 개선 필요

#### Step 1: Page Header Alignment

**Before**:
```tsx
<h1 className="text-3xl font-bold mb-2">커뮤니티</h1>
<p className="text-neutral-600 mb-6">다른 사용자들과 소통하세요</p>
```

**After**:
```tsx
<div className="py-8 mb-8">
  <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">
    Community
  </p>
  <h1 className="text-5xl font-light text-black mb-3 tracking-tight">
    Connect & Share
  </h1>
  <p className="text-lg text-neutral-500 font-light">
    Discover art lovers and share your perspective
  </p>
</div>
```

#### Step 2: User Cards (If exist)

**Apply Grayscale to Profile Images**:
```tsx
<div className="aspect-square rounded-full overflow-hidden border border-neutral-200">
  <Image
    src={avatar}
    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
  />
</div>
```

#### Step 3: Stats Section

**Align with Dashboard Style**:
```tsx
<div className="grid grid-cols-3 gap-3">
  <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
    <p className="text-4xl font-light text-black tracking-tight">{followers}</p>
    <p className="text-xs uppercase tracking-wider text-neutral-500">Followers</p>
  </div>
  <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
    <p className="text-4xl font-light text-black tracking-tight">{following}</p>
    <p className="text-xs uppercase tracking-wider text-neutral-500">Following</p>
  </div>
  <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
    <p className="text-4xl font-light text-black tracking-tight">{posts}</p>
    <p className="text-xs uppercase tracking-wider text-neutral-500">Posts</p>
  </div>
</div>
```

---

### 3. Profile Page

**Current Issues**:
- 화려한 배경색
- 이모지와 배지들
- 일반적인 카드 스타일

**Target**: 미니멀한 프로필, 포트폴리오 느낌

#### Step 1: Profile Header

**Before**:
```tsx
<div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-2xl">
  <div className="flex items-center gap-4">
    <Image src={avatar} className="w-24 h-24 rounded-full border-4 border-white" />
    <div>
      <h1 className="text-3xl font-bold text-white">{username}</h1>
      <p className="text-white/80">APT: {type}</p>
    </div>
  </div>
</div>
```

**After**:
```tsx
<div className="py-12 border-b border-neutral-100">
  <div className="flex items-start gap-8">
    {/* Avatar - Grayscale */}
    <div className="relative w-32 h-32 border border-neutral-300 overflow-hidden group">
      <Image
        src={avatar}
        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
      />
    </div>

    {/* Info */}
    <div className="flex-1">
      <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Profile</p>
      <h1 className="text-4xl font-light text-black mb-3 tracking-tight">{username}</h1>
      <p className="text-sm text-neutral-500 mb-6">{bio}</p>

      {/* APT Type - Subtle */}
      <div className="inline-block px-4 py-2 border border-neutral-300 hover:border-black transition-colors">
        <p className="text-xs uppercase tracking-wider text-neutral-600">
          APT: {type}
        </p>
      </div>
    </div>
  </div>
</div>
```

#### Step 2: Profile Stats

**After**:
```tsx
<div className="py-8">
  <div className="flex items-baseline gap-3 mb-6">
    <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Activity</h2>
    <div className="h-px flex-1 bg-neutral-200" />
  </div>

  <div className="grid grid-cols-4 gap-3">
    <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
      <p className="text-4xl font-light text-black tracking-tight">{artworksViewed}</p>
      <p className="text-xs uppercase tracking-wider text-neutral-500">Artworks</p>
    </div>
    <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
      <p className="text-4xl font-light text-black tracking-tight">{collections}</p>
      <p className="text-xs uppercase tracking-wider text-neutral-500">Collections</p>
    </div>
    <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
      <p className="text-4xl font-light text-black tracking-tight">{exhibitions}</p>
      <p className="text-xs uppercase tracking-wider text-neutral-500">Exhibitions</p>
    </div>
    <div className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
      <p className="text-4xl font-light text-black tracking-tight">{followers}</p>
      <p className="text-xs uppercase tracking-wider text-neutral-500">Followers</p>
    </div>
  </div>
</div>
```

#### Step 3: Saved Artworks Grid

**After**:
```tsx
<div className="py-8">
  <div className="flex items-baseline gap-3 mb-6">
    <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Saved Artworks</h2>
    <div className="h-px flex-1 bg-neutral-200" />
    <span className="text-xs text-neutral-400">{count} items</span>
  </div>

  <div className="grid grid-cols-4 gap-4">
    {artworks.map((artwork) => (
      <motion.div
        whileHover={{ y: -4 }}
        className="group cursor-pointer"
      >
        <div className="aspect-square border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden mb-3">
          <Image
            src={artwork.image}
            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-black line-clamp-1">{artwork.title}</h3>
          <p className="text-xs text-neutral-500">{artwork.artist}</p>
        </div>
      </motion.div>
    ))}
  </div>
</div>
```

---

## 🔧 Common Fixes

### 1. Remove Emojis

**Before**:
```tsx
<h2>✨ Quick Collections</h2>
<p>🎨 오늘의 작품</p>
<span>📚 My Collections</span>
```

**After**:
```tsx
<h2 className="text-sm uppercase tracking-widest">Quick Collections</h2>
<p className="text-xs uppercase tracking-wider text-neutral-400">Featured Today</p>
<span className="text-sm uppercase tracking-widest">Personal Collections</span>
```

### 2. Replace Colorful Badges

**Before**:
```tsx
<span className="bg-purple-500 text-white px-3 py-1 rounded-full">진행중</span>
<span className="bg-green-500 text-white px-3 py-1 rounded-full">완료</span>
```

**After**:
```tsx
<span className="text-xs uppercase tracking-wider text-neutral-500">Ongoing</span>
<span className="text-xs uppercase tracking-wider text-neutral-400">Completed</span>
```

### 3. Simplify Buttons

**Before**:
```tsx
<button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg">
  시작하기
</button>
```

**After**:
```tsx
<button className="px-8 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-neutral-800 transition-colors">
  Get Started
</button>

{/* Or outline version */}
<button className="px-8 py-3 border border-neutral-300 hover:border-black text-sm uppercase tracking-wider text-neutral-600 hover:text-black transition-colors">
  Learn More
</button>
```

---

## 📋 Implementation Checklist

### For Each Page:

- [ ] **Headers**:
  - [ ] Replace bold titles with `font-light tracking-tight`
  - [ ] Add date/label with `text-xs uppercase tracking-widest text-neutral-400`
  - [ ] Use section dividers: `<div className="h-px flex-1 bg-neutral-200" />`

- [ ] **Images**:
  - [ ] Apply `grayscale` by default
  - [ ] Add `group-hover:grayscale-0 transition-all duration-700`
  - [ ] Change borders: `border-neutral-200 hover:border-neutral-900`

- [ ] **Cards**:
  - [ ] Remove rounded corners: `rounded-2xl` → `` (no rounding) or `rounded-sm`
  - [ ] Simplify borders: `border-2 border-purple-500` → `border border-neutral-200`
  - [ ] Add subtle hover: `hover:border-neutral-400 transition-colors`

- [ ] **Stats/Numbers**:
  - [ ] Make large and light: `text-4xl font-light tracking-tight`
  - [ ] Labels small and uppercase: `text-xs uppercase tracking-wider text-neutral-500`

- [ ] **Typography**:
  - [ ] Remove: `font-bold`, `font-semibold`
  - [ ] Use: `font-light`, `font-medium` only
  - [ ] Add: `tracking-tight` (titles), `tracking-widest` (labels)

- [ ] **Colors**:
  - [ ] Remove all brand colors: purple, pink, blue, green
  - [ ] Use only: black, white, neutral-50 through neutral-900
  - [ ] Exception: SAYU gold (#d4a520) for CTAs only

- [ ] **Animations**:
  - [ ] Use Framer Motion: `whileHover={{ y: -2 }}` or `{{ y: -4 }}`
  - [ ] Long transitions for images: `duration-700`
  - [ ] Short transitions for UI: `transition-colors`

---

## 🎯 Final Result

All pages should feel like:
- **MoMA** (Museum of Modern Art) - Professional, timeless
- **Tate Modern** - Minimal, sophisticated
- **Are.na** - Clean, content-first
- **Behance Pro** - Portfolio-grade presentation

### Key Principles:
1. **Restraint** - Less is more. 절제미.
2. **Typography** - Let text create hierarchy through size, weight, spacing
3. **Grayscale** - Color only on hover creates impact
4. **Whitespace** - 충분한 여백으로 숨 쉬는 디자인
5. **Consistency** - 모든 페이지가 같은 언어로 말하기

---

## 📸 Reference Screenshots

Gallery & Dashboard 페이지를 참고하세요:
- Section headers with horizontal lines
- Grayscale cards that reveal color on hover
- Minimal stat boxes with large numbers
- Clean typography with tracking and weights

---

**구현 순서 추천**:
1. Exhibition (가장 시각적, 효과 크게 보임)
2. Profile (개인적, 포트폴리오 느낌)
3. Community (이미 괜찮은 상태, 미세 조정만)

각 페이지마다 **Before/After 스크린샷 찍으면서** 진행하면 변화를 명확히 볼 수 있습니다! 🚀
