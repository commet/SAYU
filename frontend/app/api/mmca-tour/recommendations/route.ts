import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recommendArtworks, getAllExhibitions } from '@/lib/mmca-tour/recommendation';
import { SAYUTypeCode, isValidSAYUType } from '@/shared/SAYUTypeDefinitions';

/**
 * GET /api/mmca-tour/recommendations
 * APT 기반 개인화 작품 추천
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const aptType = searchParams.get('aptType');
    const count = parseInt(searchParams.get('count') || '5');
    const exhibitionIds = searchParams.get('exhibitions')?.split(',').filter(Boolean);

    // APT 타입 검증
    if (!aptType) {
      // 로그인 사용자의 APT 타입 조회 시도
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
              exhibitions: getAllExhibitions()
            }
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'APT type is required. Please complete the personality quiz first.'
      }, { status: 400 });
    }

    if (!isValidSAYUType(aptType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid APT type: ${aptType}`
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
        exhibitions: getAllExhibitions()
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate recommendations'
    }, { status: 500 });
  }
}
