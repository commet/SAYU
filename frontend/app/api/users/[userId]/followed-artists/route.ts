import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    // Get followed artists for user (RLS ensures access to own data)
    const { data: follows, error: followError } = await supabase
      .from('artist_follows')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('user_id', user.id);

    if (followError) {
      console.error('Error fetching follows:', followError);
      return NextResponse.json(
        { error: 'Failed to fetch followed artists' },
        { status: 500 }
      );
    }

    const artists = follows?.map(follow => follow.artist) || [];
    const followings = follows || [];

    return NextResponse.json({
      artists,
      followings
    });
  } catch (error) {
    console.error('Error in followed-artists route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
