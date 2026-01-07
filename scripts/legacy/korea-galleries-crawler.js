const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

// 한국화랑협회 갤러리 정보 수집기
// robots.txt 준수: /wp-admin/ 접근 금지, 나머지 허용

class KoreaGalleriesCrawler {
  constructor() {
    this.baseUrl = 'https://koreagalleries.or.kr';
    this.galleries = [];
    this.delay = 1500; // 1.5초 딜레이 (서버 부하 방지)
  }

  // User-Agent 설정 (robots.txt 준수)
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

  // 갤러리 목록 페이지 크롤링
  async fetchGalleryList(pageNum = 1) {
    try {
      const url = `${this.baseUrl}/galleries/page/${pageNum}/`;
      console.log(`📡 Fetching page ${pageNum}: ${url}`);

      const response = await axios.get(url, {
        headers: this.getHeaders()
      });

      const $ = cheerio.load(response.data);
      const galleryItems = [];

      // 갤러리 목록 추출 (실제 HTML 구조에 따라 수정 필요)
      $('.gallery-item, .gallery-list-item, article').each((index, element) => {
        const $el = $(element);

        const gallery = {
          name_ko: $el.find('.gallery-title, h2, h3').text().trim(),
          link: $el.find('a').attr('href'),
          thumbnail: $el.find('img').attr('src') || $el.find('img').attr('data-src')
        };

        if (gallery.name_ko && gallery.link) {
          galleryItems.push(gallery);
        }
      });

      console.log(`✅ Found ${galleryItems.length} galleries on page ${pageNum}`);
      return galleryItems;

    } catch (error) {
      console.error(`❌ Error fetching page ${pageNum}:`, error.message);
      return [];
    }
  }

  // 개별 갤러리 상세 정보 크롤링
  async fetchGalleryDetail(galleryUrl) {
    try {
      const fullUrl = galleryUrl.startsWith('http') ? galleryUrl : `${this.baseUrl}${galleryUrl}`;
      console.log(`  📍 Fetching details: ${fullUrl}`);

      await this.sleep(this.delay); // 서버 부하 방지

      const response = await axios.get(fullUrl, {
        headers: this.getHeaders()
      });

      const $ = cheerio.load(response.data);

      // 상세 정보 추출 (실제 HTML 구조에 따라 수정 필요)
      const details = {
        address: $('.address, .gallery-address, .location').text().trim(),
        phone: $('.phone, .tel, .contact-phone').text().trim(),
        website: $('.website a, .gallery-website a').attr('href'),
        email: $('.email, .contact-email').text().trim(),
        operating_hours: $('.hours, .opening-hours, .business-hours').text().trim(),
        description: $('.description, .gallery-description, .about').text().trim()
      };

      // 메타 태그에서 추가 정보 추출
      $('meta').each((i, el) => {
        const property = $(el).attr('property');
        const content = $(el).attr('content');

        if (property === 'og:description' && !details.description) {
          details.description = content;
        }
      });

      return details;

    } catch (error) {
      console.error(`  ❌ Error fetching details:`, error.message);
      return {};
    }
  }

  // 전체 크롤링 실행
  async crawl(maxPages = 3) {
    console.log('🚀 Starting Korea Galleries Crawler...');
    console.log('⚖️  Following robots.txt rules');
    console.log('⏱️  Using 1.5s delay between requests\n');

    for (let page = 1; page <= maxPages; page++) {
      const galleries = await this.fetchGalleryList(page);

      for (const gallery of galleries) {
        const details = await this.fetchGalleryDetail(gallery.link);

        this.galleries.push({
          ...gallery,
          ...details,
          source: 'koreagalleries.or.kr',
          crawled_at: new Date().toISOString()
        });

        console.log(`  ✅ ${gallery.name_ko} - Data collected`);
      }

      if (page < maxPages) {
        console.log(`\n⏸️  Waiting before next page...`);
        await this.sleep(3000); // 페이지 간 3초 대기
      }
    }

    console.log(`\n✨ Crawling complete! Total: ${this.galleries.length} galleries`);
    return this.galleries;
  }

  // 결과 저장
  async saveResults() {
    const filename = `korea-galleries-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(filename, JSON.stringify(this.galleries, null, 2));
    console.log(`💾 Results saved to ${filename}`);
    return filename;
  }

  // Supabase venues 테이블 형식으로 변환
  transformToVenueFormat() {
    return this.galleries.map(gallery => ({
      venue_id: gallery.name_ko.replace(/\s+/g, '_').toUpperCase(),
      name_ko: gallery.name_ko,
      name_en: gallery.name_en || gallery.name_ko,
      address: gallery.address,
      phone: gallery.phone,
      website: gallery.website,
      instagram: gallery.instagram || null,
      operating_hours: gallery.operating_hours,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  }
}

// 사용 예시
async function main() {
  const crawler = new KoreaGalleriesCrawler();

  // 테스트: 첫 페이지만 크롤링
  console.log('🧪 Test mode: Crawling first page only\n');
  const galleries = await crawler.crawl(1);

  if (galleries.length > 0) {
    await crawler.saveResults();

    // Supabase 형식으로 변환
    const venues = crawler.transformToVenueFormat();
    console.log('\n📊 Sample venue data:', venues.slice(0, 2));
  }
}

// 실행
// main().catch(console.error);

module.exports = KoreaGalleriesCrawler;