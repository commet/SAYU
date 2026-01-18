import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface WorldcupParticipant {
  id: string;
  session_id: string;
  seed_position?: number;
  title?: string;
  artist?: string;
  image_url?: string;
  temp_image_url?: string;
  artwork?: {
    id: string;
    title?: string;
    artist?: string;
    image_url?: string;
    thumbnail_url?: string;
  };
}

/**
 * POST /api/worldcup/sessions/[id]/start
 * 토너먼트 시작 (브래킷 생성)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    // 세션 확인
    const { data: session, error: sessionError } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'setup') {
      return NextResponse.json(
        { success: false, error: 'Tournament already started or completed' },
        { status: 400 }
      );
    }

    // 참가자 확인
    const { data: participants, error: participantsError } = await supabase
      .from('exhibition_worldcup_participants')
      .select(`
        *,
        artwork:exhibition_artworks(id, title, artist, image_url, thumbnail_url)
      `)
      .eq('session_id', sessionId)
      .order('seed_position', { ascending: true });

    if (participantsError || !participants) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    if (participants.length !== session.round_type) {
      return NextResponse.json(
        {
          success: false,
          error: `Need exactly ${session.round_type} participants, got ${participants.length}`,
        },
        { status: 400 }
      );
    }

    // 참가자 셔플 (랜덤 시드)
    const shuffled = shuffleArray([...participants]);

    // 시드 위치 업데이트
    for (let i = 0; i < shuffled.length; i++) {
      await supabase
        .from('exhibition_worldcup_participants')
        .update({ seed_position: i + 1 })
        .eq('id', shuffled[i].id);
    }

    // 첫 라운드 매치 생성
    const startRound = Math.log2(session.round_type);
    const matches = [];

    for (let i = 0; i < shuffled.length / 2; i++) {
      const match = {
        session_id: sessionId,
        match_index: i,
        round: startRound,
        round_match_index: i,
        participant_a_id: shuffled[i * 2].id,
        participant_b_id: shuffled[i * 2 + 1].id,
        started_at: new Date().toISOString(),
      };
      matches.push(match);
    }

    const { data: createdMatches, error: matchError } = await supabase
      .from('exhibition_worldcup_matches')
      .insert(matches)
      .select();

    if (matchError) {
      console.error('Failed to create matches:', matchError);
      return NextResponse.json(
        { success: false, error: matchError.message },
        { status: 500 }
      );
    }

    // 세션 상태 업데이트
    const { data: updatedSession, error: updateError } = await supabase
      .from('exhibition_worldcup_sessions')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        current_match_index: 0,
      })
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update session:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // 참가자 정보 보강
    const enrichedParticipants = (shuffled as WorldcupParticipant[]).map((p, index) => ({
      ...p,
      seed_position: index + 1,
      title: p.title || p.artwork?.title,
      artist: p.artist || p.artwork?.artist,
      image_url: p.image_url || p.temp_image_url || p.artwork?.image_url || p.artwork?.thumbnail_url,
      artwork: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        session: updatedSession,
        matches: createdMatches,
        participants: enrichedParticipants,
        firstMatch: createdMatches?.[0] || null,
      },
    });
  } catch (error) {
    console.error('Start tournament error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Fisher-Yates 셔플
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
