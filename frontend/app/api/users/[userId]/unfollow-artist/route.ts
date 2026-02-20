import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the authenticated user matches the URL userId
    if (user.id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { artistId } = await request.json();

    // Delete follow record (RLS ensures user can only delete own follows)
    const { error: deleteError } = await supabase
      .from('artist_follows')
      .delete()
      .eq('user_id', user.id)
      .eq('artist_id', artistId);

    if (deleteError) {
      console.error('Error deleting follow:', deleteError);
      return NextResponse.json(
        { error: 'Failed to unfollow artist' },
        { status: 500 }
      );
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
