const KoreaGalleriesCorrectCrawler = require('./korea-galleries-correct-crawler');

async function runAllPagesCrawler() {
  console.log('🚀 전체 페이지 크롤러 실행\n');
  console.log('=' .repeat(50));
  console.log('⚠️  실제 DB 업데이트 모드');
  console.log('✅ 2~8페이지 모든 갤러리 처리');
  console.log('✅ PKM 방식으로 실제 정보 추출');
  console.log('=' .repeat(50) + '\n');

  const crawler = new KoreaGalleriesCorrectCrawler();

  // 실제 모드 (DB 업데이트)
  crawler.setTestMode(false);

  // 전체 8페이지 처리 (1페이지는 이미 했으므로 총 7페이지 더)
  console.log('📋 처리 계획:');
  console.log('   - 1페이지: ✅ 완료 (24개 갤러리)');
  console.log('   - 2~8페이지: 🔄 진행 예정\n');

  await crawler.crawl(8); // 전체 8페이지 처리

  console.log('\n\n🎉 전체 갤러리 크롤링 완료!');
  console.log('📊 모든 한국화랑협회 갤러리 정보가 업데이트되었습니다.');
}

runAllPagesCrawler().catch(console.error);