const { createClient } = require('@supabase/supabase-js');
const KoreaGalleriesCrawler = require('./korea-galleries-crawler');
const AIDescriptionGenerator = require('./ai-description-generator');
require('dotenv').config();

/**
 * SAYU 전시 정보 자동화 시스템
 *
 * 기능:
 * 1. 한국화랑협회에서 갤러리 정보 수집 (합법적)
 * 2. 기존 전시 데이터와 매칭
 * 3. AI를 활용한 description 생성
 * 4. 수동 검토 후 DB 업데이트
 */

class AutomatedExhibitionSystem {
  constructor() {
    this.supabase = createClient(
      'https://hgltvdshuyfffskvjmst.supabase.co',
      process.env.SUPABASE_SERVICE_KEY
    );
    this.crawler = new KoreaGalleriesCrawler();
    this.aiGenerator = new AIDescriptionGenerator();
  }

  // 1단계: Description이 없는 전시 목록 조회
  async getExhibitionsWithoutDescription() {
    console.log('📋 Fetching exhibitions without descriptions...');

    const { data, error } = await this.supabase
      .from('exhibitions_translations')
      .select('*')
      .eq('language_code', 'ko')
      .or('description.is.null,description.eq.""')
      .limit(100);

    if (error) {
      console.error('Error fetching exhibitions:', error);
      return [];
    }

    console.log(`Found ${data.length} exhibitions without descriptions`);
    return data;
  }

  // 2단계: 갤러리 정보 보충
  async enrichVenueData() {
    console.log('\n🏛️  Enriching venue data from Korea Galleries Association...');

    // 한국화랑협회에서 갤러리 정보 크롤링
    const galleries = await this.crawler.crawl(2); // 2페이지만 테스트

    // venues 테이블과 매칭
    const venues = this.crawler.transformToVenueFormat();

    let updatedCount = 0;
    for (const venue of venues) {
      const { error } = await this.supabase
        .from('venues')
        .upsert(venue, { onConflict: 'venue_id' });

      if (!error) {
        updatedCount++;
      }
    }

    console.log(`✅ Updated ${updatedCount} venue records`);
    return venues;
  }

  // 3단계: AI를 활용한 description 생성
  async generateDescriptions(exhibitions) {
    console.log('\n🤖 Generating AI descriptions...');

    // 전시 정보 포맷팅
    const formattedExhibitions = exhibitions.map(ex => ({
      id: ex.exhibition_id,
      title: ex.exhibition_title,
      artist: ex.artists ? ex.artists.join(', ') : null,
      venue: ex.venue_name,
      start_date: ex.start_date,
      end_date: ex.end_date,
      curator: ex.curator
    }));

    // AI 생성
    const descriptions = await this.aiGenerator.generateBatchDescriptions(
      formattedExhibitions.slice(0, 10) // 처음 10개만 테스트
    );

    return descriptions;
  }

  // 4단계: 수동 검토 인터페이스 생성
  async createReviewInterface(descriptions) {
    console.log('\n📝 Creating review interface...');

    const reviewFile = await this.aiGenerator.generatePreview(
      descriptions,
      'exhibition-descriptions-review.html'
    );

    console.log(`✅ Review interface created: ${reviewFile}`);
    console.log('   Please review and approve descriptions before database update');

    return reviewFile;
  }

  // 5단계: 승인된 descriptions DB 업데이트
  async updateApprovedDescriptions(approvedIds) {
    console.log('\n💾 Updating approved descriptions...');

    // approvedIds는 검토 후 승인된 exhibition_id 배열
    const descriptions = await this.loadApprovedDescriptions(approvedIds);

    const result = await this.aiGenerator.updateDatabase(descriptions);

    console.log(`✅ Update complete: ${result.successCount} success, ${result.errorCount} failed`);
    return result;
  }

  // 통합 실행 함수
  async run(options = {}) {
    const {
      enrichVenues = false,
      generateAI = true,
      autoUpdate = false,
      limit = 10
    } = options;

    console.log('🚀 Starting SAYU Automated Exhibition System');
    console.log('=====================================\n');

    try {
      // 1. 갤러리 정보 보충 (선택적)
      if (enrichVenues) {
        await this.enrichVenueData();
      }

      // 2. Description 없는 전시 조회
      const exhibitions = await this.getExhibitionsWithoutDescription();

      if (exhibitions.length === 0) {
        console.log('✨ All exhibitions have descriptions!');
        return;
      }

      // 3. AI Description 생성
      if (generateAI) {
        const descriptions = await this.generateDescriptions(
          exhibitions.slice(0, limit)
        );

        // 4. 검토 인터페이스 생성
        const reviewFile = await this.createReviewInterface(descriptions);

        // 5. 자동 업데이트 (위험: 검토 없이 업데이트)
        if (autoUpdate) {
          console.log('\n⚠️  Auto-update enabled - updating without review');
          await this.aiGenerator.updateDatabase(descriptions);
        } else {
          console.log('\n📌 Next steps:');
          console.log(`   1. Open ${reviewFile} in browser`);
          console.log('   2. Review and edit descriptions');
          console.log('   3. Run updateApprovedDescriptions() with approved IDs');
        }
      }

      console.log('\n✅ Process complete!');

    } catch (error) {
      console.error('❌ System error:', error);
    }
  }

  // 통계 및 진행 상황 리포트
  async generateReport() {
    console.log('\n📊 Generating progress report...');

    const { data: totalExhibitions } = await this.supabase
      .from('exhibitions_translations')
      .select('exhibition_id', { count: 'exact' })
      .eq('language_code', 'ko');

    const { data: withDescription } = await this.supabase
      .from('exhibitions_translations')
      .select('exhibition_id', { count: 'exact' })
      .eq('language_code', 'ko')
      .not('description', 'is', null)
      .not('description', 'eq', '');

    const total = totalExhibitions?.length || 0;
    const completed = withDescription?.length || 0;
    const remaining = total - completed;
    const progress = ((completed / total) * 100).toFixed(1);

    const report = `
========================================
SAYU Exhibition Data Progress Report
========================================

📈 Overall Progress: ${progress}%

✅ Completed:  ${completed} exhibitions
⏳ Remaining:  ${remaining} exhibitions
📊 Total:      ${total} exhibitions

Estimated completion:
- Manual entry: ${Math.ceil(remaining * 5 / 60)} hours
- With AI assistance: ${Math.ceil(remaining * 1 / 60)} hours
- Full automation: ${Math.ceil(remaining * 0.2 / 60)} hours

========================================
    `;

    console.log(report);
    return { total, completed, remaining, progress };
  }
}

// 사용 예시
async function main() {
  const system = new AutomatedExhibitionSystem();

  // 옵션 설정
  const options = {
    enrichVenues: false,  // 갤러리 정보 크롤링 여부
    generateAI: true,     // AI description 생성 여부
    autoUpdate: false,    // 자동 DB 업데이트 (위험!)
    limit: 5             // 처리할 전시 개수
  };

  // 시스템 실행
  await system.run(options);

  // 진행 상황 리포트
  await system.generateReport();
}

// 실행 (주석 해제하여 사용)
// main().catch(console.error);

module.exports = AutomatedExhibitionSystem;