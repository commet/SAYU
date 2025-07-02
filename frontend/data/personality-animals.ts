// 🎨 SAYU Personality Animal Characters
// 16가지 예술 성격 유형별 동물 캐릭터

export interface PersonalityAnimal {
  type: string;
  animal: string;
  animal_ko: string;
  emoji: string;
  characteristics: string[];
  characteristics_ko: string[];
  image?: string;          // 캐릭터 이미지 경로
  avatar?: string;         // 작은 아바타 이미지
  illustration?: string;   // 상세 일러스트
}

export const personalityAnimals: Record<string, PersonalityAnimal> = {
  LAEF: {
    type: 'LAEF',
    animal: 'Fox',
    animal_ko: '여우',
    emoji: '🦊',
    characteristics: [
      'Dreamy and mysterious',
      'Emotionally intuitive',
      'Solitary wanderer',
      'Sees hidden meanings'
    ],
    characteristics_ko: [
      '몽환적이고 신비로운',
      '감정적으로 직관적인',
      '고독한 방랑자',
      '숨겨진 의미를 보는'
    ],
    image: '/images/personality-animals/fox-laef.png',
    avatar: '/images/personality-animals/avatars/fox-laef-avatar.png',
    illustration: '/images/personality-animals/illustrations/fox-laef-full.png'
  },
  LAEC: {
    type: 'LAEC',
    animal: 'Swan',
    animal_ko: '백조',
    emoji: '🦢',
    characteristics: [
      'Elegant and refined',
      'Emotional depth',
      'Methodical grace',
      'Curates beauty'
    ],
    characteristics_ko: [
      '우아하고 세련된',
      '감정의 깊이를 지닌',
      '체계적인 우아함',
      '아름다움을 큐레이팅하는'
    ],
    image: '/images/personality-animals/main/swan-laec.png',
    avatar: '/images/personality-animals/avatars/swan-laec-avatar.png',
    illustration: '/images/personality-animals/illustrations/swan-laec-full.png'
  },
  LAMF: {
    type: 'LAMF',
    animal: 'Owl',
    animal_ko: '올빼미',
    emoji: '🦉',
    characteristics: [
      'Wise and observant',
      'Intuitive insights',
      'Night wanderer',
      'Sees in the dark'
    ],
    characteristics_ko: [
      '지혜롭고 관찰력 있는',
      '직관적인 통찰력',
      '밤의 방랑자',
      '어둠 속에서도 보는'
    ],
    image: '/images/personality-animals/main/owl-lamf.png',
    avatar: '/images/personality-animals/avatars/owl-lamf-avatar.png',
    illustration: '/images/personality-animals/illustrations/owl-lamf-full.png'
  },
  LAMC: {
    type: 'LAMC',
    animal: 'Turtle',
    animal_ko: '거북이',
    emoji: '🐢',
    characteristics: [
      'Patient and thoughtful',
      'Systematic collector',
      'Carries wisdom',
      'Slow but profound'
    ],
    characteristics_ko: [
      '인내심 있고 사려 깊은',
      '체계적인 수집가',
      '지혜를 품은',
      '느리지만 깊이 있는'
    ],
    image: '/images/personality-animals/main/elephant-lamc.png',
    avatar: '/images/personality-animals/avatars/elephant-lamc-avatar.png',
    illustration: '/images/personality-animals/illustrations/elephant-lamc-full.png'
  },
  LREF: {
    type: 'LREF',
    animal: 'Chameleon',
    animal_ko: '카멜레온',
    emoji: '🦎',
    characteristics: [
      'Adaptive observer',
      'Sensitive to colors',
      'Blends with art',
      'Quietly emotional'
    ],
    characteristics_ko: [
      '적응력 있는 관찰자',
      '색채에 민감한',
      '예술과 하나되는',
      '조용히 감정적인'
    ],
    image: '/images/personality-animals/main/deer-lref.png',
    avatar: '/images/personality-animals/avatars/deer-lref-avatar.png',
    illustration: '/images/personality-animals/illustrations/deer-lref-full.png'
  },
  LREC: {
    type: 'LREC',
    animal: 'Deer',
    animal_ko: '사슴',
    emoji: '🦌',
    characteristics: [
      'Gentle and delicate',
      'Emotionally aware',
      'Graceful precision',
      'Sensitive soul'
    ],
    characteristics_ko: [
      '온화하고 섬세한',
      '감정을 잘 아는',
      '우아한 정밀함',
      '민감한 영혼'
    ],
    image: '/images/personality-animals/main/cat-lrec.png',
    avatar: '/images/personality-animals/avatars/cat-lrec-avatar.png',
    illustration: '/images/personality-animals/illustrations/cat-lrec-full.png'
  },
  LRMF: {
    type: 'LRMF',
    animal: 'Wolf',
    animal_ko: '늑대',
    emoji: '🐺',
    characteristics: [
      'Independent explorer',
      'Digital native',
      'Truth seeker',
      'Lone hunter'
    ],
    characteristics_ko: [
      '독립적인 탐험가',
      '디지털 네이티브',
      '진실을 찾는',
      '고독한 사냥꾼'
    ],
    image: '/images/personality-animals/main/wolf-lrmf.png',
    avatar: '/images/personality-animals/avatars/wolf-lrmf-avatar.png',
    illustration: '/images/personality-animals/illustrations/wolf-lrmf-full.png'
  },
  LRMC: {
    type: 'LRMC',
    animal: 'Beaver',
    animal_ko: '비버',
    emoji: '🦫',
    characteristics: [
      'Methodical builder',
      'Knowledge architect',
      'Detail focused',
      'Research master'
    ],
    characteristics_ko: [
      '체계적인 건축가',
      '지식의 설계자',
      '디테일에 집중하는',
      '연구의 달인'
    ],
    image: '/images/personality-animals/main/bear-lrmc.png',
    avatar: '/images/personality-animals/avatars/bear-lrmc-avatar.png',
    illustration: '/images/personality-animals/illustrations/bear-lrmc-full.png'
  },
  SAEF: {
    type: 'SAEF',
    animal: 'Butterfly',
    animal_ko: '나비',
    emoji: '🦋',
    characteristics: [
      'Social and vibrant',
      'Emotion spreader',
      'Transforms experiences',
      'Beautiful connections'
    ],
    characteristics_ko: [
      '사교적이고 활기찬',
      '감정을 퍼뜨리는',
      '경험을 변화시키는',
      '아름다운 연결'
    ],
    image: '/images/personality-animals/main/rabbit-saef.png',
    avatar: '/images/personality-animals/avatars/rabbit-saef-avatar.png',
    illustration: '/images/personality-animals/illustrations/rabbit-saef-full.png'
  },
  SAEC: {
    type: 'SAEC',
    animal: 'Penguin',
    animal_ko: '펭귄',
    emoji: '🐧',
    characteristics: [
      'Social organizer',
      'Art community builder',
      'Structured networking',
      'Group harmony'
    ],
    characteristics_ko: [
      '사교적 조직가',
      '예술 커뮤니티 빌더',
      '체계적인 네트워킹',
      '그룹의 조화'
    ],
    image: '/images/personality-animals/main/dolphin-saec.png',
    avatar: '/images/personality-animals/avatars/dolphin-saec-avatar.png',
    illustration: '/images/personality-animals/illustrations/dolphin-saec-full.png'
  },
  SAMF: {
    type: 'SAMF',
    animal: 'Parrot',
    animal_ko: '앵무새',
    emoji: '🦜',
    characteristics: [
      'Inspiration speaker',
      'Idea sharer',
      'Colorful communicator',
      'Spreads enthusiasm'
    ],
    characteristics_ko: [
      '영감의 전달자',
      '아이디어 공유자',
      '다채로운 소통가',
      '열정을 퍼뜨리는'
    ],
    image: '/images/personality-animals/main/butterfly-samf.png',
    avatar: '/images/personality-animals/avatars/butterfly-samf-avatar.png',
    illustration: '/images/personality-animals/illustrations/butterfly-samf-full.png'
  },
  SAMC: {
    type: 'SAMC',
    animal: 'Bee',
    animal_ko: '벌',
    emoji: '🐝',
    characteristics: [
      'Cultural architect',
      'Community organizer',
      'Systematic creator',
      'Collective wisdom'
    ],
    characteristics_ko: [
      '문화의 건축가',
      '커뮤니티 조직가',
      '체계적인 창조자',
      '집단의 지혜'
    ],
    image: '/images/personality-animals/main/bee-samc.png',
    avatar: '/images/personality-animals/avatars/bee-samc-avatar.png',
    illustration: '/images/personality-animals/illustrations/bee-samc-full.png'
  },
  SREF: {
    type: 'SREF',
    animal: 'Dog',
    animal_ko: '강아지',
    emoji: '🐕',
    characteristics: [
      'Enthusiastic viewer',
      'Loyal companion',
      'Emotional expresser',
      'Joy spreader'
    ],
    characteristics_ko: [
      '열정적인 관람자',
      '충실한 동반자',
      '감정을 표현하는',
      '기쁨을 전파하는'
    ],
    image: '/images/personality-animals/main/penguin-sref.png',
    avatar: '/images/personality-animals/avatars/penguin-sref-avatar.png',
    illustration: '/images/personality-animals/illustrations/penguin-sref-full.png'
  },
  SREC: {
    type: 'SREC',
    animal: 'Duck',
    animal_ko: '오리',
    emoji: '🦆',
    characteristics: [
      'Warm guide',
      'Nurturing presence',
      'Steady companion',
      'Caring educator'
    ],
    characteristics_ko: [
      '따뜻한 안내자',
      '보살피는 존재',
      '든든한 동반자',
      '배려하는 교육자'
    ],
    image: '/images/personality-animals/main/parrot-srec.png',
    avatar: '/images/personality-animals/avatars/parrot-srec-avatar.png',
    illustration: '/images/personality-animals/illustrations/parrot-srec-full.png'
  },
  SRMF: {
    type: 'SRMF',
    animal: 'Elephant',
    animal_ko: '코끼리',
    emoji: '🐘',
    characteristics: [
      'Knowledge keeper',
      'Memory master',
      'Wise mentor',
      'Story carrier'
    ],
    characteristics_ko: [
      '지식의 수호자',
      '기억의 달인',
      '지혜로운 멘토',
      '이야기를 전하는'
    ],
    image: '/images/personality-animals/main/eagle-srmf.png',
    avatar: '/images/personality-animals/avatars/eagle-srmf-avatar.png',
    illustration: '/images/personality-animals/illustrations/eagle-srmf-full.png'
  },
  SRMC: {
    type: 'SRMC',
    animal: 'Eagle',
    animal_ko: '독수리',
    emoji: '🦅',
    characteristics: [
      'Systematic educator',
      'Overview master',
      'Precision teacher',
      'Knowledge spreader'
    ],
    characteristics_ko: [
      '체계적인 교육자',
      '전체를 보는 달인',
      '정확한 선생님',
      '지식을 전파하는'
    ],
    image: '/images/personality-animals/main/lion-srmc.png',
    avatar: '/images/personality-animals/avatars/lion-srmc-avatar.png',
    illustration: '/images/personality-animals/illustrations/lion-srmc-full.png'
  }
};

// Helper function to get animal by personality type
export const getAnimalByType = (type: string): PersonalityAnimal | null => {
  return personalityAnimals[type] || null;
};

// Get emoji by type for quick display
export const getAnimalEmoji = (type: string): string => {
  const animal = personalityAnimals[type];
  return animal ? animal.emoji : '🎨';
};