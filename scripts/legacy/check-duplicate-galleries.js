const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDuplicateGalleries() {
  console.log('🔍 갤러리 중복 체크 시작...\n');
  console.log('=' .repeat(50));

  try {
    // 모든 갤러리 가져오기
    const { data: galleries, error } = await supabase
      .from('venues')
      .select('id, name, name_en, address, phone, email, website, created_at')
      .eq('type', 'gallery')
      .order('name');

    if (error) {
      console.error('❌ 데이터 조회 실패:', error);
      return;
    }

    console.log(`📊 총 갤러리 수: ${galleries.length}개\n`);

    // 1. 이름 기반 중복 체크
    console.log('🔍 1. 갤러리 이름 중복 체크');
    console.log('-'.repeat(30));

    const nameGroups = {};
    galleries.forEach(gallery => {
      const normalizedName = normalizeGalleryName(gallery.name);
      if (!nameGroups[normalizedName]) {
        nameGroups[normalizedName] = [];
      }
      nameGroups[normalizedName].push(gallery);
    });

    let duplicatesByName = 0;
    Object.entries(nameGroups).forEach(([normalizedName, group]) => {
      if (group.length > 1) {
        duplicatesByName += group.length - 1;
        console.log(`\n🔸 "${normalizedName}" (${group.length}개 중복):`);
        group.forEach(gallery => {
          console.log(`   - ID: ${gallery.id.substring(0, 8)}... | 이름: ${gallery.name} | 주소: ${gallery.address?.substring(0, 30) || 'N/A'}...`);
          console.log(`     생성일: ${gallery.created_at?.substring(0, 10)} | 전화: ${gallery.phone || 'N/A'}`);
        });
      }
    });

    // 2. 전화번호 기반 중복 체크
    console.log('\n\n🔍 2. 전화번호 중복 체크');
    console.log('-'.repeat(30));

    const phoneGroups = {};
    galleries.forEach(gallery => {
      if (gallery.phone) {
        const normalizedPhone = normalizePhone(gallery.phone);
        if (!phoneGroups[normalizedPhone]) {
          phoneGroups[normalizedPhone] = [];
        }
        phoneGroups[normalizedPhone].push(gallery);
      }
    });

    let duplicatesByPhone = 0;
    Object.entries(phoneGroups).forEach(([phone, group]) => {
      if (group.length > 1) {
        duplicatesByPhone += group.length - 1;
        console.log(`\n📞 "${phone}" (${group.length}개 중복):`);
        group.forEach(gallery => {
          console.log(`   - ID: ${gallery.id.substring(0, 8)}... | 이름: ${gallery.name} | 주소: ${gallery.address?.substring(0, 30) || 'N/A'}...`);
        });
      }
    });

    // 3. 이메일 기반 중복 체크
    console.log('\n\n🔍 3. 이메일 중복 체크');
    console.log('-'.repeat(30));

    const emailGroups = {};
    galleries.forEach(gallery => {
      if (gallery.email) {
        const normalizedEmail = gallery.email.toLowerCase().trim();
        if (!emailGroups[normalizedEmail]) {
          emailGroups[normalizedEmail] = [];
        }
        emailGroups[normalizedEmail].push(gallery);
      }
    });

    let duplicatesByEmail = 0;
    Object.entries(emailGroups).forEach(([email, group]) => {
      if (group.length > 1) {
        duplicatesByEmail += group.length - 1;
        console.log(`\n📧 "${email}" (${group.length}개 중복):`);
        group.forEach(gallery => {
          console.log(`   - ID: ${gallery.id.substring(0, 8)}... | 이름: ${gallery.name} | 주소: ${gallery.address?.substring(0, 30) || 'N/A'}...`);
        });
      }
    });

    // 4. 웹사이트 기반 중복 체크
    console.log('\n\n🔍 4. 웹사이트 중복 체크');
    console.log('-'.repeat(30));

    const websiteGroups = {};
    galleries.forEach(gallery => {
      if (gallery.website) {
        const normalizedWebsite = normalizeWebsite(gallery.website);
        if (!websiteGroups[normalizedWebsite]) {
          websiteGroups[normalizedWebsite] = [];
        }
        websiteGroups[normalizedWebsite].push(gallery);
      }
    });

    let duplicatesByWebsite = 0;
    Object.entries(websiteGroups).forEach(([website, group]) => {
      if (group.length > 1) {
        duplicatesByWebsite += group.length - 1;
        console.log(`\n🌐 "${website}" (${group.length}개 중복):`);
        group.forEach(gallery => {
          console.log(`   - ID: ${gallery.id.substring(0, 8)}... | 이름: ${gallery.name} | 주소: ${gallery.address?.substring(0, 30) || 'N/A'}...`);
        });
      }
    });

    // 5. 유사한 이름 체크 (레벤슈타인 거리 사용)
    console.log('\n\n🔍 5. 유사한 갤러리 이름 체크');
    console.log('-'.repeat(30));

    const similarNames = [];
    for (let i = 0; i < galleries.length; i++) {
      for (let j = i + 1; j < galleries.length; j++) {
        const name1 = normalizeGalleryName(galleries[i].name);
        const name2 = normalizeGalleryName(galleries[j].name);

        const similarity = calculateSimilarity(name1, name2);
        if (similarity > 0.8 && name1 !== name2) { // 80% 이상 유사한 경우
          similarNames.push({
            gallery1: galleries[i],
            gallery2: galleries[j],
            similarity: Math.round(similarity * 100)
          });
        }
      }
    }

    similarNames.forEach(({ gallery1, gallery2, similarity }) => {
      console.log(`\n🔄 ${similarity}% 유사:`);
      console.log(`   갤러리1: ${gallery1.name} (${gallery1.address?.substring(0, 20) || 'N/A'}...)`);
      console.log(`   갤러리2: ${gallery2.name} (${gallery2.address?.substring(0, 20) || 'N/A'}...)`);
    });

    // 최종 결과 요약
    console.log('\n\n' + '=' .repeat(50));
    console.log('📊 중복 체크 결과 요약');
    console.log('=' .repeat(50));
    console.log(`📈 총 갤러리 수: ${galleries.length}개`);
    console.log(`🔸 이름 중복: ${duplicatesByName}개`);
    console.log(`📞 전화번호 중복: ${duplicatesByPhone}개`);
    console.log(`📧 이메일 중복: ${duplicatesByEmail}개`);
    console.log(`🌐 웹사이트 중복: ${duplicatesByWebsite}개`);
    console.log(`🔄 유사한 이름: ${similarNames.length}쌍`);

    const totalDuplicates = duplicatesByName + duplicatesByPhone + duplicatesByEmail + duplicatesByWebsite;
    console.log(`\n⚠️  총 중복 의심 건수: ${totalDuplicates}개`);

    if (totalDuplicates > 0) {
      console.log('\n💡 권장 사항:');
      console.log('1. 중복된 갤러리들을 수동으로 검토');
      console.log('2. 실제 같은 갤러리인 경우 하나로 통합');
      console.log('3. 다른 갤러리인 경우 이름/정보 구분');
    } else {
      console.log('\n✅ 중복된 갤러리가 발견되지 않았습니다!');
    }

  } catch (error) {
    console.error('❌ 중복 체크 실패:', error.message);
  }
}

// 갤러리 이름 정규화
function normalizeGalleryName(name) {
  if (!name) return '';

  return name.toLowerCase()
    .replace(/[\s\-_.]/g, '') // 공백, 하이픈, 언더스코어, 점 제거
    .replace(/갤러리|gallery/gi, '') // "갤러리", "gallery" 제거
    .replace(/화랑/gi, '') // "화랑" 제거
    .trim();
}

// 전화번호 정규화
function normalizePhone(phone) {
  if (!phone) return '';

  return phone.replace(/[\s\-()]/g, '') // 공백, 하이픈, 괄호 제거
    .replace(/^\+82/, '0'); // +82를 0으로 변환
}

// 웹사이트 정규화
function normalizeWebsite(website) {
  if (!website) return '';

  return website.toLowerCase()
    .replace(/^https?:\/\//, '') // 프로토콜 제거
    .replace(/^www\./, '') // www 제거
    .replace(/\/$/, ''); // 마지막 슬래시 제거
}

// 문자열 유사도 계산 (Levenshtein distance)
function calculateSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;

  const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const maxLen = Math.max(len1, len2);
  return (maxLen - matrix[len1][len2]) / maxLen;
}

checkDuplicateGalleries().catch(console.error);