import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string; matchId: string }>;
}

/**
 * POST /api/worldcup/sessions/[id]/matches/[matchId]/result
 * 매치 결과 제출
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId, matchId } = await params;
    const body = await request.json();
    const { winner_id, decision_time_ms } = body;

    if (!winner_id) {
      return NextResponse.json(
        { success: false, error: 'winner_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 매치 조회
    const { data: match, error: matchError } = await supabase
      .from('exhibition_worldcup_matches')
      .select('*')
      .eq('id', matchId)
      .eq('session_id', sessionId)
      .single();

    if (matchError || !match) {
      return NextResponse.json(
        { success: false, error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.winner_id) {
      return NextResponse.json(
        { success: false, error: 'Match already completed' },
        { status: 400 }
      );
    }

    // winner_id 유효성 검사
    if (winner_id !== match.participant_a_id && winner_id !== match.participant_b_id) {
      return NextResponse.json(
        { success: false, error: 'Invalid winner_id' },
        { status: 400 }
      );
    }

    const loser_id = winner_id === match.participant_a_id
      ? match.participant_b_id
      : match.participant_a_id;

    // 매치 업데이트
    const { error: updateMatchError } = await supabase
      .from('exhibition_worldcup_matches')
      .update({
        winner_id,
        decision_time_ms: decision_time_ms || null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', matchId);

    if (updateMatchError) {
      console.error('Failed to update match:', updateMatchError);
      return NextResponse.json(
        { success: false, error: updateMatchError.message },
        { status: 500 }
      );
    }

    // 참가자 통계 업데이트 - 승자
    await supabase.rpc('increment_participant_wins', {
      p_id: winner_id,
    }).catch(() => {
      // RPC가 없으면 직접 업데이트
      return supabase
        .from('exhibition_worldcup_participants')
        .update({
          wins: supabase.rpc('increment', { row_id: winner_id, col: 'wins' }) as any,
          total_matches: supabase.rpc('increment', { row_id: winner_id, col: 'total_matches' }) as any,
        })
        .eq('id', winner_id);
    });

    // 패자 업데이트
    await supabase
      .from('exhibition_worldcup_participants')
      .update({
        eliminated_round: match.round,
      })
      .eq('id', loser_id);

    // 세션의 current_match_index 증가
    const { data: session } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    const newMatchIndex = (session.current_match_index || 0) + 1;

    // 다음 라운드 처리
    const nextRound = match.round - 1;

    // 결승이었으면 토너먼트 종료
    if (nextRound === 0) {
      // 최종 순위 설정
      await supabase
        .from('exhibition_worldcup_participants')
        .update({ final_rank: 1 })
        .eq('id', winner_id);

      await supabase
        .from('exhibition_worldcup_participants')
        .update({ final_rank: 2 })
        .eq('id', loser_id);

      // 4강 패자들에게 공동 3위
      await supabase
        .from('exhibition_worldcup_participants')
        .update({ final_rank: 3 })
        .eq('session_id', sessionId)
        .eq('eliminated_round', 2);

      // 세션 완료
      await supabase
        .from('exhibition_worldcup_sessions')
        .update({
          status: 'completed',
          winner_participant_id: winner_id,
          completed_at: new Date().toISOString(),
          current_match_index: newMatchIndex,
          duration_seconds: session.started_at
            ? Math.floor((Date.now() - new Date(session.started_at).getTime()) / 1000)
            : null,
        })
        .eq('id', sessionId);

      // 우승자 정보 조회
      const { data: winnerData } = await supabase
        .from('exhibition_worldcup_participants')
        .select(`
          *,
          artwork:exhibition_artworks(id, title, artist, image_url, thumbnail_url)
        `)
        .eq('id', winner_id)
        .single();

      const enrichedWinner = winnerData ? {
        ...winnerData,
        title: winnerData.title || winnerData.artwork?.title,
        artist: winnerData.artist || winnerData.artwork?.artist,
        image_url: winnerData.image_url || winnerData.temp_image_url || winnerData.artwork?.image_url,
        artwork: undefined,
      } : null;

      return NextResponse.json({
        success: true,
        data: {
          completed: true,
          winner: enrichedWinner,
        },
      });
    }

    // 다음 라운드 매치 확인/생성
    const nextRoundMatchIndex = Math.floor(match.round_match_index / 2);

    // 기존 다음 라운드 매치 확인
    const { data: existingNextMatch } = await supabase
      .from('exhibition_worldcup_matches')
      .select('*')
      .eq('session_id', sessionId)
      .eq('round', nextRound)
      .eq('round_match_index', nextRoundMatchIndex)
      .single();

    let nextMatch = null;

    if (existingNextMatch) {
      // 기존 매치에 승자 추가
      const updateField = match.round_match_index % 2 === 0
        ? 'participant_a_id'
        : 'participant_b_id';

      await supabase
        .from('exhibition_worldcup_matches')
        .update({ [updateField]: winner_id })
        .eq('id', existingNextMatch.id);

      // 두 참가자가 모두 채워졌는지 확인
      const { data: updatedMatch } = await supabase
        .from('exhibition_worldcup_matches')
        .select('*')
        .eq('id', existingNextMatch.id)
        .single();

      if (updatedMatch?.participant_a_id && updatedMatch?.participant_b_id) {
        nextMatch = updatedMatch;
      }
    } else {
      // 새 매치 생성
      const newMatch = {
        session_id: sessionId,
        match_index: newMatchIndex,
        round: nextRound,
        round_match_index: nextRoundMatchIndex,
        participant_a_id: match.round_match_index % 2 === 0 ? winner_id : null,
        participant_b_id: match.round_match_index % 2 === 1 ? winner_id : null,
        started_at: new Date().toISOString(),
      };

      const { data: created } = await supabase
        .from('exhibition_worldcup_matches')
        .insert(newMatch)
        .select()
        .single();

      // 두 참가자가 모두 있으면 다음 매치로
      if (created?.participant_a_id && created?.participant_b_id) {
        nextMatch = created;
      }
    }

    // 세션 업데이트
    await supabase
      .from('exhibition_worldcup_sessions')
      .update({ current_match_index: newMatchIndex })
      .eq('id', sessionId);

    // 다음 매치가 없으면 현재 라운드의 다음 미완료 매치 찾기
    if (!nextMatch) {
      const { data: pendingMatches } = await supabase
        .from('exhibition_worldcup_matches')
        .select('*')
        .eq('session_id', sessionId)
        .is('winner_id', null)
        .not('participant_a_id', 'is', null)
        .not('participant_b_id', 'is', null)
        .order('match_index', { ascending: true })
        .limit(1);

      nextMatch = pendingMatches?.[0] || null;
    }

    return NextResponse.json({
      success: true,
      data: {
        completed: false,
        nextMatch,
        nextRound,
      },
    });
  } catch (error) {
    console.error('Match result error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
