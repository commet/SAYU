import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { selectArtwork } from '@/lib/art-counselor/artwork-selector';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { aptType, excludeIds } = await request.json();
  const artwork = selectArtwork(aptType, excludeIds || []);

  if (!artwork) {
    return NextResponse.json({ error: 'No artwork available' }, { status: 404 });
  }

  return NextResponse.json({ success: true, artwork });
}
