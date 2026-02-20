import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  try {
    const { artistId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('artist_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('artist_id', artistId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Already following this artist' },
        { status: 400 }
      );
    }

    // Create follow record
    const { data: follow, error: followError } = await supabase
      .from('artist_follows')
      .insert({
        user_id: user.id,
        artist_id: artistId,
        followed_at: new Date().toISOString(),
        notification_settings: {
          newExhibitions: true,
          mediaUpdates: true,
          socialUpdates: false
        }
      })
      .select()
      .single();

    if (followError) {
      console.error('Error creating follow:', followError);
      return NextResponse.json(
        { error: 'Failed to follow artist' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Artist followed successfully',
      follow
    });
  } catch (error) {
    console.error('Error in follow artist route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
