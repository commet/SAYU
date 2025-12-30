/**
 * GET /api/artworks/search
 * 작품 검색 API (자동완성용)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SearchArtworksResponse } from '@/shared/exhibition-recording-types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const exhibitionId = searchParams.get('exhibitionId');
    const query = searchParams.get('query');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!exhibitionId || !query) {
      return NextResponse.json<SearchArtworksResponse>(
        {
          success: false,
          error: 'Exhibition ID and query are required',
        },
        { status: 400 }
      );
    }

    // Supabase RPC 함수 사용 (더 효율적)
    // 먼저 함수가 존재하는지 확인하고, 없으면 직접 쿼리
    const { data: artworks, error } = await supabase.rpc('search_exhibition_artworks', {
      p_exhibition_id: exhibitionId,
      p_query: query,
      p_limit: limit,
    });

    if (error) {
      // RPC 함수가 없으면 직접 검색
      console.warn('RPC function not available, using direct query:', error);

      const { data: directResults, error: directError } = await supabase
        .from('exhibition_artworks')
        .select('*')
        .eq('exhibition_id', exhibitionId)
        .or(
          `title.ilike.%${query}%,title_en.ilike.%${query}%,artist.ilike.%${query}%,artist_en.ilike.%${query}%`
        )
        .order('display_order', { ascending: true })
        .limit(limit);

      if (directError) {
        console.error('Failed to search artworks:', directError);
        return NextResponse.json<SearchArtworksResponse>(
          {
            success: false,
            error: 'Failed to search artworks',
          },
          { status: 500 }
        );
      }

      return NextResponse.json<SearchArtworksResponse>({
        success: true,
        data: directResults || [],
      });
    }

    return NextResponse.json<SearchArtworksResponse>({
      success: true,
      data: artworks || [],
    });
  } catch (error) {
    console.error('Search artworks error:', error);
    return NextResponse.json<SearchArtworksResponse>(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
