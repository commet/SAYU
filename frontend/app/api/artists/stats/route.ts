import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase is configured
    // Read-only public route - use anon key to respect RLS
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    // Get total artists count
    const { count: totalArtists } = await supabase
      .from('artists')
      .select('*', { count: 'exact', head: true });

    // Get counts by copyright status
    const statuses = ['public_domain', 'licensed', 'contemporary', 'verified_artist'];
    const byStatus: Record<string, number> = {};
    
    for (const status of statuses) {
      const { count } = await supabase
        .from('artists')
        .select('*', { count: 'exact', head: true })
        .eq('copyright_status', status);
      byStatus[status] = count || 0;
    }

    // Get counts by nationality (top 10)
    const { data: nationalityData } = await supabase
      .from('artists')
      .select('nationality')
      .not('nationality', 'is', null);
    
    const byNationality: Record<string, number> = {};
    if (nationalityData) {
      nationalityData.forEach(artist => {
        if (artist.nationality) {
          byNationality[artist.nationality] = (byNationality[artist.nationality] || 0) + 1;
        }
      });
    }

    // Get counts by era
    const { data: eraData } = await supabase
      .from('artists')
      .select('era')
      .not('era', 'is', null);
    
    const byEra: Record<string, number> = {};
    if (eraData) {
      eraData.forEach(artist => {
        if (artist.era) {
          byEra[artist.era] = (byEra[artist.era] || 0) + 1;
        }
      });
    }

    return NextResponse.json({
      totalArtists: totalArtists || 0,
      byStatus,
      byNationality,
      byEra
    });
  } catch (error) {
    console.error('Error in artists stats route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}