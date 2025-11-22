import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getArtworkById } from '@/data/mmca-tour-data';
import { MMCATourMemberStatus } from '@/types/mmca-tour';
import { SAYUTypeCode } from '@/shared/SAYUTypeDefinitions';

/**
 * GET /api/mmca-tour/team-status
 * 팀 멤버들의 실시간 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const oderId = searchParams.get('oderId');

    if (!oderId) {
      return NextResponse.json({
        success: false,
        error: 'Tour ID is required'
      }, { status: 400 });
    }

    // 투어 정보 조회
    const { data: tour, error: tourError } = await supabase
      .from('mmca_tours')
      .select('*')
      .eq('id', oderId)
      .single();

    if (tourError || !tour) {
      return NextResponse.json({
        success: false,
        error: 'Tour not found'
      }, { status: 404 });
    }

    // 팀 멤버 목록
    const memberIds = tour.member_ids || [];

    // 멤버 프로필 조회
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, personality_type')
      .in('id', memberIds);

    // 각 멤버의 감상 기록 조회
    const { data: allImpressions } = await supabase
      .from('mmca_tour_impressions')
      .select('user_id, artwork_id, created_at')
      .eq('tour_id', oderId)
      .order('created_at', { ascending: false });

    // 각 멤버의 추천 작품 수 조회 (나중에 개인화)
    const totalRecommended = 5; // 기본 추천 수

    // 멤버별 상태 집계
    const memberStatuses: MMCATourMemberStatus[] = (profiles || []).map(profile => {
      const userImpressions = (allImpressions || []).filter(
        imp => imp.user_id === profile.id
      );

      const lastImpression = userImpressions[0];
      let lastActivity = undefined;

      if (lastImpression) {
        const artwork = getArtworkById(lastImpression.artwork_id);
        lastActivity = {
          artworkTitle: artwork?.title || 'Unknown',
          action: 'recorded' as const,
          timestamp: lastImpression.created_at
        };
      }

      return {
        oderId: profile.id,
        username: profile.username || '익명 사용자',
        avatarUrl: profile.avatar_url,
        personalityType: (profile.personality_type || 'LAEF') as SAYUTypeCode,
        impressionCount: userImpressions.length,
        recommendedArtworksViewed: userImpressions.length, // 추후 추적 개선
        totalRecommended,
        lastActivity,
        isOnline: true // 실시간 presence 구현 시 업데이트
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tour,
        members: memberStatuses,
        totalImpressions: (allImpressions || []).length
      }
    });
  } catch (error) {
    console.error('Error fetching team status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch team status'
    }, { status: 500 });
  }
}
