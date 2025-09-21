const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const VenueUpdateStrategy = require('./venue-update-strategy');
require('dotenv').config();

/**
 * 한국화랑협회 정확한 크롤러
 *
 * 1. 갤러리 목록에서 링크만 수집
 * 2. 각 갤러리 개별 페이지로 이동
 * 3. PKM 갤러리처럼 실제 상세 정보 추출
 */
class KoreaGalleriesCorrectCrawler {
  constructor() {
    this.baseUrl = 'https://koreagalleries.or.kr';
    this.delay = 2000; // 2초 딜레이 (더 안전하게)
    this.testMode = true;

    this.supabase = createClient(
      'https://hgltvdshuyfffskvjmst.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI'
    );

    this.stats = {
      total: 0,
      processed: 0,
      matched: 0,
      updated: 0,
      newGalleries: 0,
      errors: 0,
      fieldsUpdated: {}
    };
  }

  getHeaders() {
    return {
      'User-Agent': 'SAYU-Art-Platform/1.0 (Educational purpose)',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 갤러리 이름 정규화
  normalizeName(name) {
    return name
      .replace(/\s+/g, '')
      .replace(/갤러리|gallery/gi, '')
      .replace(/[^\w가-힣]/g, '')
      .toLowerCase();
  }

  // 갤러리 목록에서 개별 페이지 링크만 수집
  async collectGalleryLinks(maxPages = 2) {
    console.log('🔗 갤러리 링크 수집 중...\n');

    const allLinks = [];

    for (let page = 1; page <= maxPages; page++) {
      const url = page === 1
        ? `${this.baseUrl}/galleries/`
        : `${this.baseUrl}/galleries/page/${page}/`;

      console.log(`📄 페이지 ${page}: ${url}`);

      try {
        const response = await axios.get(url, {
          headers: this.getHeaders(),
          timeout: 10000
        });

        const $ = cheerio.load(response.data);
        const pageLinks = [];

        // 갤러리 링크만 수집 (정확한 패턴)
        $('a[href*="/galleries/"]').each((i, elem) => {
          const link = $(elem).attr('href');

          // 갤러리 개별 페이지 링크만 (목록이나 페이지네이션 제외)
          if (link &&
              link.includes('/galleries/') &&
              link !== '/galleries/' &&
              !link.includes('/page/') &&
              link.split('/').length >= 5) { // galleries/갤러리명/ 형태

            const fullUrl = link.startsWith('http') ? link : `${this.baseUrl}${link}`;
            pageLinks.push(fullUrl);
          }
        });

        // 중복 제거
        const uniqueLinks = [...new Set(pageLinks)];
        allLinks.push(...uniqueLinks);

        console.log(`  ✅ ${uniqueLinks.length}개 갤러리 링크 수집`);

        if (page < maxPages) {
          await this.sleep(1000);
        }

      } catch (error) {
        console.error(`  ❌ 페이지 ${page} 수집 실패:`, error.message);
      }
    }

    const finalLinks = [...new Set(allLinks)];
    console.log(`\n📋 총 ${finalLinks.length}개 갤러리 링크 수집 완료\n`);

    return finalLinks;
  }

  // 개별 갤러리 페이지에서 상세 정보 추출 (PKM 방식)
  async extractGalleryDetails(galleryUrl) {
    console.log(`\n🏛️  개별 페이지 접속: ${galleryUrl}`);

    await this.sleep(this.delay);

    try {
      const response = await axios.get(galleryUrl, {
        headers: this.getHeaders(),
        timeout: 15000
      });

      const $ = cheerio.load(response.data);

      // PKM 갤러리처럼 실제 갤러리 정보 추출
      const galleryInfo = {
        source_url: galleryUrl,
        name_ko: this.extractGalleryNameFromUrl(galleryUrl),
        name_en: this.extractEnglishName($),
        address: this.extractRealAddress($),
        phone: this.extractRealPhone($),
        email: this.extractRealEmail($),
        website: this.extractRealWebsite($),
        description: this.extractRealDescription($),
        established: this.extractEstablished($),
        representative: this.extractRepresentative($)
      };

      // 결과 로깅
      console.log(`  📋 추출 결과:`);
      Object.entries(galleryInfo).forEach(([key, value]) => {
        if (value && key !== 'source_url') {
          const displayValue = typeof value === 'string' && value.length > 50
            ? value.substring(0, 50) + '...'
            : value;
          console.log(`    ${key}: ${displayValue}`);
        }
      });

      return galleryInfo;

    } catch (error) {
      console.error(`  ❌ 상세 정보 추출 실패:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  // URL에서 갤러리 이름 추출 (021갤러리 방식)
  extractGalleryNameFromUrl(galleryUrl) {
    try {
      // URL에서 갤러리 이름 추출 (https://koreagalleries.or.kr/galleries/021갤러리/ 형태)
      const nameFromUrl = decodeURIComponent(galleryUrl.split('/').slice(-2)[0]);
      console.log(`    ✅ URL에서 추출한 갤러리명: ${nameFromUrl}`);
      return nameFromUrl;
    } catch (error) {
      console.log(`    ❌ URL에서 갤러리명 추출 실패: ${error.message}`);
      return null;
    }
  }

  // 영문명 추출
  extractEnglishName($) {
    const text = $('body').text();
    const patterns = [
      /Gallery\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g,
      /[A-Z][a-z]+\s+Gallery/g,
      /[A-Z][A-Z\s]+GALLERY/g
    ];

    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        return matches[0].trim();
      }
    }
    return null;
  }

  // 실제 주소 추출 (021갤러리 방식)
  extractRealAddress($) {
    // "위치"가 포함된 li 요소에서 추출
    let foundAddress = null;

    $('li:contains("위치")').each((i, elem) => {
      const text = $(elem).text();
      console.log(`    - 위치 li 텍스트: ${text}`);

      // 한국 주소 추출 - 전체 주소 추출
      const addressMatch = text.match(/(대구광역시|서울특별시|부산광역시|인천광역시|광주광역시|대전광역시|울산광역시|서울시|부산시|대구시|인천시|광주시|대전시|울산시|경기도|강원도|충청북도|충청남도|전라북도|전라남도|경상북도|경상남도|제주특별자치도)[^\/\n]*?(?=\s*\/|\s*$)/);
      if (addressMatch) {
        let fullAddress = addressMatch[0].trim();
        // 뒤의 영문 주소 부분 제거
        fullAddress = fullAddress.replace(/\s*\/.*$/, '').trim();
        if (fullAddress.length > 5) {
          foundAddress = fullAddress;
          console.log(`    ✅ 추출된 주소: ${foundAddress}`);
          return false; // break each loop
        }
      }
    });

    return foundAddress;
  }

  // 실제 전화번호 추출 (021갤러리 방식)
  extractRealPhone($) {
    let foundPhone = null;

    $('li:contains("전화번호")').each((i, elem) => {
      const text = $(elem).text();
      console.log(`    - 전화번호 li 텍스트: ${text}`);

      const phoneMatch = text.match(/(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/);
      if (phoneMatch) {
        foundPhone = phoneMatch[1];
        console.log(`    ✅ 추출된 전화번호: ${foundPhone}`);
        return false; // break each loop
      }
    });

    return foundPhone ? VenueUpdateStrategy.standardizePhone(foundPhone) : null;
  }

  // 실제 이메일 추출 (021갤러리 방식)
  extractRealEmail($) {
    let foundEmail = null;

    $('li:contains("이메일")').each((i, elem) => {
      const text = $(elem).text();
      console.log(`    - 이메일 li 텍스트: ${text}`);

      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        foundEmail = emailMatch[0];
        console.log(`    ✅ 추출된 이메일: ${foundEmail}`);
        return false; // break each loop
      }
    });

    return foundEmail ? foundEmail.toLowerCase() : null;
  }

  // 실제 웹사이트 추출 (021갤러리 방식)
  extractRealWebsite($) {
    let foundWebsite = null;

    $('li:contains("웹사이트")').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text();
      const link = $elem.find('a').attr('href');

      console.log(`    - 웹사이트 li 텍스트: ${text}`);
      console.log(`    - 웹사이트 li 링크: ${link}`);

      if (link && !link.includes('koreagalleries.or.kr')) {
        foundWebsite = link;
        console.log(`    ✅ 추출된 웹사이트: ${foundWebsite}`);
        return false; // break each loop
      }
    });

    return foundWebsite ? VenueUpdateStrategy.standardizeWebsite(foundWebsite) : null;
  }

  // 실제 설명 추출
  extractRealDescription($) {
    // 갤러리 소개 텍스트 찾기
    const contentSelectors = [
      '.entry-content',
      '.gallery-description',
      '.about',
      '.introduction',
      'article p',
      '.content p'
    ];

    for (const selector of contentSelectors) {
      const elements = $(selector);
      elements.each((i, elem) => {
        const $elem = $(elem);
        const text = $elem.text().trim();

        // 갤러리 소개인지 확인
        if (text.length > 50 &&
            text.length < 1000 &&
            !text.includes('한국화랑협회') &&
            !text.includes('KIAF') &&
            (text.includes('갤러리') || text.includes('전시') || text.includes('작가'))) {
          return text;
        }
      });
    }

    return null;
  }

  // 설립년도 추출
  extractEstablished($) {
    const text = $('body').text();
    const yearPattern = /(?:설립|개관|창립).*?(\d{4})/gi;
    const match = text.match(yearPattern);
    if (match) {
      const year = match[0].match(/\d{4}/);
      return year ? year[0] : null;
    }
    return null;
  }

  // 대표자 추출
  extractRepresentative($) {
    const text = $('body').text();
    const repPatterns = [
      /(?:대표|관장|디렉터|Director)[\s:]*([가-힣\s]{2,10})/gi,
      /Director[\s:]*([A-Za-z\s]{3,20})/gi
    ];

    for (const pattern of repPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  // Supabase에서 매칭 갤러리 찾기
  async findMatchingVenue(galleryName) {
    if (!galleryName) return null;

    console.log(`  🔍 매칭 검색: "${galleryName}"`);

    // 정확한 이름 매칭
    let { data } = await this.supabase
      .from('venues')
      .select('*')
      .ilike('name', `%${galleryName}%`)
      .eq('type', 'gallery');

    if (data && data.length > 0) {
      console.log(`    ✅ 정확한 매칭: ${data[0].name}`);
      return data[0];
    }

    // 정규화된 이름으로 재시도
    const normalized = this.normalizeName(galleryName);
    const { data: allGalleries } = await this.supabase
      .from('venues')
      .select('*')
      .eq('type', 'gallery');

    const match = allGalleries?.find(g =>
      this.normalizeName(g.name).includes(normalized) ||
      normalized.includes(this.normalizeName(g.name))
    );

    if (match) {
      console.log(`    ✅ 유사 매칭: ${match.name}`);
      return match;
    }

    console.log(`    ❌ 매칭 없음 - 새 갤러리`);
    return null;
  }

  // 전체 크롤링 실행
  async crawl(maxPages = 1) {
    console.log('🚀 한국화랑협회 정확한 크롤러 시작');
    console.log('=====================================');
    console.log(`⚙️  모드: ${this.testMode ? '테스트' : '실제 업데이트'}`);
    console.log(`📄 크롤링할 페이지: ${maxPages}개`);
    console.log(`⏱️  요청 간격: ${this.delay}ms\n`);

    // 1. 갤러리 링크 수집
    const galleryLinks = await this.collectGalleryLinks(maxPages);
    this.stats.total = galleryLinks.length;

    // 2. 각 갤러리 개별 처리
    const processCount = this.testMode ? 3 : galleryLinks.length; // 테스트는 3개, 실제는 전체
    for (const link of galleryLinks.slice(0, processCount)) {
      this.stats.processed++;

      const galleryInfo = await this.extractGalleryDetails(link);
      if (!galleryInfo || !galleryInfo.name_ko) continue;

      // 매칭 갤러리 찾기
      const existingVenue = await this.findMatchingVenue(galleryInfo.name_ko);

      if (existingVenue) {
        this.stats.matched++;
        await this.updateVenue(existingVenue, galleryInfo);
      } else {
        this.stats.newGalleries++;
        console.log(`    🆕 새 갤러리: ${galleryInfo.name_ko} - 추후 추가 예정`);
      }
    }

    this.printReport();
  }

  // 갤러리 업데이트
  async updateVenue(existingVenue, crawledData) {
    const { updates, log } = await VenueUpdateStrategy.updateVenue(
      existingVenue,
      crawledData
    );

    if (Object.keys(updates).length === 0) {
      console.log(`    ℹ️  업데이트할 항목 없음`);
      return false;
    }

    console.log(`    📝 업데이트 계획:`);
    log.forEach(change => {
      console.log(`      ${change.field}: ${String(change.from).substring(0, 20)} → ${String(change.to).substring(0, 20)}`);
      this.stats.fieldsUpdated[change.field] = (this.stats.fieldsUpdated[change.field] || 0) + 1;
    });

    if (!this.testMode) {
      const { error } = await this.supabase
        .from('venues')
        .update(updates)
        .eq('id', existingVenue.id);

      if (error) {
        console.error(`    ❌ 업데이트 실패:`, error.message);
        this.stats.errors++;
        return false;
      }
      console.log(`    ✅ 업데이트 성공!`);
    } else {
      console.log(`    🔸 테스트 모드 - 실제 업데이트 안 함`);
    }

    this.stats.updated++;
    return true;
  }

  // 결과 리포트
  printReport() {
    console.log('\n\n========================================');
    console.log('📊 정확한 크롤링 결과');
    console.log('========================================\n');

    console.log('📈 전체 통계:');
    console.log(`  - 수집된 갤러리: ${this.stats.total}개`);
    console.log(`  - 처리된 갤러리: ${this.stats.processed}개`);
    console.log(`  - 매칭된 갤러리: ${this.stats.matched}개`);
    console.log(`  - 업데이트된 갤러리: ${this.stats.updated}개`);
    console.log(`  - 새로운 갤러리: ${this.stats.newGalleries}개`);
    console.log(`  - 에러: ${this.stats.errors}개`);

    if (Object.keys(this.stats.fieldsUpdated).length > 0) {
      console.log('\n📝 필드별 업데이트:');
      Object.entries(this.stats.fieldsUpdated)
        .sort((a, b) => b[1] - a[1])
        .forEach(([field, count]) => {
          console.log(`  - ${field}: ${count}회`);
        });
    }

    if (this.testMode) {
      console.log('\n⚠️  테스트 모드입니다. 실제 업데이트하려면:');
      console.log('crawler.setTestMode(false); 로 변경하세요.');
    }
  }

  setTestMode(testMode) {
    this.testMode = testMode;
    console.log(`🔧 모드 변경: ${testMode ? '테스트' : '실제 업데이트'} 모드`);
  }
}

module.exports = KoreaGalleriesCorrectCrawler;