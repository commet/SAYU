/**
 * POST /api/visits/start
 * 전시 관람 시작 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { StartVisitRequest, StartVisitResponse } from '@/shared/exhibition-recording-types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<StartVisitResponse>(
        {
          success: false,
          error: '로그인이 필요합니다',
        },
        { status: 401 }
      );
    }

    // 요청 body 파싱 및 검증
    const body: StartVisitRequest = await request.json();
    const { exhibitionId, deviceInfo } = body;

    // Exhibition ID 필수 체크
    if (!exhibitionId || typeof exhibitionId !== 'string') {
      return NextResponse.json<StartVisitResponse>(
        {
          success: false,
          error: '전시 ID가 필요합니다',
        },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(exhibitionId)) {
      return NextResponse.json<StartVisitResponse>(
        {
          success: false,
          error: '잘못된 전시 ID 형식입니다',
        },
        { status: 400 }
      );
    }

    // 전시 정보 조회
    const { data: exhibition, error: exhibitionError } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name')
      .eq('id', exhibitionId)
      .single();

    if (exhibitionError || !exhibition) {
      return NextResponse.json<StartVisitResponse>(
        {
          success: false,
          error: '전시를 찾을 수 없습니다',
        },
        { status: 404 }
      );
    }

    // 이미 진행 중인 방문이 있는지 확인
    const { data: existingVisit } = await supabase
      .from('exhibition_visits')
      .select('id')
      .eq('user_id', user.id)
      .eq('exhibition_id', exhibitionId)
      .eq('status', 'in_progress')
      .single();

    if (existingVisit) {
      // 이미 진행 중인 방문이 있으면 그것을 반환
      return NextResponse.json<StartVisitResponse>({
        success: true,
        data: {
          visitId: existingVisit.id,
          startedAt: new Date().toISOString(),
          exhibition: {
            id: exhibition.id,
            title: exhibition.title_local || '',
            venue: exhibition.venue_name || '',
          },
        },
      });
    }

    // 새 방문 기록 생성
    const { data: newVisit, error: insertError } = await supabase
      .from('exhibition_visits')
      .insert({
        user_id: user.id,
        exhibition_id: exhibitionId,
        started_at: new Date().toISOString(),
        status: 'in_progress',
        device_info: deviceInfo || {},
        is_offline: false,
        total_artworks_recorded: 0,
      })
      .select()
      .single();

    if (insertError || !newVisit) {
      console.error('Failed to create visit:', insertError);
      return NextResponse.json<StartVisitResponse>(
        {
          success: false,
          error: '관람 시작에 실패했습니다',
        },
        { status: 500 }
      );
    }

    return NextResponse.json<StartVisitResponse>({
      success: true,
      data: {
        visitId: newVisit.id,
        startedAt: newVisit.started_at,
        exhibition: {
          id: exhibition.id,
          title: exhibition.title_local || '',
          venue: exhibition.venue_name || '',
        },
      },
    });
  } catch (error) {
    console.error('Start visit error:', error);
    return NextResponse.json<StartVisitResponse>(
      {
        success: false,
        error: '서버 오류가 발생했습니다',
      },
      { status: 500 }
    );
  }
}
