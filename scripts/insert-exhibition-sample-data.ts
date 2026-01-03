/**
 * Exhibition Recording System - Sample Data Insertion Script
 *
 * 이 스크립트는 exhibition_artworks 테이블에 샘플 작품 데이터를 추가합니다.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// backend/.env 파일 로드 (Service Role 키 포함)
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in backend/.env');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? '✓' : '✗');
  process.exit(1);
}

// Service Role 키 사용으로 RLS 우회
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 샘플 작품 데이터 템플릿
const SAMPLE_ARTWORKS = [
  {
    title: '모나리자',
    title_en: 'Mona Lisa',
    artist: '레오나르도 다 빈치',
    artist_en: 'Leonardo da Vinci',
    year: 1503,
    medium: 'Oil on poplar panel',
    dimensions: '77 cm × 53 cm',
    description: '세계에서 가장 유명한 초상화 중 하나로, 수수께끼 같은 미소로 유명합니다.',
    description_en: 'One of the most famous portraits in the world, known for its enigmatic smile.',
    display_order: 1,
  },
  {
    title: '별이 빛나는 밤',
    title_en: 'The Starry Night',
    artist: '빈센트 반 고흐',
    artist_en: 'Vincent van Gogh',
    year: 1889,
    medium: 'Oil on canvas',
    dimensions: '73.7 cm × 92.1 cm',
    description: '소용돌이치는 하늘과 밝은 별들이 특징인 후기 인상주의 걸작입니다.',
    description_en: 'A post-impressionist masterpiece featuring swirling skies and bright stars.',
    display_order: 2,
  },
  {
    title: '게르니카',
    title_en: 'Guernica',
    artist: '파블로 피카소',
    artist_en: 'Pablo Picasso',
    year: 1937,
    medium: 'Oil on canvas',
    dimensions: '349 cm × 776 cm',
    description: '스페인 내전 중 게르니카 폭격의 비극을 표현한 반전 그림입니다.',
    description_en: 'An anti-war painting depicting the tragedy of the bombing of Guernica during the Spanish Civil War.',
    display_order: 3,
  },
  {
    title: '진주 귀걸이를 한 소녀',
    title_en: 'Girl with a Pearl Earring',
    artist: '요하네스 페르메이르',
    artist_en: 'Johannes Vermeer',
    year: 1665,
    medium: 'Oil on canvas',
    dimensions: '44.5 cm × 39 cm',
    description: '네덜란드 황금시대의 대표작으로, \'북유럽의 모나리자\'로 불립니다.',
    description_en: 'A masterpiece of the Dutch Golden Age, often called the "Mona Lisa of the North."',
    display_order: 4,
  },
  {
    title: '절규',
    title_en: 'The Scream',
    artist: '에드바르 뭉크',
    artist_en: 'Edvard Munch',
    year: 1893,
    medium: 'Oil, tempera, pastel and crayon on cardboard',
    dimensions: '91 cm × 73.5 cm',
    description: '실존적 불안과 공포를 표현한 표현주의의 대표작입니다.',
    description_en: 'An iconic expressionist work representing existential anxiety and fear.',
    display_order: 5,
  },
  {
    title: '기억의 지속',
    title_en: 'The Persistence of Memory',
    artist: '살바도르 달리',
    artist_en: 'Salvador Dalí',
    year: 1931,
    medium: 'Oil on canvas',
    dimensions: '24 cm × 33 cm',
    description: '녹아내리는 시계로 유명한 초현실주의 작품입니다.',
    description_en: 'A surrealist work famous for its melting clocks.',
    display_order: 6,
  },
  {
    title: '최후의 만찬',
    title_en: 'The Last Supper',
    artist: '레오나르도 다 빈치',
    artist_en: 'Leonardo da Vinci',
    year: 1498,
    medium: 'Tempera on gesso, pitch and mastic',
    dimensions: '460 cm × 880 cm',
    description: '예수 그리스도와 열두 제자의 최후의 만찬을 묘사한 르네상스 벽화입니다.',
    description_en: 'A Renaissance mural depicting Jesus Christ and the Twelve Apostles at the Last Supper.',
    display_order: 7,
  },
  {
    title: '키스',
    title_en: 'The Kiss',
    artist: '구스타프 클림트',
    artist_en: 'Gustav Klimt',
    year: 1908,
    medium: 'Oil and gold leaf on canvas',
    dimensions: '180 cm × 180 cm',
    description: '금박과 화려한 패턴으로 장식된 연인들의 포옹을 그린 작품입니다.',
    description_en: 'A painting of lovers embracing, decorated with gold leaf and ornate patterns.',
    display_order: 8,
  },
  {
    title: '아담의 창조',
    title_en: 'The Creation of Adam',
    artist: '미켈란젤로',
    artist_en: 'Michelangelo',
    year: 1512,
    medium: 'Fresco',
    dimensions: '280 cm × 570 cm',
    description: '시스티나 성당 천장화의 일부로, 신이 아담에게 생명을 부여하는 장면입니다.',
    description_en: 'Part of the Sistine Chapel ceiling, depicting God giving life to Adam.',
    display_order: 9,
  },
  {
    title: '우유를 따르는 여인',
    title_en: 'The Milkmaid',
    artist: '요하네스 페르메이르',
    artist_en: 'Johannes Vermeer',
    year: 1658,
    medium: 'Oil on canvas',
    dimensions: '45.5 cm × 41 cm',
    description: '일상적인 순간의 아름다움을 포착한 네덜란드 황금시대의 걸작입니다.',
    description_en: 'A Dutch Golden Age masterpiece capturing the beauty of an everyday moment.',
    display_order: 10,
  },
];

async function main() {
  console.log('🎨 Starting exhibition sample data insertion...\n');

  // 1. 전시 목록 조회
  console.log('📋 Fetching exhibitions...');
  const { data: exhibitions, error: fetchError } = await supabase
    .from('exhibitions')
    .select('id, title_local, title_en, venue_name')
    .limit(5);

  if (fetchError) {
    console.error('❌ Error fetching exhibitions:', fetchError);
    process.exit(1);
  }

  if (!exhibitions || exhibitions.length === 0) {
    console.error('❌ No exhibitions found. Please add exhibitions first.');
    process.exit(1);
  }

  console.log(`✅ Found ${exhibitions.length} exhibitions:\n`);
  exhibitions.forEach((ex, idx) => {
    console.log(`   ${idx + 1}. ${ex.title_local || ex.title_en} (${ex.venue_name})`);
  });
  console.log('');

  // 2. 각 전시에 샘플 작품 추가
  let totalInserted = 0;

  for (const exhibition of exhibitions) {
    console.log(`\n📍 Adding artworks to: ${exhibition.title_local || exhibition.title_en}`);
    console.log(`   Exhibition ID: ${exhibition.id}`);

    // 이미 작품이 있는지 확인
    const { data: existingArtworks, error: checkError } = await supabase
      .from('exhibition_artworks')
      .select('id')
      .eq('exhibition_id', exhibition.id);

    if (checkError) {
      console.error(`   ❌ Error checking existing artworks:`, checkError);
      continue;
    }

    if (existingArtworks && existingArtworks.length > 0) {
      console.log(`   ⏭️  Skipping - already has ${existingArtworks.length} artworks`);
      continue;
    }

    // 작품 데이터에 exhibition_id 추가
    const artworksToInsert = SAMPLE_ARTWORKS.map((artwork) => ({
      ...artwork,
      exhibition_id: exhibition.id,
    }));

    // 작품 삽입
    const { data: insertedArtworks, error: insertError } = await supabase
      .from('exhibition_artworks')
      .insert(artworksToInsert)
      .select('id, title, artist');

    if (insertError) {
      console.error(`   ❌ Error inserting artworks:`, insertError);
      continue;
    }

    console.log(`   ✅ Inserted ${insertedArtworks?.length || 0} artworks:`);
    insertedArtworks?.slice(0, 3).forEach((artwork) => {
      console.log(`      - ${artwork.title} by ${artwork.artist}`);
    });
    if (insertedArtworks && insertedArtworks.length > 3) {
      console.log(`      ... and ${insertedArtworks.length - 3} more`);
    }

    totalInserted += insertedArtworks?.length || 0;
  }

  // 3. 최종 통계
  console.log('\n' + '='.repeat(60));
  console.log('✨ Sample data insertion complete!\n');
  console.log(`📊 Statistics:`);
  console.log(`   - Total exhibitions processed: ${exhibitions.length}`);
  console.log(`   - Total artworks inserted: ${totalInserted}`);
  console.log('');

  // 4. 전체 작품 수 확인
  const { count, error: countError } = await supabase
    .from('exhibition_artworks')
    .select('*', { count: 'exact', head: true });

  if (!countError) {
    console.log(`📈 Total artworks in database: ${count}`);
  }

  console.log('\n✅ Done! You can now test the exhibition recording system.\n');
}

main().catch((error) => {
  console.error('\n❌ Unexpected error:', error);
  process.exit(1);
});
