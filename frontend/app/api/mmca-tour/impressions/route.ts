import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getArtworkById, getExhibitionById, getArtistById } from '@/data/mmca-tour-data';

/**
 * GET /api/mmca-tour/impressions
 * 사용자의 감상 기록 조회
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

    let query = supabase
      .from('mmca_tour_impressions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (oderId) {
      query = query.eq('tour_id', oderId);
    }

    const { data: impressions, error } = await query;

    if (error) {
      console.error('Error fetching impressions:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    // 작품 정보 첨부
    const enrichedImpressions = (impressions || []).map(imp => {
      const artwork = getArtworkById(imp.artwork_id);
      const exhibition = artwork ? getExhibitionById(artwork.exhibitionId) : null;
      const artist = artwork ? getArtistById(artwork.artistId) : null;

      return {
        ...imp,
        artwork,
        exhibition,
        artist
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedImpressions
    });
  } catch (error) {
    console.error('Error in impressions GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch impressions'
    }, { status: 500 });
  }
}

/**
 * POST /api/mmca-tour/impressions
 * 감상 기록 저장
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const body = await request.json();
    const { oderId, artworkId, rating, emotionTags, memo, photoUrl, isBestPick } = body;

    // 작품 유효성 확인
    const artwork = getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({
        success: false,
        error: 'Invalid artwork ID'
      }, { status: 400 });
    }

    // 감상 기록 저장
    const { data: impression, error } = await supabase
      .from('mmca_tour_impressions')
      .upsert({
        user_id: user.id,
        tour_id: oderId,
        artwork_id: artworkId,
        rating,
        emotion_tags: emotionTags,
        memo,
        photo_url: photoUrl,
        is_best_pick: isBestPick || false,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,tour_id,artwork_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving impression:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: impression
    });
  } catch (error) {
    console.error('Error in impressions POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save impression'
    }, { status: 500 });
  }
}
