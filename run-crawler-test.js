const KoreaGalleriesFinalCrawler = require('./korea-galleries-final-crawler');

async function runTest() {
  console.log('🧪 한국화랑협회 크롤러 테스트 시작\n');
  console.log('=' .repeat(50));
  console.log('테스트 모드: DB 업데이트 없음');
  console.log('페이지: 1개만 크롤링');
  console.log('=' .repeat(50) + '\n');

  const crawler = new KoreaGalleriesFinalCrawler();

  // 테스트 모드 확인
  crawler.setTestMode(true);

  // 1페이지만 크롤링
  await crawler.crawl(1);

  console.log('\n\n💡 다음 단계:');
  console.log('1. 위 결과 확인');
  console.log('2. 실제 업데이트하려면:');
  console.log('   - crawler.setTestMode(false)');
  console.log('   - crawler.crawl(5) // 5페이지 크롤링');
}

runTest().catch(console.error);