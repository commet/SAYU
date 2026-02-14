import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function determineStatus(startDate: string | null, endDate: string | null): 'ongoing' | 'upcoming' | 'ended' {
  if (!startDate || !endDate) return 'upcoming';
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'ongoing';
}

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    const { data, error } = await supabase
      .from('exhibitions')
      .select('id,title_local,title_en,venue_name,venue_city,venue_country,venue_address,start_date,end_date,description,image_url,admission_fee,artists,tags,source,source_url,status,metadata')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Exhibition not found', details: error.message },
        { status: 404 }
      );
    }

    const titleLocal = data.title_local || '';
    const titleEn = data.title_en || '';
    const daysUntilEnd = data.end_date
      ? Math.ceil((new Date(data.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null;
    const exStatus = determineStatus(data.start_date, data.end_date);

    const transformedData = {
      id: data.id,
      title: titleLocal || titleEn || `${data.venue_name || ''} Exhibition`,
      titleEn: titleEn || null,
      titleLocal: titleLocal || null,
      venue: data.venue_name || '',
      location: data.venue_city || '',
      country: data.venue_country || '',
      address: data.venue_address || '',
      startDate: data.start_date,
      endDate: data.end_date,
      description: data.description || '',
      image: data.image_url || null,
      price: data.admission_fee || null,
      status: exStatus,
      closingSoon: daysUntilEnd !== null && daysUntilEnd >= 0 && daysUntilEnd <= 7,
      daysLeft: daysUntilEnd,
      artists: data.artists || null,
      tags: data.tags || null,
      source: data.source || null,
      sourceUrl: data.source_url || null,
    };

    // Fetch related exhibitions (same venue or city, limit 4)
    let related: any[] = [];
    try {
      const conditions = [];
      if (data.venue_name) conditions.push(`venue_name.eq.${data.venue_name}`);
      if (data.venue_city) conditions.push(`venue_city.eq.${data.venue_city}`);

      if (conditions.length > 0) {
        const { data: relatedData } = await supabase
          .from('exhibitions')
          .select('id,title_local,title_en,venue_name,venue_city,image_url,start_date,end_date')
          .or(conditions.join(','))
          .neq('id', id)
          .order('start_date', { ascending: false, nullsFirst: false })
          .limit(4);

        related = (relatedData || []).map((r: any) => ({
          id: r.id,
          title: r.title_local || r.title_en || `${r.venue_name || ''} Exhibition`,
          venue: r.venue_name || '',
          location: r.venue_city || '',
          image: r.image_url || null,
          status: determineStatus(r.start_date, r.end_date),
        }));
      }
    } catch {
      // related exhibitions are optional
    }

    const response = NextResponse.json({
      success: true,
      data: transformedData,
      related,
    });
    response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
    return response;

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('exhibitions')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json(
        { error: 'Failed to update exhibition', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = context.params;

    const { error } = await supabase
      .from('exhibitions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete exhibition', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exhibition deleted successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}