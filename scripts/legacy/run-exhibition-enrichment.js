#!/usr/bin/env node

/**
 * SAYU 전시 데이터 보강 시스템 실행 스크립트
 * 
 * 사용법:
 * node run-exhibition-enrichment.js [옵션]
 * 
 * 옵션:
 * --setup          스키마 및 초기 설정 실행
 * --enrich         데이터 보강 실행  
 * --report         품질 리포트 생성
 * --batch=10       배치 크기 설정 (기본: 10)
 * --max=3          최대 배치 수 설정 (기본: 3)
 * --help           도움말 표시
 */

const { createClient } = require('@supabase/supabase-js');
const ExhibitionEnricher = require('./backend/src/services/exhibitionEnricher');
require('dotenv').config();

// 명령행 인수 파싱
const args = process.argv.slice(2);
const hasFlag = (flag) => args.includes(flag);
const getFlag = (flag) => {
  const arg = args.find(arg => arg.startsWith(`${flag}=`));
  return arg ? arg.split('=')[1] : null;
};

const setup = hasFlag('--setup');
const enrich = hasFlag('--enrich');
const report = hasFlag('--report');
const help = hasFlag('--help');
const batchSize = parseInt(getFlag('--batch')) || 10;
const maxBatches = parseInt(getFlag('--max')) || 3;

// 도움말 표시
if (help || args.length === 0) {
  console.log(`
🎨 SAYU 전시 데이터 보강 시스템

사용법:
  node run-exhibition-enrichment.js [옵션]

옵션:
  --setup                스키마 생성 및 초기 설정
  --enrich               데이터 보강 배치 실행
  --report               데이터 품질 리포트 생성
  --batch=N              배치 크기 설정 (기본: 10)
  --max=N                최대 배치 수 설정 (기본: 3)
  --help                 이 도움말 표시

예시:
  node run-exhibition-enrichment.js --setup
  node run-exhibition-enrichment.js --enrich --batch=5 --max=2
  node run-exhibition-enrichment.js --report
  node run-exhibition-enrichment.js --setup --enrich --report

환경변수 요구사항:
  SUPABASE_URL           Supabase 프로젝트 URL
  SUPABASE_SERVICE_KEY   Supabase 서비스 키 (admin 권한)
  GEMINI_API_KEY         Google Gemini AI API 키
  NMMA_API_KEY           국립현대미술관 API 키 (선택)
  SEOUL_MUSEUM_API_KEY   서울시립미술관 API 키 (선택)
`);
  process.exit(0);
}

/**
 * 환경변수 검증
 */
function validateEnvironment() {
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'GEMINI_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ 필수 환경변수가 설정되지 않았습니다:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n.env 파일을 확인하거나 환경변수를 설정해주세요.');
    process.exit(1);
  }
  
  console.log('✅ 환경변수 검증 완료\n');
}

/**
 * 스키마 설정 실행
 */
async function runSetup() {
  console.log('🔧 스키마 및 초기 설정을 실행합니다...\n');
  
  try {
    const { applyEnrichmentSchema } = require('./backend/scripts/apply-enrichment-schema');
    await applyEnrichmentSchema();
    console.log('✅ 스키마 설정 완료\n');
  } catch (error) {
    console.error('❌ 스키마 설정 실패:', error.message);
    throw error;
  }
}

/**
 * 데이터 보강 실행
 */
async function runEnrichment() {
  console.log(`🎨 데이터 보강을 실행합니다... (배치: ${batchSize}, 최대: ${maxBatches})\n`);
  
  try {
    const enricher = new ExhibitionEnricher();
    const result = await enricher.runBatchEnrichment(batchSize, maxBatches);
    
    console.log('\n✅ 데이터 보강 완료!');
    console.log(`   - 처리된 전시: ${result.processed}개`);
    console.log(`   - 성공: ${result.success}개`);  
    console.log(`   - 실패: ${result.failed}개`);
    console.log(`   - 성공률: ${result.successRate.toFixed(1)}%\n`);
    
    return result;
  } catch (error) {
    console.error('❌ 데이터 보강 실패:', error.message);
    throw error;
  }
}

/**
 * 품질 리포트 생성
 */
async function runReport() {
  console.log('📊 데이터 품질 리포트를 생성합니다...\n');
  
  try {
    const enricher = new ExhibitionEnricher();
    const report = await enricher.generateQualityReport();
    
    if (!report) {
      throw new Error('리포트 생성 실패');
    }
    
    console.log('✅ 품질 리포트 생성 완료\n');
    return report;
  } catch (error) {
    console.error('❌ 품질 리포트 생성 실패:', error.message);
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  console.log('🚀 SAYU 전시 데이터 보강 시스템 시작\n');
  console.log(`실행 시간: ${new Date().toLocaleString('ko-KR')}\n`);
  
  // 환경변수 검증
  validateEnvironment();
  
  const startTime = Date.now();
  
  try {
    // 단계별 실행
    if (setup) {
      await runSetup();
    }
    
    if (enrich) {
      await runEnrichment();
    }
    
    if (report) {
      await runReport();
    }
    
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);
    
    console.log('🎉 모든 작업이 성공적으로 완료되었습니다!');
    console.log(`📈 총 실행 시간: ${duration}초\n`);
    
    // 추가 안내
    console.log('💡 추가 정보:');
    console.log('   - 관리자 대시보드: /admin/data-enrichment');
    console.log('   - API 문서: /api/exhibitions/enrich/*');
    console.log('   - 로그 파일: backend/logs/');
    
  } catch (error) {
    console.error('\n💥 실행 중 오류가 발생했습니다:');
    console.error(error.message);
    console.error('\n디버깅을 위한 정보:');
    console.error(`   - 실행 명령: ${process.argv.join(' ')}`);
    console.error(`   - 환경: ${process.env.NODE_ENV || 'development'}`);
    process.exit(1);
  }
}

// 프로세스 신호 핸들링
process.on('SIGINT', () => {
  console.log('\n⚠️  사용자에 의해 중단되었습니다.');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  시스템에 의해 종료되었습니다.');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 예상치 못한 오류:', error);
  process.exit(1);
});

// 메인 함수 실행
if (require.main === module) {
  main().catch((error) => {
    console.error('실행 실패:', error);
    process.exit(1);
  });
}

module.exports = {
  runSetup,
  runEnrichment, 
  runReport,
  validateEnvironment
};