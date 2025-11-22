import { NextRequest, NextResponse } from 'next/server';
import { MMCA_EXHIBITIONS, MMCA_ARTWORKS, MMCA_ARTISTS } from '@/data/mmca-tour-data';

/**
 * GET /api/mmca-tour/exhibitions
 * MMCA 전시 목록 및 작품 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get('id');

    if (exhibitionId) {
      // 특정 전시 상세 조회
      const exhibition = MMCA_EXHIBITIONS.find(e => e.id === exhibitionId);
      if (!exhibition) {
        return NextResponse.json({
          success: false,
          error: 'Exhibition not found'
        }, { status: 404 });
      }

      const artworks = MMCA_ARTWORKS.filter(a => a.exhibitionId === exhibitionId);
      const artistIds = [...new Set(artworks.map(a => a.artistId))];
      const artists = MMCA_ARTISTS.filter(a => artistIds.includes(a.id));

      return NextResponse.json({
        success: true,
        data: {
          exhibition,
          artworks,
          artists
        }
      });
    }

    // 전체 전시 목록 조회
    const exhibitions = MMCA_EXHIBITIONS.map(exhibition => ({
      ...exhibition,
      artworkCount: MMCA_ARTWORKS.filter(a => a.exhibitionId === exhibition.id).length
    }));

    return NextResponse.json({
      success: true,
      data: exhibitions
    });
  } catch (error) {
    console.error('Error fetching MMCA exhibitions:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch exhibitions'
    }, { status: 500 });
  }
}
