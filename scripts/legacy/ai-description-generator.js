const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

// AI 기반 전시 설명 자동 생성기
class AIDescriptionGenerator {
  constructor() {
    this.supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
    this.supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    this.supabase = createClient(this.supabaseUrl, this.supabaseKey);
  }

  // 전시 정보로부터 description 생성 프롬프트 만들기
  createPrompt(exhibition) {
    return `전시 정보를 바탕으로 매력적이고 정보가 풍부한 설명문을 작성해주세요.

전시 정보:
- 제목: ${exhibition.title}
- 작가: ${exhibition.artist || '그룹전'}
- 장소: ${exhibition.venue}
- 기간: ${exhibition.start_date} ~ ${exhibition.end_date}
${exhibition.curator ? `- 큐레이터: ${exhibition.curator}` : ''}

요구사항:
1. 한국어 설명: 150-200자
2. 영어 번역 포함
3. 전시의 핵심 주제와 특징 강조
4. 관람객의 흥미를 유발하는 문체
5. 작가의 작품 세계나 전시 컨셉 설명

형식:
{
  "ko": "한국어 설명 (150-200자)",
  "en": "English description"
}`;
  }

  // OpenAI API 대신 Groq API 사용 (더 빠르고 무료)
  async generateWithGroq(prompt) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: '당신은 예술 전시 큐레이터이자 미술 평론가입니다. 전시에 대한 깊이 있고 매력적인 설명을 작성합니다.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('Groq API Error:', error.message);
      return null;
    }
  }

  // 웹 검색을 통한 추가 정보 수집 (선택적)
  async searchAdditionalInfo(exhibition) {
    // Google Custom Search API 또는 Naver API 활용
    // 작가 정보, 과거 전시, 작품 스타일 등 추가 컨텍스트 수집
    const searchQuery = `${exhibition.artist} ${exhibition.venue} 전시`;

    // 실제 구현 시 API 호출
    console.log(`🔍 Searching for: ${searchQuery}`);

    // 임시 반환값
    return {
      artist_style: '추상표현주의',
      previous_exhibitions: ['2023 서울시립미술관'],
      themes: ['정체성', '공간', '시간']
    };
  }

  // 배치 처리 함수
  async generateBatchDescriptions(exhibitions) {
    console.log(`🤖 AI Description Generator Starting...`);
    console.log(`📝 Processing ${exhibitions.length} exhibitions\n`);

    const results = [];
    const batchSize = 5; // API 제한 고려

    for (let i = 0; i < exhibitions.length; i += batchSize) {
      const batch = exhibitions.slice(i, i + batchSize);

      console.log(`\n--- Batch ${Math.floor(i/batchSize) + 1} ---`);

      for (const exhibition of batch) {
        console.log(`\n🎨 Processing: ${exhibition.title}`);

        // 1. 추가 정보 검색 (선택적)
        const additionalInfo = await this.searchAdditionalInfo(exhibition);

        // 2. 강화된 프롬프트 생성
        const enhancedExhibition = { ...exhibition, ...additionalInfo };
        const prompt = this.createPrompt(enhancedExhibition);

        // 3. AI 설명 생성
        const description = await this.generateWithGroq(prompt);

        if (description) {
          results.push({
            exhibition_id: exhibition.id,
            ...description,
            generated_at: new Date().toISOString()
          });
          console.log(`  ✅ Description generated`);
        } else {
          console.log(`  ❌ Generation failed`);
        }

        // API 호출 제한 준수 (1초 대기)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n✨ Generation complete! Success: ${results.length}/${exhibitions.length}`);
    return results;
  }

  // Supabase에 직접 업데이트
  async updateDatabase(descriptions) {
    console.log('\n📤 Updating database...');
    let successCount = 0;
    let errorCount = 0;

    for (const desc of descriptions) {
      try {
        // 한국어 업데이트
        const { error: koError } = await this.supabase
          .from('exhibitions_translations')
          .update({ description: desc.ko })
          .eq('exhibition_id', desc.exhibition_id)
          .eq('language_code', 'ko');

        // 영어 업데이트
        const { error: enError } = await this.supabase
          .from('exhibitions_translations')
          .update({ description: desc.en })
          .eq('exhibition_id', desc.exhibition_id)
          .eq('language_code', 'en');

        if (!koError && !enError) {
          successCount++;
          console.log(`  ✅ ${desc.exhibition_id} updated`);
        } else {
          errorCount++;
          console.log(`  ❌ ${desc.exhibition_id} failed`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  ❌ Error updating ${desc.exhibition_id}:`, error.message);
      }
    }

    console.log(`\n📊 Update complete: Success ${successCount}, Failed ${errorCount}`);
    return { successCount, errorCount };
  }

  // 검증 함수: 생성된 설명의 품질 체크
  validateDescription(description) {
    const checks = {
      ko_length: description.ko && description.ko.length >= 150 && description.ko.length <= 200,
      en_exists: !!description.en,
      no_hallucination: !description.ko.includes('상상') && !description.ko.includes('가정'),
      professional: !description.ko.includes('죄송') && !description.ko.includes('오류')
    };

    const isValid = Object.values(checks).every(check => check);

    if (!isValid) {
      console.log('  ⚠️  Validation issues:', checks);
    }

    return isValid;
  }

  // 인간 검토를 위한 프리뷰 생성
  async generatePreview(descriptions, outputFile = 'ai-descriptions-preview.html') {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>AI Generated Descriptions Review</title>
  <style>
    body { font-family: 'Noto Sans KR', sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .exhibition { border: 1px solid #ddd; margin: 20px 0; padding: 20px; border-radius: 8px; }
    .title { font-size: 20px; font-weight: bold; color: #333; }
    .description { margin: 10px 0; padding: 10px; background: #f5f5f5; }
    .ko { color: #000; }
    .en { color: #666; font-style: italic; margin-top: 10px; }
    .status { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
    .valid { background: #d4edda; color: #155724; }
    .invalid { background: #f8d7da; color: #721c24; }
    .actions { margin-top: 15px; }
    button { margin-right: 10px; padding: 5px 15px; cursor: pointer; }
    .edit { background: #ffc107; border: none; }
    .approve { background: #28a745; color: white; border: none; }
    .reject { background: #dc3545; color: white; border: none; }
  </style>
</head>
<body>
  <h1>AI Generated Exhibition Descriptions - Review</h1>
  <p>Total: ${descriptions.length} descriptions</p>

  ${descriptions.map((desc, index) => `
    <div class="exhibition" id="ex-${index}">
      <div class="title">Exhibition ID: ${desc.exhibition_id}</div>
      <span class="status ${this.validateDescription(desc) ? 'valid' : 'invalid'}">
        ${this.validateDescription(desc) ? '✓ Valid' : '✗ Needs Review'}
      </span>

      <div class="description">
        <div class="ko">${desc.ko}</div>
        <div class="en">${desc.en}</div>
      </div>

      <div class="actions">
        <button class="edit" onclick="editDescription(${index})">Edit</button>
        <button class="approve" onclick="approveDescription(${index})">Approve</button>
        <button class="reject" onclick="rejectDescription(${index})">Reject</button>
      </div>
    </div>
  `).join('')}

  <script>
    function editDescription(index) {
      alert('Edit functionality would open an editor for exhibition ' + index);
    }
    function approveDescription(index) {
      document.getElementById('ex-' + index).style.background = '#d4edda';
    }
    function rejectDescription(index) {
      document.getElementById('ex-' + index).style.background = '#f8d7da';
    }
  </script>
</body>
</html>`;

    const fs = require('fs').promises;
    await fs.writeFile(outputFile, html);
    console.log(`\n📄 Preview saved to ${outputFile}`);
    return outputFile;
  }
}

// 사용 예시
async function main() {
  const generator = new AIDescriptionGenerator();

  // 테스트용 전시 데이터
  const testExhibitions = [
    {
      id: 'test-001',
      title: '시간의 층위',
      artist: '김민수',
      venue: '갤러리현대',
      start_date: '2025-09-01',
      end_date: '2025-10-15'
    }
  ];

  // 1. 설명 생성
  const descriptions = await generator.generateBatchDescriptions(testExhibitions);

  // 2. 검증 및 프리뷰
  await generator.generatePreview(descriptions);

  // 3. 데이터베이스 업데이트 (승인 후)
  // await generator.updateDatabase(descriptions);
}

// 실행 (테스트)
// main().catch(console.error);

module.exports = AIDescriptionGenerator;