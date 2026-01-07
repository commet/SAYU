const KoreaGalleriesFinalCrawler = require('./korea-galleries-final-crawler');

async function runProduction() {
  console.log('🚀 한국화랑협회 크롤러 실제 실행\n');
  console.log('=' .repeat(50));
  console.log('⚠️  실제 모드: Supabase DB 업데이트 활성화');
  console.log('📄 페이지: 3개 크롤링 (약 72개 갤러리)');
  console.log('⏱️  예상 시간: 약 3-5분');
  console.log('=' .repeat(50) + '\n');

  const crawler = new KoreaGalleriesFinalCrawler();

  // 실제 모드로 변경
  crawler.setTestMode(false);

  // 3페이지 크롤링 (약 72개 갤러리)
  await crawler.crawl(3);

  console.log('\n\n✅ 크롤링 및 업데이트 완료!');
  console.log('📊 Supabase venues 테이블이 업데이트되었습니다.');
}

runProduction().catch(console.error);