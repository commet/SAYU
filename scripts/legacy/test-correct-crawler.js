const KoreaGalleriesCorrectCrawler = require('./korea-galleries-correct-crawler');

async function testCorrectCrawler() {
  console.log('🧪 정확한 크롤러 테스트\n');
  console.log('=' .repeat(50));
  console.log('✅ 개별 갤러리 페이지 접속');
  console.log('✅ PKM 방식으로 실제 정보 추출');
  console.log('🔸 테스트 모드: DB 업데이트 없음');
  console.log('📄 첫 페이지에서 3개 갤러리만 테스트');
  console.log('=' .repeat(50) + '\n');

  const crawler = new KoreaGalleriesCorrectCrawler();

  // 테스트 모드
  crawler.setTestMode(true);

  // 1페이지, 3개 갤러리만 테스트
  await crawler.crawl(1);

  console.log('\n\n💡 테스트 완료!');
  console.log('📊 결과가 정확하면 실제 모드로 실행하세요.');
}

testCorrectCrawler().catch(console.error);