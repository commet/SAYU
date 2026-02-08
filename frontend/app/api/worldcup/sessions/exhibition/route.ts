import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RoundType, ExhibitionWorldcupTheme } from '@sayu/shared/exhibition-worldcup-types';

/**
 * POST /api/worldcup/sessions/exhibition
 * 전시 월드컵 세션 생성 + 참가자 자동 등록 + 브래킷 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { round, theme } = body as {
      round: RoundType;
      theme: ExhibitionWorldcupTheme;
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

    // 테마별 전시 필터링
    // DB columns: title_en, title_local, artists (array), exhibition_type, venue_name, venue_country
    let query = supabase
      .from('exhibitions')
      .select('id, title_en, title_local, artists, description, start_date, end_date, exhibition_type, tags, venue_name, venue_country, status');

    if (theme === 'korean') {
      query = query.or(
        'source.eq.culture_events,source.eq.mmca,source.eq.MMCA,source.eq.한국관광공사,source.eq.artmap,source.eq.culture_portal,source.eq.seoul_museum_official,source.eq.seoul_arts_center,source.eq.leeum_official,source.eq.ddp_official,source.eq.national_museum_official,source.eq.kukje_gallery_web'
      );
    } else if (theme === 'international') {
      query = query.or(
        'source.eq.aic,source.eq.chicago_art_api,source.eq.manual,source.eq.manual_met_2025,source.eq.met_museum_verified'
      );
    } else if (theme === 'ongoing') {
      query = query.eq('status', 'ongoing');
    }
    // 'all' = no filter

    const { data: exhibitions, error: fetchError } = await query.limit(300);

    if (fetchError) {
      console.error('Failed to fetch exhibitions:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exhibitions' },
        { status: 500 }
      );
    }

    // title이 있는 것만 필터
    const withTitle = (exhibitions || []).filter(
      (ex) => ex.title_en || ex.title_local
    );

    if (withTitle.length < round) {
      return NextResponse.json(
        {
          success: false,
          error: `Not enough exhibitions for ${round} round. Found ${withTitle.length}.`,
        },
        { status: 400 }
      );
    }

    // Fisher-Yates 셔플 후 round 수만큼 선택
    const shuffled = [...withTitle];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, round);

    // 세션 생성
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

    // 참가자 등록 - DB 컬럼명을 participant 컬럼에 매핑
    const participantRows = selected.map((ex, index) => ({
      session_id: session.id,
      source_type: 'exhibition' as const,
      exhibition_ref_id: ex.id,
      title: ex.title_en || ex.title_local,
      artist: Array.isArray(ex.artists) ? ex.artists.join(', ') : null,
      description: ex.description?.slice(0, 200) || null,
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

    // 추가 전시 정보를 클라이언트에 전달
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
              venue_country: ex.venue_country,
            }
          : null,
      };
    });

    // 브래킷 생성 (첫 라운드 매치들)
    const startRound = Math.log2(round);
    const matchRows = [];
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

    // 세션 상태를 in_progress로 업데이트
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
