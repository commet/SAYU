/**
 * POST /api/visits/[id]/records
 * 작품 기록 추가 API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { AddRecordRequest, AddRecordResponse } from '@/shared/exhibition-recording-types';

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
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // 요청 body 파싱
    const body: AddRecordRequest = await request.json();
    const {
      artworkId,
      emotions,
      emotionText,
      emotionIntensity,
      note,
      recognitionMethod,
      recordedAt,
    } = body;

    // 유효성 검증
    if (!artworkId || !emotions || emotions.length === 0) {
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'Artwork ID and emotions are required',
        },
        { status: 400 }
      );
    }

    // 방문 기록 조회 및 권한 확인
    const { data: visit, error: visitError } = await supabase
      .from('exhibition_visits')
      .select('*')
      .eq('id', visitId)
      .eq('user_id', user.id)
      .single();

    if (visitError || !visit) {
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'Visit not found or unauthorized',
        },
        { status: 404 }
      );
    }

    if (visit.status !== 'in_progress') {
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'Visit is not in progress',
        },
        { status: 400 }
      );
    }

    // 작품 정보 조회
    const { data: artwork, error: artworkError } = await supabase
      .from('exhibition_artworks')
      .select('*')
      .eq('id', artworkId)
      .single();

    if (artworkError || !artwork) {
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'Artwork not found',
        },
        { status: 404 }
      );
    }

    // 이미 이 작품을 기록했는지 확인
    const { data: existingRecord } = await supabase
      .from('artwork_records')
      .select('id')
      .eq('visit_id', visitId)
      .eq('artwork_id', artworkId)
      .single();

    if (existingRecord) {
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'This artwork has already been recorded in this visit',
        },
        { status: 409 }
      );
    }

    // 작품 기록 생성
    const { data: newRecord, error: insertError } = await supabase
      .from('artwork_records')
      .insert({
        visit_id: visitId,
        artwork_id: artworkId,
        recorded_at: recordedAt || new Date().toISOString(),
        emotions,
        emotion_text: emotionText,
        emotion_intensity: emotionIntensity,
        note,
        recognition_method: recognitionMethod,
        is_offline_record: false,
      })
      .select()
      .single();

    if (insertError || !newRecord) {
      console.error('Failed to create record:', insertError);
      return NextResponse.json<AddRecordResponse>(
        {
          success: false,
          error: 'Failed to create record',
        },
        { status: 500 }
      );
    }

    // sequence_number는 트리거가 자동으로 할당하므로 다시 조회
    const { data: finalRecord } = await supabase
      .from('artwork_records')
      .select('*')
      .eq('id', newRecord.id)
      .single();

    return NextResponse.json<AddRecordResponse>({
      success: true,
      data: {
        recordId: newRecord.id,
        sequenceNumber: finalRecord?.sequence_number || 1,
        artwork: {
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
        },
      },
    });
  } catch (error) {
    console.error('Add record error:', error);
    return NextResponse.json<AddRecordResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/visits/[id]/records
 * 방문의 모든 작품 기록 조회
 */
export async function GET(
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
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      );
    }

    // 방문 기록 조회 및 권한 확인
    const { data: visit, error: visitError } = await supabase
      .from('exhibition_visits')
      .select('*')
      .eq('id', visitId)
      .eq('user_id', user.id)
      .single();

    if (visitError || !visit) {
      return NextResponse.json(
        {
          success: false,
          error: 'Visit not found or unauthorized',
        },
        { status: 404 }
      );
    }

    // 작품 기록 조회 (작품 정보와 함께)
    const { data: records, error: recordsError } = await supabase
      .from('artwork_records')
      .select(
        `
        *,
        artwork:exhibition_artworks(*)
      `
      )
      .eq('visit_id', visitId)
      .order('sequence_number', { ascending: true });

    if (recordsError) {
      console.error('Failed to fetch records:', recordsError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch records',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: records || [],
    });
  } catch (error) {
    console.error('Get records error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
