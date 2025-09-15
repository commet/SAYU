const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgltvdshuyfffskvjmst.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4OTUzMSwiZXhwIjoyMDY4MDY1NTMxfQ.CGTxr2fMsj3kT0Qf_Ytk3SmU5zeMLkdB3nvnBWkXtaI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 간단한 번역 맵 (실제로는 번역 API 사용 필요)
const simpleTranslations = {
  '현대미술': 'contemporary art',
  '회고전': 'retrospective',
  '개인전': 'solo exhibition',
  '기획전': 'special exhibition',
  '그룹전': 'group exhibition',
  '작가': 'artist',
  '작품': 'artwork',
  '전시': 'exhibition',
  '갤러리': 'gallery',
  '미술관': 'museum',
  '설치': 'installation',
  '조각': 'sculpture',
  '회화': 'painting',
  '사진': 'photography',
  '영상': 'video',
  '퍼포먼스': 'performance',
  '드로잉': 'drawing',
  '판화': 'print',
  '미디어': 'media',
  '디지털': 'digital',
  '예술': 'art',
  '현대': 'contemporary',
  '한국': 'Korea',
  '서울': 'Seoul',
  '국제': 'international',
  '세계': 'world',
  '문화': 'culture',
  '시대': 'era',
  '역사': 'history',
  '탐구': 'exploration',
  '표현': 'expression',
  '실험': 'experiment',
  '혁신': 'innovation',
  '전통': 'tradition',
  '미래': 'future',
  '과거': 'past',
  '현재': 'present',
  '공간': 'space',
  '시간': 'time',
  '빛': 'light',
  '색': 'color',
  '형태': 'form',
  '구조': 'structure',
  '관계': 'relationship',
  '소통': 'communication',
  '대화': 'dialogue',
  '경험': 'experience',
  '감각': 'sense',
  '감정': 'emotion',
  '기억': 'memory',
  '상상': 'imagination',
  '창조': 'creation',
  '변화': 'change',
  '움직임': 'movement',
  '정적': 'static',
  '동적': 'dynamic',
  '추상': 'abstract',
  '구상': 'figurative',
  '개념': 'concept',
  '맥락': 'context',
  '비평': 'critique',
  '해석': 'interpretation',
  '의미': 'meaning',
  '상징': 'symbol',
  '은유': 'metaphor',
  '서사': 'narrative',
  '이야기': 'story',
  '풍경': 'landscape',
  '초상': 'portrait',
  '정물': 'still life',
  '자연': 'nature',
  '도시': 'city',
  '인간': 'human',
  '사회': 'society',
  '정치': 'politics',
  '경제': 'economy',
  '환경': 'environment',
  '생태': 'ecology',
  '기술': 'technology',
  '과학': 'science',
  '철학': 'philosophy',
  '심리': 'psychology',
  '영성': 'spirituality',
  '종교': 'religion',
  '신화': 'mythology',
  '민속': 'folklore',
  '일상': 'daily life',
  '삶': 'life',
  '죽음': 'death',
  '사랑': 'love',
  '희망': 'hope',
  '꿈': 'dream',
  '자유': 'freedom',
  '평화': 'peace',
  '갈등': 'conflict',
  '화해': 'reconciliation',
  '치유': 'healing'
};

// 기본적인 번역 함수 (실제로는 DeepL이나 Google Translate API 사용 권장)
function basicTranslate(koreanText) {
  if (!koreanText) return null;
  
  // 여기서는 단순히 플레이스홀더 텍스트 반환
  // 실제 구현시 번역 API 호출 필요
  let translated = koreanText;
  
  // 간단한 단어 치환 (매우 기초적)
  for (const [ko, en] of Object.entries(simpleTranslations)) {
    const regex = new RegExp(ko, 'g');
    translated = translated.replace(regex, en);
  }
  
  // 실제로는 번역 API를 사용해야 함
  return `[Translation needed] ${koreanText.substring(0, 200)}...`;
}

async function translateKoToEnDescriptions() {
  console.log('========================================');
  console.log('KO → EN Description 번역');
  console.log('========================================\n');
  
  try {
    // 1. ko description은 있지만 en description이 없는 전시 찾기
    const { data: allTranslations, error } = await supabase
      .from('exhibitions_translations')
      .select('*')
      .order('exhibition_id');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    // exhibition_id별로 그룹화
    const exhibitions = {};
    allTranslations.forEach(trans => {
      if (!exhibitions[trans.exhibition_id]) {
        exhibitions[trans.exhibition_id] = {};
      }
      exhibitions[trans.exhibition_id][trans.language_code] = trans;
    });
    
    // 번역이 필요한 전시 찾기
    const needsTranslation = [];
    
    Object.keys(exhibitions).forEach(exhibitionId => {
      const exh = exhibitions[exhibitionId];
      
      // ko description은 있지만 en description이 없는 경우
      if (exh.ko && exh.ko.description && 
          exh.en && (!exh.en.description || exh.en.description === '')) {
        needsTranslation.push({
          exhibitionId,
          koTitle: exh.ko.exhibition_title,
          enTitle: exh.en.exhibition_title,
          koDescription: exh.ko.description
        });
      }
    });
    
    console.log(`📋 번역이 필요한 전시: ${needsTranslation.length}개\n`);
    
    if (needsTranslation.length === 0) {
      console.log('번역이 필요한 전시가 없습니다.');
      return;
    }
    
    // 2. 처음 5개만 예시로 보여주기
    console.log('📝 번역 예시 (처음 5개):');
    console.log('═'.repeat(80));
    
    const examples = needsTranslation.slice(0, 5);
    
    for (const item of examples) {
      console.log(`\n전시: ${item.koTitle}`);
      console.log(`영문명: ${item.enTitle}`);
      console.log(`exhibition_id: ${item.exhibitionId}`);
      console.log('\n[한글 설명]');
      console.log(item.koDescription.substring(0, 200) + '...');
      
      const translatedDesc = basicTranslate(item.koDescription);
      console.log('\n[영문 번역 (예시)]');
      console.log(translatedDesc);
      console.log('-'.repeat(80));
    }
    
    // 3. 실제 번역 적용 여부 확인
    console.log('\n\n💡 실제 번역 적용 방법:');
    console.log('═'.repeat(80));
    console.log(`
1. 번역 API 설정 (DeepL, Google Translate, OpenAI 등)
2. 위의 basicTranslate 함수를 실제 API 호출로 교체
3. 배치 처리로 번역 수행

예시 코드:
----------------------------------------
// DeepL API 사용 예시
const deepl = require('deepl-node');
const translator = new deepl.Translator(authKey);

async function translateWithDeepL(text) {
  const result = await translator.translateText(
    text, 
    'ko',  // source language
    'en-US' // target language
  );
  return result.text;
}

// 배치 업데이트
for (const item of needsTranslation) {
  const translatedDesc = await translateWithDeepL(item.koDescription);
  
  await supabase
    .from('exhibitions_translations')
    .update({ 
      description: translatedDesc,
      updated_at: new Date().toISOString()
    })
    .eq('exhibition_id', item.exhibitionId)
    .eq('language_code', 'en');
}
`);
    
    // 결과 저장
    const fs = require('fs').promises;
    await fs.writeFile(
      'needs-translation.json',
      JSON.stringify({
        total: needsTranslation.length,
        exhibitions: needsTranslation,
        timestamp: new Date().toISOString()
      }, null, 2)
    );
    
    console.log('\n📄 번역이 필요한 전시 목록이 needs-translation.json에 저장되었습니다.');
    console.log(`\n✅ 총 ${needsTranslation.length}개 전시의 영문 설명 번역 필요`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

translateKoToEnDescriptions().catch(console.error);