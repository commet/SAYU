import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  if (body.action === 'create') {
    const { artworkId, artworkTitle, artworkArtist, artworkImageUrl, artworkThumbnailUrl, aptType } = body;

    const { data, error } = await supabase
      .from('counselor_sessions')
      .insert({
        user_id: user.id,
        artwork_id: artworkId,
        artwork_title: artworkTitle,
        artwork_artist: artworkArtist || null,
        artwork_image_url: artworkImageUrl || null,
        artwork_thumbnail_url: artworkThumbnailUrl || null,
        apt_type: aptType,
        messages: [],
        status: 'active',
      })
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionId: data.id });
  }

  if (body.action === 'complete') {
    const { sessionId, messages, summary, moodTags } = body;

    const { error } = await supabase
      .from('counselor_sessions')
      .update({
        messages,
        summary: summary || null,
        mood_tags: moodTags || [],
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
