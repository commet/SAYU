import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  const { count } = await supabase
    .from('counselor_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'completed');

  const { data, error } = await supabase
    .from('counselor_sessions')
    .select('id, artwork_title, artwork_artist, artwork_thumbnail_url, summary, mood_tags, completed_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const sessions = (data || []).map((row) => ({
    id: row.id,
    artworkTitle: row.artwork_title,
    artworkArtist: row.artwork_artist,
    artworkThumbnailUrl: row.artwork_thumbnail_url,
    summary: row.summary,
    moodTags: row.mood_tags || [],
    completedAt: row.completed_at,
  }));

  return NextResponse.json({ success: true, sessions, total: count || 0 });
}
