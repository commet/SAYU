/**
 * MMCA Tour Data
 * 국립현대미술관 서울 전시 데이터
 *
 * ⚠️ 데이터 입력 규칙:
 * - 모든 ID는 영문 소문자 + 하이픈만 사용 (예: kim-tschang-yeul-water-drops)
 * - 날짜는 YYYY-MM-DD 형식
 * - 태그는 미리 정의된 값만 사용 (아래 VALID_TAGS 참조)
 */

import { MMCAExhibition, MMCAArtist, MMCAArtwork } from '@/types/mmca-tour';

// ==================== 유효한 태그 목록 (표준화) ====================
export const VALID_STYLE_TAGS = [
  '추상', '구상', '설치미술', '영상', '사운드아트', '사진', '회화',
  '미니멀', '표현주의', '팝아트', '미디어아트', '개념미술', '단색화', '앵포르멜'
] as const;

export const VALID_MOOD_TAGS = [
  '명상적', '역동적', '고요한', '강렬한', '서정적', '철학적',
  '따뜻한', '차가운', '신비로운', '일상적', '실험적', '전통적'
] as const;

export const VALID_THEME_TAGS = [
  '자연', '인간', '사회', '정체성', '시간', '기억', '치유',
  '물질', '공간', '관계', '역사', '기술', '감정'
] as const;

// ==================== 전시 데이터 ====================
export const MMCA_EXHIBITIONS: MMCAExhibition[] = [
  {
    id: 'kim-tschang-yeul-water-drops',
    title: '김창열: 물방울',
    titleEn: 'Kim Tschang-yeul: Water Drops',
    description: '김창열(1929-2021)의 첫 대규모 회고전으로, 전쟁의 상흔을 응시한 초기작부터 뉴욕 시절의 기하학적 추상, 파리에서 완성된 물방울 연작까지 삶과 예술의 전 과정을 조명한다. 근현대사의 격변 속에서 탄생한 물방울의 의미와 작가가 남긴 조형 언어를 다시 묻는다.',
    curatorNote: '공개되지 않았던 뉴욕 시기 작품과 자료를 포함해 공백기를 재조명하고, 물방울 이면에 깃든 상처·애도·성찰을 균형 있게 살핀다. 한국 현대미술사에서 김창열 예술이 갖는 역사적·미학적 의미를 총체적으로 보여주는 장을 마련한다.',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    location: '서울 6, 7, 8전시실',
    tags: ['회화', '한국작가', '물방울', '앵포르멜']
  }
];

// ==================== 작가 데이터 ====================
export const MMCA_ARTISTS: MMCAArtist[] = [
  {
    id: 'kim-tschang-yeul',
    name: '김창열',
    nameEn: 'Kim Tschang-yeul',
    birthYear: 1929,
    deathYear: 2021,
    nationality: '한국',
    biography: '평안남도 맹산에서 태어나 해방·분단·전쟁을 겪으며 성장했고, 1950년대 앵포르멜 실험과 국제 비엔날레 참여로 한국 현대미술의 해외 진출을 개척했다. 1965년 뉴욕 체류 후 1969년 파리에 정착, 상흔의 회화에서 기하학적 추상을 거쳐 물방울 회화로 나아가며 독자적 조형 언어를 완성했다.',
    philosophy: '물방울은 전쟁의 상처를 위로하는 눈물이자 정화수, 동시에 존재와 소멸을 묻는 상징으로 자리 잡았다. 반복되는 물방울을 통해 상처를 응시하고, 사유와 침묵을 응축한 채 현실과 환영, 언어와 이미지의 경계를 탐구했다.',
    anecdotes: [
      '파리 팔레조의 마구간 작업실 문패에는 이름 대신 물방울 그림을 붙였고, 그는 이웃들에게 ‘무슈 구뜨(물방울 씨)’로 불렸다. 작업실은 예술가와 사회 인사들이 드나드는 사랑방이 되었다.',
      '경제적 어려움 속에서도 도움받은 이들을 잊지 않고 공간을 나누며, 인간적인 대화와 예술적 담론이 공존하는 자리를 만들었다.'
    ],
    styleDescription: '초기 앵포르멜의 거친 상흔에서 뉴욕의 기하학적 추상, 파리에서의 점액질 형상과 물방울로 이어지며 재료·형태·언어를 지속적으로 실험했다. 물방울은 구멍·구체 모티프의 연속선 위에서 현실과 환영, 문자와 이미지가 만나는 독자적 회화 언어로 확장되었다.'
  }
];

// ==================== 작품 데이터 ====================
export const MMCA_ARTWORKS: MMCAArtwork[] = [
  // 1장. 상흔 시리즈
  {
    id: 'sangheun-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '상흔',
    year: '1950년대',
    description: '해방·분단·전쟁을 통과하며 목격한 죽음과 폭력의 기억을 화면에 각인한 초기 작업. 총탄 자국과 파편 같은 거친 흔적은 제의(祭儀)처럼 상처를 응시하고 위로하려는 몸부림으로 나타난다.',
    floor: '6전시실',
    room: '1장. 상흔',
    styleTags: ['구상', '표현주의'],
    moodTags: ['강렬한', '역동적', '철학적'],
    themeTags: ['기억', '역사', '감정'],
    imageUrl: '/mmca-tour-kcy/artwork/상흔 작품 1.png',
    artistContext: '1957년 ‘현대미술가협회’를 창립하며 앵포르멜 실험을 주도했고, 1961 파리비엔날레·1965 상파울루비엔날레 참가로 국제 교류를 개척했다. 상흔 연작은 전쟁 기억을 화면에 남긴 출발점이자 물방울 이전의 원형 모티프를 예고한다.',
    aptRecommendations: {
      'LREC': '전쟁의 상처와 기억을 섬세하게 담아낸 작품입니다. 역사적 맥락 속에서 작가의 깊은 감정을 읽어낼 수 있습니다.',
      'LRMC': '한국 현대사의 비극적 순간을 학구적으로 탐구한 작품입니다. 역사와 예술의 교차점을 분석적으로 이해할 수 있습니다.',
      'SRMF': '역사적 트라우마를 교육적 관점에서 이해할 수 있는 작품입니다.',
      'SRMC': '전쟁과 분단이라는 역사적 사건을 체계적으로 기록한 작품입니다.'
    }
  },
  {
    id: 'sangheun-02',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '상흔 2',
    year: '1950년대',
    floor: '6전시실',
    room: '1장. 상흔',
    styleTags: ['구상', '표현주의'],
    moodTags: ['강렬한', '역동적'],
    themeTags: ['기억', '역사', '감정'],
    imageUrl: '/mmca-tour-kcy/artwork/상흔 작품 2.png'
  },

  // 2장. 현상 시리즈
  {
    id: 'hyunsang-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '현상',
    year: '1965년 이후',
    description: '뉴욕 체류 시기에 앵포르멜의 두터운 질감을 걷어내고 정제된 화면 위에 구체와 색 띠를 배치하며 시각적 착시와 팽창하는 에너지를 실험했다. 스프레이·스텐실 기법을 적극 사용하며 존재와 정체성의 위기를 기하학적 형상으로 환원한 시기.',
    floor: '6전시실',
    room: '2장. 현상',
    styleTags: ['추상', '앵포르멜', '표현주의'],
    moodTags: ['실험적', '역동적', '철학적'],
    themeTags: ['물질', '감정', '자연'],
    imageUrl: '/mmca-tour-kcy/artwork/현상 작품 1.png',
    artistContext: '록펠러 재단 지원으로 뉴욕에 머물며 옵아트·기하학적 추상에 반응했고, 1969년 파리로 이동한 뒤 점액질처럼 흐르는 유기적 형상으로 변주되며 물방울의 전조가 되었다.',
    aptRecommendations: {
      'LAMF': '물질과 형태의 철학적 탐구를 통해 존재의 의미를 찾아가는 작품입니다.',
      'LAMC': '앵포르멜에서 기하학적 추상으로의 전환을 분석적으로 이해할 수 있습니다.',
      'SAMF': '예술적 실험과 혁신의 과정이 담긴 영감을 주는 작품입니다.'
    }
  },
  {
    id: 'hyunsang-02',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '현상 2',
    year: '1965-1970',
    floor: '6전시실',
    room: '2장. 현상',
    styleTags: ['추상', '앵포르멜'],
    moodTags: ['실험적', '역동적'],
    themeTags: ['물질', '감정'],
    imageUrl: '/mmca-tour-kcy/artwork/현상 작품 2.png'
  },
  {
    id: 'hyunsang-03',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '현상 3',
    year: '1965-1970',
    floor: '6전시실',
    room: '2장. 현상',
    styleTags: ['추상', '앵포르멜'],
    moodTags: ['실험적'],
    themeTags: ['물질'],
    imageUrl: '/mmca-tour-kcy/artwork/현상 작품 3.png'
  },

  // 3장. 물방울 시리즈
  {
    id: 'moolbangul-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '물방울',
    titleEn: 'Water Drops',
    year: '1971년 이후',
    description: '캔버스를 적시는 우연에서 발견한 투명한 물방울을 중심으로, 현실적 묘사와 환영 사이를 오가는 극사실적 이미지를 구축했다. 거친 바탕 위에 맺힌 물방울은 상처와 애도, 정화와 생명의 상징으로 응축된다.',
    floor: '6전시실',
    room: '3장. 물방울',
    styleTags: ['구상', '회화'],
    moodTags: ['명상적', '고요한', '신비로운'],
    themeTags: ['자연', '치유', '시간'],
    imageUrl: '/mmca-tour-kcy/artwork/물방울 작품.png',
    artistContext: '파리 팔레조의 마구간 작업실에서 물방울을 발견한 뒤 평생 이 형상을 천착했다. 물방울은 눈물·정화수·생명의 은유로, 전쟁의 상흔과 존재에 대한 질문을 담은 독자적 조형 언어로 자리잡았다.',
    viewingQuestions: [
      '물방울이 화면 위에 실제로 맺혀있는 것처럼 보이나요?',
      '투명한 물방울을 통해 무엇이 보이나요?',
      '물방울은 당신에게 어떤 감정을 불러일으키나요?'
    ],
    aptRecommendations: {
      'LAEF': '명상적이고 고요한 물방울의 세계에서 내면의 평화를 찾을 수 있습니다.',
      'LAEC': '정갈하고 섬세한 기법으로 완성된 물방울의 깊이있는 미학을 감상하세요.',
      'SAEF': '투명하고 순수한 물방울이 주는 감정적 울림을 함께 나눠보세요.',
      'SAEC': '물방울의 조화로운 배치와 균형미를 통해 연결감을 느껴보세요.'
    }
  },
  {
    id: 'moolbangul-02',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '물방울 2',
    year: '1970-1980',
    floor: '6전시실',
    room: '3장. 물방울',
    styleTags: ['구상', '회화'],
    moodTags: ['명상적', '고요한'],
    themeTags: ['자연', '치유'],
    imageUrl: '/mmca-tour-kcy/artwork/물방울 작품 1.png'
  },
  {
    id: 'moolbangul-03',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '물방울 3',
    year: '1970-1980',
    floor: '6전시실',
    room: '3장. 물방울',
    styleTags: ['구상', '회화'],
    moodTags: ['명상적', '신비로운'],
    themeTags: ['자연', '시간'],
    imageUrl: '/mmca-tour-kcy/artwork/물방울 작품 3.png'
  },
  {
    id: 'il-pleut',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: 'Il pleut (비가 내린다)',
    titleEn: 'Il pleut',
    year: '1970년대',
    floor: '6전시실',
    room: '3장. 물방울',
    styleTags: ['구상', '회화'],
    moodTags: ['서정적', '고요한'],
    themeTags: ['자연', '시간'],
    imageUrl: '/mmca-tour-kcy/artwork/il pleut.png'
  },

  // 4장. 회귀 시리즈
  {
    id: 'hoegwi-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '회귀',
    titleEn: 'Return',
    year: '1980년대 이후',
    description: '1980년대 중반 천자문을 화면에 옮겨 쓰고 그 위에 물방울을 올리며 문자와 이미지의 결합을 탐구했다. 유년기에 익힌 한문을 통해 정체성과 세계 질서를 되짚고, 사라지는 글자 위에 떠 있는 물방울로 기억과 존재를 겹쳐 놓는다.',
    floor: '7전시실',
    room: '4장. 회귀',
    styleTags: ['회화', '전통적'],
    moodTags: ['명상적', '따뜻한', '전통적'],
    themeTags: ['역사', '정체성', '관계'],
    imageUrl: '/mmca-tour-kcy/artwork/회귀 작품 1.png',
    artistContext: '신문지 실험을 거쳐 직접 쓴 천자문을 바탕으로 삼으며, 문자(기억)와 곧 사라질 물방울(존재)의 긴장을 구축했다. 남프랑스 드라기냥 작업실 이후 색채와 콜라주, 대형 화면으로 확장되며 노년기의 사유가 응축된다.',
    aptRecommendations: {
      'LREF': '한국 전통과 현대미술의 따뜻한 만남을 서정적으로 느껴보세요.',
      'SAMC': '전통과 현대의 통합적 비전을 보여주는 기획적 작품입니다.',
      'SREF': '한국적 정서가 담긴 친근하고 따뜻한 작품입니다.',
      'SREC': '전통 문화를 포용하며 현대적으로 재해석한 작품입니다.'
    }
  },
  {
    id: 'hoegwi-02',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '회귀 2',
    year: '1980-1990',
    floor: '7전시실',
    room: '4장. 회귀',
    styleTags: ['회화', '전통적'],
    moodTags: ['따뜻한', '전통적'],
    themeTags: ['정체성', '관계'],
    imageUrl: '/mmca-tour-kcy/artwork/회귀 작품 2.png'
  },
  {
    id: 'hoegwi-03',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '회귀 3',
    year: '1980-1990',
    floor: '7전시실',
    room: '4장. 회귀',
    styleTags: ['회화', '전통적'],
    moodTags: ['명상적', '따뜻한'],
    themeTags: ['역사', '정체성'],
    imageUrl: '/mmca-tour-kcy/artwork/회귀 작품 3.png'
  },

  // 드로잉 및 기타
  {
    id: 'drawing-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '드로잉',
    year: '다양한 시기',
    floor: '6전시실',
    styleTags: ['회화'],
    moodTags: ['실험적', '자유로운'],
    themeTags: ['감정', '자연'],
    imageUrl: '/mmca-tour-kcy/artwork/드로잉_1.png'
  }
];

// ==================== 데이터 헬퍼 함수 ====================
export function getExhibitionById(id: string): MMCAExhibition | undefined {
  return MMCA_EXHIBITIONS.find(e => e.id === id);
}

export function getArtistById(id: string): MMCAArtist | undefined {
  return MMCA_ARTISTS.find(a => a.id === id);
}

export function getArtworkById(id: string): MMCAArtwork | undefined {
  return MMCA_ARTWORKS.find(a => a.id === id);
}

export function getArtworksByExhibition(exhibitionId: string): MMCAArtwork[] {
  return MMCA_ARTWORKS.filter(a => a.exhibitionId === exhibitionId);
}

export function getArtworksByArtist(artistId: string): MMCAArtwork[] {
  return MMCA_ARTWORKS.filter(a => a.artistId === artistId);
}

export function searchArtworks(query: string): MMCAArtwork[] {
  if (!query || query.length < 1) return [];
  const lowercaseQuery = query.toLowerCase();
  return MMCA_ARTWORKS.filter(artwork => {
    const artist = getArtistById(artwork.artistId);
    return (
      artwork.title.toLowerCase().includes(lowercaseQuery) ||
      artwork.titleEn?.toLowerCase().includes(lowercaseQuery) ||
      artist?.name.toLowerCase().includes(lowercaseQuery) ||
      artist?.nameEn?.toLowerCase().includes(lowercaseQuery)
    );
  });
}

// ==================== 데이터 검증 함수 ====================
export function validateArtwork(artwork: Partial<MMCAArtwork>): string[] {
  const errors: string[] = [];

  if (!artwork.id) errors.push('id 필수');
  if (!artwork.exhibitionId) errors.push('exhibitionId 필수');
  if (!artwork.artistId) errors.push('artistId 필수');
  if (!artwork.title) errors.push('title 필수');
  if (!artwork.floor) errors.push('floor 필수');
  if (!artwork.styleTags || artwork.styleTags.length === 0) errors.push('styleTags 최소 1개 필수');
  if (!artwork.moodTags || artwork.moodTags.length === 0) errors.push('moodTags 최소 1개 필수');
  if (!artwork.themeTags || artwork.themeTags.length === 0) errors.push('themeTags 최소 1개 필수');

  if (artwork.id && !/^[a-z0-9-]+$/.test(artwork.id)) {
    errors.push('id는 영문 소문자, 숫자, 하이픈만 사용');
  }

  artwork.styleTags?.forEach(tag => {
    if (!VALID_STYLE_TAGS.includes(tag as any)) {
      errors.push(`유효하지 않은 styleTags: ${tag}`);
    }
  });
  artwork.moodTags?.forEach(tag => {
    if (!VALID_MOOD_TAGS.includes(tag as any)) {
      errors.push(`유효하지 않은 moodTags: ${tag}`);
    }
  });
  artwork.themeTags?.forEach(tag => {
    if (!VALID_THEME_TAGS.includes(tag as any)) {
      errors.push(`유효하지 않은 themeTags: ${tag}`);
    }
  });

  if (artwork.exhibitionId && !getExhibitionById(artwork.exhibitionId)) {
    errors.push(`존재하지 않는 exhibitionId: ${artwork.exhibitionId}`);
  }
  if (artwork.artistId && !getArtistById(artwork.artistId)) {
    errors.push(`존재하지 않는 artistId: ${artwork.artistId}`);
  }

  return errors;
}
