import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getArtworkById, getExhibitionById, getArtistById } from '@/data/mmca-tour-data';

interface TourRow {
  id: string;
  created_by: string | null;
  member_ids: string[] | null;
}

interface ImpressionRow {
  id: string;
  user_id: string;
  tour_id: string;
  artwork_id: string;
  rating: 'love' | 'like' | 'neutral' | 'dislike';
  emotion_tags: string[] | null;
  memo: string | null;
  photo_url: string | null;
  is_best_pick: boolean;
  created_at: string;
  updated_at: string | null;
}

const saveImpressionSchema = z.object({
  tourId: z.string().min(1).max(120).optional(),
  oderId: z.string().min(1).max(120).optional(),
  artworkId: z.string().min(1).max(120),
  rating: z.enum(['love', 'like', 'neutral', 'dislike']),
  emotionTags: z.array(z.string().min(1).max(32)).max(12).default([]),
  memo: z.string().max(2000).optional(),
  photoUrl: z.string().url().max(2048).optional(),
  isBestPick: z.boolean().optional(),
});

function resolveTourId(searchParams: URLSearchParams) {
  return searchParams.get('tourId') || searchParams.get('oderId');
}

function canAccessTour(tour: TourRow | null, userId: string) {
  if (!tour) return false;
  if (tour.created_by === userId) return true;
  return Array.isArray(tour.member_ids) && tour.member_ids.includes(userId);
}

/**
 * GET /api/mmca-tour/impressions
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tourId = resolveTourId(searchParams);

    let query = supabase
      .from('mmca_tour_impressions')
      .select('id, user_id, tour_id, artwork_id, rating, emotion_tags, memo, photo_url, is_best_pick, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (tourId) {
      query = query.eq('tour_id', tourId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching impressions:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    const impressions = (data || []) as ImpressionRow[];
    const enrichedImpressions = impressions.map((imp) => {
      const artwork = getArtworkById(imp.artwork_id);
      const exhibition = artwork ? getExhibitionById(artwork.exhibitionId) : null;
      const artist = artwork ? getArtistById(artwork.artistId) : null;

      return {
        ...imp,
        artwork,
        exhibition,
        artist,
      };
    });

    return NextResponse.json({
      success: true,
      data: enrichedImpressions,
    });
  } catch (error) {
    console.error('Error in impressions GET:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch impressions',
    }, { status: 500 });
  }
}

/**
 * POST /api/mmca-tour/impressions
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 });
    }

    const parsed = saveImpressionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request payload',
        details: parsed.error.flatten(),
      }, { status: 400 });
    }

    const {
      tourId: inputTourId,
      oderId,
      artworkId,
      rating,
      emotionTags,
      memo,
      photoUrl,
      isBestPick,
    } = parsed.data;

    const tourId = inputTourId || oderId;
    if (!tourId) {
      return NextResponse.json({
        success: false,
        error: 'Tour ID is required',
      }, { status: 400 });
    }

    const { data: tour, error: tourError } = await supabase
      .from('mmca_tours')
      .select('id, created_by, member_ids')
      .eq('id', tourId)
      .single();

    if (tourError || !canAccessTour((tour || null) as TourRow | null, user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden',
      }, { status: 403 });
    }

    const artwork = getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({
        success: false,
        error: 'Invalid artwork ID',
      }, { status: 400 });
    }

    const { data: impression, error } = await supabase
      .from('mmca_tour_impressions')
      .upsert({
        user_id: user.id,
        tour_id: tourId,
        artwork_id: artworkId,
        rating,
        emotion_tags: emotionTags,
        memo,
        photo_url: photoUrl,
        is_best_pick: isBestPick || false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tour_id,artwork_id',
      })
      .select('id, user_id, tour_id, artwork_id, rating, emotion_tags, memo, photo_url, is_best_pick, created_at, updated_at')
      .single();

    if (error) {
      console.error('Error saving impression:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: impression,
    });
  } catch (error) {
    console.error('Error in impressions POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to save impression',
    }, { status: 500 });
  }
}
