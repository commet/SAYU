/**
 * POST /api/visits/[id]/end
 * 전시 관람 종료 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { EndVisitRequest, EndVisitResponse } from '@sayu/shared/exhibition-recording-types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: visitId } = await params;

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json<EndVisitResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // 요청 body 파싱
    const body: EndVisitRequest = await request.json();
    const { endedAt, notes } = body;

    // 방문 기록 조회 및 권한 확인
    const { data: visit, error: visitError } = await supabase
      .from('exhibition_visits')
      .select('*')
      .eq('id', visitId)
      .eq('user_id', user.id)
      .single();

    if (visitError || !visit) {
      return NextResponse.json<EndVisitResponse>(
        {
          success: false,
          error: 'Visit not found or unauthorized',
        },
        { status: 404 }
      );
    }

    if (visit.status !== 'in_progress') {
      return NextResponse.json<EndVisitResponse>(
        {
          success: false,
          error: 'Visit is not in progress',
        },
        { status: 400 }
      );
    }

    // 방문 종료
    const endTime = endedAt || new Date().toISOString();
    const { error: updateError } = await supabase
      .from('exhibition_visits')
      .update({
        ended_at: endTime,
        status: 'completed',
        notes: notes || visit.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', visitId);

    if (updateError) {
      console.error('Failed to end visit:', updateError);
      return NextResponse.json<EndVisitResponse>(
        {
          success: false,
          error: 'Failed to end visit',
        },
        { status: 500 }
      );
    }

    // 작품 기록 수 조회
    const { count: recordCount } = await supabase
      .from('artwork_records')
      .select('*', { count: 'exact', head: true })
      .eq('visit_id', visitId);

    // 관람 시간 계산 (분)
    const startTime = new Date(visit.started_at).getTime();
    const end = new Date(endTime).getTime();
    const duration = Math.floor((end - startTime) / 1000 / 60);

    return NextResponse.json<EndVisitResponse>({
      success: true,
      data: {
        visitId,
        duration,
        recordCount: recordCount || 0,
        analysisStarted: false, // Phase 4에서 구현
      },
    });
  } catch (error) {
    console.error('End visit error:', error);
    return NextResponse.json<EndVisitResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
