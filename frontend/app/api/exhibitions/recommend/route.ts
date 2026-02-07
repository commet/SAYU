import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  calculateMatchScore,
  rankExhibitions,
  inferGenresFromKeywords,
  getRecommendationMessage,
  ExhibitionFeatures
} from '@sayu/shared/apt-exhibition-matching';
import { APT_PROMPT_PROFILES } from '@sayu/shared/apt-ai-prompt-mapping';

// Supabase 클라이언트 초기화 (read-only public route - anon key respects RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

interface Exhibition {
  id: string;
  title_local: string;
  title_en: string;
  venue_name: string;
  venue_city: string;
  venue_country: string;
  start_date: string;
  end_date: string;
  description?: string;
  image_url?: string;
  official_url?: string;
  genres?: string[];
  status: 'upcoming' | 'ongoing' | 'ended';
}

interface RecommendedExhibition extends Exhibition {
  matchScore: number;
  matchReasons: string[];
  matchConfidence: 'high' | 'medium' | 'low';
  recommendationMessage: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const aptCode = searchParams.get('apt');
  const city = searchParams.get('city');
  const limit = parseInt(searchParams.get('limit') || '10');
  const includeEnded = searchParams.get('includeEnded') === 'true';

  // APT 코드 유효성 검사
  if (!aptCode || !APT_PROMPT_PROFILES[aptCode]) {
    return NextResponse.json({
      success: false,
      error: 'Invalid or missing APT code',
      validCodes: Object.keys(APT_PROMPT_PROFILES)
    }, { status: 400 });
  }

  try {
    let exhibitions: Exhibition[] = [];

    // Supabase에서 전시 데이터 조회
    if (supabase) {
      let query = supabase
        .from('exhibitions')
        .select('*')
        .order('start_date', { ascending: false });

      // 종료된 전시 제외
      if (!includeEnded) {
        query = query.neq('status', 'ended');
      }

      // 도시 필터
      if (city) {
        query = query.eq('venue_city', city);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('[Recommend] Supabase error:', error);
      } else if (data) {
        exhibitions = data;
      }
    }

    // 전시 데이터가 없으면 샘플 데이터 사용
    if (exhibitions.length === 0) {
      exhibitions = getSampleExhibitions();
    }

    // 전시를 ExhibitionFeatures로 변환
    const exhibitionFeatures: ExhibitionFeatures[] = exhibitions.map(ex => {
      // 제목과 설명에서 장르 추론
      const keywords = [
        ex.title_local || '',
        ex.title_en || '',
        ex.description || '',
        ...(ex.genres || [])
      ].filter(Boolean);

      const genres = inferGenresFromKeywords(keywords);

      return {
        id: ex.id,
        title: ex.title_local || ex.title_en,
        genres,
        emotionalTone: inferEmotionalTone(keywords),
        interactivity: inferInteractivity(keywords),
        crowdLevel: 'medium' as const,
        difficulty: 'intermediate' as const
      };
    });

    // APT 기반 매칭 및 정렬
    const matchResults = rankExhibitions(aptCode, exhibitionFeatures);

    // 상위 N개 추천 생성
    const recommendations: RecommendedExhibition[] = matchResults
      .slice(0, limit)
      .map(result => {
        const exhibition = exhibitions.find(e => e.id === result.exhibitionId)!;
        return {
          ...exhibition,
          matchScore: result.score,
          matchReasons: result.matchReasons,
          matchConfidence: result.confidence,
          recommendationMessage: getRecommendationMessage(aptCode, result.score, 'ko')
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        aptCode,
        aptName: APT_PROMPT_PROFILES[aptCode]?.personalityEssence?.split(',')[0] || aptCode,
        totalExhibitions: exhibitions.length,
        recommendations,
        filters: {
          city: city || 'all',
          includeEnded
        }
      }
    });

  } catch (error) {
    console.error('[Recommend] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get recommendations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// 감정적 톤 추론
function inferEmotionalTone(keywords: string[]): ExhibitionFeatures['emotionalTone'] {
  const text = keywords.join(' ').toLowerCase();

  if (text.includes('명상') || text.includes('고요') || text.includes('contemplat')) {
    return 'contemplative';
  }
  if (text.includes('에너지') || text.includes('활력') || text.includes('dynamic')) {
    return 'energetic';
  }
  if (text.includes('도전') || text.includes('논쟁') || text.includes('provocat')) {
    return 'provocative';
  }
  if (text.includes('교육') || text.includes('학습') || text.includes('educat')) {
    return 'educational';
  }
  return 'serene';
}

// 인터랙티비티 추론
function inferInteractivity(keywords: string[]): ExhibitionFeatures['interactivity'] {
  const text = keywords.join(' ').toLowerCase();

  if (text.includes('인터랙티브') || text.includes('체험') || text.includes('interactive')) {
    return 'high';
  }
  if (text.includes('설치') || text.includes('미디어') || text.includes('installation')) {
    return 'medium';
  }
  return 'low';
}

// 샘플 전시 데이터 (DB 연결 안 될 때)
function getSampleExhibitions(): Exhibition[] {
  return [
    {
      id: 'sample-1',
      title_local: '빛의 채집가 - 인상주의 명작전',
      title_en: 'Collectors of Light - Impressionist Masterpieces',
      venue_name: '국립현대미술관 서울',
      venue_city: '서울',
      venue_country: 'KR',
      start_date: '2026-01-01',
      end_date: '2026-03-31',
      description: '모네, 르누아르, 드가 등 인상주의 거장들의 작품을 통해 빛과 순간을 포착한 예술의 혁명을 경험하세요.',
      image_url: '/images/exhibitions/sample-1.jpg',
      genres: ['impressionism', 'landscape'],
      status: 'ongoing'
    },
    {
      id: 'sample-2',
      title_local: '초현실의 정원',
      title_en: 'Gardens of Surrealism',
      venue_name: '삼성미술관 리움',
      venue_city: '서울',
      venue_country: 'KR',
      start_date: '2026-01-15',
      end_date: '2026-04-15',
      description: '달리, 마그리트, 에른스트의 초현실주의 작품들이 펼쳐내는 꿈과 무의식의 세계.',
      image_url: '/images/exhibitions/sample-2.jpg',
      genres: ['surrealism', 'conceptual'],
      status: 'ongoing'
    },
    {
      id: 'sample-3',
      title_local: '디지털 네이처 - 미디어아트 체험전',
      title_en: 'Digital Nature - Interactive Media Art',
      venue_name: '아트센터 나비',
      venue_city: '서울',
      venue_country: 'KR',
      start_date: '2026-02-01',
      end_date: '2026-05-31',
      description: '최첨단 미디어 기술로 재해석한 자연의 아름다움. 인터랙티브 체험으로 예술 속에 들어가세요.',
      image_url: '/images/exhibitions/sample-3.jpg',
      genres: ['media_art', 'installation'],
      status: 'ongoing'
    },
    {
      id: 'sample-4',
      title_local: '팝의 시대 - 앤디 워홀과 팝아트',
      title_en: 'Age of Pop - Andy Warhol and Pop Art',
      venue_name: '서울시립미술관',
      venue_city: '서울',
      venue_country: 'KR',
      start_date: '2026-01-20',
      end_date: '2026-04-20',
      description: '팝아트의 거장 앤디 워홀과 동시대 팝아티스트들의 작품으로 보는 대중문화와 예술의 만남.',
      image_url: '/images/exhibitions/sample-4.jpg',
      genres: ['pop_art', 'contemporary'],
      status: 'ongoing'
    },
    {
      id: 'sample-5',
      title_local: '조선의 화가들 - 진경산수화전',
      title_en: 'Masters of Joseon - True-View Landscape',
      venue_name: '국립중앙박물관',
      venue_city: '서울',
      venue_country: 'KR',
      start_date: '2025-12-01',
      end_date: '2026-03-01',
      description: '정선, 김홍도, 신윤복 등 조선시대 대표 화가들의 진경산수화 명작을 한자리에서 만나세요.',
      image_url: '/images/exhibitions/sample-5.jpg',
      genres: ['traditional_asian', 'landscape'],
      status: 'ongoing'
    },
    {
      id: 'sample-6',
      title_local: '색채의 철학 - 마크 로스코 회고전',
      title_en: 'Philosophy of Color - Mark Rothko Retrospective',
      venue_name: '대림미술관',
      venue_city: '서울',
      venue_country: 'KR',
      start_date: '2026-02-15',
      end_date: '2026-05-15',
      description: '색면 추상의 거장 마크 로스코의 명상적 작품 세계. 색채가 전하는 감정의 깊이를 경험하세요.',
      image_url: '/images/exhibitions/sample-6.jpg',
      genres: ['abstract_expressionism', 'minimalism'],
      status: 'upcoming'
    }
  ];
}
