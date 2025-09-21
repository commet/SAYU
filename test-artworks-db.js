/**
 * SAYU Art Counselor - 작품 데이터베이스 테스트
 * 16개 작품이 성공적으로 삽입되었는지 확인
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 생성 (백엔드 설정 사용)
const supabase = createClient(
  'https://hgltvdshuyfffskvjmst.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI'
);

async function testArtworksDatabase() {
  console.log('🎨 SAYU Art Counselor - 작품 데이터베이스 테스트 시작\n');

  try {
    // 1. 전체 작품 수 확인
    const { data: allArtworks, error: countError } = await supabase
      .from('artworks')
      .select('id, title, artist, year_created, style, metadata')
      .order('created_at', { ascending: true });

    if (countError) {
      console.error('❌ 데이터베이스 연결 오류:', countError.message);
      return;
    }

    console.log(`📊 총 작품 수: ${allArtworks.length}개`);

    if (allArtworks.length === 0) {
      console.log('⚠️  작품 데이터가 없습니다. scripts/insert-16-artworks.sql을 실행해주세요.');
      return;
    }

    // 2. 16개 목표 작품 확인
    const targetArtworkIds = [
      '550e8400-e29b-41d4-a716-446655440001', // 별밤
      '550e8400-e29b-41d4-a716-446655440002', // 수련
      '550e8400-e29b-41d4-a716-446655440003', // 키스
      '550e8400-e29b-41d4-a716-446655440004', // 절규
      '550e8400-e29b-41d4-a716-446655440005', // 진주 귀걸이
      '550e8400-e29b-41d4-a716-446655440006', // 비너스의 탄생
      '550e8400-e29b-41d4-a716-446655440007', // 야경
      '550e8400-e29b-41d4-a716-446655440008', // 씨름
      '550e8400-e29b-41d4-a716-446655440009', // 미인도
      '550e8400-e29b-41d4-a716-446655440010', // 정물
      '550e8400-e29b-41d4-a716-446655440011', // 르누아르
      '550e8400-e29b-41d4-a716-446655440012', // 무용수업
      '550e8400-e29b-41d4-a716-446655440013', // 방랑자
      '550e8400-e29b-41d4-a716-446655440014', // 물랭루주
      '550e8400-e29b-41d4-a716-446655440015', // 터너
      '550e8400-e29b-41d4-a716-446655440016'  // 인왕제색도
    ];

    const foundArtworks = allArtworks.filter(artwork =>
      targetArtworkIds.includes(artwork.id)
    );

    console.log(`✅ 목표 작품 중 발견: ${foundArtworks.length}/16개\n`);

    // 3. 발견된 작품 목록
    if (foundArtworks.length > 0) {
      console.log('📝 발견된 작품 목록:');
      foundArtworks.forEach((artwork, index) => {
        const country = artwork.metadata?.country || '미상';
        console.log(`${index + 1}. ${artwork.title} - ${artwork.artist} (${artwork.year_created}, ${country})`);
      });
      console.log('');
    }

    // 4. 누락된 작품 확인
    const missingIds = targetArtworkIds.filter(id =>
      !foundArtworks.some(artwork => artwork.id === id)
    );

    if (missingIds.length > 0) {
      console.log('⚠️  누락된 작품 ID:');
      missingIds.forEach((id, index) => {
        console.log(`${index + 1}. ${id}`);
      });
      console.log('');
    }

    // 5. 한국 작품 확인
    const koreanArtworks = foundArtworks.filter(artwork =>
      artwork.metadata?.country === 'Korea'
    );
    console.log(`🇰🇷 한국 작품: ${koreanArtworks.length}개`);
    koreanArtworks.forEach(artwork => {
      console.log(`   - ${artwork.title} (${artwork.artist})`);
    });

    // 6. 스타일 분포 확인
    const styles = [...new Set(foundArtworks.map(artwork => artwork.style))];
    console.log(`\n🎭 스타일 분포: ${styles.length}가지`);
    styles.forEach(style => {
      const count = foundArtworks.filter(artwork => artwork.style === style).length;
      console.log(`   - ${style}: ${count}개`);
    });

    // 7. 결과 요약
    console.log('\n📋 테스트 결과 요약:');
    if (foundArtworks.length === 16) {
      console.log('✅ 모든 작품이 성공적으로 삽입되었습니다!');
      console.log('✅ API 테스트를 진행할 수 있습니다.');
    } else if (foundArtworks.length > 0) {
      console.log('⚠️  일부 작품이 누락되었습니다.');
      console.log('💡 scripts/insert-16-artworks.sql을 다시 실행해보세요.');
    } else {
      console.log('❌ 작품 데이터가 없습니다.');
      console.log('💡 scripts/insert-16-artworks.sql을 먼저 실행해주세요.');
    }

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
  }
}

// 스크립트 실행
if (require.main === module) {
  testArtworksDatabase();
}

module.exports = { testArtworksDatabase };