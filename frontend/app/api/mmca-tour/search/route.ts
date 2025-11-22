import { NextRequest, NextResponse } from 'next/server';
import { quickSearchArtworks } from '@/lib/mmca-tour/recommendation';

/**
 * GET /api/mmca-tour/search
 * 작품 빠른 검색 (현장에서 사용)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const results = quickSearchArtworks(query);

    return NextResponse.json({
      success: true,
      data: results.slice(0, 10) // 최대 10개 결과
    });
  } catch (error) {
    console.error('Error searching artworks:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to search artworks'
    }, { status: 500 });
  }
}
