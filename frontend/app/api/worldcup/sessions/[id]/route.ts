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
 * GET /api/worldcup/sessions/[id]
 * 세션 상세 조회 (참가자, 매치 포함)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 세션 조회
    const { data: session, error: sessionError } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError) {
      console.error('Failed to fetch session:', sessionError);
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // 참가자 조회
    const { data: participants, error: participantsError } = await supabase
      .from('exhibition_worldcup_participants')
      .select(`
        *,
        artwork:exhibition_artworks(id, title, artist, image_url, thumbnail_url)
      `)
      .eq('session_id', id)
      .order('seed_position', { ascending: true });

    if (participantsError) {
      console.error('Failed to fetch participants:', participantsError);
    }

    // 매치 조회
    const { data: matches, error: matchesError } = await supabase
      .from('exhibition_worldcup_matches')
      .select('*')
      .eq('session_id', id)
      .order('match_index', { ascending: true });

    if (matchesError) {
      console.error('Failed to fetch matches:', matchesError);
    }

    // 참가자 정보 보강 (artwork 정보 병합)
    const enrichedParticipants = ((participants || []) as WorldcupParticipant[]).map((p) => ({
      ...p,
      title: p.title || p.artwork?.title,
      artist: p.artist || p.artwork?.artist,
      image_url: p.image_url || p.temp_image_url || p.artwork?.image_url || p.artwork?.thumbnail_url,
      artwork: undefined, // 중복 제거
    }));

    return NextResponse.json({
      success: true,
      data: {
        session,
        participants: enrichedParticipants,
        matches: matches || [],
      },
    });
  } catch (error) {
    console.error('Worldcup session API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/worldcup/sessions/[id]
 * 세션 업데이트
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();

    const allowedFields = ['status', 'current_match_index', 'winner_participant_id'];
    const updates: Record<string, string | number | null> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (body.status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data: session, error } = await supabase
      .from('exhibition_worldcup_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update session:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { session },
    });
  } catch (error) {
    console.error('Worldcup session PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/worldcup/sessions/[id]
 * 세션 삭제
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase
      .from('exhibition_worldcup_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete session:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Worldcup session DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
