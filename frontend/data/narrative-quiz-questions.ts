// 🎨 SAYU Narrative Quiz - A Personal Gallery Journey

export interface NarrativeQuestion {
  id: number;
  act: 'curiosity' | 'exploration' | 'revelation';
  narrative: {
    setup?: string;
    setup_ko?: string;
    transition?: string;
    transition_ko?: string;
    atmosphere?: string;
  };
  question: string;
  question_ko?: string;
  options: Array<{
    id: string;
    text: string;
    text_ko?: string;
    subtext?: string;
    subtext_ko?: string;
    weight: Record<string, number>;
    narrative: string;
    emotional: string;
  }>;
}

export const narrativeQuestions: NarrativeQuestion[] = [
  // Act 1: Curiosity - Entering the Space (Questions 1-5)
  {
    id: 1,
    act: 'curiosity',
    narrative: {
      setup: "A gallery invitation arrives.\nInside: 'Discover art, discover yourself.'",
      setup_ko: "갤러리 초대장이 도착했습니다.\n'예술과 함께 나를 발견하세요.'",
      atmosphere: "anticipation"
    },
    question: "You arrive at the gallery entrance.\nTwo paths lead inside:",
    question_ko: "갤러리 입구에 도착했습니다.\n두 개의 길이 보입니다:",
    options: [
      {
        id: 'solitary',
        text: "A quiet corridor",
        text_ko: "조용한 복도",
        subtext: "Natural light streams in, few visitors around",
        subtext_ko: "자연광이 들어오는 고요한 공간, 적은 관람객",
        weight: { L: 3 },
        narrative: "You choose solitude, drawn to the peaceful promise of undisturbed contemplation.",
        emotional: "introspective"
      },
      {
        id: 'social',
        text: "A lively main hall",
        text_ko: "활기찬 중앙 홀",
        subtext: "Groups discussing artworks with enthusiasm",
        subtext_ko: "작품에 대해 열정적으로 이야기 나누는 사람들",
        weight: { S: 3 },
        narrative: "You're energized by the collective excitement, eager to share this journey.",
        emotional: "connected"
      }
    ]
  },
  {
    id: 2,
    act: 'curiosity',
    narrative: {
      transition: "You enter the main exhibition space.",
      transition_ko: "메인 전시 공간으로 들어섭니다.",
      atmosphere: "wonder"
    },
    question: "A curator approaches.\nWould you like guidance?",
    question_ko: "큐레이터가 다가옵니다.\n안내를 받으시겠어요?",
    options: [
      {
        id: 'intuitive',
        text: "I'll explore on my own",
        text_ko: "혼자 둘러볼게요",
        subtext: "Follow your instincts",
        subtext_ko: "작품이 영혼에 직접 말을 걸기를 바랍니다",
        weight: { F: 3 },
        narrative: "The curator nods knowingly, 'Some journeys are meant to be unguided.'",
        emotional: "free"
      },
      {
        id: 'structured',
        text: "Yes, tell me about the exhibition",
        text_ko: "네, 전시에 대해 알려주세요",
        subtext: "Context enhances understanding",
        subtext_ko: "맥락이 이해를 돕습니다",
        weight: { C: 3 },
        narrative: "Their face lights up as they begin to share the careful choreography of the collection.",
        emotional: "grounded"
      }
    ]
  },
  {
    id: 3,
    act: 'curiosity',
    narrative: {
      transition: "You enter the first exhibition room.",
      transition_ko: "첫 전시실에 들어섭니다.",
      atmosphere: "threshold"
    },
    question: "The gallery's first chamber reveals itself.\nWhat captures your attention?",
    question_ko: "갤러리의 첫 전시실이 모습을 드러냅니다.\n무엇이 먼저 눈에 들어오나요?",
    options: [
      {
        id: 'atmosphere',
        text: "The room's atmosphere draws me in",
        text_ko: "공간의 분위기에 빠져듭니다",
        subtext: "Colors and light create a unique energy",
        subtext_ko: "색과 빛이 만드는 특별한 기운",
        weight: { A: 3, E: 1, L: 1 },
        narrative: "You breathe deeply, letting the space's energy fill your lungs and lift your spirit.",
        emotional: "absorbed"
      },
      {
        id: 'details',
        text: "A painting's details draw me close",
        text_ko: "한 작품의 세부에 이끌립니다",
        subtext: "You notice techniques and textures others might miss",
        subtext_ko: "남들이 놓칠 법한 기법과 질감을 발견합니다",
        weight: { R: 3, M: 1, S: 1 },
        narrative: "Your eyes trace each deliberate stroke, marveling at the artist's technical mastery.",
        emotional: "focused"
      }
    ]
  },

  // Act 2: Exploration - Deepening Experience
  {
    id: 4,
    act: 'exploration',
    narrative: {
      transition: "Time seems to slow as you find your rhythm in the gallery's flow.",
      transition_ko: "갤러리의 흐름 속에서 자신만의 리듬을 찾자,\n시간이 느려지는 듯합니다.",
      atmosphere: "immersion"
    },
    question: "A painting stops you mid-step.\nIt feels familiar somehow...",
    question_ko: "한 그림 앞에 발걸음이 멈춥니다.\n어딘가 익숙한 느낌이...",
    options: [
      {
        id: 'emotional',
        text: "Tears threaten to form - it touches something deep",
        text_ko: "눈시울이 뜨거워집니다 - 마음 깊은 곳을 건드렸어요",
        subtext: "The artwork speaks directly to your heart",
        subtext_ko: "작품이 당신의 마음에 직접 말을 겁니다",
        weight: { E: 3, A: 1, L: 2 },
        narrative: "You stand transfixed, feeling seen by something that has no eyes.",
        emotional: "moved"
      },
      {
        id: 'analytical',
        text: "You search for the story and message within",
        text_ko: "작품 속 이야기와 메시지를 찾아봅니다",
        subtext: "Every brushstroke has intention to decode",
        subtext_ko: "모든 붓터치에는 해독할 의도가 담겨 있습니다",
        weight: { M: 3, R: 1, S: 2 },
        narrative: "Your mind becomes a key, unlocking layers of intentional meaning.",
        emotional: "enlightened"
      }
    ]
  },
  {
    id: 5,
    act: 'exploration',
    narrative: {
      transition: "In a sunlit alcove, you discover a series of works that seem to tell a story.",
      transition_ko: "햇살이 비치는 작은 공간에서 하나의 이야기를 들려주는 연작을 발견합니다.",
      atmosphere: "discovery"
    },
    question: "Time flows differently here.\nHow do you explore?",
    question_ko: "시간이 다르게 흐릅니다.\n어떻게 둘러보시겠어요?",
    options: [
      {
        id: 'flowing',
        text: "Follow intuition between pieces",
        text_ko: "직감 따라 자유롭게",
        subtext: "Each artwork calls to the next in an organic flow",
        subtext_ko: "작품들이 자연스럽게 다음을 향해 이끕니다",
        weight: { F: 3, A: 1, L: 1 },
        narrative: "You become a leaf on an artistic stream, trusting the current completely.",
        emotional: "surrendered"
      },
      {
        id: 'methodical',
        text: "Move systematically through each room",
        text_ko: "전시실을 차례대로\n꼼꼼히 둘러봅니다",
        subtext: "Ensuring no masterpiece goes unseen",
        subtext_ko: "어떤 작품도 놓치지 않도록 합니다",
        weight: { C: 3, R: 1, S: 1 },
        narrative: "Your careful progression reveals the curator's hidden narrative arc.",
        emotional: "complete"
      }
    ]
  },
  {
    id: 6,
    act: 'exploration',
    narrative: {
      transition: "Another visitor stands beside you, drawn to the same magnetic piece.",
      transition_ko: "같은 작품에 이끌린 또 다른 관람객이 옆에 섭니다.",
      atmosphere: "connection"
    },
    question: "Another visitor stands nearby.\nDo you engage?",
    question_ko: "다른 관람객이 옆에 있습니다.\n어떻게 하시겠어요?",
    options: [
      {
        id: 'preserve',
        text: "You maintain your private communion with the art",
        text_ko: "작품과의 조용한 대화를 이어갑니다",
        subtext: "This moment is personal",
        subtext_ko: "개인적인 순간입니다",
        weight: { L: 2, M: 1 },
        narrative: "You close your eyes briefly, holding the moment like a secret.",
        emotional: "protected"
      },
      {
        id: 'share',
        text: "You smile and nod in shared appreciation",
        text_ko: "미소로 감상을 공유합니다",
        subtext: "A silent connection forms",
        subtext_ko: "말없는 교감이 생겨납니다",
        weight: { S: 2, E: 1 },
        narrative: "Your perspectives interweave, creating a richer tapestry of understanding.",
        emotional: "expanded"
      }
    ]
  },
  {
    id: 7,
    act: 'exploration',
    narrative: {
      transition: "The gallery seems to be revealing itself to you, layer by layer.",
      transition_ko: "갤러리가 한 겹씩 자신을 드러내는 듯합니다.",
      atmosphere: "depth"
    },
    question: "An experimental installation challenges your perception.\nHow do you engage?",
    question_ko: "실험적인 설치 작품이 호기심을 자극합니다.\n어떻게 받아들이시겠어요?",
    options: [
      {
        id: 'immerse',
        text: "Surrender to the sensory experience",
        text_ko: "감각적 경험에 온전히 몸을 맡깁니다",
        subtext: "Let it wash over you without trying to understand",
        subtext_ko: "이해하려 애쓰지 않고 받아들입니다",
        weight: { A: 3, F: 1, L: 2 },
        narrative: "You become part of the artwork, your presence completing its purpose.",
        emotional: "transformed"
      },
      {
        id: 'analyze',
        text: "Circle it slowly, understanding its construction",
        text_ko: "천천히 돌며 작품의\n구조를 파악합니다",
        subtext: "Appreciating the artist's technical achievement",
        subtext_ko: "작가의 기술적 성취를 음미합니다",
        weight: { R: 3, C: 1, S: 2 },
        narrative: "Each angle reveals new insights into the artist's methodical genius.",
        emotional: "impressed"
      }
    ]
  },

  // Act 3: Revelation - Self-Discovery (Questions 8-10)
  {
    id: 8,
    act: 'revelation',
    narrative: {
      transition: "You've reached the gallery's heart. The final room awaits.",
      transition_ko: "갤러리의 중심부에 도착했습니다.\n마지막 전시실이 기다립니다.",
      atmosphere: "anticipation"
    },
    question: "The final room holds a reflective installation.\nWhat do you see?",
    question_ko: "마지막 방의 반사 설치 작품.\n무엇이 보이나요?",
    options: [
      {
        id: 'abstract',
        text: "Colors and emotions swirling",
        text_ko: "소용돌이치는 색과 감정",
        subtext: "Pure feeling and energy",
        subtext_ko: "순수한 느낌과 에너지",
        weight: { A: 4, E: 2, L: 2 },
        narrative: "The mirror shows your inner landscape - beautiful, complex, ever-changing.",
        emotional: "recognized"
      },
      {
        id: 'concrete',
        text: "Precise patterns and clear forms",
        text_ko: "정확한 패턴과 명확한 형태",
        subtext: "Your reflection reveals structure and clarity",
        subtext_ko: "구조와 명료함이 드러납니다",
        weight: { R: 3, M: 2, S: 2 },
        narrative: "The mirror reflects your mind's architecture - organized, purposeful, strong.",
        emotional: "understood"
      }
    ]
  },
  {
    id: 9,
    act: 'revelation',
    narrative: {
      transition: "The journey nears its end, but something has fundamentally shifted within you.",
      transition_ko: "여정이 끝나가지만, 내면에서 무언가 근본적인 변화가 일어났습니다.",
      atmosphere: "transformation"
    },
    question: "Preparing to leave,\nyou realize what you've been seeking...",
    question_ko: "떠날 준비를 하며,\n찾던 것을 깨닫습니다...",
    options: [
      {
        id: 'connection',
        text: "A deeper connection to your own emotions",
        text_ko: "내 감정과의 더 깊은 연결",
        subtext: "Art as a mirror to your inner world",
        subtext_ko: "내면을 비추는 거울로서의\n예술",
        weight: { E: 3, L: 1 },
        narrative: "You've found a language for feelings you couldn't name before.",
        emotional: "whole"
      },
      {
        id: 'understanding',
        text: "A framework for understanding beauty",
        text_ko: "아름다움을 이해하는 틀",
        subtext: "Art as a system to be comprehended",
        subtext_ko: "이해할 수 있는 체계로서의\n예술",
        weight: { M: 3, S: 1 },
        narrative: "You've discovered the keys to a vast kingdom of meaning.",
        emotional: "empowered"
      }
    ]
  },
  {
    id: 10,
    act: 'revelation',
    narrative: {
      transition: "At the exit, a guest book lies open. Your hand hovers over the page.",
      transition_ko: "출구에 방명록이 펼쳐져 있습니다.\n펜을 든 손이 잠시 머뭇거립니다.",
      atmosphere: "reflection"
    },
    question: "What will you take with you?",
    question_ko: "무엇을 가지고 가시겠어요?",
    options: [
      {
        id: 'fluid',
        text: "The freedom to experience art without boundaries",
        text_ko: "경계 없이 예술을\n경험하는 자유",
        subtext: "Every encounter, a new adventure",
        subtext_ko: "모든 만남이 새로운 모험",
        weight: { F: 3, A: 1, L: 1 },
        narrative: "You write: 'I came seeking art, but found myself in every frame.'",
        emotional: "liberated"
      },
      {
        id: 'structured',
        text: "A deeper appreciation for artistic craft and intention",
        text_ko: "예술적 기법과 의도에\n대한 깊은 이해",
        subtext: "Art speaks in a language you understand",
        subtext_ko: "이제 예술의 언어를 이해합니다",
        weight: { C: 3, R: 1, S: 1 },
        narrative: "You write: 'I leave with eyes that see not just beauty, but the hands that shaped it.'",
        emotional: "enriched"
      }
    ]
  },

  // Additional Questions for Deeper Insight (Questions 11-15)
  {
    id: 11,
    act: 'exploration',
    narrative: {
      transition: "In the museum shop, books about the artists catch your eye.",
      transition_ko: "뮤지엄 샵의 작가들에 대한 책들이 눈길을 끕니다.",
      atmosphere: "curiosity"
    },
    question: "What draws you most to understanding an artist?",
    question_ko: "작가를 이해할 때 무엇이 가장 중요한가요?",
    options: [
      {
        id: 'life-story',
        text: "Their personal journey and struggles",
        text_ko: "작가의 개인적 여정과 고민",
        subtext: "Life shaping their art",
        subtext_ko: "삶이 작품에 스며든 방식",
        weight: { E: 2, A: 1 },
        narrative: "You believe art is inseparable from the human story behind it.",
        emotional: "empathetic"
      },
      {
        id: 'technique',
        text: "The deeper meanings in their work",
        text_ko: "작품 속 깊은 의미들",
        subtext: "What messages they embedded in their art",
        subtext_ko: "예술에 담긴 메시지와 상징",
        weight: { M: 2, R: 2 },
        narrative: "You're drawn to uncover the stories and symbols within each piece.",
        emotional: "appreciative"
      }
    ]
  },
  {
    id: 12,
    act: 'exploration',
    narrative: {
      transition: "Exhibition catalogs from past shows.",
      transition_ko: "과거 전시 도록들을 봅니다.",
      atmosphere: "decision"
    },
    question: "Which exhibition calls to you more strongly?",
    question_ko: "어떤 전시가 더 끌리나요?",
    options: [
      {
        id: 'contemporary',
        text: "Emerging Voices: New perspectives in art",
        text_ko: "신진 작가전:\n예술의 새로운 시각",
        subtext: "Fresh explorations, flowing with creative currents",
        subtext_ko: "창의적 흐름을 따라가는 신선한 탐구",
        weight: { F: 2, S: 1 },
        narrative: "You're drawn to the cutting edge, where art is still being defined.",
        emotional: "adventurous"
      },
      {
        id: 'classical',
        text: "Masters Revisited: Timeless beauty revealed",
        text_ko: "거장 재조명:\n시대를 초월한 미학",
        subtext: "Structured excellence, enduring foundations",
        subtext_ko: "체계적 우수성과 지속적인 기반",
        weight: { C: 2, L: 1 },
        narrative: "You seek the wisdom and beauty that has stood the test of time.",
        emotional: "reverent"
      }
    ]
  },
  {
    id: 13,
    act: 'revelation',
    narrative: {
      transition: "Back home, imagining art in your space.",
      transition_ko: "집으로 돌아와, 내 공간의 예술을 상상합니다.",
      atmosphere: "memory"
    },
    question: "What kind of art would you want in your personal space?",
    question_ko: "당신의 공간에는 어떤 예술 작품을 두고 싶나요?",
    options: [
      {
        id: 'emotional-abstract',
        text: "Something that evokes a feeling",
        text_ko: "감정을 불러일으키는 작품",
        subtext: "A piece that changes meaning with your mood",
        subtext_ko: "기분에 따라 의미가 달라지는 작품",
        weight: { A: 2, F: 1 },
        narrative: "You want art that converses with your emotional states.",
        emotional: "resonant"
      },
      {
        id: 'meaningful-concrete',
        text: "Something with a clear story or message",
        text_ko: "명확한 이야기나 메시지가 있는 작품",
        subtext: "A piece that speaks to specific ideas",
        subtext_ko: "특정한 생각을 전달하는 작품",
        weight: { R: 2, C: 1 },
        narrative: "You want art that enriches your understanding of the world.",
        emotional: "thoughtful"
      }
    ]
  },
  {
    id: 14,
    act: 'revelation',
    narrative: {
      transition: "In your daily life, you notice artistic beauty in unexpected places.",
      transition_ko: "일상 속에서 예상치 못한 곳에서 예술적 아름다움을 발견합니다.",
      atmosphere: "integration"
    },
    question: "How does art fit into your everyday life?",
    question_ko: "예술은 당신의 일상에 어떻게 자리하고 있나요?",
    options: [
      {
        id: 'essential',
        text: "It filters and enriches my perception",
        text_ko: "내 인식을 풍부하게 하는 필터",
        subtext: "Beauty and meaning are everywhere",
        subtext_ko: "아름다움과 의미는 어디에나 있습니다",
        weight: { A: 1, E: 2 },
        narrative: "Art isn't separate from life - it IS life, seen clearly.",
        emotional: "integrated"
      },
      {
        id: 'sanctuary',
        text: "It's my escape and my sanctuary",
        text_ko: "나만의 도피처이자 안식처",
        subtext: "A special realm I visit for renewal",
        subtext_ko: "재충전을 위해 찾는 특별한\n영역입니다",
        weight: { R: 1, M: 2 },
        narrative: "Art is your sacred space, distinct from daily routine.",
        emotional: "renewed"
      }
    ]
  },
  {
    id: 15,
    act: 'revelation',
    narrative: {
      transition: "Reflecting on your journey, something has shifted.",
      transition_ko: "여정을 되돌아보니, 무언가 변했습니다.",
      atmosphere: "transformation"
    },
    question: "What kind of art lover have you discovered yourself to be?",
    question_ko: "당신은 어떤 예술 애호가임을 발견했나요?",
    options: [
      {
        id: 'seeker',
        text: "A seeker of new experiences",
        text_ko: "새로운 경험의 탐구자",
        subtext: "Following artistic discovery",
        subtext_ko: "예술적 발견을 따라서",
        weight: { F: 2, S: 1, A: 1 },
        narrative: "Your artistic journey has just begun - infinite discoveries await.",
        emotional: "excited"
      },
      {
        id: 'cultivator',
        text: "A cultivator of deep appreciation",
        text_ko: "깊은 감상을 기르는 사람",
        subtext: "Constructing enduring frameworks of understanding",
        subtext_ko: "이해의 지속적인 체계를 구축하는",
        weight: { C: 2, L: 1, R: 1 },
        narrative: "You'll return to favorites, finding new depths each time.",
        emotional: "grounded"
      }
    ]
  }
];

// Personalized transitions based on previous choices
export const getPersonalizedTransition = (
  fromQuestion: number,
  toQuestion: number,
  previousChoice: string
): string => {
  const transitions: Record<string, string> = {
    'solitary-2': "In your chosen solitude, each step echoes with purpose...",
    'social-2': "Energized by the crowd's enthusiasm, you move forward...",
    'intuitive-3': "Trusting your instincts, you drift toward a doorway that seems to call...",
    'structured-3': "Following the curator's suggested path, you approach the first chamber...",
    'atmosphere-4': "Still wrapped in that emotional atmosphere, you float deeper into the gallery...",
    'details-4': "Your attention to detail rewards you as you discover more treasures...",
    'emotional-5': "Your heart still resonating from that encounter, you continue...",
    'analytical-5': "Your mind buzzing with insights, you seek the next puzzle...",
    'flowing-6': "Your intuitive journey brings an unexpected companion...",
    'methodical-6': "Your systematic exploration is noticed by another careful observer...",
    'preserve-7': "In your protected bubble of experience, you encounter something new...",
    'share-7': "Enriched by shared perspectives, you both discover something challenging...",
    'immerse-8': "Still tingling from that sensory experience, you reach the final space...",
    'analyze-8': "Your technical appreciation has prepared you for this culmination...",
    'abstract-9': "Seeing your emotional truth reflected, you understand your journey...",
    'concrete-9': "Your structured soul recognized, the path becomes clear...",
    'connection-10': "With emotions now given form and name, one gesture remains...",
    'understanding-10': "Armed with new frameworks of beauty, you approach the end...",
    'fluid-11': "Your free spirit guides you toward the museum shop's treasures...",
    'structured-11': "Your systematic journey leads you to the gift shop's curated collection...",
    'life-story-12': "In the shop, you seek pieces that tell human stories...",
    'technique-12': "Browsing exhibition catalogs, you're drawn to fresh voices and masters reimagined...",
    'contemporary-13': "Leaving the museum, you carry fresh perspectives into your personal space...",
    'classical-13': "Taking timeless beauty with you, you envision it in your home...",
    'emotional-abstract-14': "In daily life, your fluid artistic soul finds beauty everywhere...",
    'meaningful-concrete-14': "Your everyday world becomes enriched with purpose and meaning...",
    'essential-15': "At home, you realize art has become inseparable from your life...",
    'sanctuary-15': "In your personal sanctuary, the artistic journey finds its home..."
  };

  const transitions_ko: Record<string, string> = {
    'solitary-2': "선택한 고독 속에서, 발걸음 하나하나가 목적을 담아 울려 퍼집니다...",
    'social-2': "군중의 열정에 힘입어, 앞으로 나아갑니다...",
    'intuitive-3': "직감을 믿으며, 부르는 듯한 문을 향해 발길을 돌립니다...",
    'structured-3': "큐레이터가 제안한 길을 따라, 첫 번째 전시실에 다가갑니다...",
    'atmosphere-4': "아직 그 감정적 분위기에 휩싸인 채, 갤러리 깊숙이 스며듭니다...",
    'details-4': "세심한 관찰력이 보상받듯, 더 많은 보물들을 발견합니다...",
    'emotional-5': "그 만남의 여운이 가슴에 남은 채, 계속 걸어갑니다...",
    'analytical-5': "통찰로 가득한 마음으로, 다음 퍼즐을 찾아 나섭니다...",
    'flowing-6': "직관적인 여정이 예상치 못한 동반자를 데려옵니다...",
    'methodical-6': "체계적인 탐험이 또 다른 신중한 관찰자의 눈에 띕니다...",
    'preserve-7': "경험의 보호막 안에서, 새로운 것과 마주합니다...",
    'share-7': "공유된 관점으로 풍요로워진 채, 도전적인 무언가를 발견합니다...",
    'immerse-8': "그 감각적 경험의 전율이 남은 채, 마지막 공간에 도달합니다...",
    'analyze-8': "기술적 감상이 이 절정을 위해 당신을 준비시켰습니다...",
    'abstract-9': "반영된 감정적 진실을 보며, 당신의 여정을 이해합니다...",
    'concrete-9': "체계적인 영혼이 인정받으며, 길이 명확해집니다...",
    'connection-10': "감정이 형태와 이름을 얻은 지금, 한 가지 행동이 남았습니다...",
    'understanding-10': "아름다움의 새로운 체계로 무장한 채, 끝을 향해 나아갑니다...",
    'fluid-11': "자유로운 영혼이 뮤지엄샵의 보물들로 안내합니다...",
    'structured-11': "체계적인 여정이 선물가게의 큐레이팅된 컬렉션으로 이끕니다...",
    'life-story-12': "샵에서, 인간의 이야기를 담은 작품들을 찾습니다...",
    'technique-12': "전시 도록들을 살펴보며, 신진 작가의 참신함과 거장의 재해석에 끌립니다...",
    'contemporary-13': "미술관을 나서며, 새로운 시각을 개인 공간으로 가져갑니다...",
    'classical-13': "영원한 아름다움을 가져가며, 집에서의 모습을 그려봅니다...",
    'emotional-abstract-14': "일상에서, 유동적인 예술혼이 어디서나 아름다움을 찾아냅니다...",
    'meaningful-concrete-14': "당신의 일상 세계가 목적과 의미로 풍요로워집니다...",
    'essential-15': "집에서, 예술이 삶과 분리될 수 없음을 깨닫습니다...",
    'sanctuary-15': "개인적인 성소에서, 예술적 여정이 안식처를 찾습니다..."
  };

  const key = `${previousChoice}-${toQuestion}`;
  return transitions[key] || "You continue your journey through the gallery...";
};

// Korean version of personalized transitions
export const getPersonalizedTransition_ko = (
  fromQuestion: number,
  toQuestion: number,
  previousChoice: string
): string => {
  const transitions_ko: Record<string, string> = {
    'solitary-2': "선택한 고독 속에서, 발걸음 하나하나가 목적을 담아 울려 퍼집니다...",
    'social-2': "군중의 열정에 힘입어, 앞으로 나아갑니다...",
    'intuitive-3': "직감을 믿으며, 부르는 듯한 문을 향해 발길을 돌립니다...",
    'structured-3': "큐레이터가 제안한 길을 따라, 첫 번째 전시실에 다가갑니다...",
    'atmosphere-4': "아직 그 감정적 분위기에 휩싸인 채, 갤러리 깊숙이 스며듭니다...",
    'details-4': "세심한 관찰력이 보상받듯, 더 많은 보물들을 발견합니다...",
    'emotional-5': "그 만남의 여운이 가슴에 남은 채, 계속 걸어갑니다...",
    'analytical-5': "통찰로 가득한 마음으로, 다음 퍼즐을 찾아 나섭니다...",
    'flowing-6': "직관적인 여정이 예상치 못한 동반자를 데려옵니다...",
    'methodical-6': "체계적인 탐험이 또 다른 신중한 관찰자의 눈에 띕니다...",
    'preserve-7': "경험의 보호막 안에서, 새로운 것과 마주합니다...",
    'share-7': "공유된 관점으로 풍요로워진 채, 도전적인 무언가를 발견합니다...",
    'immerse-8': "그 감각적 경험의 전율이 남은 채, 마지막 공간에 도달합니다...",
    'analyze-8': "기술적 감상이 이 절정을 위해 당신을 준비시켰습니다...",
    'abstract-9': "반영된 감정적 진실을 보며, 당신의 여정을 이해합니다...",
    'concrete-9': "체계적인 영혼이 인정받으며, 길이 명확해집니다...",
    'connection-10': "감정이 형태와 이름을 얻은 지금, 한 가지 행동이 남았습니다...",
    'understanding-10': "아름다움의 새로운 체계로 무장한 채, 끝을 향해 나아갑니다...",
    'fluid-11': "자유로운 영혼이 뮤지엄샵의 보물들로 안내합니다...",
    'structured-11': "체계적인 여정이 선물가게의 큐레이팅된 컬렉션으로 이끕니다...",
    'life-story-12': "샵에서, 인간의 이야기를 담은 작품들을 찾습니다...",
    'technique-12': "전시 도록들을 살펴보며, 신진 작가의 참신함과 거장의 재해석에 끌립니다...",
    'contemporary-13': "미술관을 나서며, 새로운 시각을 개인 공간으로 가져갑니다...",
    'classical-13': "영원한 아름다움을 가져가며, 집에서의 모습을 그려봅니다...",
    'emotional-abstract-14': "일상에서, 유동적인 예술혼이 어디서나 아름다움을 찾아냅니다...",
    'meaningful-concrete-14': "당신의 일상 세계가 목적과 의미로 풍요로워집니다...",
    'essential-15': "집에서, 예술이 삶과 분리될 수 없음을 깨닫습니다...",
    'sanctuary-15': "개인적인 성소에서, 예술적 여정이 안식처를 찾습니다..."
  };

  const key = `${previousChoice}-${toQuestion}`;
  return transitions_ko[key] || "갤러리를 통한 여정을 계속합니다...";
};

// Encouraging feedback messages
export const encouragingFeedback = [
  "Your unique perspective is revealing itself beautifully.",
  "There's no wrong way to experience art - you're proving that.",
  "Your artistic soul is beginning to shine through.",
  "Each choice paints another stroke of who you are.",
  "You're not just viewing art - you're discovering yourself.",
  "Your journey is as unique as a fingerprint on canvas.",
  "The gallery seems to be responding to your presence.",
  "You're writing your own story through these halls.",
  "Your authentic responses are creating something beautiful.",
  "This is your masterpiece of self-discovery."
];

export const encouragingFeedback_ko = [
  "당신만의 독특한 시각이 아름답게 드러나고 있습니다.",
  "예술을 경험하는 잘못된 방법은 없습니다 - 당신이 그걸 증명하고 있어요.",
  "당신의 예술적 영혼이 빛나기 시작합니다.",
  "각각의 선택이 당신이 누구인지 그려내고 있습니다.",
  "단순히 예술을 보는 것이 아니라 - 자신을 발견하고 있습니다.",
  "당신의 여정은 캔버스 위의 지문처럼 독특합니다.",
  "갤러리가 당신의 존재에 반응하는 것 같습니다.",
  "이 공간에서 당신만의 이야기를 써내려가고 있습니다.",
  "당신의 진솔한 반응들이 아름다운 무언가를 만들어내고 있습니다.",
  "이것은 자기 발견의 걸작입니다."
];