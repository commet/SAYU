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
    title: '제사 (Ritual)',
    titleEn: 'Ritual',
    year: '1965',
    description: '1965년 제8회 상파울루 비엔날레에 출품된 작품. "너무 많은 죽음과 끔찍한 잔인함"을 목격한 작가가 전쟁의 상처를 화면에 각인하고 죽음을 위로하는 제의(祭儀)처럼 그린 초기 대표작이다. 상단 색 띠 아래 거친 화면 위로 총탄 자국을 연상시키는 불규칙한 구멍들이 표현되어 있으며, 이 원형 기호들은 훗날 물방울 묘사를 예견한다. 김창열은 이 작품 출품 8년 뒤인 1973년 제12회 상파울루 비엔날레에서 명예상을 수상하며 국제 미술계 입지를 확고히 했다.',
    floor: '6전시실',
    room: '1장. 상흔',
    styleTags: ['구상', '표현주의', '앵포르멜'],
    moodTags: ['강렬한', '역동적', '철학적'],
    themeTags: ['기억', '역사', '감정', '치유'],
    imageUrl: '/mmca-tour-kcy/artwork/상흔 작품 1.png',
    artistContext: `1957년 '현대미술가협회'를 창립하며 앵포르멜 실험을 주도했다. 당시 김창열에게 앵포르멜은 단순한 양식이 아니라 총탄 자국과 탱크의 흔적처럼 전쟁의 상처를 화면에 각인시키고 죽음을 위로하는 제의와도 같았다. 실제로 당시 대다수 작품에 "제사"라는 제목을 붙였는데, 그의 예술 세계에서 상처를 형상화하는 시작점이라 할 수 있다. 1961 파리비엔날레, 1965 상파울루비엔날레 참가로 체계적 국가 지원이 없던 상황 속에서도 국제 교류를 개척했다.`,
    viewingQuestions: [
      '불규칙한 구멍들이 총탄 자국처럼 보이나요?',
      '거친 화면에서 어떤 감정이 느껴지나요?',
      '이 작품이 죽음을 위로하는 제의라면, 무엇을 위로하고 있을까요?'
    ],
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
    title: '상흔',
    year: '1950년대',
    description: '한국 미술계에 앵포르멜이 본격 유입되던 시기의 작품. 전쟁의 참혹함과 인간 존재의 불안을 강렬하게 반영하는 비정형 추상으로, 전쟁이 남긴 상처와 고통, 탱크가 짓밟고 간 육체의 흔적, 총탄 자국과 살점이 드러난 듯한 거친 표현을 반복하며 시대적 비극을 정면으로 마주한다. 김창열을 포함한 현대미술가협회 소속 작가들은 앵포르멜 실험을 통해 국제 미술계와 소통할 수 있는 독자적인 조형 언어를 개발하고자 했다. 이는 비극적 현실을 극복하기 위한 몸부림이자 예술의 확장과 변혁을 향한 열망이었다.',
    floor: '6전시실',
    room: '1장. 상흔',
    styleTags: ['구상', '표현주의', '앵포르멜'],
    moodTags: ['강렬한', '역동적'],
    themeTags: ['기억', '역사', '감정'],
    imageUrl: '/mmca-tour-kcy/artwork/상흔 작품 2.png',
    artistContext: '전후 혼란 속에서도 김창열과 현대미술가협회 작가들은 앵포르멜 실험을 통해 한국 미술의 새로운 가능성을 모색했다. 국제 미술계와 소통할 수 있는 독자적 조형 언어 개발을 위한 시도였으며, 이와 함께 한국 현대미술도 새로운 지평을 열어갔다.'
  },

  // 2장. 현상 시리즈
  {
    id: 'hyunsang-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '현상 (Phenomenon)',
    titleEn: 'Phenomenon',
    year: '1966-1969',
    description: '뉴욕 체류 시기 작품. 세밀하게 묘사된 둥근 구체들을 화면 중심축에 놓고 키아로스쿠로(명암대비기법)를 활용해 구체의 부피감을 효과적으로 드러낸다. 구체의 둥근 윤곽을 따라 방사형으로 펼쳐지는 색채 레이어는 유기적 형태들이 화면 안쪽으로 침잠했다가 다시 외부로 돌출되는 듯한 시각적 리듬을 만든다. 앵포르멜 시기 살점이 긁혀 나간 듯 거친 질감의 점들은 뉴욕의 냉랭한 공기 속에 씻긴 듯 차갑게 변형되며, 마치 내면의 뜨거운 응어리가 응축되고 굳어져 차가운 구체로 응결된 듯하다. 넥타이 공장에서 생계를 이으며 익힌 스텐실과 에어스프레이 기법을 확인할 수 있다.',
    floor: '6전시실',
    room: '2장. 현상',
    styleTags: ['추상', '기하학'],
    moodTags: ['실험적', '역동적', '철학적', '차가운'],
    themeTags: ['물질', '존재', '정체성'],
    imageUrl: '/mmca-tour-kcy/artwork/현상 작품 1.png',
    artistContext: '1965년 김환기의 추천으로 록펠러 재단 지원을 받아 뉴욕으로 활동지를 넓혔다. 그러나 한국에서 꾸준히 그려온 앵포르멜 회화는 뉴욕에서 별다른 주목을 받지 못했고, 자본주의 소비사회에서 느낀 정서적 이질감은 소외감과 회의로 다가왔다. 당시를 "전쟁보다 견디기 힘든 악몽 같은 시간"으로 회고할 정도였다. 1966년 아트 스튜던츠 리그 수강 시 옵아트 작가 래리 푼스에게서 영향을 받았다. 록펠러 재단 지원이 끊기며 넥타이 공장에서 일하며 생계를 이어갔고, 이때 익힌 기법이 작품에 적용되었다.',
    viewingQuestions: [
      '구체가 화면 안쪽으로 들어가는 것 같나요, 밖으로 나오는 것 같나요?',
      '차가운 기하학적 형태에서 어떤 감정이 느껴지나요?',
      '이 작품이 "전쟁보다 견디기 힘든" 시간의 산물이라면, 무엇을 표현하고 있을까요?'
    ],
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
    title: '현상 (파리)',
    year: '1969-1970',
    description: '파리 정착 직후 제작한 현상 연작. 뉴욕 체류 시기 냉각된 점들이 점차 점액질처럼 흘러내리기 시작하고, 찢긴 듯한 캔버스 틈새로 불투명한 액체가 삐져나오는 듯한 형상이 출현한다. 이러한 흐물거리는 액체 덩어리는 단순한 형상 재현을 넘어 감각적이고 육체적인 이미지로 다가온다. 김창열은 이 시기 프란시스 베이컨의 그림에 깊은 인상을 받았다고 회고했는데, 인체가 뭉개지고 뒤틀린 살덩이로 표현되는 베이컨의 강렬한 회화는 그에게 전쟁과 폭력의 흔적을 표현하는 또 다른 언어로 다가왔다.',
    floor: '6전시실',
    room: '2장. 현상',
    styleTags: ['추상', '유기적'],
    moodTags: ['실험적', '역동적', '육체적'],
    themeTags: ['물질', '감정', '변화'],
    imageUrl: '/mmca-tour-kcy/artwork/현상 작품 2.png',
    artistContext: '1969년 12월, 록펠러 재단이 귀국 여정에 제공한 세계일주 항공권으로 첫 행선지 파리에 도착해 평생의 정착을 결심했다. 처음엔 한 평 남짓한 다락방, 이후 파리 외곽 팔레조 지역의 허물어진 마구간으로 거처를 옮겼고, 이곳이 오랫동안 작업실이자 사유의 공간이 되었다. 환경이 달라지며 작업에도 뚜렷한 변화가 나타났다. 김창열은 이를 "창자 미술"이라 부르며 신체와 물질, 추상과 재현 사이의 경계를 탐색했다.'
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
  {
    id: 'what-happened-at-night',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '밤에 일어난 일 (What Happened at Night)',
    titleEn: 'What Happened at Night',
    year: '1970-1971',
    description: '김창열 회화의 전환점을 상징하는 초기 물방울 대표작. 오랫동안 표현주의적 회화의 한계를 벗어나 새로운 조형 형식을 찾기 위해 고민하던 중, "화면에 찍힌 점들이 만약 투명해진다면 어떨까"하는 착상에 이르렀다. 공중에 머물다 떨어지기 직전 그 찰나를 포착한 물방울 형상을 떠올리고, 흰 바탕이나 검은 바탕 위에 물방울과 그림자의 관계를 실험적으로 그려나갔다. 그렇게 실험을 반복하던 중 캔버스를 재활용하기 위해 물을 뿌려두고 말리던 과정에서, 우연히 캔버스 뒷면에 맺힌 물방울을 발견했다. 바로 그 순간 물방울의 충일한 생명감과 조형적 가능성을 직관적으로 체감했다. "하나의 점이면서도 생명력을 지닌 존재", "회화적으로 점이 가질 수 있는 최고의 성취"이자 조형적 결론처럼 여겨졌다. 이 깨달음은 곧 <밤에 일어난 일>이라는 작품으로 이어진다. 어두운 바탕 위에 중력을 거스르듯 떠 있는 단 하나의 물방울. 유리처럼 투명한 이 물방울은 마구간 작업실의 어슴푸레한 공간을 반사하듯 담아내며, 김창열 회화의 전환점을 상징하는 이미지가 되었다.',
    floor: '6전시실',
    room: '2장. 현상 / 3장. 물방울',
    styleTags: ['구상', '회화', '극사실주의'],
    moodTags: ['명상적', '고요한', '신비로운', '전환적'],
    themeTags: ['발견', '깨달음', '전환', '존재'],
    imageUrl: '/mmca-tour-kcy/artwork/밤에 일어난 일.png',
    artistContext: '그토록 오랫동안 찾아 헤매던 조형 언어를 마침내 발견한 순간이었다. 이후 그는 평생을 물방울이라는 조형 언어에 천착하며, 그 안에 존재와 상처, 침묵과 사유의 모든 층위를 응축해나간다. 1971년 물방울의 등장은 단순한 우연의 산물이 아니라 오랜 시간에 걸친 실험과 고민, 그리고 철학적 성찰 끝에 이룬 필연적 발견이었다.',
    viewingQuestions: [
      '어두운 바탕 위에 떠 있는 단 하나의 물방울이 보이나요?',
      '이 물방울이 떨어지기 직전인 것 같나요, 아니면 영원히 떠 있을 것 같나요?',
      '작업실의 어슴푸레한 공간이 물방울에 반사되어 보이나요?'
    ],
    aptRecommendations: {
      'LAEF': '직관적 깨달음의 순간을 포착한 작품. 우연에서 필연으로의 전환을 느껴보세요.',
      'LAMF': '오랜 탐구 끝에 찾아낸 조형 언어. 발견의 순간을 직관적으로 포착하세요.',
      'LAMC': '점에서 물방울로의 철학적 전환. 존재론적 깨달음의 순간을 수집해보세요.',
      'LRMC': '50년 물방울 여정의 출발점. 조형 언어 탄생의 순간을 천천히 추적하세요.',
      'SAMF': '우연한 발견을 필연으로 만든 결정적 순간. 창작의 영감을 느껴보세요.',
      'SRMC': '김창열 회화사의 전환점. 이 작품 이전과 이후를 비교하며 토론해보세요.'
    }
  },

  // 3장. 물방울 시리즈
  {
    id: 'moolbangul-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '물방울',
    titleEn: 'Water Drops',
    year: '1973',
    description: '1973년 파리 놀 인터내셔널 갤러리 첫 개인전에서 프랑스 문화계에 신선한 충격을 안긴 물방울 연작. 저명한 평론가이자 초현실주의 시인 알랭 보스케는 "물질을 재정의하고 정신성을 제시하는 보기 드문 최면력을 지녔다. 단순한 시각적 환영을 넘어 존재와 본질에 대한 사유를 자극한다"며 프랑스 유력 매체 『꽁바』 한 면 전체를 할애해 극찬했다. 초현실주의 거장 살바도르 달리와 프랑스 국민 여배우 까트린 드뇌브도 전시장을 찾았다. 투박한 캔버스 위에 맺힌 물방울들은 각각 고유한 모양과 질감, 리듬을 지니며, 극사실 묘사가 압권이다. 김창열에게 물방울은 "내 물방울은 아기의 소변이다. 또한 스님들이 사찰 마당에 부은 정화수이기도 하다"는 말처럼, 전쟁의 눈물이자 정화수, 생명이자 소멸을 아우르는 상징이었다.',
    floor: '6전시실',
    room: '3장. 물방울',
    styleTags: ['구상', '회화', '극사실주의'],
    moodTags: ['명상적', '고요한', '신비로운'],
    themeTags: ['자연', '치유', '시간', '존재'],
    imageUrl: '/mmca-tour-kcy/artwork/물방울 작품.png',
    artistContext: '오랫동안 "투명해진 점"을 착상하며 고민하던 중, 캔버스를 재활용하기 위해 물을 뿌려두고 말리던 과정에서 우연히 캔버스 뒷면에 맺힌 물방울을 발견했다. 그 순간 물방울의 충일한 생명감과 조형적 가능성을 직관적으로 체감했다. "회화적으로 점이 가질 수 있는 최고의 성취"이자 조형적 결론처럼 여겨졌다. 그토록 오랫동안 찾아 헤매던 조형 언어를 마침내 발견한 것이다. 파리 외곽 마구간 작업실에서 열악한 삶을 이어가면서도 물방울 작업에 몰두했고, 1973년 첫 개인전 이후 국내외에서 본격적으로 알려지며 명성을 얻게 되었다.',
    viewingQuestions: [
      '물방울이 화면 위에 실제로 맺혀있는 것처럼 보이나요?',
      '투명한 물방울 속에 무엇이 반사되어 보이나요?',
      '이 물방울이 눈물일까요, 정화수일까요, 아니면 생명일까요?'
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
    description: '"화가가 아니라면 시인이 되고 싶었다"는 김창열에게 문자는 오랫동안 사유와 삶을 지탱해 온 모태적 기반이었다. 작품 Il pleut는 프랑스어로 "비가 온다"는 뜻으로, 프랑스 초현실주의 시인 기욤 아폴리네르의 동명의 시에서 영감을 받아 탄생했다. 아폴리네르는 1916년 글자의 배열을 통해 시가 빗방울처럼 비스듬히 지면을 타고 떨어지도록 시각화한 작품을 선보였다. 김창열은 그 형식을 회화로 옮겨왔다. 아폴리네르가 종이 위에 흐르는 시를 창조했다면, 김창열은 그 언어의 잔향을 화폭 위 물방울로 응축시킨다. Il pleut에서 물방울 하나하나는 멈춰 선 음표이자 지워진 음절이고, 침묵의 악보 위에 흩어진 시의 파편이다. 그렇게 물방울은 시각적이고 명상적인 언어로서 "비"가 되어 내린다. "읽는 것이 아니라 보는 시"—그것이야말로 회화의 언어가 할 수 있는 일이었고 김창열은 그런 형식에 매혹되었다.',
    floor: '6전시실',
    room: '3장. 물방울',
    styleTags: ['구상', '회화', '시적'],
    moodTags: ['서정적', '고요한', '명상적'],
    themeTags: ['문자', '시', '시간', '예술'],
    imageUrl: '/mmca-tour-kcy/artwork/il pleut.png',
    artistContext: '순수 회화처럼 보이는 그의 작품은 실은 문자와 언어, 사유와 끊임없이 연결되어 있으며, 회화와 시, 이미지와 의미 사이의 경계를 사유하는 예술적 실험의 장을 보여준다. Il pleut는 이를 가장 세련되게 표현한 작품 중 하나다.',
    viewingQuestions: [
      '물방울이 빗방울처럼 떨어지는 것 같나요?',
      '이 작품이 시처럼 느껴지나요, 아니면 그림처럼 느껴지나요?',
      '물방울 하나하나가 음표나 글자처럼 보이나요?'
    ],
    aptRecommendations: {
      'LAEF': '시를 물방울로 번역한 작품. 빛과 리듬을 자유롭게 느껴보세요.',
      'LAMF': '시를 회화로 옮긴 실험. "읽는 것이 아니라 보는 시"라는 조형적 탐구를 느껴보세요.',
      'LAEC': '문자와 이미지의 세련된 결합. 시각적 시의 균형미를 큐레이팅해보세요.',
      'SAEF': '멈춰 선 음표, 침묵의 악보. 시적 감성을 함께 나눠보세요.',
      'SAMC': '회화와 시의 경계를 넘나드는 학제적 실험. 장르 통합의 비전을 보세요.'
    }
  },

  // 4장. 회귀 시리즈
  {
    id: 'hoegwi-01',
    exhibitionId: 'kim-tschang-yeul-water-drops',
    artistId: 'kim-tschang-yeul',
    title: '회귀 (Return)',
    titleEn: 'Return',
    year: '1991',
    description: '1980년대 중반부터 본격 등장한 천자문과 물방울의 결합. 신문지 위에 물방울을 그리는 과정에서 글자와 이미지가 맺는 긴밀한 관계에 주목하며 천자문을 도입했다. 하늘 천, 땅 지로 시작되는 천자문은 한문 학습 교본으로 익숙하지만 겹치는 글자가 하나도 없는 잘 지어진 한시이기도 하다. 김창열은 어린 시절 할아버지로부터 처음 천자문을 익혔다고 회고했는데, 그에게 천자문은 단순한 글이 아닌 자연과 우주의 질서를 인식하는 기호였고 유년의 기억과 긴밀하게 연결되는 고리였다. 마치 유년 시절 습자지에 글씨를 써내려가듯 화면을 천자문으로 촘촘히 채워나간다. 흔들리고 어슴푸레한 문자 표면 위에 떠 있는 물방울은 깊은 사유의 공간을 연다. 천자문이 세계를 이해하고 자신의 정체성을 되찾기 위한 토대였다면, 천자문과 조응하는 물방울은 존재에 대한 질문을 던지는 도구였다. 기억을 담는 기호인 문자와 곧 소멸할 운명을 지닌 물방울이 화면 위에서 조우하는 회귀 연작은 기존 회화의 문법이나 사조의 계보를 넘어서는 독자적 조형 언어이자 김창열이 쌓아올린 미학적 성취다.',
    floor: '7전시실',
    room: '4장. 회귀',
    styleTags: ['회화', '전통적', '콜라주'],
    moodTags: ['명상적', '따뜻한', '서정적'],
    themeTags: ['역사', '정체성', '기억', '회귀'],
    imageUrl: '/mmca-tour-kcy/artwork/회귀 작품 1.png',
    artistContext: '1970년대 중반부터 신문지 위에 물방울을 그려 문자와의 결합을 시도했으나, 신문지는 내구성이 약하고 크기가 작아 효과적이지 못했다. 1980년 중반, 캔버스에 자신이 직접 한자를 쓴 뒤 그 위에 물방울을 그리기 시작했다. "어렸을 때부터 할아버지한테서 배운 낯익은 글씨"였기에 여러 문자 가운데 한자를 택했다고 말했다. 회귀 연작은 작가 자신을 성장시킨 문화권으로의 회귀를 뜻한다. 남프랑스 드라기냥 작업실에서 강렬한 햇빛과 풍요로운 자연을 만나며 본격적으로 색채에 대해 탐구했고, 화면은 더욱 대형화되었다.',
    viewingQuestions: [
      '천자문 글자가 선명하게 보이나요, 흐릿하게 보이나요?',
      '물방울이 글자 위에 떠 있는 것 같나요, 아니면 글자를 덮고 있는 것 같나요?',
      '문자(기억)와 물방울(존재)이 만날 때 무엇이 느껴지나요?'
    ],
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
