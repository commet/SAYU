import { Suspense } from 'react';
import MatchingPageClient from './MatchingPageClient';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MatchingPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <MatchingPageClient />
    </Suspense>
  );
}