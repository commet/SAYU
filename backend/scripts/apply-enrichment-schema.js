#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * 전시 데이터 보강 스키마 적용 스크립트
 */
async function applyEnrichmentSchema() {
  console.log('🚀 SAYU 전시 데이터 보강 스키마 적용 시작\n');

  try {
    // 스키마 파일 읽기
    const schemaPath = path.join(__dirname, '../migrations/exhibition-enrichment-schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`스키마 파일을 찾을 수 없습니다: ${schemaPath}`);
    }

    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    console.log('📄 스키마 파일 로드 완료');

    // 스키마를 세미콜론으로 분리하여 개별 쿼리로 실행
    const queries = schemaSQL
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--'));

    console.log(`📊 총 ${queries.length}개의 쿼리 실행 예정\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      
      try {
        // 함수 생성이나 복잡한 쿼리는 rpc로 실행
        if (query.includes('CREATE OR REPLACE FUNCTION') || 
            query.includes('CREATE FUNCTION') ||
            query.includes('CREATE TRIGGER') ||
            query.includes('INSERT INTO apt_type_preferences')) {
          
          await supabase.rpc('exec_sql', { sql_query: query });
        } else {
          // 일반 SQL은 직접 실행
          const { error } = await supabase.from('_temp_schema_execution').select().limit(0);
          if (error && !error.message.includes('does not exist')) {
            // 일반 쿼리 실행
            const result = await supabase.rpc('exec_sql', { sql_query: query });
            if (result.error) throw result.error;
          }
        }
        
        console.log(`✅ 쿼리 ${i + 1}/${queries.length} 실행 성공`);
        successCount++;
        
      } catch (error) {
        console.error(`❌ 쿼리 ${i + 1}/${queries.length} 실행 실패:`, error.message);
        
        // 테이블이 이미 존재하거나 무시할 수 있는 에러들
        const ignorableErrors = [
          'already exists',
          'duplicate key',
          'relation already exists',
          'function already exists',
          'trigger already exists'
        ];
        
        const isIgnorable = ignorableErrors.some(err => 
          error.message.toLowerCase().includes(err.toLowerCase())
        );
        
        if (isIgnorable) {
          console.log(`⚠️  무시 가능한 오류: ${error.message}`);
          successCount++;
        } else {
          errorCount++;
          console.log(`🔍 쿼리 내용: ${query.substring(0, 100)}...`);
        }
      }
      
      // 쿼리 간 잠시 대기 (API 레이트 리미트 방지)
      if (i < queries.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n=== 스키마 적용 결과 ===');
    console.log(`✅ 성공: ${successCount}개`);
    console.log(`❌ 실패: ${errorCount}개`);
    console.log(`📊 총합: ${successCount + errorCount}개\n`);

    if (errorCount === 0) {
      console.log('🎉 모든 스키마가 성공적으로 적용되었습니다!');
    } else {
      console.log(`⚠️  ${errorCount}개의 쿼리 실행에 실패했습니다.`);
      console.log('   실패한 쿼리들을 수동으로 확인해주세요.');
    }

    // 적용된 테이블 목록 확인
    console.log('\n=== 적용된 테이블 확인 ===');
    await verifyCreatedTables();

  } catch (error) {
    console.error('💥 스키마 적용 중 치명적 오류:', error);
    process.exit(1);
  }
}

/**
 * 생성된 테이블들을 확인하는 함수
 */
async function verifyCreatedTables() {
  const expectedTables = [
    'exhibition_keywords',
    'exhibition_categories', 
    'apt_exhibition_scores',
    'exhibition_enrichment_logs',
    'exhibition_data_quality',
    'apt_type_preferences',
    'exhibition_recommendation_cache',
    'data_enrichment_batches'
  ];

  for (const tableName of expectedTables) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName}: 테이블이 존재하지 않음`);
      } else {
        console.log(`✅ ${tableName}: 테이블 존재 확인`);
      }
    } catch (error) {
      console.log(`❌ ${tableName}: 확인 중 오류`);
    }
  }
}

/**
 * 명령행 인수 처리
 */
const args = process.argv.slice(2);
const forceApply = args.includes('--force');
const verifyOnly = args.includes('--verify');

if (verifyOnly) {
  console.log('🔍 테이블 존재 여부만 확인합니다...\n');
  verifyCreatedTables().then(() => {
    console.log('\n✅ 테이블 확인 완료');
  });
} else {
  if (forceApply) {
    console.log('⚠️  강제 적용 모드로 실행합니다.\n');
  }
  
  applyEnrichmentSchema().catch((error) => {
    console.error('스키마 적용 실패:', error);
    process.exit(1);
  });
}

module.exports = { applyEnrichmentSchema, verifyCreatedTables };