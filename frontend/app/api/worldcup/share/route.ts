import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface WorldcupParticipant {
  id: string;
  final_rank: number | null;
  title?: string;
  artist?: string;
  image_url?: string;
  temp_image_url?: string;
  source_type?: string;
  wins?: number;
  total_matches?: number;
  artwork?: {
    id: string;
    title?: string;
    artist?: string;
    image_url?: string;
    thumbnail_url?: string;
  };
}

interface Ranking {
  rank: number | null;
  participant_id: string;
  title?: string;
  artist?: string;
  image_url?: string;
  source_type?: string;
  wins?: number;
  total_matches?: number;
}

/**
 * POST /api/worldcup/share
 * 공유 URL 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, share_type = 'link' } = body;

    if (!session_id) {
      return NextResponse.json(
        { success: false, error: 'session_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 세션 확인
    const { data: session, error: sessionError } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('status')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: 'Can only share completed tournaments' },
        { status: 400 }
      );
    }

    // 기존 공유 확인
    const { data: existingShare } = await supabase
      .from('exhibition_worldcup_shares')
      .select('*')
      .eq('session_id', session_id)
      .eq('share_type', share_type)
      .single();

    if (existingShare) {
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sayu.app'}/worldcup/result/${existingShare.share_code}`;

      return NextResponse.json({
        success: true,
        data: {
          share: existingShare,
          share_url: shareUrl,
        },
      });
    }

    // 새 공유 생성
    const shareCode = generateShareCode();

    const { data: share, error: shareError } = await supabase
      .from('exhibition_worldcup_shares')
      .insert({
        session_id,
        share_type,
        share_code: shareCode,
        view_count: 0,
      })
      .select()
      .single();

    if (shareError) {
      console.error('Failed to create share:', shareError);
      return NextResponse.json(
        { success: false, error: shareError.message },
        { status: 500 }
      );
    }

    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sayu.app'}/worldcup/result/${shareCode}`;

    return NextResponse.json({
      success: true,
      data: {
        share,
        share_url: shareUrl,
      },
    });
  } catch (error) {
    console.error('Share creation error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/worldcup/share?code=XXXXX
 * 공유 결과 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'code is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 공유 조회
    const { data: share, error: shareError } = await supabase
      .from('exhibition_worldcup_shares')
      .select('*')
      .eq('share_code', code)
      .single();

    if (shareError || !share) {
      return NextResponse.json(
        { success: false, error: 'Share not found' },
        { status: 404 }
      );
    }

    // 조회수 증가
    await supabase
      .from('exhibition_worldcup_shares')
      .update({ view_count: share.view_count + 1 })
      .eq('id', share.id);

    // 세션 및 결과 조회
    const { data: session } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('*')
      .eq('id', share.session_id)
      .single();

    // 참가자 조회 (순위 포함)
    const { data: participants } = await supabase
      .from('exhibition_worldcup_participants')
      .select(`
        *,
        artwork:exhibition_artworks(id, title, artist, image_url, thumbnail_url)
      `)
      .eq('session_id', share.session_id)
      .not('final_rank', 'is', null)
      .order('final_rank', { ascending: true });

    // 참가자 정보 보강
    const rankings: Ranking[] = ((participants || []) as WorldcupParticipant[]).map((p) => ({
      rank: p.final_rank,
      participant_id: p.id,
      title: p.title || p.artwork?.title,
      artist: p.artist || p.artwork?.artist,
      image_url: p.image_url || p.temp_image_url || p.artwork?.image_url || p.artwork?.thumbnail_url,
      source_type: p.source_type,
      wins: p.wins,
      total_matches: p.total_matches,
    }));

    const winner = rankings.find((r) => r.rank === 1);

    return NextResponse.json({
      success: true,
      data: {
        share,
        session,
        winner,
        rankings,
      },
    });
  } catch (error) {
    console.error('Share fetch error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 공유 코드 생성 (8자리)
 */
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
