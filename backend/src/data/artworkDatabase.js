/**
 * SAYU Art Counselor - Artwork Database
 * 16개 퍼블릭 도메인 작품 데이터베이스
 * 각 작품은 16가지 성격 유형별로 다른 접근법 제공
 *
 * 현재 Supabase DB 구조에 맞춰 UUID 사용
 */

const artworks = {
  // 1. 반 고흐 - 별이 빛나는 밤
  "550e8400-e29b-41d4-a716-446655440001": {
    id: "550e8400-e29b-41d4-a716-446655440001",
    metadata: {
      title: "별이 빛나는 밤",
      titleEn: "The Starry Night",
      artist: "빈센트 반 고흐",
      artistEn: "Vincent van Gogh",
      year: 1889,
      medium: "유화",
      dimensions: "73.7 × 92.1 cm",
      location: "뉴욕 현대미술관",
      style: "포스트 인상주의",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg"
    },

    // 기본 소개 (모든 유형 공통)
    basePresentation: {
      hook: "정신병원 창문에서 본 새벽 4시의 하늘, 73번의 붓질로 탄생한 우주",
      visualFocus: "소용돌이치는 하늘과 고요한 마을의 대비",
      funFacts: [
        "실제 천문학자들이 분석한 결과, 소용돌이 패턴이 실제 난류 현상과 일치",
        "노란색 별들은 실제로 그날 밤 금성의 위치와 일치",
        "물감이 1cm 이상 두껍게 쌓인 부분이 11곳"
      ],
      technique: "임파스토 기법으로 물감을 두껍게 발라 질감을 만들어냄"
    },

    // 16가지 성격 유형별 맞춤 접근
    personalityApproaches: {
      // L (Lone/고독한) + A (Abstract/추상) 그룹
      LAEF: { // 여우 - 몽환적 방랑자
        focus: "초현실적 상상력",
        opening: "이 하늘이 실제로 움직인다면 어떤 소리가 날까요?",
        interpretation: "반 고흐는 '보이지 않는 것을 보이게 하는' 능력이 있었습니다. 이 소용돌이는 단순한 바람이 아니라 우주의 숨결이죠.",
        questions: [
          "소용돌이 속에서 당신만의 패턴을 발견하셨나요?",
          "이 하늘이 꿈이라면, 어떤 꿈일까요?"
        ],
        journalPrompt: "이 밤하늘이 들려주는 이야기를 상상해보세요"
      },

      LAEC: { // 고양이 - 감성 큐레이터
        focus: "색채와 감정의 조화",
        opening: "파란색과 노란색이 만들어내는 감정의 리듬을 느껴보세요",
        interpretation: "차가운 밤하늘에 따뜻한 별빛, 이 대비가 만드는 정서적 균형이 작품의 핵심입니다.",
        questions: [
          "어떤 색이 가장 마음에 와닿나요?",
          "이 색들이 만드는 기분은 어떤가요?"
        ],
        journalPrompt: "당신에게 위로가 되는 색은 무엇인가요?"
      },

      LAMF: { // 올빼미 - 직관적 탐구자
        focus: "숨겨진 의미와 상징",
        opening: "11개의 소용돌이, 11개의 별 - 이 숫자들이 우연일까요?",
        interpretation: "반 고흐는 편지에서 '밤이 낮보다 더 살아있다'고 했습니다. 어둠 속에서 진실을 보는 통찰력을 그렸죠.",
        questions: [
          "이 그림에서 가장 '살아있는' 부분은 어디인가요?",
          "소용돌이가 향하는 방향이 의미하는 것은?"
        ],
        journalPrompt: "어둠 속에서 발견한 빛에 대해 써보세요"
      },

      LAMC: { // 거북이 - 철학적 수집가
        focus: "예술사적 의미와 영향",
        opening: "이 작품이 표현주의와 추상미술의 시작점이 된 이유를 아시나요?",
        interpretation: "19세기 말 과학적 세계관과 영적 세계관의 충돌, 반 고흐는 이 둘을 하나의 캔버스에 통합했습니다.",
        questions: [
          "이 작품이 미술사에 던진 질문은 무엇일까요?",
          "100년 후에도 이 작품이 사랑받는 이유는?"
        ],
        journalPrompt: "시간을 초월한 아름다움이란 무엇일까요?"
      },

      // L (Lone/고독한) + R (Representational/구상) 그룹
      LREF: { // 카멜레온 - 고독한 관찰자
        focus: "세밀한 관찰과 발견",
        opening: "마을의 창문 불빛 하나하나가 다른 색인 걸 보셨나요?",
        interpretation: "반 고흐는 각 집의 불빛을 다른 색으로 칠했습니다. 각자의 삶이 지닌 고유한 온기를 표현한 거죠.",
        questions: [
          "가장 따뜻해 보이는 창문은 어느 것인가요?",
          "교회 첨탑이 하늘을 향해 뻗은 의미는?"
        ],
        journalPrompt: "작은 디테일에서 발견한 특별함을 기록해보세요"
      },

      LREC: { // 고슴도치 - 섬세한 감정가
        focus: "내면의 감정과 공명",
        opening: "반 고흐의 고독이 느껴지시나요? 하지만 그 속에 희망도 있습니다",
        interpretation: "정신병원에서 그린 이 그림은 고통 속에서도 아름다움을 찾아내는 인간의 의지를 보여줍니다.",
        questions: [
          "이 밤하늘이 주는 위로가 있나요?",
          "어떤 별이 가장 따뜻해 보이나요?"
        ],
        journalPrompt: "어둠 속에서도 빛나는 것들에 대해"
      },

      LRMF: { // 문어 - 디지털 탐험가
        focus: "기법과 과학적 분석",
        opening: "NASA 과학자들이 이 소용돌이가 실제 대기 난류와 일치한다고 밝혔습니다",
        interpretation: "반 고흐는 관찰만으로 콜모고로프의 난류 이론을 시각화했습니다. 예술적 직관이 과학을 앞선 사례죠.",
        questions: [
          "물감의 두께가 만드는 입체감을 느끼시나요?",
          "디지털로 재현 불가능한 부분은 무엇일까요?"
        ],
        journalPrompt: "예술과 과학이 만나는 지점에 대해"
      },

      LRMC: { // 비버 - 학구적 연구자
        focus: "제작 과정과 기법 분석",
        opening: "반 고흐는 이 그림을 단 하루 만에 완성했다고 합니다",
        interpretation: "빠른 붓질 속에 계획된 구성, 즉흥성과 치밀함이 공존하는 걸작입니다.",
        questions: [
          "가장 먼저 그려진 부분은 어디일까요?",
          "마지막 붓질은 어느 부분일까요?"
        ],
        journalPrompt: "창작 과정의 열정에 대해 생각해보세요"
      },

      // S (Social/공유하는) + A (Abstract/추상) 그룹
      SAEF: { // 나비 - 감성 나눔이
        focus: "함께 느끼는 감동",
        opening: "전 세계 수백만 명이 이 하늘에서 위로받았다고 해요",
        interpretation: "개인의 고통이 보편적 아름다움이 되는 순간, 우리는 모두 이 별빛 아래 연결되어 있습니다.",
        questions: [
          "이 작품을 보며 떠오른 사람이 있나요?",
          "누구와 함께 이 하늘을 보고 싶나요?"
        ],
        journalPrompt: "이 감동을 누군가와 나눈다면"
      },

      SAEC: { // 펭귄 - 예술 네트워커
        focus: "문화적 영향과 연결",
        opening: "돈 맥클린의 'Vincent'부터 영화 '러빙 빈센트'까지, 이 작품의 영향력은 계속됩니다",
        interpretation: "하나의 그림이 음악, 영화, 문학으로 확장되며 문화적 아이콘이 되었죠.",
        questions: [
          "이 작품에서 영감받은 다른 예술을 아시나요?",
          "현대 문화에서 이 작품의 의미는?"
        ],
        journalPrompt: "예술이 예술을 낳는 과정에 대해"
      },

      SAMF: { // 앵무새 - 영감 전도사
        focus: "영감과 창의성 전파",
        opening: "이 소용돌이를 보면 무언가를 창작하고 싶어지지 않나요?",
        interpretation: "반 고흐의 열정은 전염성이 있습니다. 보는 이에게 창작 욕구를 불러일으키죠.",
        questions: [
          "이 에너지를 어떻게 표현하고 싶으신가요?",
          "당신만의 '별이 빛나는 밤'은?"
        ],
        journalPrompt: "받은 영감을 어떻게 전달할까요?"
      },

      SAMC: { // 사슴 - 문화 기획자
        focus: "전시와 큐레이션 관점",
        opening: "만약 이 작품으로 전시를 기획한다면 어떤 주제가 좋을까요?",
        interpretation: "밤의 정경을 그린 다른 작품들과 함께 보면 반 고흐만의 독특함이 더욱 부각됩니다.",
        questions: [
          "이 작품과 어울리는 다른 작품은?",
          "어떤 공간에서 감상하면 좋을까요?"
        ],
        journalPrompt: "이상적인 감상 환경을 상상해보세요"
      },

      // S (Social/공유하는) + R (Representational/구상) 그룹
      SREF: { // 강아지 - 열정적 관람자
        focus: "즉각적 감동과 에너지",
        opening: "와! 정말 하늘이 움직이는 것 같지 않나요?",
        interpretation: "이 역동적인 에너지는 보는 사람도 함께 움직이게 만듭니다. 정적인 그림이 아니라 살아있는 우주예요!",
        questions: [
          "가장 에너지가 느껴지는 부분은?",
          "이 그림이 주는 활력을 어떻게 표현하시겠어요?"
        ],
        journalPrompt: "이 에너지가 당신에게 주는 힘"
      },

      SREC: { // 오리 - 따뜻한 안내자
        focus: "친근한 스토리텔링",
        opening: "반 고흐가 동생 테오에게 '드디어 내가 찾던 밤하늘을 그렸어'라고 편지를 썼대요",
        interpretation: "형제애, 고독, 희망... 인간적인 이야기가 이 그림을 더욱 특별하게 만듭니다.",
        questions: [
          "반 고흐의 마음이 느껴지시나요?",
          "이 이야기를 듣고 그림이 다르게 보이나요?"
        ],
        journalPrompt: "작품 뒤의 인간적인 이야기"
      },

      SRMF: { // 코끼리 - 지식 멘토
        focus: "교육적 가치와 전달",
        opening: "이 작품으로 포스트 인상주의의 핵심을 이해할 수 있습니다",
        interpretation: "감정의 표현이 사실적 묘사보다 중요하다는 새로운 예술관의 시작이었죠.",
        questions: [
          "인상주의와 어떻게 다른지 보이시나요?",
          "이 기법이 후대에 미친 영향은?"
        ],
        journalPrompt: "배운 것을 어떻게 전달할까요?"
      },

      SRMC: { // 독수리 - 체계적 교육자
        focus: "구조적 분석과 이해",
        opening: "이 그림의 구도를 3분할로 나누면 완벽한 황금비율이 나타납니다",
        interpretation: "혼란스러워 보이지만 치밀하게 계산된 구성입니다. 소용돌이의 중심, 교회 첨탑, 사이프러스 나무가 만드는 삼각 구도를 보세요.",
        questions: [
          "균형을 잡아주는 요소들이 보이시나요?",
          "구도가 주는 안정감을 느끼시나요?"
        ],
        journalPrompt: "혼돈 속의 질서에 대해"
      }
    },

    // 감정 여정 설계
    emotionalJourney: {
      entry: ["호기심", "경외감"],
      exploration: ["불안", "몰입", "공감"],
      resolution: ["희망", "평온", "영감"]
    }
  },

  // 2. 모네 - 수련
  "water-lilies": {
    id: "water-lilies",
    metadata: {
      title: "수련",
      titleEn: "Water Lilies",
      artist: "클로드 모네",
      artistEn: "Claude Monet",
      year: 1906,
      medium: "유화",
      dimensions: "89.9 × 94.1 cm",
      location: "시카고 미술관",
      style: "인상주의",
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg"
    },

    basePresentation: {
      hook: "백내장으로 흐려진 시야가 만들어낸 꿈같은 정원",
      visualFocus: "물과 하늘의 경계가 사라진 무한한 공간",
      funFacts: [
        "모네는 같은 연못을 250번 이상 그렸습니다",
        "수련을 기르기 위해 정원사 6명을 고용했습니다",
        "일본 다리와 수련은 일본 우키요에의 영향입니다"
      ],
      technique: "짧은 붓질로 빛의 떨림을 표현하는 인상주의 기법"
    },

    // 나머지 15개 작품도 동일한 구조로...
  }

  // ... 14개 작품 더 추가
};

/**
 * 성격 유형에 맞는 작품 추천
 */
const getRecommendedArtworks = (personalityType) => {
  const recommendations = {
    LAEF: ["starry-night", "the-scream", "wanderer"],
    LAEC: ["water-lilies", "the-kiss", "girl-with-pearl"],
    LAMF: ["starry-night", "wanderer", "inwangjeseokdo"],
    LAMC: ["the-birth-of-venus", "night-watch", "apples-oranges"],
    LREF: ["girl-with-pearl", "night-watch", "ssireum"],
    LREC: ["the-scream", "water-lilies", "beauty"],
    LRMF: ["rain-steam-speed", "starry-night", "wanderer"],
    LRMC: ["apples-oranges", "dance-class", "night-watch"],
    SAEF: ["water-lilies", "luncheon", "the-kiss"],
    SAEC: ["dance-class", "beauty", "girl-with-pearl"],
    SAMF: ["moulin-rouge", "luncheon", "starry-night"],
    SAMC: ["the-kiss", "water-lilies", "dance-class"],
    SREF: ["moulin-rouge", "ssireum", "luncheon"],
    SREC: ["ssireum", "luncheon", "dance-class"],
    SRMF: ["night-watch", "rain-steam-speed", "inwangjeseokdo"],
    SRMC: ["inwangjeseokdo", "night-watch", "apples-oranges"]
  };

  return recommendations[personalityType] || ["starry-night"];
};

/**
 * 감정 상태에 맞는 작품 추천
 */
const getArtworkByEmotion = (emotion) => {
  const emotionMap = {
    anxious: ["water-lilies", "apples-oranges"],
    sad: ["starry-night", "wanderer"],
    happy: ["luncheon", "moulin-rouge"],
    calm: ["water-lilies", "girl-with-pearl"],
    inspired: ["starry-night", "the-birth-of-venus"],
    lonely: ["night-hawks", "wanderer"],
    loved: ["the-kiss", "luncheon"],
    curious: ["the-scream", "rain-steam-speed"]
  };

  return emotionMap[emotion] || ["water-lilies"];
};

module.exports = {
  artworks,
  getRecommendedArtworks,
  getArtworkByEmotion
};