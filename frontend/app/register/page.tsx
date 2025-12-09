'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Home, Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { ModernButton } from '@/components/ui/modern-button';
import { SocialLoginButton } from '@/components/ui/social-login-button';

function RegisterContent() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [region, setRegion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);

  const { signUp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();

  // Transfer guest data info to router state if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // noop for now, kept for possible future guest migration hook
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gender) {
      toast.error(language === 'ko' ? '성별을 선택해주세요.' : 'Please select your gender.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error(language === 'ko' ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      toast.error(language === 'ko' ? '비밀번호를 6자 이상 입력해주세요.' : 'Password must be at least 6 characters.');
      return;
    }

    if (!agree) {
      toast.error(language === 'ko' ? '이용약관과 개인정보 처리에 동의해주세요.' : 'Please agree to the terms.');
      return;
    }

    setLoading(true);
    try {
      const metadata = {
        full_name: name,
        gender,
        ageRange: ageRange || null,
        region: region || null,
      };

      await signUp(email, password, metadata);
      toast.success(language === 'ko' ? '회원가입이 완료되었습니다.' : 'Registration successful.');

      const redirect = searchParams?.get('redirect') || '/login';
      router.push(redirect);
    } catch (error: any) {
      const message =
        error?.message ||
        (language === 'ko' ? '회원가입에 실패했습니다. 다시 시도해주세요.' : 'Registration failed. Please try again.');
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const label = (ko: string, en: string) => (language === 'ko' ? ko : en);

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between text-sm text-neutral-600 mb-6">
          <Link href="/" className="flex items-center gap-2 hover:text-black transition-colors">
            <Home className="w-4 h-4" />
            <span>{label('홈으로', 'Back to Home')}</span>
          </Link>
          <Link href="/login" className="font-semibold hover:text-black transition-colors">
            {label('로그인', 'Sign in')}
          </Link>
        </div>

        <div className="bg-white border border-neutral-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-black text-white px-3 py-1 text-xs font-medium">
              <UserPlus className="w-3.5 h-3.5" />
              {label('새 계정 만들기', 'Create account')}
            </div>
            <h1 className="text-3xl font-bold">{label('SAYU 시작하기', 'Get started with SAYU')}</h1>
            <p className="text-neutral-600">
              {label('간단한 정보만 입력하면 맞춤 추천을 바로 시작할 수 있어요.', 'A few details to start personalized curation.')}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="name">
                  {label('이름', 'Name')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                    placeholder={label('홍길동', 'Your name')}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="gender">
                  {label('성별', 'Gender')} <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none bg-white"
                >
                  <option value="">{label('선택하세요', 'Select')}</option>
                  <option value="female">{label('여성', 'Female')}</option>
                  <option value="male">{label('남성', 'Male')}</option>
                  <option value="other">{label('기타/밝히고 싶지 않음', 'Other / Prefer not to say')}</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-medium text-neutral-700" htmlFor="email">
                  {label('이메일', 'Email')}
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
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="password">
                  {label('비밀번호', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
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

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="confirmPassword">
                  {label('비밀번호 확인', 'Confirm password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-black"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="ageRange">
                  {label('나이대 (선택)', 'Age range (optional)')}
                </label>
                <select
                  id="ageRange"
                  value={ageRange}
                  onChange={(e) => setAgeRange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none bg-white"
                >
                  <option value="">{label('선택 안 함', 'Prefer not to say')}</option>
                  <option value="19-24">{label('19-24세', '19-24')}</option>
                  <option value="25-34">{label('25-34세', '25-34')}</option>
                  <option value="35-44">{label('35-44세', '35-44')}</option>
                  <option value="45-54">{label('45-54세', '45-54')}</option>
                  <option value="55+">{label('55세 이상', '55 or above')}</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-neutral-700" htmlFor="region">
                  {label('거주지역 (선택)', 'Region (optional)')}
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 focus:border-black focus:ring-2 focus:ring-black/10 outline-none bg-white"
                >
                  <option value="">{label('선택 안 함', 'Prefer not to say')}</option>
                  <option value="seoul">{label('서울/경기', 'Seoul/Gyeonggi')}</option>
                  <option value="busan">{label('부산/경남', 'Busan/Gyeongnam')}</option>
                  <option value="daegu">{label('대구/경북', 'Daegu/Gyeongbuk')}</option>
                  <option value="gwangju">{label('광주/전라', 'Gwangju/Jeolla')}</option>
                  <option value="daejeon">{label('대전/충청', 'Daejeon/Chungcheong')}</option>
                  <option value="jeju">{label('제주', 'Jeju')}</option>
                  <option value="overseas">{label('해외', 'Overseas')}</option>
                </select>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
              />
              <span>
                {label(
                  '서비스 이용약관과 개인정보 처리방침에 동의합니다.',
                  'I agree to the Terms of Service and Privacy Policy.'
                )}{' '}
                <Link href="/terms" className="underline hover:text-black">
                  {label('약관 보기', 'View terms')}
                </Link>
              </span>
            </label>

            <ModernButton
              type="submit"
              className="w-full bg-black text-white hover:bg-neutral-900"
              loading={loading}
              iconLeft={!loading && <UserPlus className="w-5 h-5" />}
            >
              {label('회원가입', 'Create account')}
            </ModernButton>
          </form>

          <div className="space-y-3 pt-4">
            <div className="text-center text-sm text-neutral-500">
              {label('소셜 계정으로 계속하기', 'Continue with social')}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SocialLoginButton provider="instagram" />
              <SocialLoginButton provider="google" />
              <SocialLoginButton provider="discord" />
              <SocialLoginButton provider="kakao" />
            </div>
          </div>

          <div className="text-center text-sm text-neutral-600">
            {label('이미 계정이 있으신가요?', 'Already have an account?')}{' '}
            <Link href="/login" className="font-semibold hover:text-black underline">
              {label('로그인', 'Sign in')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-black">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-neutral-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Loading...</p>
          </div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
