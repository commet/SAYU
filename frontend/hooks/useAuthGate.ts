import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

type RequireAuthOptions = {
  message?: string;
  redirect?: string;
  mode?: 'register' | 'login';
};

type RequireAuthResult =
  | { allowed: true }
  | { allowed: false; pending?: boolean };

/**
 * Lightweight guard for gated actions.
 * - Does NOT block page access.
 * - When unauthenticated, shows toast and redirects to login with return path.
 */
export function useAuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = (opts?: RequireAuthOptions): RequireAuthResult => {
    if (loading) return { allowed: false, pending: true };
    if (!user) {
      const redirect = opts?.redirect ?? pathname ?? '/';
      const mode = opts?.mode ?? 'register';
      if (opts?.message) {
        toast(opts.message);
      } else {
        toast('회원가입 후 이용할 수 있습니다.');
      }
      const target = mode === 'register' ? '/register' : '/login';
      router.push(`${target}?redirect=${encodeURIComponent(redirect)}`);
      return { allowed: false };
    }
    return { allowed: true };
  };

  return { requireAuth };
}
