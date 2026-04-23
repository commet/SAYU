import { createBrowserClient } from '@supabase/ssr';

export function createClientComponentClient() {
  if (typeof window === 'undefined') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables not set during build. Using placeholder values.');
      return {
        auth: {
          signInWithPassword: async () => ({ error: new Error('Auth not configured') }),
          signInWithOAuth: async () => ({ error: new Error('Auth not configured') }),
          signOut: async () => ({ error: null }),
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
        },
        from: () => ({
          select: () => ({ data: null, error: null }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ data: null, error: null }),
          delete: () => ({ data: null, error: null }),
        })
      } as any;
    }
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
