const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
const VenueUpdateStrategy = require('./venue-update-strategy');
require('dotenv').config();

/**
 * 한국화랑협회 Venues 크롤러 (최종 버전)
 *
 * 원칙:
 * 1. 기존 정보 최대한 존중
 * 2. NULL이면 무조건 채움
 * 3. 더 상세한 정보면 업데이트
 */
class KoreaGalleriesFinalCrawler {
  constructor() {
    this.baseUrl = 'https://koreagalleries.or.kr';
    this.delay = 1500; // 1.5초 딜레이
    this.testMode = true; // 테스트 모드 (실제 업데이트 안 함)

    // Supabase 연결
    const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';
    this.supabase = createClient(supabaseUrl, supabaseKey);

    this.stats = {
      total: 0,
      matched: 0,
      updated: 0,
      newGalleries: 0,
      errors: 0,
      fieldsUpdated: {}
    };
  }

  getHeaders() {
    return {
      'User-Agent': 'SAYU-Art-Platform/1.0 (Non-commercial)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 갤러리 이름 정규화 (매칭용)
  normalizeName(name) {
    return name
      .replace(/\s+/g, '')           // 공백 제거
      .replace(/갤러리|gallery/gi, '') // '갤러리' 제거
      .replace(/[^\w가-힣]/g, '')     // 특수문자 제거
      .toLowerCase();
  }

  // Supabase에서 매칭되는 갤러리 찾기
  async findMatchingVenue(galleryName) {
    console.log(`  🔍 매칭 검색: "${galleryName}"`);

    // 1. 정확한 이름 매칭
    let { data } = await this.supabase
      .from('venues')
      .select('*')
      .ilike('name', `%${galleryName}%`)
      .eq('type', 'gallery');

    if (data && data.length > 0) {
      console.log(`    ✅ 매칭 발견: ${data[0].name}`);
      return data[0];
    }

    // 2. 정규화된 이름으로 재시도
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
      console.log(`    ✅ 유사 매칭 발견: ${match.name}`);
      return match;
    }

    console.log(`    ❌ 매칭 없음 - 새 갤러리`);
    return null;
  }

  // 갤러리 목록 페이지 크롤링
  async fetchGalleryList(pageNum = 1) {
    const url = pageNum === 1
      ? `${this.baseUrl}/galleries/`
      : `${this.baseUrl}/galleries/page/${pageNum}/`;

    console.log(`\n📡 페이지 ${pageNum} 크롤링: ${url}`);

    try {
      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const galleries = [];
      const uniqueUrls = new Set(); // 중복 제거

      // 모든 갤러리 링크 찾기 (더 정확한 방법)
      $('a[href*="/galleries/"]').each((i, elem) => {
        const $elem = $(elem);
        const link = $elem.attr('href');

        // /galleries/ 페이지 자체나 페이지네이션 제외
        if (!link ||
            link === '/galleries/' ||
            link === `${this.baseUrl}/galleries/` ||
            link.includes('/page/')) {
          return;
        }

        // 중복 제거
        if (uniqueUrls.has(link)) return;
        uniqueUrls.add(link);

        // 이름 추출 (한글명과 영문명)
        let name_ko = '';
        let name_en = '';

        // 1. 한글 갤러리명 (h3.gallery-name 또는 첫 번째 h3)
        const koreanName = $elem.find('.gallery-name, h3').first().text().trim();
        if (koreanName && !koreanName.includes('<') && !koreanName.includes('VIEW MORE')) {
          name_ko = koreanName;
        }

        // 2. 영문 갤러리명 (h3.gallery-name-en 또는 두 번째 h3)
        const englishName = $elem.find('.gallery-name-en, h3').eq(1).text().trim();
        if (englishName && !englishName.includes('<')) {
          name_en = englishName;
        }

        // 3. 텍스트에서 깨끗한 이름 추출 (VIEW MORE 제거)
        if (!name_ko) {
          const cleanText = $elem.text()
            .replace(/VIEW MORE|더 보기/gi, '')
            .replace(/<[^>]*>/g, '') // HTML 태그 제거
            .trim();

          if (cleanText && cleanText.length < 50) {
            name_ko = cleanText;
          }
        }

        // 4. URL에서 추출 (최후의 수단)
        if (!name_ko || name_ko.length < 2) {
          const urlParts = decodeURIComponent(link).split('/').filter(p => p);
          const lastPart = urlParts[urlParts.length - 1];
          if (lastPart && lastPart !== 'galleries') {
            name_ko = lastPart.replace(/[-_]/g, ' ').replace(/%[0-9a-f]{2}/gi, '');
          }
        }

        // 유효한 갤러리 링크만 추가
        if (link.includes('/galleries/') && name_ko) {
          const gallery = {
            name: name_ko.replace(/\s+/g, ' ').trim(),
            url: link.startsWith('http') ? link : `${this.baseUrl}${link}`
          };

          // 영문명이 있으면 추가
          if (name_en) {
            gallery.name_en = name_en.trim();
          }

          galleries.push(gallery);
        }
      });

      console.log(`  ✅ ${galleries.length}개 갤러리 발견`);

      // 처음 몇 개 출력 (디버깅용)
      if (galleries.length > 0) {
        console.log(`  📋 샘플:`, galleries.slice(0, 3).map(g => g.name).join(', '));
      }

      return galleries;

    } catch (error) {
      console.error(`  ❌ 페이지 크롤링 실패:`, error.message);
      return [];
    }
  }

  // 갤러리 상세 페이지 크롤링
  async fetchGalleryDetail(gallery) {
    console.log(`\n🏛️  상세 정보 크롤링: ${gallery.name}`);
    await this.sleep(this.delay);

    try {
      const response = await axios.get(gallery.url, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const text = $('body').text();

      // 정보 추출
      const crawledData = {
        name_ko: gallery.name,
        address: this.extractAddress(text, $),
        phone: this.extractPhone(text, $),
        email: this.extractEmail(text, $),
        website: this.extractWebsite(text, $),
        description: this.extractDescription($)
      };

      // 영문 이름 추출 시도
      const englishName = this.extractEnglishName(text, gallery.name);
      if (englishName) {
        crawledData.name_en = englishName;
      }

      console.log(`  📋 추출된 정보:`);
      Object.entries(crawledData).forEach(([key, value]) => {
        if (value) {
          console.log(`    - ${key}: ${String(value).substring(0, 50)}${value.length > 50 ? '...' : ''}`);
        }
      });

      return crawledData;

    } catch (error) {
      console.error(`  ❌ 상세 정보 크롤링 실패:`, error.message);
      this.stats.errors++;
      return null;
    }
  }

  // 주소 추출 (개선된 버전)
  extractAddress(text, $) {
    // 다양한 주소 패턴
    const patterns = [
      /(서울|경기|부산|대구|인천|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^,\n]{10,60}/,
      /\d{5}[\s\S]{5,60}/, // 우편번호로 시작
      /[가-힣]+(시|도)\s+[가-힣]+(구|군)\s+[가-힣\s\d-]+/
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0].trim()
          .replace(/\s+/g, ' ')
          .replace(/[,\n\r\t]/g, ' ')
          .trim();
      }
    }

    // 구조화된 요소에서 찾기
    const addressSelectors = [
      '.address', '.location', '.venue-address',
      '*:contains("주소")', '*:contains("위치")', '*:contains("Address")'
    ];

    for (const selector of addressSelectors) {
      const elem = $(selector);
      if (elem.length) {
        const addr = elem.parent().text()
          .replace(/주소|위치|Address|:/g, '')
          .trim();
        if (addr.length > 5) return addr;
      }
    }

    return null;
  }

  // 전화번호 추출
  extractPhone(text, $) {
    const phonePatterns = [
      /(?:전화|Tel|TEL|T|Phone)[\s:]*([0-9\s-+()]+)/i,
      /(\+82[\s-]?)?0?\d{1,2}[\s-]?\d{3,4}[\s-]?\d{4}/,
      /\d{2,3}-\d{3,4}-\d{4}/
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        const phone = match[1] || match[0];
        return VenueUpdateStrategy.standardizePhone(phone);
      }
    }
    return null;
  }

  // 이메일 추출
  extractEmail(text, $) {
    const emailPattern = /[a-zA-Z0-9][a-zA-Z0-9._%+-]*@[a-zA-Z0-9][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);
    return match ? match[0].toLowerCase() : null;
  }

  // 웹사이트 추출
  extractWebsite(text, $) {
    // 외부 링크 찾기
    const links = $('a[href^="http"]').map((i, el) => $(el).attr('href')).get();
    const externalLinks = links.filter(link =>
      !link.includes('koreagalleries.or.kr') &&
      !link.includes('facebook.com') &&
      !link.includes('instagram.com') &&
      !link.includes('naver.com') &&
      (link.includes('.com') || link.includes('.kr') || link.includes('.org'))
    );

    if (externalLinks.length > 0) {
      return VenueUpdateStrategy.standardizeWebsite(externalLinks[0]);
    }

    // 텍스트에서 패턴 찾기
    const wwwPattern = /(?:www\.)?[a-zA-Z0-9-]+\.(?:com|kr|org|net)/i;
    const match = text.match(wwwPattern);
    if (match) {
      return VenueUpdateStrategy.standardizeWebsite(match[0]);
    }

    return null;
  }

  // 설명 추출
  extractDescription($) {
    // 갤러리 소개 찾기
    const selectors = [
      '.gallery-description', '.about', '.introduction',
      '.entry-content p:first', 'article p:first'
    ];

    for (const selector of selectors) {
      const elem = $(selector);
      if (elem.length) {
        const desc = elem.text().trim();
        if (desc.length > 30 && desc.length < 500) {
          return desc;
        }
      }
    }

    // 메타 태그에서 추출
    const metaDesc = $('meta[name="description"]').attr('content') ||
                     $('meta[property="og:description"]').attr('content');

    if (metaDesc && metaDesc.length > 30) {
      return metaDesc;
    }

    return null;
  }

  // 영문 이름 추출
  extractEnglishName(text, koreanName) {
    // 한글 이름 근처의 영문 찾기
    const normalized = this.normalizeName(koreanName);
    const englishPattern = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*(?:Gallery|Art|Space)?/g;
    const matches = text.match(englishPattern);

    if (matches) {
      for (const match of matches) {
        const normalizedMatch = this.normalizeName(match);
        if (normalizedMatch.includes(normalized.substring(0, 3)) ||
            normalized.includes(normalizedMatch.substring(0, 3))) {
          return match;
        }
      }
    }

    return null;
  }

  // 업데이트 실행
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

      // 통계 업데이트
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

  // 전체 크롤링 실행
  async crawl(maxPages = 1) {
    console.log('🚀 한국화랑협회 Venues 크롤러 시작');
    console.log('=====================================');
    console.log(`⚙️  설정: ${this.testMode ? '테스트 모드' : '실제 업데이트 모드'}`);
    console.log(`📄 크롤링할 페이지: ${maxPages}개`);
    console.log(`⏱️  요청 간격: ${this.delay}ms\n`);

    // 1. 갤러리 목록 수집
    const allGalleries = [];
    for (let page = 1; page <= maxPages; page++) {
      const galleries = await this.fetchGalleryList(page);
      allGalleries.push(...galleries);

      if (page < maxPages && galleries.length > 0) {
        await this.sleep(2000); // 페이지 간 대기
      }
    }

    this.stats.total = allGalleries.length;
    console.log(`\n📋 총 ${this.stats.total}개 갤러리 처리 시작\n`);

    // 2. 각 갤러리 처리
    for (const gallery of allGalleries) {
      // 상세 정보 크롤링
      const crawledData = await this.fetchGalleryDetail(gallery);
      if (!crawledData) continue;

      // Supabase에서 매칭
      const existingVenue = await this.findMatchingVenue(gallery.name);

      if (existingVenue) {
        this.stats.matched++;
        await this.updateVenue(existingVenue, crawledData);
      } else {
        this.stats.newGalleries++;
        console.log(`    🆕 새 갤러리 - 추후 추가 예정`);
      }
    }

    // 3. 결과 리포트
    this.printReport();
  }

  // 결과 리포트 출력
  printReport() {
    console.log('\n\n========================================');
    console.log('📊 크롤링 결과 리포트');
    console.log('========================================\n');

    console.log('📈 전체 통계:');
    console.log(`  - 총 갤러리: ${this.stats.total}개`);
    console.log(`  - 매칭된 갤러리: ${this.stats.matched}개`);
    console.log(`  - 업데이트된 갤러리: ${this.stats.updated}개`);
    console.log(`  - 새로운 갤러리: ${this.stats.newGalleries}개`);
    console.log(`  - 에러: ${this.stats.errors}개`);

    console.log('\n📝 필드별 업데이트 횟수:');
    Object.entries(this.stats.fieldsUpdated)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        console.log(`  - ${field}: ${count}회`);
      });

    if (this.testMode) {
      console.log('\n⚠️  테스트 모드였습니다. 실제 DB는 변경되지 않았습니다.');
      console.log('실제 업데이트하려면 testMode를 false로 설정하세요.');
    }
  }

  // 테스트 모드 설정
  setTestMode(testMode) {
    this.testMode = testMode;
    console.log(`🔧 모드 변경: ${testMode ? '테스트' : '실제 업데이트'} 모드`);
  }
}

// 실행
async function main() {
  const crawler = new KoreaGalleriesFinalCrawler();

  // 테스트 실행 (1페이지만)
  await crawler.crawl(1);

  // 실제 실행하려면:
  // crawler.setTestMode(false);
  // await crawler.crawl(5);
}

// 실행 (주석 해제하여 사용)
// main().catch(console.error);

module.exports = KoreaGalleriesFinalCrawler;