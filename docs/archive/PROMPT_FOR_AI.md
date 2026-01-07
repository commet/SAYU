# SAYU UI/UX 리뉴얼 작업 프롬프트

> 이 프롬프트를 다른 AI에게 전달하여 SAYU 페이지 리뉴얼 작업을 수행하도록 하세요.

---

## 📌 지시사항

당신은 SAYU 프로젝트의 UI/UX 리뉴얼 작업을 수행해야 합니다.

**프로젝트 위치:**
- Repository: `C:\Users\SAMSUNG\documents\github\sayu`
- Frontend: `frontend/` 디렉토리
- 브랜치: `ui-redesign-2025`

**필수 문서:**
- **`UI_REDESIGN_GUIDE.md`를 반드시 먼저 읽고 완전히 숙지하세요.**
- 이 문서에는 디자인 시스템, 색상 팔레트, 컴포넌트 사용법, 금지사항이 모두 포함되어 있습니다.

---

## 🎯 작업 목표

SAYU의 모든 페이지를 통일된 디자인 시스템으로 리뉴얼합니다.

**핵심 원칙:**
1. ✅ **깔끔한 흰색 배경** - 보라색 gradient 완전 제거
2. ✅ **명확한 텍스트** - 모든 텍스트는 `text-black` 또는 `text-neutral-600` 사용
3. ✅ **Glass morphism 제거** - `backdrop-blur`, `bg-white/10` 등 금지
4. ✅ **opacity 금지** - 텍스트에 `opacity-60` 같은 거 절대 사용 금지
5. ✅ **단순하고 기능적** - 과도한 애니메이션, 둥근 테두리 자제

---

## 📋 작업 순서

### **1단계: 준비**

```bash
# 브랜치 확인
cd frontend
git checkout ui-redesign-2025
git pull origin ui-redesign-2025

# 의존성 확인
npm install

# 개발 서버 실행
npm run dev
```

### **2단계: 가이드 숙지**

```bash
# 가이드 문서 읽기
cat UI_REDESIGN_GUIDE.md
```

**반드시 읽어야 할 섹션:**
- ✅ 디자인 철학
- ✅ 색상 팔레트 (정확한 hex 코드)
- ✅ 핵심 원칙 (텍스트 가독성!)
- ✅ 공통 컴포넌트 가이드
- ✅ 실전 변환 예시 (Before/After 코드)
- ✅ 금지 사항

### **3단계: 페이지 선택**

**우선순위:**
1. Quiz Results (가장 시급 - 보라색 폭탄)
2. Dashboard
3. Gallery
4. Exhibitions
5. Community
6. Profile
7. Art Counselor
8. MMCA Pages

### **4단계: 페이지 리뉴얼**

각 페이지마다:

```bash
# 1. 현재 파일 읽기
cat frontend/app/[PAGE]/page.tsx

# 2. UI_REDESIGN_GUIDE.md의 해당 페이지 섹션 참고

# 3. 코드 수정

# 4. 로컬 테스트
npm run dev
# http://localhost:3000/[PAGE] 접속하여 확인

# 5. 체크리스트 확인 (아래 참고)

# 6. 커밋
git add frontend/app/[PAGE]/page.tsx
git commit -m "feat: redesign [PAGE] page - clean white theme"
```

---

## ✅ 필수 체크리스트

**각 페이지 수정 후 반드시 확인:**

### **텍스트 관련**
- [ ] 모든 헤딩이 `text-black`인가?
- [ ] 본문 텍스트가 `text-black`인가?
- [ ] 부가 정보만 `text-neutral-600`인가?
- [ ] `opacity-60`, `opacity-80` 같은 거 없는가?
- [ ] `text-gray-400` 같은 연한 회색 없는가?
- [ ] `text-white/80` 같은 투명도 없는가?

### **배경 관련**
- [ ] 배경이 `bg-white` 또는 `bg-neutral-50`인가?
- [ ] `bg-gradient-to-br from-purple-...` 같은 거 없는가?
- [ ] `backdrop-blur-md` 사용 안 했는가?
- [ ] `bg-white/10`, `bg-black/40` 같은 거 없는가?

### **컴포넌트 관련**
- [ ] 디자인 시스템 컴포넌트를 사용했는가? (`<Card>`, `<Button>` 등)
- [ ] Button outline이 검은색인가? (`border-black`)
- [ ] 카드가 glass morphism이 아닌가?
- [ ] 둥근 테두리가 과하지 않은가? (`rounded-lg` 정도만)

### **색상 관련**
- [ ] 보라색이 완전히 제거되었는가?
- [ ] `purple-900`, `indigo-900`, `pink-500` 같은 거 없는가?
- [ ] Accent 색상을 올바르게 사용했는가?

### **레이아웃 관련**
- [ ] Navigation과 Footer를 가이드대로 추가했는가?
- [ ] 간격이 적절한가? (`py-32`, `py-20` 등)
- [ ] Container를 사용했는가?

---

## 🚫 절대 금지 사항

다음 패턴을 발견하면 즉시 수정하세요:

```tsx
// ❌ 금지 1: 보라색
className="from-purple-900 via-blue-900 to-indigo-900"
className="bg-purple-500"
className="text-purple-400"

// ❌ 금지 2: Glass morphism
className="backdrop-blur-md"
className="bg-white/10"
className="bg-black/40"

// ❌ 금지 3: Opacity on text
className="text-white opacity-60"
className="text-xl opacity-80"

// ❌ 금지 4: 연한 회색 텍스트
className="text-gray-400"
className="text-white/80"

// ❌ 금지 5: 과도한 애니메이션
initial={{ opacity: 0, y: 20, scale: 0.8 }}
transition={{ duration: 0.8, delay: 0.3 }}
```

---

## 💡 주요 변환 패턴

### **패턴 1: Hero Section**

```tsx
// ❌ Before
<div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
  <h1 className="text-white">제목</h1>
  <p className="text-white/80">설명</p>
</div>

// ✅ After
<div className="bg-white">
  <section className="py-32 bg-neutral-50">
    <Container size="xl">
      <h1 className="text-6xl font-bold text-black">제목</h1>
      <p className="text-xl text-black">설명</p>
    </Container>
  </section>
</div>
```

### **패턴 2: Card**

```tsx
// ❌ Before
<div className="bg-white/10 backdrop-blur-md rounded-2xl p-8">
  <h3 className="text-white">제목</h3>
  <p className="text-white/60">내용</p>
</div>

// ✅ After
<Card className="p-8">
  <h3 className="text-2xl font-bold text-black">제목</h3>
  <p className="text-black">내용</p>
</Card>
```

### **패턴 3: Button**

```tsx
// ❌ Before
<button className="bg-gradient-to-r from-pink-500 to-purple-500">
  클릭
</button>

// ✅ After
<Button variant="primary">
  클릭
</Button>
```

---

## 🔧 트러블슈팅

### **문제: 텍스트가 여전히 회색으로 보임**
**해결:** `opacity-XX` 제거하고 명시적 색상 사용
```tsx
// ❌ <p className="text-xl opacity-60">
// ✅ <p className="text-xl text-black">
```

### **문제: Button 테두리가 노란색**
**해결:** Button outline variant 수정됨 (검은색으로)
```tsx
<Button variant="outline">확인</Button>
```

### **문제: 페이지가 너무 밋밋함**
**해결:**
- Section별로 `bg-neutral-50` 교차 사용
- Icon 추가 (시각적 포인트)
- Hover 효과 활용

---

## 📝 커밋 메시지 가이드

```bash
# 페이지 리뉴얼
git commit -m "feat: redesign quiz results page - remove purple gradient"

# 텍스트 수정
git commit -m "fix: improve text contrast on gallery page"

# 컴포넌트 수정
git commit -m "refactor: replace glass cards with clean cards on dashboard"

# 레이아웃 개선
git commit -m "style: add proper spacing and sections on profile page"
```

---

## 🎯 완료 기준

각 페이지가 다음 조건을 만족하면 완료:

1. ✅ 가이드의 체크리스트 모두 통과
2. ✅ 로컬에서 확인했을 때 텍스트 명확히 보임
3. ✅ 보라색 완전 제거
4. ✅ 일관된 디자인 (Home page와 유사한 느낌)
5. ✅ 기능 정상 동작

---

## 🚀 시작하기

**준비되었다면 다음 명령어로 시작:**

```bash
# 1. 가이드 읽기
cat UI_REDESIGN_GUIDE.md | head -200

# 2. 첫 페이지 (Quiz Results) 시작
cat frontend/app/quiz/results/page.tsx

# 3. 리뉴얼 작업 시작!
```

**중요:**
- 한 번에 한 페이지씩 작업하세요
- 각 페이지마다 커밋하세요
- 체크리스트를 반드시 확인하세요
- UI_REDESIGN_GUIDE.md를 자주 참고하세요

---

## ❓ 질문이 있다면

가이드에 답이 있습니다:
- 색상 hex 코드 → "색상 팔레트" 섹션
- 컴포넌트 사용법 → "컴포넌트 사용법" 섹션
- 변환 방법 → "실전 변환 예시" 섹션
- 금지사항 → "금지 사항" 섹션

---

**작성일:** 2025-01-08
**버전:** 1.0
**대상:** 다른 AI (Claude, GPT 등)
