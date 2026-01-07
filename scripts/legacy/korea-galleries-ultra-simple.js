const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 매우 단순한 021갤러리 테스트 크롤러
 * 정확한 선택자로 실제 정보 추출 확인
 */

async function testSingleGallery() {
  const url = 'https://koreagalleries.or.kr/galleries/021갤러리/';

  console.log('🧪 021갤러리 단일 테스트');
  console.log('URL:', url);
  console.log('=' .repeat(50));

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    console.log('\n📋 HTML 구조 분석:');
    console.log('Title:', $('title').text());

    // li 요소들에서 정보 추출
    console.log('\n📞 전화번호 섹션:');
    $('li:contains("전화번호")').each((i, elem) => {
      const text = $(elem).text();
      console.log(`  - ${text}`);

      const phoneMatch = text.match(/(\d{2,3}[-\s]?\d{3,4}[-\s]?\d{4})/);
      if (phoneMatch) {
        console.log(`  ✅ 추출된 전화번호: ${phoneMatch[1]}`);
      }
    });

    console.log('\n📧 이메일 섹션:');
    $('li:contains("이메일")').each((i, elem) => {
      const text = $(elem).text();
      console.log(`  - ${text}`);

      const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) {
        console.log(`  ✅ 추출된 이메일: ${emailMatch[0]}`);
      }
    });

    console.log('\n🌐 웹사이트 섹션:');
    $('li:contains("웹사이트")').each((i, elem) => {
      const $elem = $(elem);
      const text = $elem.text();
      const link = $elem.find('a').attr('href');

      console.log(`  - 텍스트: ${text}`);
      console.log(`  - 링크: ${link}`);

      if (link) {
        console.log(`  ✅ 추출된 웹사이트: ${link}`);
      }
    });

    console.log('\n📍 위치 섹션:');
    $('li:contains("위치")').each((i, elem) => {
      const text = $(elem).text();
      console.log(`  - ${text}`);

      // 한국 주소 추출
      const addressMatch = text.match(/(대구광역시[^\/\n]*)/);
      if (addressMatch) {
        console.log(`  ✅ 추출된 주소: ${addressMatch[1]}`);
      }
    });

    console.log('\n🏷️  갤러리 이름:');
    // URL에서 이름 추출
    const nameFromUrl = decodeURIComponent(url.split('/').slice(-2)[0]);
    console.log(`  ✅ URL에서 추출: ${nameFromUrl}`);

  } catch (error) {
    console.error('❌ 오류:', error.message);
  }
}

testSingleGallery();