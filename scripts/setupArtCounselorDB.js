/**
 * SAYU Art Counselor Database Setup Script
 * Supabase SDK를 사용한 테이블 생성
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 설정
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  console.error('필요한 변수:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 테이블 생성 함수들
 */

// 1. artworks 테이블
async function createArtworksTable() {
  console.log('📋 Creating artworks table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS artworks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        title_en TEXT,
        artist TEXT NOT NULL,
        artist_en TEXT,
        year INTEGER,
        medium TEXT,
        dimensions TEXT,
        location TEXT,
        style TEXT,
        image_url TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 인덱스 생성
      CREATE INDEX IF NOT EXISTS idx_artworks_artist ON artworks(artist);
      CREATE INDEX IF NOT EXISTS idx_artworks_style ON artworks(style);
      CREATE INDEX IF NOT EXISTS idx_artworks_year ON artworks(year);

      -- RLS 정책
      ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Artworks are viewable by everyone" ON artworks
        FOR SELECT USING (true);
    `
  });

  if (error) {
    console.error('❌ Error creating artworks table:', error);
    return false;
  }

  console.log('✅ artworks table created');
  return true;
}

// 2. art_journals 테이블
async function createArtJournalsTable() {
  console.log('📋 Creating art_journals table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS art_journals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        artwork_id TEXT REFERENCES artworks(id),

        -- User Content
        first_impression TEXT,
        personal_connection TEXT,
        new_discovery TEXT,
        question_to_artist TEXT,

        -- Quick Reactions
        mood_tags TEXT[],
        color_selections TEXT[],

        -- Metadata
        weather_data JSONB,
        time_of_day TEXT,
        session_number INTEGER DEFAULT 1,

        -- AI Enrichment (vector 타입은 pgvector 확장 필요)
        emotion_vector TEXT, -- 일단 TEXT로, 나중에 vector로 변환
        writing_style JSONB,
        growth_indicators JSONB,

        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 인덱스
      CREATE INDEX IF NOT EXISTS idx_art_journals_user ON art_journals(user_id);
      CREATE INDEX IF NOT EXISTS idx_art_journals_artwork ON art_journals(artwork_id);
      CREATE INDEX IF NOT EXISTS idx_art_journals_created ON art_journals(created_at);
      CREATE INDEX IF NOT EXISTS idx_art_journals_mood ON art_journals USING GIN(mood_tags);

      -- RLS 정책
      ALTER TABLE art_journals ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can view own journals" ON art_journals
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can create own journals" ON art_journals
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "Users can update own journals" ON art_journals
        FOR UPDATE USING (auth.uid() = user_id);
    `
  });

  if (error) {
    console.error('❌ Error creating art_journals table:', error);
    return false;
  }

  console.log('✅ art_journals table created');
  return true;
}

// 3. user_art_journeys 테이블
async function createUserArtJourneysTable() {
  console.log('📋 Creating user_art_journeys table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS user_art_journeys (
        user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        total_artworks INTEGER DEFAULT 0,
        total_entries INTEGER DEFAULT 0,
        favorite_artists TEXT[],
        emotional_evolution JSONB DEFAULT '{}',
        preference_patterns JSONB DEFAULT '{}',
        special_moments JSONB[],
        last_viewed_artworks TEXT[],
        last_journal_entry TIMESTAMPTZ,
        next_recommendations TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- RLS 정책
      ALTER TABLE user_art_journeys ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can view own journey" ON user_art_journeys
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "Users can update own journey" ON user_art_journeys
        FOR ALL USING (auth.uid() = user_id);
    `
  });

  if (error) {
    console.error('❌ Error creating user_art_journeys table:', error);
    return false;
  }

  console.log('✅ user_art_journeys table created');
  return true;
}

// 4. daily_art_presentations 테이블
async function createDailyArtPresentationsTable() {
  console.log('📋 Creating daily_art_presentations table...');

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS daily_art_presentations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        artwork_id TEXT REFERENCES artworks(id),
        presented_at TIMESTAMPTZ DEFAULT NOW(),
        selection_reason TEXT,
        engagement_level TEXT,
        journal_created BOOLEAN DEFAULT FALSE,

        UNIQUE(user_id, artwork_id, DATE(presented_at))
      );

      -- 인덱스
      CREATE INDEX IF NOT EXISTS idx_daily_art_user ON daily_art_presentations(user_id);
      CREATE INDEX IF NOT EXISTS idx_daily_art_date ON daily_art_presentations(presented_at);

      -- RLS 정책
      ALTER TABLE daily_art_presentations ENABLE ROW LEVEL SECURITY;

      CREATE POLICY "Users can view own presentations" ON daily_art_presentations
        FOR SELECT USING (auth.uid() = user_id);

      CREATE POLICY "System can create presentations" ON daily_art_presentations
        FOR INSERT WITH CHECK (true);
    `
  });

  if (error) {
    console.error('❌ Error creating daily_art_presentations table:', error);
    return false;
  }

  console.log('✅ daily_art_presentations table created');
  return true;
}

// 5. 작품 데이터 삽입
async function insertArtworkData() {
  console.log('🎨 Inserting artwork data...');

  const artworks = [
    {
      id: 'starry-night',
      title: '별이 빛나는 밤',
      title_en: 'The Starry Night',
      artist: '빈센트 반 고흐',
      artist_en: 'Vincent van Gogh',
      year: 1889,
      medium: '유화',
      dimensions: '73.7 × 92.1 cm',
      location: '뉴욕 현대미술관',
      style: '포스트 인상주의',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg'
    },
    {
      id: 'water-lilies',
      title: '수련',
      title_en: 'Water Lilies',
      artist: '클로드 모네',
      artist_en: 'Claude Monet',
      year: 1906,
      medium: '유화',
      dimensions: '89.9 × 94.1 cm',
      location: '시카고 미술관',
      style: '인상주의',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg'
    },
    {
      id: 'the-kiss',
      title: '키스',
      title_en: 'The Kiss',
      artist: '구스타프 클림트',
      artist_en: 'Gustav Klimt',
      year: 1908,
      medium: '유화, 금박',
      dimensions: '180 × 180 cm',
      location: '벨베데레 궁전',
      style: '아르누보',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg/1280px-Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg'
    },
    {
      id: 'the-scream',
      title: '절규',
      title_en: 'The Scream',
      artist: '에드바르 뭉크',
      artist_en: 'Edvard Munch',
      year: 1893,
      medium: '유화, 템페라, 파스텔',
      dimensions: '91 × 73.5 cm',
      location: '노르웨이 국립미술관',
      style: '표현주의',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg'
    },
    {
      id: 'girl-with-pearl',
      title: '진주 귀걸이를 한 소녀',
      title_en: 'Girl with a Pearl Earring',
      artist: '요하네스 페르메이르',
      artist_en: 'Johannes Vermeer',
      year: 1665,
      medium: '유화',
      dimensions: '44.5 × 39 cm',
      location: '마우리츠하위스 미술관',
      style: '바로크',
      image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg'
    }
    // 나머지 11개 작품도 추가 가능
  ];

  const { data, error } = await supabase
    .from('artworks')
    .upsert(artworks, { onConflict: 'id' });

  if (error) {
    console.error('❌ Error inserting artworks:', error);
    return false;
  }

  console.log(`✅ ${artworks.length} artworks inserted`);
  return true;
}

/**
 * 메인 실행 함수
 */
async function setupDatabase() {
  console.log('🚀 Starting SAYU Art Counselor Database Setup...\n');

  try {
    // 1. 테이블 생성
    const tables = [
      { name: 'artworks', fn: createArtworksTable },
      { name: 'art_journals', fn: createArtJournalsTable },
      { name: 'user_art_journeys', fn: createUserArtJourneysTable },
      { name: 'daily_art_presentations', fn: createDailyArtPresentationsTable }
    ];

    for (const table of tables) {
      const success = await table.fn();
      if (!success) {
        console.log(`⚠️  Skipping ${table.name} table (may already exist)`);
      }
    }

    // 2. 작품 데이터 삽입
    console.log('\n📚 Inserting initial data...');
    await insertArtworkData();

    console.log('\n✨ Database setup complete!');
    console.log('\n📊 Created tables:');
    console.log('  - artworks (작품 정보)');
    console.log('  - art_journals (감상 기록)');
    console.log('  - user_art_journeys (사용자 여정)');
    console.log('  - daily_art_presentations (일일 작품)');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// RPC 함수가 없을 경우를 대비한 대안
async function testConnection() {
  console.log('🔍 Testing Supabase connection...');

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (error) {
    console.error('❌ Connection failed:', error);
    console.log('\n💡 대안: Supabase Dashboard에서 SQL Editor를 사용해주세요.');
    console.log('다음 단계로 SQL 파일을 생성해드릴 수 있습니다.');
    return false;
  }

  console.log('✅ Connection successful');
  return true;
}

// 실행
async function run() {
  const connected = await testConnection();

  if (connected) {
    console.log('\n⚠️  주의: exec_sql RPC 함수가 없다면 이 스크립트는 작동하지 않습니다.');
    console.log('Supabase Dashboard에서 직접 SQL을 실행하는 것이 더 안전할 수 있습니다.');
    console.log('\n계속 진행하시겠습니까? (Ctrl+C로 취소)');

    setTimeout(() => {
      setupDatabase();
    }, 3000);
  }
}

run();