const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * 중복 데이터 처리 전략
 *
 * 원칙:
 * 1. NULL이나 빈 값은 항상 업데이트
 * 2. 기존 값이 있으면 보존 (덮어쓰지 않음)
 * 3. 형식 표준화는 별도 처리
 * 4. 한글/영문 혼재는 영문 우선
 */

class VenueUpdateStrategy {

  // 주소 처리 전략
  static handleAddress(current, crawled) {
    // 현재 주소가 없으면 새 주소 사용
    if (!current || current.trim() === '') {
      return crawled;
    }

    // 영문 주소 패턴 확인
    const isEnglish = /[A-Za-z]/.test(current);
    const isKorean = /[가-힣]/.test(current);

    // 현재 영문 주소가 있고, 크롤링한 것이 한글이면 유지
    if (isEnglish && !isKorean) {
      console.log('  ℹ️ 영문 주소 유지:', current.substring(0, 30) + '...');
      return current; // 영문 주소 유지
    }

    // 현재 한글 주소만 있고, 크롤링한 것도 한글이면 더 상세한 것 선택
    if (isKorean && !isEnglish) {
      if (crawled && crawled.length > current.length) {
        console.log('  ✅ 더 상세한 주소로 업데이트');
        return crawled;
      }
    }

    return current; // 기본적으로 현재 값 유지
  }

  // 전화번호 표준화
  static standardizePhone(phone) {
    if (!phone) return null;

    // 국제 번호 형식을 한국 형식으로
    let standardized = phone
      .replace(/^\+82\s?/, '0')     // +82 -> 0
      .replace(/[\s()]/g, '')        // 공백, 괄호 제거
      .replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3'); // 하이픈 추가

    return standardized;
  }

  // 웹사이트 표준화
  static standardizeWebsite(website) {
    if (!website) return null;

    // http:// 또는 https:// 없으면 추가
    if (!website.match(/^https?:\/\//)) {
      website = 'https://' + website;
    }

    // 마지막 슬래시 제거
    website = website.replace(/\/$/, '');

    return website;
  }

  // 업데이트 규칙 정의
  static getUpdateRules() {
    return {
      // NULL이면 무조건 업데이트
      email: {
        rule: 'NULL_ONLY',
        process: (current, crawled) => !current ? crawled : current
      },

      // NULL이면 무조건 업데이트
      description: {
        rule: 'NULL_ONLY',
        process: (current, crawled) => !current ? crawled : current
      },

      // NULL이면 무조건 업데이트
      description_en: {
        rule: 'NULL_ONLY',
        process: (current, crawled) => !current ? crawled : current
      },

      // 주소는 복잡한 로직
      address: {
        rule: 'SMART_MERGE',
        process: this.handleAddress
      },

      // 전화번호는 표준화
      phone: {
        rule: 'STANDARDIZE',
        process: (current, crawled) => {
          const standardized = this.standardizePhone(crawled);
          if (!current) return standardized;

          // 현재와 표준화된 값이 다르면 업데이트
          const currentStandard = this.standardizePhone(current);
          return currentStandard !== standardized ? standardized : current;
        }
      },

      // 웹사이트는 표준화
      website: {
        rule: 'STANDARDIZE',
        process: (current, crawled) => {
          const standardized = this.standardizeWebsite(crawled);
          if (!current) return standardized;

          // https 우선
          if (current.startsWith('http://') && standardized?.startsWith('https://')) {
            return standardized;
          }
          return current;
        }
      },

      // 인스타그램은 NULL일 때만
      instagram: {
        rule: 'NULL_ONLY',
        process: (current, crawled) => {
          if (!current && crawled) {
            // @ 없으면 추가
            return crawled.startsWith('@') ? crawled : '@' + crawled;
          }
          return current;
        }
      }
    };
  }

  // 실제 업데이트 실행
  static async updateVenue(venueData, crawledData) {
    const rules = this.getUpdateRules();
    const updates = {};
    const log = [];

    // 각 필드별로 규칙 적용
    for (const [field, rule] of Object.entries(rules)) {
      const currentValue = venueData[field];
      const crawledValue = crawledData[field];

      if (crawledValue === null || crawledValue === undefined) {
        continue; // 크롤링된 값이 없으면 스킵
      }

      const newValue = rule.process(currentValue, crawledValue);

      // 값이 변경되었으면 업데이트 목록에 추가
      if (newValue !== currentValue) {
        updates[field] = newValue;
        log.push({
          field,
          from: currentValue || 'NULL',
          to: newValue,
          rule: rule.rule
        });
      }
    }

    return { updates, log };
  }
}

// 테스트
async function testUpdateStrategy() {
  console.log('🔍 중복 데이터 처리 전략 테스트\n');
  console.log('=====================================\n');

  // 테스트 케이스들
  const testCases = [
    {
      name: 'Case 1: 영문 주소가 있는 경우',
      current: { address: '40 Samcheong-ro 7-gil, Jongno District, Seoul' },
      crawled: { address: '서울시 종로구 삼청로 7길 40' },
      expected: '영문 주소 유지'
    },
    {
      name: 'Case 2: 한글 주소만 있는 경우',
      current: { address: '서울시 종로구' },
      crawled: { address: '서울시 종로구 삼청로 7길 40' },
      expected: '더 상세한 한글 주소로 업데이트'
    },
    {
      name: 'Case 3: NULL인 경우',
      current: { email: null },
      crawled: { email: 'info@gallery.com' },
      expected: '새 값으로 업데이트'
    },
    {
      name: 'Case 4: 전화번호 표준화',
      current: { phone: '+82 2 734 9467' },
      crawled: { phone: '02-734-9467' },
      expected: '표준 형식으로 통일'
    },
    {
      name: 'Case 5: 웹사이트 https 업그레이드',
      current: { website: 'http://www.gallery.com' },
      crawled: { website: 'www.gallery.com' },
      expected: 'https://로 업그레이드'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('-'.repeat(40));

    const { updates, log } = await VenueUpdateStrategy.updateVenue(
      testCase.current,
      testCase.crawled
    );

    if (log.length > 0) {
      log.forEach(change => {
        console.log(`  ${change.field}: "${change.from}" → "${change.to}"`);
        console.log(`    규칙: ${change.rule}`);
      });
    } else {
      console.log('  변경 없음 (현재 값 유지)');
    }
    console.log(`  예상: ${testCase.expected}`);
  }

  // 실제 갤러리 테스트
  console.log('\n\n🏛️ 실제 갤러리 업데이트 시뮬레이션');
  console.log('=====================================\n');

  const { data: realVenue } = await supabase
    .from('venues')
    .select('*')
    .ilike('name', '%국제갤러리%')
    .limit(1)
    .single();

  if (realVenue) {
    const crawledData = {
      email: 'info@kukjegallery.com',
      phone: '02-735-8449',
      website: 'www.kukjegallery.com',
      description: '1982년 설립된 국제갤러리는 한국 현대미술을 대표하는 갤러리입니다.',
      address: '서울시 종로구 소격동 59-1'
    };

    console.log('현재 국제갤러리 정보:');
    console.log(`  address: ${realVenue.address || 'NULL'}`);
    console.log(`  email: ${realVenue.email || 'NULL'}`);
    console.log(`  description: ${realVenue.description || 'NULL'}`);

    const { updates, log } = await VenueUpdateStrategy.updateVenue(
      realVenue,
      crawledData
    );

    console.log('\n업데이트 계획:');
    if (log.length > 0) {
      log.forEach(change => {
        const fromDisplay = String(change.from).substring(0, 30);
        const toDisplay = String(change.to).substring(0, 30);
        console.log(`  ✅ ${change.field}: ${fromDisplay} → ${toDisplay}`);
      });
    } else {
      console.log('  ℹ️ 업데이트할 항목 없음');
    }
  }
}

// 실행
testUpdateStrategy().catch(console.error);

module.exports = VenueUpdateStrategy;