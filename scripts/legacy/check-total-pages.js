const axios = require('axios');
const cheerio = require('cheerio');

async function checkTotalPages() {
  console.log('📊 한국화랑협회 전체 페이지 수 확인 중...\n');

  try {
    const response = await axios.get('https://koreagalleries.or.kr/galleries/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);

    // 페이지네이션에서 마지막 페이지 번호 찾기
    const paginationLinks = [];
    $('.pagination a, .pagination span').each((i, elem) => {
      const text = $(elem).text().trim();
      if (/^\d+$/.test(text)) {
        paginationLinks.push(parseInt(text));
      }
    });

    const maxPage = Math.max(...paginationLinks);
    console.log(`📄 발견된 페이지 번호들: ${paginationLinks.join(', ')}`);
    console.log(`📈 최대 페이지 번호: ${maxPage}`);

    // 첫 페이지에서 갤러리 수 확인
    const firstPageGalleries = $('a[href*="/galleries/"]').length;
    console.log(`🏛️  첫 페이지 갤러리 링크 수: ${firstPageGalleries}개`);

    // 2페이지도 확인해보기
    console.log('\n🔍 2페이지 확인 중...');
    const page2Response = await axios.get('https://koreagalleries.or.kr/galleries/page/2/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $page2 = cheerio.load(page2Response.data);
    const page2Galleries = $page2('a[href*="/galleries/"]').filter((i, elem) => {
      const link = $page2(elem).attr('href');
      return link &&
             link.includes('/galleries/') &&
             link !== '/galleries/' &&
             !link.includes('/page/') &&
             link.split('/').length >= 5;
    }).length;

    console.log(`🏛️  2페이지 갤러리 링크 수: ${page2Galleries}개`);

    // 예상 총 갤러리 수 계산
    const estimatedTotal = maxPage * 20; // 대략적인 추정
    console.log(`\n📊 예상 총 갤러리 수: ${estimatedTotal}개 (페이지당 약 20개 기준)`);

    console.log('\n💡 추천 크롤링 전략:');
    console.log(`   - 전체 ${maxPage}페이지 처리`);
    console.log(`   - 페이지당 2초 딜레이로 안전하게 진행`);
    console.log(`   - 예상 소요 시간: ${Math.ceil(maxPage * 2 / 60)}분`);

    return { maxPage, estimatedTotal };

  } catch (error) {
    console.error('❌ 페이지 확인 실패:', error.message);
    return null;
  }
}

checkTotalPages().catch(console.error);