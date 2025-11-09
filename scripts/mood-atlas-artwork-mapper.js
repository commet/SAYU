/**
 * Mood Atlas Artwork Mapper
 * Cloudinary 작품 데이터를 7개 예술 대륙에 매핑
 */

const fs = require('fs');
const path = require('path');

// Cloudinary 데이터 로드
const cloudinaryData = require('../artvee-crawler/data/cloudinary-urls.json');

// 7개 대륙별 유명 작가 정의
const REGION_ARTISTS = {
  renaissance: {
    name_ko: '르네상스 중심',
    name_en: 'Renaissance Plaza',
    icon: '🏛️',
    artists: [
      'Leonardo da Vinci',
      'Michelangelo',
      'Raphael',
      'Sandro Botticelli',
      'Titian',
      'Caravaggio',
      'Rembrandt',
      'Peter Paul Rubens',
      'Jan Vermeer',
      'Diego Velázquez'
    ],
    keywords: ['renaissance', 'classical', 'religious', 'portrait', 'baroque'],
    targetCount: 10
  },

  impressionist: {
    name_ko: '인상주의 해안',
    name_en: 'Impressionist Coast',
    icon: '🌊',
    artists: [
      'Claude Monet',
      'Pierre-Auguste Renoir',
      'Edgar Degas',
      'Camille Pissarro',
      'Alfred Sisley',
      'Berthe Morisot',
      'Mary Cassatt',
      'Gustave Caillebotte'
    ],
    keywords: ['impressionism', 'water', 'light', 'garden', 'landscape'],
    targetCount: 10
  },

  expressionist: {
    name_ko: '표현주의 협곡',
    name_en: 'Expressionist Canyon',
    icon: '🌋',
    artists: [
      'Vincent van Gogh',
      'Edvard Munch',
      'Egon Schiele',
      'Oskar Kokoschka',
      'Ernst Ludwig Kirchner',
      'Emil Nolde',
      'Wassily Kandinsky' // 초기작
    ],
    keywords: ['expressionism', 'emotion', 'night', 'portrait', 'landscape'],
    targetCount: 10
  },

  pop_art: {
    name_ko: '팝아트 섬',
    name_en: 'Pop Art Island',
    icon: '🏝️',
    artists: [
      'Andy Warhol',
      'Roy Lichtenstein',
      'Keith Haring',
      'David Hockney',
      'Jasper Johns',
      'Robert Rauschenberg'
    ],
    keywords: ['pop', 'modern', 'colorful', 'graphic', 'urban'],
    targetCount: 7
  },

  contemporary: {
    name_ko: '현대미술 군도',
    name_en: 'Contemporary Archipelago',
    icon: '🌈',
    artists: [
      'Yayoi Kusama',
      'Jeff Koons',
      'Damien Hirst',
      'Takashi Murakami',
      'Anish Kapoor',
      'Marina Abramović'
    ],
    keywords: ['contemporary', 'installation', 'conceptual', 'modern', 'experimental'],
    targetCount: 7
  },

  abstract: {
    name_ko: '추상의 고원',
    name_en: 'Abstract Highlands',
    icon: '🏔️',
    artists: [
      'Wassily Kandinsky',
      'Piet Mondrian',
      'Mark Rothko',
      'Kazimir Malevich',
      'Jackson Pollock',
      'Joan Miró',
      'Paul Klee'
    ],
    keywords: ['abstract', 'geometric', 'composition', 'color field', 'suprematism'],
    targetCount: 3
  },

  surreal: {
    name_ko: '초현실 심연',
    name_en: 'Surreal Abyss',
    icon: '🌌',
    artists: [
      'Salvador Dalí',
      'René Magritte',
      'Max Ernst',
      'Giorgio de Chirico',
      'Frida Kahlo',
      'Marc Chagall'
    ],
    keywords: ['surrealism', 'dream', 'symbolic', 'fantasy', 'metaphysical'],
    targetCount: 3
  }
};

// 감정별 추천 메시지 템플릿
const EMOTION_MESSAGES = {
  'blue-light': {
    templates: [
      '고요한 {subject}가 마음을 잔잔하게 해줄 거예요',
      '평온한 {mood}가 느껴지는 작품이에요',
      '차분한 분위기가 마음을 편안하게 해줄 거예요'
    ]
  },
  'blue-medium': {
    templates: [
      '깊은 사색에 잠기게 될 거예요',
      '{subject}의 깊이가 당신의 내면과 공명합니다',
      '고요한 {mood} 속에서 자신을 발견하게 될 거예요'
    ]
  },
  'blue-deep': {
    templates: [
      '깊은 그리움이 아름답게 표현된 작품이에요',
      '우수에 잠긴 {subject}가 마음을 어루만져요',
      '깊은 감정의 바다로 빠져들게 될 거예요'
    ]
  },
  'red-light': {
    templates: [
      '은은한 설렘이 느껴지는 작품이에요',
      '따뜻한 에너지가 전해질 거예요',
      '생동감 넘치는 {subject}가 활력을 줄 거예요'
    ]
  },
  'red-medium': {
    templates: [
      '열정적인 {mood}가 당신을 자극할 거예요',
      '강렬한 에너지가 느껴지는 작품이에요',
      '역동적인 움직임이 흥분을 불러일으켜요'
    ]
  },
  'red-deep': {
    templates: [
      '폭발적인 감정이 담긴 걸작이에요',
      '강렬한 {subject}가 마음을 뒤흔들 거예요',
      '뜨거운 열정이 화폭을 넘어 전해져요'
    ]
  },
  'yellow-light': {
    templates: [
      '은은한 빛이 따뜻함을 전해줘요',
      '부드러운 {mood}가 미소 짓게 할 거예요',
      '온화한 {subject}가 마음을 밝혀줘요'
    ]
  },
  'yellow-medium': {
    templates: [
      '희망찬 {subject}가 마음을 환하게 해줘요',
      '밝은 에너지가 넘치는 작품이에요',
      '따뜻한 {mood} 속에서 위안을 얻게 될 거예요'
    ]
  },
  'yellow-deep': {
    templates: [
      '눈부신 {subject}가 기쁨을 가득 채워줘요',
      '강렬한 빛이 어둠을 밝혀줄 거예요',
      '황홀한 {mood}에 휩싸이게 될 거예요'
    ]
  },
  'purple-light': {
    templates: [
      '신비로운 분위기가 감싸줘요',
      '몽환적인 {subject}가 꿈을 꾸게 할 거예요',
      '은은한 신비감이 느껴지는 작품이에요'
    ]
  },
  'purple-medium': {
    templates: [
      '초현실적인 {mood}에 빠져들게 될 거예요',
      '신비로운 {subject}가 상상력을 자극해요',
      '경이로운 세계로 초대할 거예요'
    ]
  },
  'purple-deep': {
    templates: [
      '강렬한 신비감이 압도할 거예요',
      '황홀한 {mood}에 취하게 될 거예요',
      '초월적 경험을 선사할 걸작이에요'
    ]
  },
  'green-light': {
    templates: [
      '평화로운 {subject}가 마음을 편안하게 해줘요',
      '자연스러운 조화가 느껴져요',
      '부드러운 생명력이 전해질 거예요'
    ]
  },
  'green-medium': {
    templates: [
      '생동하는 {subject}가 활력을 줄 거예요',
      '조화로운 {mood}에서 균형을 찾게 돼요',
      '자연의 에너지가 넘치는 작품이에요'
    ]
  },
  'green-deep': {
    templates: [
      '강렬한 생명력이 폭발하는 작품이에요',
      '풍요로운 {subject}가 마음을 가득 채워요',
      '압도적인 자연의 힘을 느낄 거예요'
    ]
  },
  'gray-light': {
    templates: [
      '잔잔한 쓸쓸함이 위로가 될 거예요',
      '고요한 {mood} 속에서 평화를 찾아요',
      '담담한 {subject}가 마음을 정리해줘요'
    ]
  },
  'gray-medium': {
    templates: [
      '우울한 분위기가 공감을 불러일으켜요',
      '고독한 {subject}가 당신과 함께할 거예요',
      '쓸쓸한 {mood}를 나누게 될 거예요'
    ]
  },
  'gray-deep': {
    templates: [
      '깊은 침잠 속에서 자신을 마주해요',
      '강렬한 공허함이 오히려 위안이 돼요',
      '무의 경지에서 평온을 찾게 될 거예요'
    ]
  }
};

/**
 * 작가 이름 매칭 (다양한 표기법 고려)
 */
function matchArtist(artistName, targetArtists) {
  if (!artistName) return null;

  const normalized = artistName.toLowerCase();

  for (const target of targetArtists) {
    const targetNormalized = target.toLowerCase();

    // 정확한 매칭
    if (normalized.includes(targetNormalized) || targetNormalized.includes(normalized)) {
      return target;
    }

    // 성만 매칭 (예: "van Gogh", "Gogh")
    const lastName = targetNormalized.split(' ').pop();
    if (lastName && normalized.includes(lastName)) {
      return target;
    }
  }

  return null;
}

/**
 * 작품 제목/설명에서 키워드 찾기
 */
function hasKeyword(artwork, keywords) {
  const text = `${artwork.title || ''} ${artwork.artist || ''}`.toLowerCase();
  return keywords.some(keyword => text.includes(keyword.toLowerCase()));
}

/**
 * 작품을 지역에 매핑
 */
function mapArtworksToRegions() {
  const regionArtworks = {};

  // 각 지역별 빈 배열 초기화
  Object.keys(REGION_ARTISTS).forEach(region => {
    regionArtworks[region] = [];
  });

  // 모든 작품 순회
  for (const [key, data] of Object.entries(cloudinaryData)) {
    const artwork = data.artwork;
    if (!artwork) continue;

    // 각 지역별로 매칭 시도
    for (const [regionId, regionData] of Object.entries(REGION_ARTISTS)) {
      const matchedArtist = matchArtist(artwork.artist, regionData.artists);

      if (matchedArtist) {
        // 작가 매칭 성공
        regionArtworks[regionId].push({
          id: key,
          title: artwork.title,
          artist: matchedArtist,
          originalArtist: artwork.artist,
          year: extractYear(artwork.title),
          imageUrl: data.full?.url,
          thumbnail: data.thumbnail?.url,
          width: data.full?.width,
          height: data.full?.height,
          region: regionId,
          matchReason: 'artist',
          matchScore: 100
        });
      } else if (hasKeyword(artwork, regionData.keywords)) {
        // 키워드 매칭
        regionArtworks[regionId].push({
          id: key,
          title: artwork.title,
          artist: artwork.artist,
          year: extractYear(artwork.title),
          imageUrl: data.full?.url,
          thumbnail: data.thumbnail?.url,
          width: data.full?.width,
          height: data.full?.height,
          region: regionId,
          matchReason: 'keyword',
          matchScore: 60
        });
      }
    }
  }

  return regionArtworks;
}

/**
 * 연도 추출
 */
function extractYear(title) {
  if (!title) return '';
  const match = title.match(/\((\d{4})\)/);
  return match ? match[1] : '';
}

/**
 * 작품별 감정 메시지 생성
 */
function generateEmotionMessages(artwork, region) {
  const messages = {};

  // 작품에서 주요 요소 추출
  const subject = extractSubject(artwork.title);
  const mood = extractMood(region);

  // 18가지 감정별 메시지 생성
  for (const [emotion, data] of Object.entries(EMOTION_MESSAGES)) {
    const template = data.templates[Math.floor(Math.random() * data.templates.length)];
    messages[emotion] = template
      .replace('{subject}', subject)
      .replace('{mood}', mood);
  }

  return messages;
}

/**
 * 작품 제목에서 주제 추출
 */
function extractSubject(title) {
  if (!title) return '이 작품';

  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes('water') || lowerTitle.includes('pond') || lowerTitle.includes('lake')) {
    return '물';
  }
  if (lowerTitle.includes('flower') || lowerTitle.includes('garden')) {
    return '꽃';
  }
  if (lowerTitle.includes('night') || lowerTitle.includes('star')) {
    return '밤하늘';
  }
  if (lowerTitle.includes('portrait') || lowerTitle.includes('woman') || lowerTitle.includes('man')) {
    return '인물';
  }
  if (lowerTitle.includes('landscape') || lowerTitle.includes('mountain')) {
    return '풍경';
  }
  if (lowerTitle.includes('city') || lowerTitle.includes('street')) {
    return '도시';
  }

  return '화면';
}

/**
 * 지역별 분위기 키워드
 */
function extractMood(region) {
  const moods = {
    renaissance: '웅장함',
    impressionist: '빛과 색채',
    expressionist: '강렬한 감정',
    pop_art: '경쾌한 리듬',
    contemporary: '실험적 탐구',
    abstract: '순수한 형태',
    surreal: '꿈의 세계'
  };

  return moods[region] || '예술적 표현';
}

/**
 * 작품 스토리 생성
 */
function generateStory(artwork, artist) {
  const stories = {
    'Vincent van Gogh': [
      `반 고흐는 생전에 단 한 점의 그림밖에 팔지 못했지만, 그림을 그리는 것이 유일한 위안이었습니다.`,
      `정신병원에 입원한 상태에서도 창밖을 바라보며 끊임없이 작품을 그렸습니다.`,
      `동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.`
    ],
    'Claude Monet': [
      `모네는 말년에 시력을 거의 잃었지만, 자신의 정원에서 수련을 그리는 것을 멈추지 않았습니다.`,
      `같은 장소를 다른 시간, 다른 빛에서 반복해서 그리며 순간의 인상을 포착했습니다.`,
      `"빛이 있는 한 나는 계속 그릴 것이다"라는 말을 남겼습니다.`
    ],
    'Edvard Munch': [
      `뭉크는 어린 시절 어머니와 누나를 잃은 트라우마를 예술로 승화시켰습니다.`,
      `절규를 그릴 때 "자연을 관통하는 무한한 절규를 들었다"고 회상했습니다.`,
      `정신병원에 입퇴원을 반복하면서도 창작을 멈추지 않았습니다.`
    ]
  };

  const artistStories = stories[artist];
  if (artistStories) {
    return artistStories[Math.floor(Math.random() * artistStories.length)];
  }

  return `${artist}의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.`;
}

/**
 * 재미있는 사실 생성
 */
function generateFunFact(artwork, artist) {
  const facts = {
    'Vincent van Gogh': [
      `이 작품은 반 고흐가 사망하기 몇 주 전에 그린 것입니다.`,
      `반 고흐는 10년의 화가 생활 동안 약 900점의 그림을 그렸습니다.`,
      `반 고흐의 그림은 현재 수백억 원에 거래되지만, 생전에는 거의 팔리지 않았습니다.`
    ],
    'Claude Monet': [
      `모네는 백내장으로 시력을 잃어가면서도 수련 시리즈를 계속 그렸습니다.`,
      `모네의 정원은 지금도 프랑스 지베르니에서 관광 명소로 운영되고 있습니다.`,
      `수련 시리즈는 약 250점이 넘으며, 일부는 방 하나를 가득 채울 만큼 거대합니다.`
    ],
    'Edvard Munch': [
      `절규의 원본은 도난당했다가 2년 후 회수되었습니다.`,
      `뭉크는 절규를 4번이나 다시 그렸습니다.`,
      `뭉크는 "병과 광기와 죽음이 내 요람을 지켰다"고 말했습니다.`
    ]
  };

  const artistFacts = facts[artist];
  if (artistFacts) {
    return artistFacts[Math.floor(Math.random() * artistFacts.length)];
  }

  return `이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.`;
}

/**
 * 최종 작품 데이터 생성
 */
function generateFinalArtworkData(regionArtworks) {
  const finalData = [];

  for (const [regionId, artworks] of Object.entries(regionArtworks)) {
    const regionInfo = REGION_ARTISTS[regionId];

    // 점수 순으로 정렬하고 목표 개수만큼 선택
    const topArtworks = artworks
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, regionInfo.targetCount);

    topArtworks.forEach(artwork => {
      finalData.push({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        year: artwork.year,
        region: regionId,
        region_name_ko: regionInfo.name_ko,
        region_name_en: regionInfo.name_en,

        imageUrl: artwork.imageUrl,
        thumbnailUrl: artwork.thumbnail,
        width: artwork.width,
        height: artwork.height,

        emotions: generateEmotionMessages(artwork, regionId),
        story: generateStory(artwork, artwork.artist),
        funFact: generateFunFact(artwork, artwork.artist),

        tags: extractTags(artwork, regionId),
        matchScore: artwork.matchScore,
        matchReason: artwork.matchReason
      });
    });
  }

  return finalData;
}

/**
 * 태그 추출
 */
function extractTags(artwork, region) {
  const tags = [REGION_ARTISTS[region].name_ko];

  const title = (artwork.title || '').toLowerCase();

  if (title.includes('portrait')) tags.push('인물화');
  if (title.includes('landscape')) tags.push('풍경화');
  if (title.includes('night')) tags.push('야경');
  if (title.includes('flower') || title.includes('garden')) tags.push('자연');
  if (title.includes('water') || title.includes('sea')) tags.push('물');

  return tags;
}

/**
 * SQL 생성
 */
function generateSQL(artworkData) {
  let sql = `-- Mood Atlas 작품 데이터
-- 생성일: ${new Date().toISOString()}
-- 총 ${artworkData.length}개 작품

`;

  sql += `
-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS mood_atlas_artworks (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(100) NOT NULL,
  year VARCHAR(20),

  region VARCHAR(50) NOT NULL,
  region_name_ko VARCHAR(100),
  region_name_en VARCHAR(100),

  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INT,
  height INT,

  emotions JSONB,
  story TEXT,
  fun_fact TEXT,

  tags TEXT[],
  match_score INT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 작품 데이터 삽입
`;

  artworkData.forEach(artwork => {
    sql += `
INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  ${sqlEscape(artwork.id)},
  ${sqlEscape(artwork.title)},
  ${sqlEscape(artwork.artist)},
  ${sqlEscape(artwork.year)},
  ${sqlEscape(artwork.region)},
  ${sqlEscape(artwork.region_name_ko)},
  ${sqlEscape(artwork.region_name_en)},
  ${sqlEscape(artwork.imageUrl)},
  ${sqlEscape(artwork.thumbnailUrl)},
  ${artwork.width || 'NULL'},
  ${artwork.height || 'NULL'},
  '${JSON.stringify(artwork.emotions)}'::jsonb,
  ${sqlEscape(artwork.story)},
  ${sqlEscape(artwork.funFact)},
  ARRAY[${artwork.tags.map(t => sqlEscape(t)).join(', ')}],
  ${artwork.matchScore}
) ON CONFLICT (id) DO NOTHING;
`;
  });

  return sql;
}

/**
 * SQL 문자열 이스케이프
 */
function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL';
  return `'${String(value).replace(/'/g, "''")}'`;
}

/**
 * 메인 실행
 */
function main() {
  console.log('🎨 Mood Atlas Artwork Mapper 시작...\n');

  // 1. 작품 매핑
  console.log('1. 작품을 지역별로 매핑 중...');
  const regionArtworks = mapArtworksToRegions();

  // 2. 통계 출력
  console.log('\n📊 지역별 매칭 결과:');
  for (const [regionId, artworks] of Object.entries(regionArtworks)) {
    const regionInfo = REGION_ARTISTS[regionId];
    console.log(`  ${regionInfo.icon} ${regionInfo.name_ko}: ${artworks.length}개 (목표: ${regionInfo.targetCount}개)`);
  }

  // 3. 최종 데이터 생성
  console.log('\n2. 최종 작품 데이터 생성 중...');
  const finalData = generateFinalArtworkData(regionArtworks);
  console.log(`   ✅ 총 ${finalData.length}개 작품 선정`);

  // 4. JSON 저장
  const jsonPath = path.join(__dirname, '../data/mood-atlas-artworks.json');
  fs.writeFileSync(jsonPath, JSON.stringify(finalData, null, 2), 'utf-8');
  console.log(`   ✅ JSON 저장: ${jsonPath}`);

  // 5. SQL 생성 및 저장
  console.log('\n3. SQL 파일 생성 중...');
  const sql = generateSQL(finalData);
  const sqlPath = path.join(__dirname, '../backend/src/migrations/insert_mood_atlas_artworks.sql');
  fs.writeFileSync(sqlPath, sql, 'utf-8');
  console.log(`   ✅ SQL 저장: ${sqlPath}`);

  // 6. 샘플 출력
  console.log('\n📝 샘플 작품:');
  const sample = finalData.slice(0, 3);
  sample.forEach(artwork => {
    console.log(`\n  ${artwork.region_name_ko} - ${artwork.artist}`);
    console.log(`  "${artwork.title}"`);
    console.log(`  감정 메시지 예시 (blue-light): ${artwork.emotions['blue-light']}`);
  });

  console.log('\n✨ 완료!\n');
}

// 실행
main();
