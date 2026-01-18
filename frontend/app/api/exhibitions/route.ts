import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Types for exhibition data
interface ExhibitionRow {
  id: string;
  title_local?: string;
  title_en?: string;
  title?: string;
  venue_name?: string;
  venue?: string;
  venue_city?: string;
  location?: string;
  start_date: string;
  end_date: string;
  description?: string;
  image_url?: string;
  category?: string;
  price?: string;
  admission_fee?: string;
  view_count?: number;
  like_count?: number;
  featured?: boolean;
}

interface TransformedExhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  startDate: string;
  endDate: string;
  description?: string;
  image?: string;
  category: string;
  price: string;
  status: 'ongoing' | 'upcoming' | 'ended';
  viewCount: number;
  likeCount: number;
  featured: boolean;
}

interface ExhibitionStats {
  ongoing: number;
  upcoming: number;
  ended: number;
  total: number;
}

// Cache duration: 5 minutes (in seconds for HTTP cache headers)
const CACHE_MAX_AGE = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        data: [],
        error: 'Database connection not configured'
      });
    }
    
    const supabase = await createClient();
    
    // Build query with pagination
    let query = supabase
      .from('exhibitions')
      .select('*', { count: 'exact' });
    
    // Apply filters if provided
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    if (status && status !== 'all') {
      const now = new Date().toISOString();
      if (status === 'ongoing') {
        query = query.lte('start_date', now).gte('end_date', now);
      } else if (status === 'upcoming') {
        query = query.gt('start_date', now);
      } else if (status === 'ended') {
        query = query.lt('end_date', now);
      }
    }
    
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    
    if (search) {
      query = query.or(`title_local.ilike.%${search}%,title_en.ilike.%${search}%,venue_name.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Apply sorting and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Execute query with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 5000);
    });

    const queryResult = await Promise.race([
      query,
      timeoutPromise
    ]);

    const { data: exhibitions, error, count } = queryResult as {
      data: ExhibitionRow[] | null;
      error: { message: string } | null;
      count: number | null;
    };

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({
        success: false,
        data: [],
        error: error.message
      });
    }
    
    // Get total statistics for all exhibitions (not just current page)
    let totalStats = null;
    if (offset === 0) { // Only fetch stats on first page
      try {
        const now = new Date().toISOString();
        
        // Get counts for each status
        const [ongoingResult, upcomingResult, endedResult, totalResult] = await Promise.all([
          supabase.from('exhibitions').select('*', { count: 'exact', head: true })
            .lte('start_date', now).gte('end_date', now),
          supabase.from('exhibitions').select('*', { count: 'exact', head: true })
            .gt('start_date', now),
          supabase.from('exhibitions').select('*', { count: 'exact', head: true })
            .lt('end_date', now),
          supabase.from('exhibitions').select('*', { count: 'exact', head: true })
        ]);
        
        totalStats = {
          ongoing: ongoingResult.count || 0,
          upcoming: upcomingResult.count || 0,
          ended: endedResult.count || 0,
          total: totalResult.count || 0
        };
        
        console.log('Total statistics:', totalStats);
      } catch (statsError) {
        console.error('Failed to fetch statistics:', statsError);
        // Use approximate counts as fallback
        totalStats = {
          ongoing: count ? Math.floor(count * 0.4) : 50,
          upcoming: count ? Math.floor(count * 0.3) : 30,
          ended: count ? Math.floor(count * 0.3) : 30,
          total: count || 110
        };
      }
    }

    // Transform data efficiently
    const transformedData: TransformedExhibition[] = (exhibitions || []).map((ex) => ({
      id: ex.id,
      title: ex.title_local || ex.title_en || ex.title || `${ex.venue_name || '미지의 장소'} 전시`,
      venue: ex.venue_name || ex.venue || '미지의 장소',
      location: ex.venue_city || ex.location || '서울',
      startDate: ex.start_date,
      endDate: ex.end_date,
      description: ex.description,
      image: ex.image_url,
      category: ex.category || '미술',
      price: ex.price || ex.admission_fee || '정보 없음',
      status: determineStatus(ex.start_date, ex.end_date),
      viewCount: ex.view_count || 0,
      likeCount: ex.like_count || 0,
      featured: ex.featured || false
    }));
    
    const response = NextResponse.json({
      success: true,
      data: transformedData,
      total: count || transformedData.length,
      totalStats: totalStats,
      timestamp: new Date().toISOString()
    });

    // Set HTTP cache headers for CDN/browser caching
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`);

    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exhibitions API error:', errorMessage);
    
    // Return fallback data on error
    const fallbackData = [
      {
        id: 'fallback-1',
        title: '이불: 1998년 이후',
        venue: '리움미술관',
        location: '서울',
        startDate: '2025-09-04',
        endDate: '2026-01-04',
        description: '한국 현대미술을 대표하는 이불 작가의 대규모 회고전',
        image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800&h=600&fit=crop',
        category: '현대미술',
        price: '성인 20,000원',
        status: 'upcoming',
        viewCount: 156,
        likeCount: 42,
        featured: true
      }
    ];
    
    return NextResponse.json({
      success: false,
      data: fallbackData,
      error: 'Service temporarily unavailable',
      fallback: true
    });
  }
}

// Helper function to determine exhibition status
function determineStatus(startDate: string, endDate: string): 'ongoing' | 'upcoming' | 'ended' {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}