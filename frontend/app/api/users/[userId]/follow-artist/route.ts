import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the authenticated user matches the URL userId
    if (user.id !== params.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { artistId } = await request.json();

    // Create follow record (RLS ensures user can only create own follows)
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

    // Get artist data
    const { data: artist } = await supabase
      .from('artists')
      .select('*')
      .eq('id', artistId)
      .single();

    return NextResponse.json({
      follow,
      artist
    });
  } catch (error) {
    console.error('Error in follow-artist route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
