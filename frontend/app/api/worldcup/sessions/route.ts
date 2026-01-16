import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RoundType, WorldcupSession } from '@sayu/shared/exhibition-worldcup-types';

/**
 * POST /api/worldcup/sessions
 * 새 월드컵 세션 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { round_type, exhibition_visit_id, exhibition_id } = body;

    // 유효성 검사
    if (!round_type || ![8, 16, 32, 64].includes(round_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid round_type. Must be 8, 16, 32, or 64.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 현재 사용자 확인 (선택)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // 세션 생성
    const { data: session, error } = await supabase
      .from('exhibition_worldcup_sessions')
      .insert({
        user_id: user?.id || null,
        exhibition_visit_id: exhibition_visit_id || null,
        exhibition_id: exhibition_id || null,
        round_type: round_type as RoundType,
        status: 'setup',
        current_match_index: 0,
        total_matches: round_type - 1,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create worldcup session:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { session },
    });
  } catch (error: any) {
    console.error('Worldcup sessions API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/worldcup/sessions
 * 사용자의 월드컵 세션 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('exhibition_worldcup_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Failed to fetch worldcup sessions:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { sessions },
    });
  } catch (error: any) {
    console.error('Worldcup sessions API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
