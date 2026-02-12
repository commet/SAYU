'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { FeedbackManager } from '@/components/admin/FeedbackManager';

export default function AdminFeedbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (loading) return;
        if (!user) {
          router.push('/admin/login');
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error || !profile?.is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
      } catch (error) {
        console.error('Admin role check failed:', error);
        router.push('/');
      } finally {
        setChecking(false);
      }
    };

    checkAdminRole();
  }, [loading, router, supabase, user]);

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-white text-sm">Checking admin permission...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white mb-2">Access denied</h1>
          <p className="text-gray-400">Admin role is required for this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Feedback Operations</h1>
            <p className="text-gray-400 text-sm">Review, prioritize, and close the user feedback loop.</p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            Back to Admin
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <FeedbackManager />
      </main>
    </div>
  );
}
