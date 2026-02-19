import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getArtworkById } from '@/data/mmca-tour-data';
import { MMCATourMemberStatus } from '@/types/mmca-tour';
import { SAYUTypeCode } from '@sayu/shared/SAYUTypeDefinitions';

interface TourRow {
  id: string;
  created_by: string | null;
  member_ids: string[] | null;
  exhibition_ids: string[] | null;
  status: string | null;
  visit_date: string | null;
}

interface ProfileRow {
  id: string;
  username: string | null;
  avatar_url: string | null;
  personality_type: string | null;
}

interface ImpressionRow {
  user_id: string;
  artwork_id: string;
  created_at: string;
}

const querySchema = z.object({
  tourId: z.string().min(1).max(120).optional(),
  oderId: z.string().min(1).max(120).optional(),
});

function canAccessTour(tour: TourRow | null, userId: string) {
  if (!tour) return false;
  if (tour.created_by === userId) return true;
  return Array.isArray(tour.member_ids) && tour.member_ids.includes(userId);
}

/**
 * GET /api/mmca-tour/team-status
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

    const parsedQuery = querySchema.safeParse({
      tourId: request.nextUrl.searchParams.get('tourId'),
      oderId: request.nextUrl.searchParams.get('oderId'),
    });

    if (!parsedQuery.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameter',
      }, { status: 400 });
    }

    const tourId = parsedQuery.data.tourId || parsedQuery.data.oderId;
    if (!tourId) {
      return NextResponse.json({
        success: false,
        error: 'Tour ID is required',
      }, { status: 400 });
    }

    const { data: tourData, error: tourError } = await supabase
      .from('mmca_tours')
      .select('id, created_by, member_ids, exhibition_ids, status, visit_date')
      .eq('id', tourId)
      .single();

    const tour = (tourData || null) as TourRow | null;
    if (tourError || !tour) {
      return NextResponse.json({
        success: false,
        error: 'Tour not found',
      }, { status: 404 });
    }

    if (!canAccessTour(tour, user.id)) {
      return NextResponse.json({
        success: false,
        error: 'Forbidden',
      }, { status: 403 });
    }

    const memberIds = Array.isArray(tour.member_ids) ? tour.member_ids : [];
    if (memberIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          tour,
          members: [],
          totalImpressions: 0,
        },
      });
    }

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, personality_type')
      .in('id', memberIds);

    const { data: impressionsData } = await supabase
      .from('mmca_tour_impressions')
      .select('user_id, artwork_id, created_at')
      .eq('tour_id', tourId)
      .order('created_at', { ascending: false });

    const profiles = (profilesData || []) as ProfileRow[];
    const allImpressions = (impressionsData || []) as ImpressionRow[];
    const totalRecommended = 5;

    const memberStatuses: MMCATourMemberStatus[] = profiles.map((profile) => {
      const userImpressions = allImpressions.filter((imp) => imp.user_id === profile.id);
      const lastImpression = userImpressions[0];

      const lastActivity = lastImpression
        ? {
            artworkTitle: getArtworkById(lastImpression.artwork_id)?.title || 'Unknown',
            action: 'recorded' as const,
            timestamp: lastImpression.created_at,
          }
        : undefined;

      return {
        memberId: profile.id,
        oderId: profile.id, // Backward compatibility
        username: profile.username || 'Anonymous User',
        avatarUrl: profile.avatar_url || undefined,
        personalityType: (profile.personality_type || 'LAEF') as SAYUTypeCode,
        impressionCount: userImpressions.length,
        recommendedArtworksViewed: userImpressions.length,
        totalRecommended,
        lastActivity,
        isOnline: false,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        tour,
        members: memberStatuses,
        totalImpressions: allImpressions.length,
      },
    });
  } catch (error) {
    console.error('Error fetching team status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch team status',
    }, { status: 500 });
  }
}
