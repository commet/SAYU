# 🎨 SAYU APT 타입별 전시 추천 매칭 시스템

## 📌 개요
SAYU의 16가지 APT 성격 유형별로 맞춤형 전시를 추천하는 지능형 매칭 시스템입니다.

## 🎯 핵심 원리
> "각 성격 유형마다 선호하는 전시 스타일이 다르다"

### 시스템 작동 흐름
```
사용자 → [APT 타입 확인] → [전시 특성 분석] → [매칭 점수 계산] → [맞춤 추천]
```

## 🏗️ 시스템 아키텍처

### 1. 16개 APT 타입 프로파일 구조

각 타입별로 다음 요소들을 정의:
- **preferences** (선호 요소): 0-1 사이의 가중치
- **avoidance** (회피 요소): 0-1 사이의 가중치
- **ideal_exhibitions** (이상적인 전시 유형)

### 2. 전시 특성 분석 시스템

전시마다 다음 특성들을 자동 분석:
```javascript
{
  abstraction: 0-1,        // 추상성
  realism: 0-1,            // 사실성
  emotional_depth: 0-1,    // 감정적 깊이
  philosophical: 0-1,      // 철학적 깊이
  social: 0-1,             // 사회적 경험
  solitude: 0-1,           // 고독한 감상
  systematic: 0-1,         // 체계적 구성
  freedom: 0-1,            // 자유로운 관람
  educational: 0-1,        // 교육적 가치
  crowded: 0-1            // 예상 붐빔도
}
```

### 3. 매칭 점수 계산 알고리즘

```
매칭 점수 = Σ(전시특성 × APT선호도) - Σ(전시특성 × APT회피도 × 0.5)
```

## 📊 4대 예술 부족별 특성

### 🌙 몽상가 부족 (Dreamers) - LA군
- **LAEF** (몽환적 방랑자-여우): 추상적, 자유로운, 감정적
- **LAEC** (감성 큐레이터-고양이): 추상적, 체계적, 감성적
- **LAMF** (직관적 탐구자-올빼미): 추상적, 철학적, 자유로운
- **LAMC** (철학적 수집가-거북이): 추상적, 체계적, 아카이빙

### 🔍 관찰자 부족 (Observers) - LR군
- **LREF** (고독한 관찰자-카멜레온): 사실적, 감정적, 자유로운
- **LREC** (섬세한 감정가-고슴도치): 사실적, 감정적, 체계적
- **LRMF** (디지털 탐험가-문어): 사실적, 기술적, 혁신적
- **LRMC** (학구적 연구자-비버): 사실적, 학술적, 체계적

### 🎪 연결자 부족 (Connectors) - SA군
- **SAEF** (감성 나누미-나비): 추상적, 사회적, 감정공유
- **SAEC** (예술 네트워커-펭귄): 추상적, 사회적, 체계적
- **SAMF** (영감 전도사-앵무새): 추상적, 영감적, 전파력
- **SAMC** (문화 기획자-사슴): 추상적, 문화적, 조직적

### 🎓 전달자 부족 (Messengers) - SR군
- **SREF** (열정적 관람자-강아지): 사실적, 열정적, 즐거운
- **SREC** (따뜻한 안내자-오리): 사실적, 따뜻한, 안내력
- **SRMF** (지식 멘토-코끼리): 사실적, 지식전달, 멘토링
- **SRMC** (체계적 교육자-독수리): 사실적, 교육적, 체계적

## 💻 구현 코드

### APTExhibitionMatcher 클래스
```javascript
class APTExhibitionMatcher {
  constructor() {
    this.typeProfiles = {
      // 16개 타입별 프로파일 정의
      LAEF: {
        name: '몽환적 방랑자',
        preferences: {
          abstraction: 0.9,
          solitude: 0.8,
          emotional_depth: 0.85,
          freedom: 0.9,
          // ...
        },
        avoidance: {
          crowded: 0.8,
          structured_tour: 0.7,
          // ...
        }
      },
      // ... 나머지 15개 타입
    };
  }

  calculateExhibitionScore(exhibition, aptType) {
    const profile = this.typeProfiles[aptType];
    let score = 0;
    
    // 선호 요소 가산
    for (const [key, weight] of Object.entries(profile.preferences)) {
      score += (exhibition[key] || 0) * weight;
    }
    
    // 회피 요소 감산
    for (const [key, weight] of Object.entries(profile.avoidance)) {
      score -= (exhibition[key] || 0) * weight * 0.5;
    }
    
    return Math.min(100, Math.max(0, score * 100));
  }
}
```

### ExhibitionEnricher 클래스
```javascript
class ExhibitionEnricher {
  async enrichExhibitionData(exhibition) {
    return {
      ...exhibition,
      abstraction: await this.calculateAbstraction(exhibition),
      realism: await this.calculateRealism(exhibition),
      emotional_depth: await this.analyzeEmotionalDepth(exhibition),
      // ... 모든 특성 분석
    };
  }

  calculateAbstraction(exhibition) {
    const keywords = ['추상', '개념', 'abstract', 'conceptual'];
    const text = `${exhibition.title} ${exhibition.description}`.toLowerCase();
    // 키워드 매칭으로 점수 계산
    return this.keywordScore(text, keywords);
  }
}
```

## 📊 데이터베이스 스키마

```sql
-- 전시 특성 테이블
CREATE TABLE exhibition_characteristics (
  exhibition_id UUID PRIMARY KEY,
  abstraction DECIMAL(3,2),
  realism DECIMAL(3,2),
  emotional_depth DECIMAL(3,2),
  philosophical DECIMAL(3,2),
  expected_crowd_level DECIMAL(3,2),
  interactive_level DECIMAL(3,2),
  educational_value DECIMAL(3,2),
  instagram_worthy DECIMAL(3,2),
  has_guided_tour BOOLEAN,
  family_friendly BOOLEAN,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APT별 피드백 테이블
CREATE TABLE apt_exhibition_feedback (
  id UUID PRIMARY KEY,
  user_id UUID,
  apt_type VARCHAR(4),
  exhibition_id UUID,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  visited BOOLEAN,
  would_recommend BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 구현 로드맵

### Phase 1: 기본 구조 (1주차)
- [ ] APTExhibitionMatcher 클래스 구현
- [ ] 16개 타입 프로파일 정의
- [ ] 기본 점수 계산 로직

### Phase 2: 데이터 확장 (2주차)
- [ ] ExhibitionEnricher 구현
- [ ] 전시 메타데이터 수집
- [ ] 키워드 기반 특성 분석

### Phase 3: 통합 (3주차)
- [ ] 추천 파이프라인 완성
- [ ] 캐싱 시스템 구축
- [ ] API 엔드포인트 구현

### Phase 4: 학습 시스템 (4주차)
- [ ] 피드백 수집 시스템
- [ ] 선호도 학습 알고리즘
- [ ] A/B 테스트 프레임워크

## 📈 예상 추천 결과 예시

```
🦊 LAEF(몽환적 방랑자)님을 위한 추천:

1. 칸딘스키 특별전 [85점]
   • 매칭 이유: 추상적 표현, 깊은 감성, 자유로운 감상
   💡 관람 팁: "마음이 이끄는 대로 자유롭게 감상하세요"

2. 이우환 공간전 [78점]
   • 매칭 이유: 미니멀리즘, 명상적 공간, 조용한 환경
   💡 관람 팁: "충분한 시간을 갖고 천천히 둘러보세요"
```

## 📝 핵심 차별점

| 기존 방식 | 새로운 방식 |
|---------|----------|
| 모든 사용자에게 인기 전시 추천 | 16개 타입별 맞춤 추천 |
| 장르별 단순 분류 | 다차원 특성 분석 |
| 일방적 추천 | 선호/회피 요소 균형 고려 |

## 🔧 기술 스택
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis
- **Analysis**: Natural Language Processing (키워드 분석)

## 📌 참고사항
- 점수 60점 이상의 전시만 추천
- 각 타입별 최대 10개 전시 추천
- 실시간 전시 정보 업데이트
- 사용자 피드백 기반 지속적 개선

---

문서 작성일: 2025-09-07
버전: 1.0.0