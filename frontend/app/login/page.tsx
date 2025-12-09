'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Home, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { SocialLoginButton } from '@/components/ui/social-login-button';
import { ModernButton } from '@/components/ui/modern-button';

function useAuthErrors() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  useEffect(() => {
    const error = searchParams?.get('error');
    const info = searchParams?.get('info');

    if (info === 'instagram_no_email') {
      toast(
        language === 'ko'
          ? 'Instagram에서 이메일을 제공하지 않았습니다. 프로필 설정에서 이메일을 추가해주세요.'
          : 'Instagram does not provide email. Please add your email in profile settings.',
        { icon: 'ℹ️', duration: 6000 }
      );
    } else if (error) {
      const errorMessages: Record<string, Record<string, string>> = {
        auth_failed: { en: 'Authentication failed. Please try again.', ko: '인증에 실패했습니다. 다시 시도해주세요.' },
        auth_error: { en: 'An authentication error occurred.', ko: '인증 오류가 발생했습니다.' },
        google_auth_failed: { en: 'Google login failed.', ko: '구글 로그인에 실패했습니다.' },
        github_auth_failed: { en: 'GitHub login failed.', ko: '깃허브 로그인에 실패했습니다.' },
        apple_auth_failed: { en: 'Apple login failed.', ko: '애플 로그인에 실패했습니다.' },
        kakao_error: { en: 'Kakao login failed.', ko: '카카오 로그인에 실패했습니다.' },
      };
      const message = errorMessages[error]?.[language] || (language === 'ko' ? '인증 오류' : 'Authentication error');
      toast.error(message);
    }
  }, [searchParams, language]);
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useAuthErrors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success(language === 'ko' ? '로그인 완료!' : 'Login successful!');
      const redirect = searchParams?.get('redirect') || '/profile';
      router.push(redirect);
    } catch (err: any) {
      toast.error(err?.message || (language === 'ko' ? '로그인에 실패했습니다.' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] bg-white text-black">
      {/* Left: Form */}
      <div className="flex items-center justify-center px-6 py-10 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="flex items-center justify-between text-sm text-neutral-700">
            <Link href="/" className="flex items-center gap-2 hover:text-black transition-colors">
              <Home className="w-4 h-4" />
              <span>{language === 'ko' ? '홈으로' : 'Back to Home'}</span>
            </Link>
            <Link href="/register" className="font-semibold hover:text-black transition-colors">
              {language === 'ko' ? '회원가입' : 'Sign up'}
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-[32px] font-bold">{language === 'ko' ? '다시 만나서 반가워요' : 'Welcome back'}</h1>
            <p className="text-neutral-700">
              {language === 'ko' ? '이메일과 비밀번호로 로그인하세요.' : 'Sign in with your email and password.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800" htmlFor="email">
                {language === 'ko' ? '이메일' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/15 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-neutral-800" htmlFor="password">
                {language === 'ko' ? '비밀번호' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-300 focus:border-black focus:ring-2 focus:ring-black/15 outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-800">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-400 text-black focus:ring-black"
                />
                <span>{language === 'ko' ? '로그인 상태 유지' : 'Remember me'}</span>
              </label>
              <Link href="/forgot-password" className="hover:text-black">
                {language === 'ko' ? '비밀번호 찾기' : 'Forgot password?'}
              </Link>
            </div>

            <ModernButton
              type="submit"
              className="w-full bg-black text-white hover:bg-neutral-800 font-semibold shadow-sm hover:shadow-md"
              loading={loading}
              iconLeft={!loading && <LogIn className="w-5 h-5" />}
            >
              {language === 'ko' ? '로그인' : 'Sign in'}
            </ModernButton>
          </form>

          <div className="space-y-3">
            <div className="text-center text-sm text-neutral-600">
              {language === 'ko' ? '소셜 계정으로 계속하기' : 'Continue with social'}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton provider="instagram" />
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="discord" />
              <SocialLoginButton provider="kakao" />
            </div>
          </div>

          <div className="text-center text-sm text-neutral-700">
            {language === 'ko' ? '계정이 없으신가요?' : "Don't have an account?"}{' '}
            <Link href="/register" className="font-semibold hover:text-black underline">
              {language === 'ko' ? '회원가입' : 'Sign up'}
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Right: Hero */}
      <div className="relative hidden lg:block overflow-hidden bg-neutral-950">
        <Image
          src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
          alt="Gallery interior"
          fill
          priority
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-white space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-white/70">SAYU</p>
            <h2 className="text-4xl font-bold leading-tight">
              {language === 'ko'
                ? 'APT 기반 맞춤 큐레이션을 바로 경험해 보세요.'
                : 'Experience APT-based curation instantly.'}
            </h2>
            <p className="text-white/80">
              {language === 'ko'
                ? '저장, 매칭, 알림까지 로그인 한 번이면 방금 본 작품과 함께 자동으로 동기화돼요.'
                : 'Save, match, and get alerts in one place. Your recent views sync automatically when you log in.'}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              {['맞춤 추천', '최근 본 그림', '커뮤니티 매칭'].map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
