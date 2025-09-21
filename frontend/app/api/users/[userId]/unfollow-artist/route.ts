import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { userId } = params;
    const { artistId } = await request.json();

    // Delete follow record
    const { error: deleteError } = await supabase
      .from('artist_follows')
      .delete()
      .eq('user_id', userId)
      .eq('artist_id', artistId);

    if (deleteError) {
      console.error('Error deleting follow:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unfollow artist' },
        { status: 500 }
      );
    }

    // Update artist follow count
    const { data: artist } = await supabase
      .from('artists')
      .select('follow_count')
      .eq('id', artistId)
      .single();

    if (artist && artist.follow_count > 0) {
      await supabase
        .from('artists')
        .update({ follow_count: artist.follow_count - 1 })
        .eq('id', artistId);
    }

    return NextResponse.json({
      success: true,
      message: 'Artist unfollowed successfully'
    });
  } catch (error) {
    console.error('Error in unfollow-artist route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}