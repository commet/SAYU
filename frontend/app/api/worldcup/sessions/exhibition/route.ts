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
    let query = supabase
      .from('exhibitions')
      .select('id, title, artist, description, start_date, end_date, category, tags, venue_id, image_url, status')
      .not('title', 'is', null);

    if (theme === 'korean') {
      // 한국 전시: venue의 country가 KR인 것들
      // venue join이 복잡하므로 source 기반 필터링
      query = query.or('source.eq.korea_culture,source.eq.seoul_opendata,source.eq.artmap');
    } else if (theme === 'international') {
      query = query.or('source.eq.aic,source.eq.manual');
    } else if (theme === 'ongoing') {
      query = query.eq('status', 'ongoing');
    }
    // 'all' 은 필터 없음

    const { data: exhibitions, error: fetchError } = await query.limit(200);

    if (fetchError) {
      console.error('Failed to fetch exhibitions:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch exhibitions' },
        { status: 500 }
      );
    }

    if (!exhibitions || exhibitions.length < round) {
      return NextResponse.json(
        {
          success: false,
          error: `Not enough exhibitions for ${round} round. Found ${exhibitions?.length || 0}.`,
        },
        { status: 400 }
      );
    }

    // Fisher-Yates 셔플 후 round 수만큼 선택
    const shuffled = [...exhibitions];
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

    // 참가자 등록
    const participantRows = selected.map((ex, index) => ({
      session_id: session.id,
      source_type: 'exhibition' as const,
      exhibition_ref_id: ex.id,
      title: ex.title,
      artist: ex.artist || null,
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
      // 세션 정리
      await supabase.from('exhibition_worldcup_sessions').delete().eq('id', session.id);
      return NextResponse.json(
        { success: false, error: 'Failed to register participants' },
        { status: 500 }
      );
    }

    // 추가 전시 정보(venue, dates)를 participants에 넣기
    // selected 배열의 순서 = participantRows의 순서이므로 매핑
    const enrichedParticipants = participants.map((p) => {
      const ex = selected.find((e) => e.id === p.exhibition_ref_id);
      return {
        ...p,
        _exhibition: ex
          ? {
              start_date: ex.start_date,
              end_date: ex.end_date,
              category: ex.category,
              tags: ex.tags,
              status: ex.status,
              venue_id: ex.venue_id,
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
