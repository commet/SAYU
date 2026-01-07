const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

/**
 * 한국화랑협회 갤러리 정보 크롤러
 * venues 테이블 업데이트용
 * robots.txt 준수: 대부분 허용, /wp-admin/ 제외
 */

class KoreaGalleriesVenueCrawler {
  constructor() {
    this.baseUrl = 'https://koreagalleries.or.kr';
    this.galleries = [];
    this.delay = 1500; // 1.5초 딜레이 (서버 부하 방지)

    // Supabase 연결
    this.supabase = createClient(
      'https://hgltvdshuyfffskvjmst.supabase.co',
      process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI'
    );
  }

  // User-Agent 설정
  getHeaders() {
    return {
      'User-Agent': 'SAYU-Art-Platform/1.0 (Non-commercial art recommendation service)',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
    };
  }

  // 딜레이 함수
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 갤러리 목록 페이지에서 링크 추출
  async fetchGalleryLinks(pageNum = 1) {
    try {
      const url = pageNum === 1
        ? `${this.baseUrl}/galleries/`
        : `${this.baseUrl}/galleries/page/${pageNum}/`;

      console.log(`📡 Fetching gallery list page ${pageNum}...`);

      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const links = [];

      // 갤러리 링크 추출 (다양한 가능한 선택자)
      $('a[href*="/galleries/"]').each((i, elem) => {
        const href = $(elem).attr('href');
        // /galleries/갤러리명/ 형식의 링크만 추출
        if (href && href.match(/\/galleries\/[^\/]+\/$/)) {
          if (!links.includes(href)) {
            links.push(href);
          }
        }
      });

      // /galleries/ 자체 링크는 제외
      const galleryLinks = links.filter(link => link !== '/galleries/');

      console.log(`  ✅ Found ${galleryLinks.length} gallery links`);
      return galleryLinks;

    } catch (error) {
      console.error(`  ❌ Error fetching page ${pageNum}:`, error.message);
      return [];
    }
  }

  // 개별 갤러리 상세 정보 크롤링
  async fetchGalleryDetail(galleryPath) {
    try {
      const url = galleryPath.startsWith('http')
        ? galleryPath
        : `${this.baseUrl}${galleryPath}`;

      console.log(`  🏛️  Fetching: ${url}`);
      await this.sleep(this.delay);

      const response = await axios.get(url, {
        headers: this.getHeaders(),
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const content = $('.entry-content, .content, main').text();

      // 정보 추출
      const gallery = {
        // 갤러리 이름 추출
        name_ko: $('h1, .entry-title').first().text().trim() ||
                 galleryPath.split('/').filter(p => p).pop().replace(/-/g, ' '),

        // 주소 추출 (다양한 패턴)
        address: this.extractAddress(content, $),

        // 전화번호 추출
        phone: this.extractPhone(content, $),

        // 이메일 추출
        email: this.extractEmail(content, $),

        // 웹사이트 추출
        website: this.extractWebsite(content, $),

        // 운영시간 추출
        operating_hours: this.extractHours(content, $),

        // 대표자명 추출
        representative: this.extractRepresentative(content, $),

        // 메타 정보
        source_url: url,
        crawled_at: new Date().toISOString()
      };

      // venue_id 생성 (영문 변환 또는 한글 그대로)
      gallery.venue_id = this.generateVenueId(gallery.name_ko);
      gallery.name_en = this.extractEnglishName($, gallery.name_ko);

      return gallery;

    } catch (error) {
      console.error(`    ❌ Error fetching detail:`, error.message);
      return null;
    }
  }

  // 주소 추출
  extractAddress(text, $) {
    // 패턴 1: "서울" 또는 도시명으로 시작하는 주소
    const addressPattern = /(서울|경기|부산|대구|인천|광주|대전|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주)[^\n\r,]+/;
    const match = text.match(addressPattern);

    if (match) return match[0].trim();

    // 패턴 2: 구조화된 HTML에서 추출
    const addressElement = $('*:contains("주소"), *:contains("Address"), *:contains("Location")').parent();
    if (addressElement.length) {
      return addressElement.text().replace(/주소|Address|Location|:/g, '').trim();
    }

    return null;
  }

  // 전화번호 추출
  extractPhone(text, $) {
    // 다양한 전화번호 패턴
    const phonePatterns = [
      /(\+82[\s-]?)?0?\d{1,2}[\s-]?\d{3,4}[\s-]?\d{4}/,
      /\d{2,3}-\d{3,4}-\d{4}/
    ];

    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim();
    }

    return null;
  }

  // 이메일 추출
  extractEmail(text, $) {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(emailPattern);
    return match ? match[0].trim() : null;
  }

  // 웹사이트 추출
  extractWebsite(text, $) {
    // href에서 외부 링크 찾기
    const links = $('a[href^="http"]').map((i, el) => $(el).attr('href')).get();
    const externalLinks = links.filter(link =>
      !link.includes('koreagalleries.or.kr') &&
      !link.includes('facebook') &&
      !link.includes('instagram') &&
      !link.includes('twitter')
    );

    if (externalLinks.length > 0) {
      return externalLinks[0];
    }

    // 텍스트에서 www 패턴 찾기
    const wwwPattern = /www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const match = text.match(wwwPattern);
    return match ? `https://${match[0]}` : null;
  }

  // 운영시간 추출
  extractHours(text, $) {
    const hoursPatterns = [
      /\d{1,2}:\d{2}\s*[-~]\s*\d{1,2}:\d{2}/,
      /\d{1,2}(am|pm|AM|PM)\s*[-~]\s*\d{1,2}(am|pm|AM|PM)/
    ];

    for (const pattern of hoursPatterns) {
      const match = text.match(pattern);
      if (match) return match[0].trim();
    }

    return null;
  }

  // 대표자명 추출
  extractRepresentative(text, $) {
    const repPatterns = [
      /대표\s*[:：]\s*([가-힣\s]+)/,
      /관장\s*[:：]\s*([가-힣\s]+)/,
      /Director\s*[:：]\s*([A-Za-z\s]+)/
    ];

    for (const pattern of repPatterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }

    return null;
  }

  // 영문 이름 추출
  extractEnglishName($, koreanName) {
    // 페이지에서 영문 이름 찾기
    const englishPattern = /[A-Z][a-z]+(\s+[A-Z][a-z]+)*/g;
    const pageText = $('body').text();
    const matches = pageText.match(englishPattern);

    if (matches) {
      // 갤러리 관련 단어가 포함된 것 찾기
      const galleryNames = matches.filter(m =>
        m.toLowerCase().includes('gallery') ||
        m.toLowerCase().includes('art')
      );
      if (galleryNames.length > 0) {
        return galleryNames[0];
      }
    }

    // 못 찾으면 한글 이름 그대로 반환
    return koreanName;
  }

  // venue_id 생성
  generateVenueId(name) {
    // 특수문자 제거, 공백을 언더스코어로 변경, 대문자로
    return name
      .replace(/[^\w\s가-힣]/g, '')
      .replace(/\s+/g, '_')
      .toUpperCase()
      .substring(0, 50); // 최대 50자
  }

  // 전체 크롤링 실행
  async crawl(maxPages = 2) {
    console.log('🚀 Starting Korea Galleries Venue Crawler');
    console.log('⚖️  Following robots.txt rules');
    console.log('⏱️  Using 1.5s delay between requests\n');

    const allLinks = [];

    // 1. 모든 갤러리 링크 수집
    for (let page = 1; page <= maxPages; page++) {
      const links = await this.fetchGalleryLinks(page);
      allLinks.push(...links);

      if (page < maxPages && links.length > 0) {
        console.log('  ⏸️  Waiting before next page...');
        await this.sleep(2000);
      }
    }

    // 중복 제거
    const uniqueLinks = [...new Set(allLinks)];
    console.log(`\n📋 Total unique galleries to fetch: ${uniqueLinks.length}\n`);

    // 2. 각 갤러리 상세 정보 수집
    for (const link of uniqueLinks) {
      const gallery = await this.fetchGalleryDetail(link);
      if (gallery) {
        this.galleries.push(gallery);
        console.log(`    ✅ ${gallery.name_ko} - Data collected`);
      }
    }

    console.log(`\n✨ Crawling complete! Total: ${this.galleries.length} galleries`);
    return this.galleries;
  }

  // Supabase venues 테이블에 업데이트
  async updateSupabase() {
    console.log('\n📤 Updating Supabase venues table...');

    let successCount = 0;
    let errorCount = 0;

    for (const gallery of this.galleries) {
      const venueData = {
        venue_id: gallery.venue_id,
        name_ko: gallery.name_ko,
        name_en: gallery.name_en || gallery.name_ko,
        address: gallery.address,
        phone: gallery.phone,
        website: gallery.website,
        email: gallery.email,
        operating_hours: gallery.operating_hours,
        representative: gallery.representative,
        updated_at: new Date().toISOString()
      };

      try {
        const { error } = await this.supabase
          .from('venues')
          .upsert(venueData, {
            onConflict: 'venue_id',
            ignoreDuplicates: false
          });

        if (error) {
          console.error(`  ❌ ${gallery.name_ko}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`  ✅ ${gallery.name_ko} updated`);
          successCount++;
        }
      } catch (error) {
        console.error(`  ❌ ${gallery.name_ko}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Update complete: ${successCount} success, ${errorCount} failed`);
    return { successCount, errorCount };
  }

  // 결과를 JSON 파일로 저장
  async saveToFile() {
    const fs = require('fs').promises;
    const filename = `venues-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify(this.galleries, null, 2));
    console.log(`💾 Data saved to ${filename}`);
    return filename;
  }
}

// 실행
async function main() {
  const crawler = new KoreaGalleriesVenueCrawler();

  // 1. 크롤링 (2페이지만 테스트)
  await crawler.crawl(2);

  // 2. 파일 저장
  await crawler.saveToFile();

  // 3. Supabase 업데이트
  const result = await crawler.updateSupabase();

  console.log('\n✅ Process complete!');
}

// 실행 (주석 해제하여 사용)
// main().catch(console.error);

module.exports = KoreaGalleriesVenueCrawler;