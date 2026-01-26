import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const { count, error } = await supabase
      .from('exhibition_visits')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error counting visits:', error);
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (error) {
    console.error('Error in visits count:', error);
    return NextResponse.json({ count: 0 });
  }
}
