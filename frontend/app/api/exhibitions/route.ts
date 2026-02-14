import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CACHE_MAX_AGE = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '40'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({ success: false, data: [], error: 'Database connection not configured' });
    }

    const supabase = await createClient();

    let query = supabase
      .from('exhibitions')
      .select('id,title_local,title_en,venue_name,venue_city,venue_country,start_date,end_date,description,image_url,admission_fee,artists,tags,source,source_url,status,metadata', { count: 'exact' });

    // Status filter
    const status = searchParams.get('status');
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

    // City filter
    const city = searchParams.get('city');
    if (city && city !== 'all') {
      query = query.eq('venue_city', city);
    }

    // Country filter
    const country = searchParams.get('country');
    if (country && country !== 'all') {
      query = query.eq('venue_country', country);
    }

    // Closing soon filter (within 7 days)
    const closingSoon = searchParams.get('closing_soon');
    if (closingSoon === 'true') {
      const now = new Date();
      const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      query = query.gte('end_date', now.toISOString()).lte('end_date', soon.toISOString());
    }

    // Search
    const search = searchParams.get('search');
    if (search) {
      const s = search.replace(/[%_\\]/g, '\\$&');
      query = query.or(`title_local.ilike.%${s}%,title_en.ilike.%${s}%,venue_name.ilike.%${s}%,description.ilike.%${s}%`);
    }

    // Sorting: prioritize ongoing, then by start_date desc
    const sort = searchParams.get('sort');
    if (sort === 'closing_soon') {
      query = query.order('end_date', { ascending: true });
    } else {
      query = query.order('start_date', { ascending: false, nullsFirst: false });
    }

    query = query.range(offset, offset + limit - 1);

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 8000);
    });

    const queryResult = await Promise.race([query, timeoutPromise]) as any;
    const { data: exhibitions, error, count } = queryResult;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json({ success: false, data: [], error: error.message });
    }

    // Stats only on first page
    let totalStats = null;
    if (offset === 0) {
      try {
        const now = new Date().toISOString();
        const [ongoingR, upcomingR, endedR, totalR] = await Promise.all([
          supabase.from('exhibitions').select('*', { count: 'exact', head: true }).lte('start_date', now).gte('end_date', now),
          supabase.from('exhibitions').select('*', { count: 'exact', head: true }).gt('start_date', now),
          supabase.from('exhibitions').select('*', { count: 'exact', head: true }).lt('end_date', now),
          supabase.from('exhibitions').select('*', { count: 'exact', head: true })
        ]);
        totalStats = {
          ongoing: ongoingR.count || 0,
          upcoming: upcomingR.count || 0,
          ended: endedR.count || 0,
          total: totalR.count || 0
        };
      } catch {
        totalStats = null;
      }
    }

    // Get unique cities for filter options (first page only)
    let cities: string[] = [];
    if (offset === 0) {
      try {
        const { data: cityData } = await supabase
          .from('exhibitions')
          .select('venue_city')
          .not('venue_city', 'is', null)
          .neq('venue_city', '')
          .limit(1000);

        const citySet = new Map<string, number>();
        (cityData || []).forEach(r => {
          if (r.venue_city) citySet.set(r.venue_city, (citySet.get(r.venue_city) || 0) + 1);
        });
        cities = [...citySet.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 30)
          .map(([city]) => city);
      } catch {
        cities = [];
      }
    }

    const transformedData = (exhibitions || []).map((ex: any) => {
      const titleLocal = ex.title_local || '';
      const titleEn = ex.title_en || '';
      const daysUntilEnd = ex.end_date ? Math.ceil((new Date(ex.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

      return {
        id: ex.id,
        title: titleLocal || titleEn || `${ex.venue_name || ''} Exhibition`,
        titleEn: titleEn || null,
        titleLocal: titleLocal || null,
        venue: ex.venue_name || '',
        location: ex.venue_city || '',
        country: ex.venue_country || '',
        startDate: ex.start_date,
        endDate: ex.end_date,
        description: ex.description || undefined,
        image: ex.image_url || undefined,
        price: ex.admission_fee || undefined,
        status: determineStatus(ex.start_date, ex.end_date),
        closingSoon: daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 7,
        daysLeft: daysUntilEnd,
        artists: ex.artists || undefined,
        tags: ex.tags || undefined,
        source: ex.source || undefined,
        featured: false
      };
    });

    const response = NextResponse.json({
      success: true,
      data: transformedData,
      total: count || transformedData.length,
      totalStats,
      cities,
      hasMore: (offset + limit) < (count || 0),
      timestamp: new Date().toISOString()
    });

    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_MAX_AGE}, stale-while-revalidate=60`);
    return response;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Exhibitions API error:', errorMessage);

    return NextResponse.json({
      success: false,
      data: [],
      error: 'Service temporarily unavailable'
    });
  }
}

function determineStatus(startDate: string, endDate: string): 'ongoing' | 'upcoming' | 'ended' {
  if (!startDate || !endDate) return 'upcoming';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}
