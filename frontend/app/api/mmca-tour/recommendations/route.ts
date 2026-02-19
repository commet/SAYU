import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { recommendArtworks, getAllExhibitions } from '@/lib/mmca-tour/recommendation';
import { SAYUTypeCode, isValidSAYUType } from '@sayu/shared/SAYUTypeDefinitions';

const querySchema = z.object({
  aptType: z.string().trim().optional(),
  count: z.coerce.number().int().min(1).max(12).default(5),
  exhibitions: z.string().trim().optional(),
});

/**
 * GET /api/mmca-tour/recommendations
 * Returns APT-based recommendations.
 */
export async function GET(request: NextRequest) {
  try {
    const parsedQuery = querySchema.safeParse({
      aptType: request.nextUrl.searchParams.get('aptType'),
      count: request.nextUrl.searchParams.get('count') || '5',
      exhibitions: request.nextUrl.searchParams.get('exhibitions'),
    });

    if (!parsedQuery.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameter',
      }, { status: 400 });
    }

    const aptType = parsedQuery.data.aptType || null;
    const count = parsedQuery.data.count;
    const exhibitionIds = parsedQuery.data.exhibitions
      ? parsedQuery.data.exhibitions.split(',').map((value) => value.trim()).filter(Boolean)
      : undefined;

    if (!aptType) {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('personality_type')
          .eq('id', user.id)
          .single();

        if (profile?.personality_type && isValidSAYUType(profile.personality_type)) {
          const recommendations = recommendArtworks(
            profile.personality_type as SAYUTypeCode,
            count,
            exhibitionIds
          );

          return NextResponse.json({
            success: true,
            data: {
              aptType: profile.personality_type,
              recommendations,
              exhibitions: getAllExhibitions(),
            },
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'APT type is required. Please complete the personality quiz first.',
      }, { status: 400 });
    }

    if (!isValidSAYUType(aptType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid APT type: ${aptType}`,
      }, { status: 400 });
    }

    const recommendations = recommendArtworks(
      aptType as SAYUTypeCode,
      count,
      exhibitionIds
    );

    return NextResponse.json({
      success: true,
      data: {
        aptType,
        recommendations,
        exhibitions: getAllExhibitions(),
      },
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations',
    }, { status: 500 });
  }
}
