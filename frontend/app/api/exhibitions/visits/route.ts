import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ data: [], message: 'Not authenticated' });
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('exhibition_visits')
      .select(`
        id,
        exhibition_id,
        visited_at,
        exhibitions (
          id,
          title,
          venue,
          location,
          start_date,
          end_date,
          image_url,
          status
        )
      `)
      .eq('user_id', session.user.id)
      .order('visited_at', { ascending: false })
      .limit(limit);

    const { data: visits, error } = await query;

    if (error) {
      console.error('Error fetching visits:', error);
      return NextResponse.json({ data: [], error: error.message }, { status: 500 });
    }

    // Transform to match expected format
    const transformedVisits = (visits || [])
      .filter((v): v is typeof v & { exhibitions: NonNullable<typeof v.exhibitions> } =>
        v.exhibitions !== null
      )
      .map((visit) => ({
        id: visit.exhibitions.id,
        title: visit.exhibitions.title,
        venue: visit.exhibitions.venue,
        location: visit.exhibitions.location,
        startDate: visit.exhibitions.start_date,
        endDate: visit.exhibitions.end_date,
        image: visit.exhibitions.image_url,
        status: visit.exhibitions.status,
        visited_at: visit.visited_at,
      }));

    // Apply search filter if provided
    const filteredVisits = search
      ? transformedVisits.filter(
          (v) =>
            v.title?.toLowerCase().includes(search.toLowerCase()) ||
            v.venue?.toLowerCase().includes(search.toLowerCase())
        )
      : transformedVisits;

    return NextResponse.json({ data: filteredVisits });
  } catch (error) {
    console.error('Error in visits API:', error);
    return NextResponse.json({ data: [], error: 'Internal server error' }, { status: 500 });
  }
}
