import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RoundType, ExhibitionWorldcupTheme } from '@sayu/shared/exhibition-worldcup-types';

// City name mappings for flexible matching
const CITY_FILTERS: Record<string, string[]> = {
  Seoul: ['Seoul', '서울'],
  'New York': ['New York', 'NYC'],
  London: ['London'],
  Paris: ['Paris'],
  Berlin: ['Berlin'],
  Tokyo: ['Tokyo', '東京'],
  Chicago: ['Chicago'],
  Cleveland: ['Cleveland'],
  'Los Angeles': ['Los Angeles', 'LA'],
};

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * POST /api/worldcup/sessions/exhibition
 * 전시 월드컵 세션 생성 + 참가자 자동 등록 + 브래킷 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { round, theme, city } = body as {
      round: RoundType;
      theme: ExhibitionWorldcupTheme;
      city?: string;
    };

    if (!round || ![8, 16, 32].includes(round)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round. Must be 8, 16, or 32.' },
        { status: 400 }
      );
    }

    if (!theme || !['korean', 'international', 'ongoing', 'all'].includes(theme)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build query with filtering
    let query = supabase
      .from('exhibitions')
      .select('id, title_en, title_local, artists, description, start_date, end_date, exhibition_type, tags, venue_name, venue_city, venue_country, status, image_url');

    // City-based filtering (takes priority over theme)
    if (city) {
      const cityNames = CITY_FILTERS[city] || [city];
      if (cityNames.length === 1) {
        query = query.eq('venue_city', cityNames[0]);
      } else {
        query = query.or(cityNames.map(c => `venue_city.eq.${c}`).join(','));
      }
    } else if (theme === 'korean') {
      query = query.or(
        'source.eq.culture_events,source.eq.mmca,source.eq.MMCA,source.eq.artmap,source.eq.culture_portal,source.eq.exhibition_integrated,source.eq.gallery'
      );
    } else if (theme === 'international') {
      query = query.or(
        'source.eq.aic,source.eq.harvard,source.eq.chicago_art_api,source.eq.manual,source.eq.manual_met_2025,source.eq.met_museum_verified,source.eq.cleveland,source.eq.whitney,source.eq.eflux,source.eq.paris_opendata,source.eq.berlin_kultur'
      );
    } else if (theme === 'ongoing') {
      query = query.eq('status', 'ongoing');
    }
    // 'all' = no filter

    // Fetch a larger pool for better variety
    const { data: exhibitions, error: fetchError } = await query.limit(500);

    if (fetchError) {
      console.error('Failed to fetch exhibitions:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exhibitions' },
        { status: 500 }
      );
    }

    // Filter: must have a title, exclude non-exhibition content
    const NON_EXHIBITION_KEYWORDS = [
      'yoga', 'concert', 'workshop', 'class', 'lecture', 'seminar',
      'film', 'movie', 'screening', 'recital', 'festival', 'fair',
      'marathon', 'run', 'walk', 'tour', 'camp', 'retreat',
    ];

    const withTitle = (exhibitions || []).filter((ex) => {
      const title = (ex.title_en || ex.title_local || '').toLowerCase();
      if (!title) return false;

      // Exclude entries with non-exhibition keywords in title
      for (const keyword of NON_EXHIBITION_KEYWORDS) {
        if (title.includes(keyword)) return false;
      }

      return true;
    });

    if (withTitle.length < round) {
      return NextResponse.json(
        {
          success: false,
          error: `선택한 조건의 전시가 부족합니다 (${withTitle.length}개). ${round}개 이상 필요합니다.`,
        },
        { status: 400 }
      );
    }

    // Prioritize exhibitions with images for better visual experience
    const withImages = withTitle.filter(ex => ex.image_url);
    const withoutImages = withTitle.filter(ex => !ex.image_url);

    // Shuffle each group, then prefer with-images first
    const pool = [...shuffleArray(withImages), ...shuffleArray(withoutImages)];
    const selected = pool.slice(0, round);

    // Create session
    const { data: session, error: sessionError } = await supabase
      .from('exhibition_worldcup_sessions')
      .insert({
        user_id: user?.id || null,
        round_type: round,
        mode: 'exhibition',
        status: 'setup',
        current_match_index: 0,
        total_matches: round - 1,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Failed to create session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create session' },
        { status: 500 }
      );
    }

    // Register participants
    const participantRows = selected.map((ex, index) => ({
      session_id: session.id,
      source_type: 'exhibition' as const,
      exhibition_ref_id: ex.id,
      title: ex.title_en || ex.title_local,
      artist: Array.isArray(ex.artists) ? ex.artists.join(', ') : null,
      description: ex.description?.slice(0, 200) || null,
      image_url: ex.image_url || null,
      seed_position: index,
    }));

    const { data: participants, error: participantError } = await supabase
      .from('exhibition_worldcup_participants')
      .insert(participantRows)
      .select();

    if (participantError || !participants) {
      console.error('Failed to create participants:', participantError);
      await supabase.from('exhibition_worldcup_sessions').delete().eq('id', session.id);
      return NextResponse.json(
        { success: false, error: 'Failed to register participants' },
        { status: 500 }
      );
    }

    // Enrich participants with exhibition metadata for the client
    const enrichedParticipants = participants.map((p) => {
      const ex = selected.find((e) => e.id === p.exhibition_ref_id);
      return {
        ...p,
        _exhibition: ex
          ? {
              start_date: ex.start_date,
              end_date: ex.end_date,
              category: ex.exhibition_type,
              tags: ex.tags,
              status: ex.status,
              venue_name: ex.venue_name,
              venue_city: ex.venue_city,
              venue_country: ex.venue_country,
              image_url: ex.image_url,
            }
          : null,
      };
    });

    // Create bracket (first round matches)
    const startRound = Math.log2(round);
    const matchRows: any[] = [];
    for (let i = 0; i < round / 2; i++) {
      matchRows.push({
        session_id: session.id,
        match_index: i,
        round: startRound,
        round_match_index: i,
        participant_a_id: participants[i * 2].id,
        participant_b_id: participants[i * 2 + 1].id,
      });
    }

    const { data: matches, error: matchError } = await supabase
      .from('exhibition_worldcup_matches')
      .insert(matchRows)
      .select();

    if (matchError || !matches) {
      console.error('Failed to create matches:', matchError);
      return NextResponse.json(
        { success: false, error: 'Failed to create bracket' },
        { status: 500 }
      );
    }

    // Update session status to in_progress
    const { data: updatedSession } = await supabase
      .from('exhibition_worldcup_sessions')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .eq('id', session.id)
      .select()
      .single();

    return NextResponse.json({
      success: true,
      data: {
        session: updatedSession || { ...session, status: 'in_progress' },
        participants: enrichedParticipants,
        matches,
      },
    });
  } catch (error) {
    console.error('Exhibition worldcup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
