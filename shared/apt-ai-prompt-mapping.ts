/**
 * APT (Art Personality Type) → AI Prompt Mapping
 * 16가지 성격 유형별 AI 아트 프로필 생성을 위한 프롬프트 매핑
 *
 * 사용 목적: MVP 2 - "나를 닮은 명화" 바이럴 기능
 */

// 아트 스타일 정의
export interface ArtStyle {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  artistReference: string;
  basePrompt: string;
  negativePrompt: string;
  colorPalette: string;
}

// APT 프롬프트 프로필
export interface APTPromptProfile {
  code: string;
  personalityEssence: string;      // 성격의 핵심 본질
  visualMetaphors: string[];       // 시각적 은유들
  emotionalAura: string;           // 감정적 분위기
  symbolicElements: string[];      // 상징적 요소들
  colorMood: string;               // 색채 무드
  compositionStyle: string;        // 구도 스타일
  lightingMood: string;            // 조명 분위기
}

// 5가지 핵심 아트 스타일 (MVP)
export const ART_STYLES: Record<string, ArtStyle> = {
  impressionism: {
    id: 'impressionism',
    name: 'Impressionism',
    nameKo: '인상주의',
    description: '빛과 색채의 순간 포착',
    artistReference: 'Monet, Renoir',
    basePrompt: 'impressionist oil painting, soft brushstrokes, capturing light and atmosphere, en plein air aesthetic, dappled sunlight, vibrant yet soft colors',
    negativePrompt: 'sharp edges, dark shadows, photorealistic, digital art',
    colorPalette: 'soft pastels, luminous blues, warm golds, gentle greens'
  },
  surrealism: {
    id: 'surrealism',
    name: 'Surrealism',
    nameKo: '초현실주의',
    description: '꿈과 무의식의 세계',
    artistReference: 'Dalí, Magritte',
    basePrompt: 'surrealist painting, dreamlike imagery, impossible landscapes, melting forms, subconscious symbolism, mysterious atmosphere, symbolic objects',
    negativePrompt: 'realistic, mundane, ordinary, simple composition',
    colorPalette: 'ethereal blues, mysterious purples, dream-like gradients'
  },
  expressionism: {
    id: 'expressionism',
    name: 'Expressionism',
    nameKo: '표현주의',
    description: '강렬한 감정 표현',
    artistReference: 'Munch, Kandinsky, Van Gogh',
    basePrompt: 'expressionist painting, bold emotional brushstrokes, distorted forms, vivid colors conveying emotion, psychological intensity, swirling patterns',
    negativePrompt: 'calm, peaceful, photorealistic, muted colors',
    colorPalette: 'bold yellows, intense blues, fiery oranges, deep reds'
  },
  popart: {
    id: 'popart',
    name: 'Pop Art',
    nameKo: '팝아트',
    description: '대중문화와 위트',
    artistReference: 'Warhol, Lichtenstein',
    basePrompt: 'pop art style, bold graphic design, bright saturated colors, halftone dots, comic book aesthetic, screen print effect, cultural icons',
    negativePrompt: 'muted colors, classical style, realistic shading',
    colorPalette: 'bright primary colors, neon accents, high contrast'
  },
  renaissance: {
    id: 'renaissance',
    name: 'Renaissance',
    nameKo: '르네상스',
    description: '고전적 우아함과 균형',
    artistReference: 'Da Vinci, Raphael',
    basePrompt: 'renaissance painting, classical composition, sfumato technique, golden ratio, chiaroscuro lighting, dignified pose, timeless elegance',
    negativePrompt: 'modern, abstract, bright neon colors, casual',
    colorPalette: 'earth tones, golden accents, rich burgundy, deep greens'
  }
};

// 16가지 APT 유형별 프롬프트 프로필
export const APT_PROMPT_PROFILES: Record<string, APTPromptProfile> = {
  // === L (Lone/혼자) 시작 유형들 ===

  LAEF: {
    code: 'LAEF',
    personalityEssence: 'dreamy wanderer lost in abstract emotions, introspective soul',
    visualMetaphors: ['misty forests', 'floating islands', 'ethereal fog', 'lone figure in vast landscape'],
    emotionalAura: 'melancholic beauty, serene solitude, peaceful introspection',
    symbolicElements: ['fox silhouette', 'moonlight', 'abstract swirls', 'floating dreams'],
    colorMood: 'soft purples, misty blues, warm sepia undertones',
    compositionStyle: 'off-center subject, vast negative space, dreamlike depth',
    lightingMood: 'soft diffused light, twilight glow, mystical ambiance'
  },

  LAEC: {
    code: 'LAEC',
    personalityEssence: 'elegant curator of emotions, refined aesthetic sensibility',
    visualMetaphors: ['organized garden', 'graceful architecture', 'carefully arranged objects'],
    emotionalAura: 'refined elegance, controlled passion, curated beauty',
    symbolicElements: ['cat figure', 'delicate flowers', 'symmetrical patterns', 'art frames'],
    colorMood: 'sophisticated greys, elegant purples, refined golds',
    compositionStyle: 'balanced arrangement, elegant symmetry, refined details',
    lightingMood: 'soft gallery lighting, elegant shadows, refined contrast'
  },

  LAMF: {
    code: 'LAMF',
    personalityEssence: 'wise philosopher seeking hidden meanings, intuitive explorer',
    visualMetaphors: ['ancient library', 'starlit sky', 'cosmic void', 'mysterious symbols'],
    emotionalAura: 'profound wisdom, cosmic curiosity, philosophical depth',
    symbolicElements: ['owl figure', 'ancient books', 'celestial objects', 'philosophical symbols'],
    colorMood: 'deep indigo, cosmic purples, mysterious blacks with golden accents',
    compositionStyle: 'layered depth, mysterious perspective, hidden meanings',
    lightingMood: 'starlight, candle glow, mysterious illumination'
  },

  LAMC: {
    code: 'LAMC',
    personalityEssence: 'systematic collector of wisdom, patient archivist',
    visualMetaphors: ['ancient archive', 'structured shelves', 'organized collections'],
    emotionalAura: 'patient dedication, methodical pursuit, quiet satisfaction',
    symbolicElements: ['turtle figure', 'scrolls', 'organized systems', 'time symbols'],
    colorMood: 'earthy browns, aged paper tones, forest greens',
    compositionStyle: 'structured grid, organized layers, methodical arrangement',
    lightingMood: 'warm study light, natural daylight, comfortable glow'
  },

  LREF: {
    code: 'LREF',
    personalityEssence: 'quiet observer blending with surroundings, adaptable spirit',
    visualMetaphors: ['hidden garden', 'reflective pool', 'nature camouflage'],
    emotionalAura: 'gentle observation, adaptive calm, natural harmony',
    symbolicElements: ['chameleon figure', 'changing colors', 'natural patterns', 'reflection'],
    colorMood: 'adaptive greens, earth tones, subtle color shifts',
    compositionStyle: 'integrated figure, environmental harmony, subtle presence',
    lightingMood: 'natural dappled light, soft shadows, organic glow'
  },

  LREC: {
    code: 'LREC',
    personalityEssence: 'delicate connoisseur with protective sensitivity',
    visualMetaphors: ['protected garden', 'detailed miniature world', 'precious collection'],
    emotionalAura: 'gentle protection, sensitive appreciation, careful observation',
    symbolicElements: ['hedgehog figure', 'delicate objects', 'protective shells', 'tiny details'],
    colorMood: 'warm beiges, soft pinks, gentle earth tones',
    compositionStyle: 'intimate close-up, protected spaces, detailed focus',
    lightingMood: 'warm gentle light, soft focus, protective shadows'
  },

  LRMF: {
    code: 'LRMF',
    personalityEssence: 'multi-dimensional explorer, digital age philosopher',
    visualMetaphors: ['interconnected networks', 'underwater depth', 'multiple screens'],
    emotionalAura: 'curious exploration, analytical depth, adaptive thinking',
    symbolicElements: ['octopus figure', 'tentacles reaching', 'multiple perspectives', 'digital elements'],
    colorMood: 'deep ocean blues, digital cyan, mysterious purples',
    compositionStyle: 'multiple focal points, layered dimensions, connected elements',
    lightingMood: 'bioluminescent glow, screen light, underwater ambiance'
  },

  LRMC: {
    code: 'LRMC',
    personalityEssence: 'methodical builder of knowledge, academic researcher',
    visualMetaphors: ['constructed dam', 'organized workshop', 'blueprint designs'],
    emotionalAura: 'focused determination, building satisfaction, organized progress',
    symbolicElements: ['beaver figure', 'building materials', 'blueprints', 'structured creations'],
    colorMood: 'wood browns, blueprint blues, construction oranges',
    compositionStyle: 'architectural precision, organized structure, clear hierarchy',
    lightingMood: 'clear daylight, workshop lighting, focused illumination'
  },

  // === S (Social/함께) 시작 유형들 ===

  SAEF: {
    code: 'SAEF',
    personalityEssence: 'vibrant emotional connector, transformative spirit',
    visualMetaphors: ['flower garden', 'butterfly migration', 'colorful celebration'],
    emotionalAura: 'joyful transformation, emotional contagion, beautiful connections',
    symbolicElements: ['butterfly figure', 'blooming flowers', 'dancing colors', 'transformation'],
    colorMood: 'vibrant rainbow, spring colors, celebratory hues',
    compositionStyle: 'dynamic movement, flowing connections, organic patterns',
    lightingMood: 'bright natural light, colorful reflections, warm sunshine'
  },

  SAEC: {
    code: 'SAEC',
    personalityEssence: 'community organizer, art network architect',
    visualMetaphors: ['organized colony', 'synchronized movement', 'connected community'],
    emotionalAura: 'collective harmony, organized connection, group achievement',
    symbolicElements: ['penguin figure', 'group formation', 'network nodes', 'community gathering'],
    colorMood: 'icy blues, warm community accents, organized patterns',
    compositionStyle: 'group arrangement, balanced community, organized celebration',
    lightingMood: 'aurora borealis, shared warmth, collective glow'
  },

  SAMF: {
    code: 'SAMF',
    personalityEssence: 'inspiring communicator, idea pollinator',
    visualMetaphors: ['tropical paradise', 'colorful ideas flying', 'vibrant conversation'],
    emotionalAura: 'infectious enthusiasm, inspiring energy, creative broadcast',
    symbolicElements: ['parrot figure', 'colorful feathers', 'flying ideas', 'vocal expression'],
    colorMood: 'tropical rainbow, bold primaries, energetic accents',
    compositionStyle: 'dynamic expression, radiating energy, central broadcast',
    lightingMood: 'tropical sunshine, vibrant highlights, energetic glow'
  },

  SAMC: {
    code: 'SAMC',
    personalityEssence: 'cultural architect, community planner',
    visualMetaphors: ['cultural landscape', 'organized pathway', 'heritage preservation'],
    emotionalAura: 'cultural stewardship, organized wisdom, community building',
    symbolicElements: ['deer figure', 'forest paths', 'cultural symbols', 'guiding presence'],
    colorMood: 'forest greens, autumn golds, natural earth tones',
    compositionStyle: 'guiding composition, clear pathways, cultural depth',
    lightingMood: 'golden hour, forest light, guiding illumination'
  },

  SREF: {
    code: 'SREF',
    personalityEssence: 'enthusiastic companion, loyal emotional expresser',
    visualMetaphors: ['joyful play', 'open meadow', 'celebration with friends'],
    emotionalAura: 'pure joy, loyal enthusiasm, infectious happiness',
    symbolicElements: ['dog figure', 'open fields', 'playful energy', 'loyal companionship'],
    colorMood: 'sunny yellows, happy oranges, warm friendship tones',
    compositionStyle: 'dynamic action, joyful movement, open expression',
    lightingMood: 'bright sunshine, warm highlights, joyful glow'
  },

  SREC: {
    code: 'SREC',
    personalityEssence: 'warm nurturing guide, caring educator',
    visualMetaphors: ['safe pond', 'nurturing nest', 'guiding path'],
    emotionalAura: 'warm care, nurturing protection, gentle guidance',
    symbolicElements: ['duck figure', 'safe waters', 'following ducklings', 'nurturing environment'],
    colorMood: 'warm greens, nurturing yellows, safe water blues',
    compositionStyle: 'protective arrangement, nurturing space, guided composition',
    lightingMood: 'warm afternoon light, protective shadows, nurturing glow'
  },

  SRMF: {
    code: 'SRMF',
    personalityEssence: 'wisdom keeper, storytelling mentor',
    visualMetaphors: ['ancient savanna', 'gathered tribe', 'wisdom passing'],
    emotionalAura: 'timeless wisdom, gentle authority, knowledge transmission',
    symbolicElements: ['elephant figure', 'memory symbols', 'story circles', 'wisdom trees'],
    colorMood: 'sunset golds, wisdom greys, earthy tones',
    compositionStyle: 'central wisdom figure, gathering arrangement, story circle',
    lightingMood: 'golden sunset, wisdom glow, ancestral light'
  },

  SRMC: {
    code: 'SRMC',
    personalityEssence: 'visionary educator, systematic guide',
    visualMetaphors: ['eagle view from above', 'clear vision', 'organized landscape'],
    emotionalAura: 'clear vision, systematic understanding, authoritative guidance',
    symbolicElements: ['eagle figure', 'high perspective', 'clear horizon', 'guiding vision'],
    colorMood: 'sky blues, mountain greys, visionary golds',
    compositionStyle: 'elevated perspective, clear structure, comprehensive view',
    lightingMood: 'clear mountain light, sharp clarity, guiding brightness'
  }
};

/**
 * APT 유형과 아트 스타일을 조합하여 AI 이미지 생성 프롬프트 생성
 */
export function generateArtProfilePrompt(
  aptCode: string,
  artStyleId: string,
  gender: 'male' | 'female' | 'neutral' = 'neutral'
): { prompt: string; negativePrompt: string } {
  const aptProfile = APT_PROMPT_PROFILES[aptCode];
  const artStyle = ART_STYLES[artStyleId];

  if (!aptProfile || !artStyle) {
    throw new Error(`Invalid APT code or art style: ${aptCode}, ${artStyleId}`);
  }

  // 성별에 따른 주체 표현
  const subjectDescription = {
    male: 'a contemplative man, masculine features',
    female: 'an elegant woman, feminine features',
    neutral: 'a contemplative figure, androgynous beauty'
  }[gender];

  // 핵심 프롬프트 조합
  const prompt = [
    // 아트 스타일 기본
    artStyle.basePrompt,

    // 주체 (성별)
    `portrait of ${subjectDescription}`,

    // APT 성격 본질
    aptProfile.personalityEssence,

    // 감정적 분위기
    aptProfile.emotionalAura,

    // 시각적 은유 (2개 선택)
    aptProfile.visualMetaphors.slice(0, 2).join(', '),

    // 상징적 요소 (2개 선택)
    `with ${aptProfile.symbolicElements.slice(0, 2).join(' and ')}`,

    // 색채 무드
    aptProfile.colorMood,

    // 조명 분위기
    aptProfile.lightingMood,

    // 품질 키워드
    'masterpiece, best quality, highly detailed, beautiful composition, award-winning art'
  ].join(', ');

  // 네거티브 프롬프트
  const negativePrompt = [
    artStyle.negativePrompt,
    'lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit',
    'fewer digits, cropped, worst quality, low quality, normal quality',
    'jpeg artifacts, signature, watermark, username, blurry',
    'ugly, duplicate, morbid, mutilated, poorly drawn face, deformed'
  ].join(', ');

  return { prompt, negativePrompt };
}

/**
 * APT 유형에 따른 추천 아트 스타일 반환
 */
export function getRecommendedStylesForAPT(aptCode: string): string[] {
  const styleRecommendations: Record<string, string[]> = {
    // Lone + Abstract 유형 → 추상적, 감성적 스타일
    LAEF: ['surrealism', 'impressionism', 'expressionism'],
    LAEC: ['renaissance', 'impressionism', 'surrealism'],
    LAMF: ['surrealism', 'expressionism', 'renaissance'],
    LAMC: ['renaissance', 'impressionism', 'surrealism'],

    // Lone + Realistic 유형 → 구상적, 섬세한 스타일
    LREF: ['impressionism', 'renaissance', 'surrealism'],
    LREC: ['impressionism', 'renaissance', 'expressionism'],
    LRMF: ['popart', 'surrealism', 'expressionism'],
    LRMC: ['renaissance', 'impressionism', 'expressionism'],

    // Social + Abstract 유형 → 활발한, 사회적 스타일
    SAEF: ['impressionism', 'popart', 'expressionism'],
    SAEC: ['popart', 'impressionism', 'renaissance'],
    SAMF: ['popart', 'expressionism', 'surrealism'],
    SAMC: ['renaissance', 'impressionism', 'surrealism'],

    // Social + Realistic 유형 → 따뜻한, 연결하는 스타일
    SREF: ['popart', 'impressionism', 'expressionism'],
    SREC: ['impressionism', 'renaissance', 'popart'],
    SRMF: ['renaissance', 'expressionism', 'impressionism'],
    SRMC: ['renaissance', 'impressionism', 'popart']
  };

  return styleRecommendations[aptCode] || ['impressionism', 'surrealism', 'renaissance'];
}

/**
 * 결과 카드용 짧은 설명 생성
 */
export function getArtProfileDescription(aptCode: string, artStyleId: string, locale: 'ko' | 'en' = 'ko'): string {
  const descriptions: Record<string, Record<string, Record<string, string>>> = {
    LAEF: {
      ko: {
        impressionism: '빛과 안개 사이를 거니는 몽상가의 영혼',
        surrealism: '꿈과 현실의 경계에서 춤추는 여우',
        expressionism: '감정의 소용돌이 속에서 피어나는 시',
        popart: '고독한 영혼의 현대적 각성',
        renaissance: '시간을 거스르는 고독한 탐험가'
      },
      en: {
        impressionism: 'A dreamer wandering between light and mist',
        surrealism: 'A fox dancing on the edge of dreams and reality',
        expressionism: 'Poetry blooming in the whirlpool of emotions',
        popart: 'Modern awakening of a solitary soul',
        renaissance: 'A lone explorer transcending time'
      }
    }
    // ... 다른 APT 유형들도 추가 가능
  };

  // 기본 설명
  const aptProfile = APT_PROMPT_PROFILES[aptCode];
  const artStyle = ART_STYLES[artStyleId];

  if (descriptions[aptCode]?.[locale]?.[artStyleId]) {
    return descriptions[aptCode][locale][artStyleId];
  }

  // 동적 생성 (기본값)
  if (locale === 'ko') {
    return `${artStyle.nameKo} 스타일로 표현된 당신의 예술적 영혼`;
  }
  return `Your artistic soul expressed in ${artStyle.name} style`;
}

export default {
  ART_STYLES,
  APT_PROMPT_PROFILES,
  generateArtProfilePrompt,
  getRecommendedStylesForAPT,
  getArtProfileDescription
};
