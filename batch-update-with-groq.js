const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');
const fs = require('fs').promises;

// Supabase 설정
const SUPABASE_URL = 'https://hgltvdshuyfffskvjmst.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

// Groq API 설정
const GROQ_API_KEY = process.env.GROQ_API_KEY || 'YOUR_GROQ_API_KEY_HERE';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const groq = new Groq({ apiKey: GROQ_API_KEY });

// 전시 설명 생성 함수
async function generateDescription(exhibition) {
  const prompt = `다음 전시에 대한 매력적이고 정보가 풍부한 설명을 한국어로 작성해주세요.
전시 제목과 장소 정보를 바탕으로 관람객의 흥미를 끌 수 있는 150-200자 내외의 설명을 작성하세요.

전시 정보:
- 제목: ${exhibition.exhibition_title}
${exhibition.subtitle ? `- 부제: ${exhibition.subtitle}` : ''}
- 장소: ${exhibition.venue_name} (${exhibition.city})
${exhibition.artists && exhibition.artists.length > 0 ? `- 작가: ${exhibition.artists.join(', ')}` : ''}

요구사항:
1. 전시의 주제나 특징을 상상력을 발휘해 설명
2. 관람객이 방문하고 싶어지도록 매력적으로 작성
3. 150-200자 내외로 간결하게
4. 한국어로 작성`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "당신은 전문 큐레이터이자 예술 비평가입니다. 전시에 대한 매력적이고 정보가 풍부한 설명을 작성합니다."
        },
        { role: "user", content: prompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens: 500
    });

    return completion.choices[0]?.message?.content?.trim();
  } catch (error) {
    console.error(`Error generating description for ${exhibition.exhibition_title}:`, error.message);
    return null;
  }
}

// 배치 처리 함수
async function processBatch(exhibitions, batchNumber) {
  console.log(`\n📦 배치 ${batchNumber} 처리 시작 (${exhibitions.length}개 전시)`);
  console.log('─'.repeat(60));
  
  const results = {
    success: [],
    failed: []
  };

  for (let i = 0; i < exhibitions.length; i++) {
    const exhibition = exhibitions[i];
    console.log(`\n[${i + 1}/${exhibitions.length}] ${exhibition.exhibition_title}`);
    
    try {
      // 1. 설명 생성
      console.log('  ⏳ 설명 생성 중...');
      const description = await generateDescription(exhibition);
      
      if (!description) {
        console.log('  ❌ 설명 생성 실패');
        results.failed.push({
          exhibition_id: exhibition.exhibition_id,
          title: exhibition.exhibition_title,
          reason: 'Description generation failed'
        });
        continue;
      }

      console.log(`  ✅ 설명 생성 완료 (${description.length}자)`);
      console.log(`  📝 ${description.substring(0, 50)}...`);

      // 2. Supabase 업데이트
      console.log('  ⏳ Supabase 업데이트 중...');
      const { error } = await supabase
        .from('exhibitions_translations')
        .update({ 
          description,
          updated_at: new Date().toISOString()
        })
        .eq('exhibition_id', exhibition.exhibition_id)
        .eq('language_code', 'ko');

      if (error) {
        console.log(`  ❌ 업데이트 실패: ${error.message}`);
        results.failed.push({
          exhibition_id: exhibition.exhibition_id,
          title: exhibition.exhibition_title,
          reason: error.message
        });
      } else {
        console.log('  ✅ 업데이트 성공!');
        results.success.push({
          exhibition_id: exhibition.exhibition_id,
          title: exhibition.exhibition_title,
          description
        });
      }

      // API 요청 간 딜레이 (1초)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ 처리 중 오류: ${error.message}`);
      results.failed.push({
        exhibition_id: exhibition.exhibition_id,
        title: exhibition.exhibition_title,
        reason: error.message
      });
    }
  }

  console.log(`\n📊 배치 ${batchNumber} 결과:`);
  console.log(`  ✅ 성공: ${results.success.length}개`);
  console.log(`  ❌ 실패: ${results.failed.length}개`);
  
  return results;
}

// 메인 실행 함수
async function main() {
  try {
    console.log('🎨 전시 설명 일괄 업데이트 시작 (Groq API 사용)\n');
    console.log('=' * 60);
    
    // 1. description이 없는 전시 목록 가져오기
    console.log('📋 설명이 없는 전시 목록 조회 중...');
    const { data: exhibitions, error } = await supabase
      .from('exhibitions_translations')
      .select(`
        exhibition_id,
        exhibition_title,
        subtitle,
        venue_name,
        city,
        artists
      `)
      .or('description.is.null,description.eq.""')
      .eq('language_code', 'ko')
      .order('exhibition_title');

    if (error) {
      console.error('Error fetching exhibitions:', error);
      return;
    }

    console.log(`✅ 총 ${exhibitions.length}개의 전시 발견\n`);

    // 2. 5개씩 배치로 나누기
    const BATCH_SIZE = 5;
    const totalBatches = Math.ceil(exhibitions.length / BATCH_SIZE);
    
    console.log(`📦 총 ${totalBatches}개의 배치로 처리 예정 (배치당 ${BATCH_SIZE}개)\n`);

    // 처리 결과 저장
    const allResults = {
      success: [],
      failed: [],
      startTime: new Date().toISOString(),
      endTime: null
    };

    // 3. 배치별로 처리
    for (let i = 0; i < totalBatches; i++) {
      const start = i * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, exhibitions.length);
      const batch = exhibitions.slice(start, end);
      
      const batchResults = await processBatch(batch, i + 1);
      allResults.success.push(...batchResults.success);
      allResults.failed.push(...batchResults.failed);
      
      // 다음 배치 전 2초 대기 (API 제한 방지)
      if (i < totalBatches - 1) {
        console.log('\n⏳ 다음 배치 처리 전 2초 대기...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 4. 최종 결과 저장 및 출력
    allResults.endTime = new Date().toISOString();
    
    console.log('\n' + '=' * 60);
    console.log('🎉 전체 처리 완료!\n');
    console.log(`📊 최종 결과:`);
    console.log(`  ✅ 성공: ${allResults.success.length}개`);
    console.log(`  ❌ 실패: ${allResults.failed.length}개`);
    console.log(`  ⏱️  소요 시간: ${Math.round((new Date(allResults.endTime) - new Date(allResults.startTime)) / 1000)}초`);

    // 결과를 파일로 저장
    const resultFileName = `groq-batch-results-${new Date().toISOString().split('T')[0]}.json`;
    await fs.writeFile(resultFileName, JSON.stringify(allResults, null, 2));
    console.log(`\n📄 상세 결과가 ${resultFileName}에 저장되었습니다.`);

    // 실패한 항목 출력
    if (allResults.failed.length > 0) {
      console.log('\n❌ 실패한 전시 목록:');
      allResults.failed.forEach((item, idx) => {
        console.log(`  ${idx + 1}. ${item.title} (${item.exhibition_id})`);
        console.log(`     이유: ${item.reason}`);
      });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}