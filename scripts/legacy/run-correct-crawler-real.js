const KoreaGalleriesCorrectCrawler = require('./korea-galleries-correct-crawler');

async function runRealCrawler() {
  console.log('🚀 정확한 크롤러 실제 모드 실행\n');
  console.log('=' .repeat(50));
  console.log('⚠️  실제 DB 업데이트 모드');
  console.log('✅ 개별 갤러리 페이지 접속');
  console.log('✅ PKM 방식으로 실제 정보 추출');
  console.log('📄 첫 페이지 전체 갤러리 처리');
  console.log('=' .repeat(50) + '\n');

  const crawler = new KoreaGalleriesCorrectCrawler();

  // 실제 모드 (DB 업데이트)
  crawler.setTestMode(false);

  // 1페이지 전체 갤러리 처리
  await crawler.crawl(1);

  console.log('\n\n🎉 첫 페이지 크롤링 완료!');
  console.log('📊 결과를 확인하고 추가 페이지 실행 여부를 결정하세요.');
}

runRealCrawler().catch(console.error);