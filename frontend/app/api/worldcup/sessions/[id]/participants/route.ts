import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ParticipantSourceType } from '@sayu/shared/exhibition-worldcup-types';

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
 * POST /api/worldcup/sessions/[id]/participants
 * 참가자 추가
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { source_type, artwork_id, temp_image_url, temp_image_path, title, artist, image_url } = body;

    // 유효성 검사
    if (!source_type || !['uploaded', 'artwork', 'manual'].includes(source_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid source_type' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 세션 확인
    const { data: session, error: sessionError } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('round_type, status')
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
        { success: false, error: 'Cannot add participants after tournament started' },
        { status: 400 }
      );
    }

    // 현재 참가자 수 확인
    const { count } = await supabase
      .from('exhibition_worldcup_participants')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    const currentCount = count || 0;
    const maxCount = session.round_type;

    if (currentCount >= maxCount) {
      return NextResponse.json(
        { success: false, error: `Maximum ${maxCount} participants allowed` },
        { status: 400 }
      );
    }

    // 참가자 추가
    const { data: participant, error } = await supabase
      .from('exhibition_worldcup_participants')
      .insert({
        session_id: sessionId,
        source_type: source_type as ParticipantSourceType,
        artwork_id: artwork_id || null,
        temp_image_url: temp_image_url || null,
        temp_image_path: temp_image_path || null,
        title: title || null,
        artist: artist || null,
        image_url: image_url || null,
        seed_position: currentCount + 1,
        total_matches: 0,
        wins: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add participant:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        participant,
        currentCount: currentCount + 1,
        maxCount,
      },
    });
  } catch (error) {
    console.error('Add participant error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/worldcup/sessions/[id]/participants
 * 참가자 목록 조회
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const supabase = await createClient();

    const { data: participants, error } = await supabase
      .from('exhibition_worldcup_participants')
      .select(`
        *,
        artwork:exhibition_artworks(id, title, artist, image_url, thumbnail_url)
      `)
      .eq('session_id', sessionId)
      .order('seed_position', { ascending: true });

    if (error) {
      console.error('Failed to fetch participants:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // 참가자 정보 보강
    const enrichedParticipants = ((participants || []) as WorldcupParticipant[]).map((p) => ({
      ...p,
      title: p.title || p.artwork?.title,
      artist: p.artist || p.artwork?.artist,
      image_url: p.image_url || p.temp_image_url || p.artwork?.image_url || p.artwork?.thumbnail_url,
      artwork: undefined,
    }));

    return NextResponse.json({
      success: true,
      data: { participants: enrichedParticipants },
    });
  } catch (error) {
    console.error('Fetch participants error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/worldcup/sessions/[id]/participants
 * 참가자 삭제 (body에 participant_id 필요)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();
    const { participant_id } = body;

    if (!participant_id) {
      return NextResponse.json(
        { success: false, error: 'participant_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 세션 상태 확인
    const { data: session } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('status')
      .eq('id', sessionId)
      .single();

    if (session?.status !== 'setup') {
      return NextResponse.json(
        { success: false, error: 'Cannot remove participants after tournament started' },
        { status: 400 }
      );
    }

    // 참가자 삭제
    const { error } = await supabase
      .from('exhibition_worldcup_participants')
      .delete()
      .eq('id', participant_id)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Failed to delete participant:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // seed_position 재정렬
    const { data: remaining } = await supabase
      .from('exhibition_worldcup_participants')
      .select('id')
      .eq('session_id', sessionId)
      .order('seed_position', { ascending: true });

    if (remaining && remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        await supabase
          .from('exhibition_worldcup_participants')
          .update({ seed_position: i + 1 })
          .eq('id', remaining[i].id);
      }
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
