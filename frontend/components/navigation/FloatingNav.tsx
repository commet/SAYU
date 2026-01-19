'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Sparkles,
  Users,
  User,
  LayoutDashboard,
  Calendar,
  GalleryVerticalEnd,
  HeartHandshake,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useOnboardingV2 } from '@/contexts/OnboardingContextV2';

type LangText = { en: string; ko: string };

type NavLeaf = {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: LangText;
  requiresAuth?: boolean;
};

type NavGroup = {
  id: string;
  label: LangText;
  items: NavLeaf[];
  requiresAuth?: boolean;
};

const navGroups: NavGroup[] = [
  {
    id: 'main',
    label: { en: 'Main', ko: '메인' },
    items: [
      { path: '/', icon: Home, label: { en: 'Home', ko: '홈' } },
      { path: '/quiz', icon: Sparkles, label: { en: 'Discover', ko: '발견' } },
      { path: '/mmca-kim-chang-yeol', icon: Calendar, label: { en: 'MMCA · Kim', ko: 'MMCA · 김창열' } },
    ],
  },
  {
    id: 'collection',
    label: { en: 'Art Collection', ko: '아트 컬렉션' },
    requiresAuth: true,
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ko: '대시보드' }, requiresAuth: true },
      { path: '/gallery', icon: GalleryVerticalEnd, label: { en: 'Gallery', ko: '갤러리' }, requiresAuth: true },
      { path: '/exhibitions', icon: Calendar, label: { en: 'Exhibitions', ko: '전시' }, requiresAuth: true },
    ],
  },
  {
    id: 'companion',
    label: { en: 'Art Companion', ko: '아트 컴패니언' },
    requiresAuth: true,
    items: [
      { path: '/art-counselor', icon: Sparkles, label: { en: 'Art Counselor', ko: '아트 카운슬러' }, requiresAuth: true },
      { path: '/community', icon: Users, label: { en: 'Community', ko: '커뮤니티' }, requiresAuth: true },
    ],
  },
  {
    id: 'profile',
    label: { en: 'Profile', ko: '프로필' },
    requiresAuth: true,
    items: [{ path: '/profile', icon: User, label: { en: 'Profile', ko: '프로필' }, requiresAuth: true }],
  },
];

const mobileQuickNav: NavLeaf[] = [
  { path: '/', icon: Home, label: { en: 'Home', ko: '홈' } },
  { path: '/quiz', icon: Sparkles, label: { en: 'Quiz', ko: '퀴즈' } },
  { path: '/community', icon: Users, label: { en: 'Community', ko: '커뮤니티' }, requiresAuth: true },
  { path: '/dashboard', icon: LayoutDashboard, label: { en: 'Dashboard', ko: '대시보드' }, requiresAuth: true },
  { path: '/profile', icon: User, label: { en: 'Profile', ko: '프로필' }, requiresAuth: true },
];

function useIsActive(pathname: string | null, item: NavLeaf | NavGroup) {
  if (!pathname) return false;
  if ('items' in item) {
    return item.items.some((leaf) => pathname === leaf.path || pathname.startsWith(`${leaf.path}/`));
  }
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export default function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isNewUser, currentJourney, getCompletionPercentage, isOnboardingComplete } = useOnboardingV2();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const greeting = useMemo(() => {
    if (!user) return language === 'ko' ? '로그인' : 'Login';
    return user.email?.split('@')[0] || 'Member';
  }, [user, language]);

  const handleNavigate = (item: NavLeaf) => {
    router.push(item.path);
    setMobileOpen(false);
    setOpenGroup(null);
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    setOpenGroup(null);
    await signOut();
  };

  const currentLeaf = useMemo(() => {
    if (!pathname) return null;
    for (const group of navGroups) {
      for (const leaf of group.items) {
        if (pathname === leaf.path || pathname.startsWith(`${leaf.path}/`)) {
          return leaf;
        }
      }
    }
    return null;
  }, [pathname]);

  const currentLabel = currentLeaf ? currentLeaf.label[language] : null;

  return (
    <div className="relative">
      {/* Desktop top bar */}
      <div
        data-primary-nav="desktop"
        className="hidden lg:block fixed top-0 left-0 right-0 z-[1000] border-b border-[#FFD800]/20"
        style={{ backgroundColor: '#D4A520' }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between gap-6" style={{ height: '70px' }}>
            {/* Logo + onboarding hint */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight text-white"
            >
              SAYU
              {isNewUser && !isOnboardingComplete && currentJourney && (
                <span className="ml-2 flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
                  Day {currentJourney.day}/7
                  <span className="inline-block h-1.5 w-10 rounded-full bg-neutral-200 overflow-hidden">
                    <span
                      className="block h-full rounded-full bg-black transition-all"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </span>
                </span>
              )}
            </button>

            {/* Nav groups */}
            <div className="flex items-center gap-2">
              {navGroups.map((group) => {
                const isGroupActive = useIsActive(pathname, group);
                const hasChildren = group.items.length > 1;
                const isDisabled = false;

                return (
                  <div
                    key={group.id}
                    className="relative"
                    onMouseEnter={() => setOpenGroup(group.id)}
                    onMouseLeave={() => setOpenGroup(null)}
                  >
                    <button
                      onClick={() => {
                        if (!hasChildren) {
                          handleNavigate(group.items[0]);
                        } else {
                          setOpenGroup(openGroup === group.id ? null : group.id);
                        }
                      }}
                      className={`flex items-center justify-center gap-1 px-3 h-[40px] text-base font-semibold transition-all ${
                        isGroupActive ? 'text-white' : 'text-white/90 hover:text-white'
                      } ${isDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      {group.label[language]}
                      {hasChildren && <ChevronDown className="h-4 w-4" />}
                    </button>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {hasChildren && openGroup === group.id && !isDisabled && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-[calc(100%+4px)] min-w-[220px] overflow-hidden shadow-lg"
                          style={{ backgroundColor: '#D4A520' }}
                        >
                          {group.items.map((item) => {
                            return (
                              <button
                                key={item.path}
                                onClick={() => handleNavigate(item)}
                                className="flex w-full items-center gap-3 px-4 py-3 text-left text-base font-semibold transition-colors text-white/90 hover:bg-white/25 hover:text-white"
                              >
                                <item.icon className="h-4 w-4" />
                                <span>{item.label[language]}</span>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="hidden lg:flex items-center text-sm tracking-wider text-white/80 hover:text-white transition-colors"
                aria-label="Toggle language"
              >
                <span className={`px-1.5 py-1 ${language === 'en' ? 'text-white font-medium' : 'text-white/50'}`}>
                  EN
                </span>
                <span className="text-white/30">|</span>
                <span className={`px-1.5 py-1 ${language === 'ko' ? 'text-white font-medium' : 'text-white/50'}`}>
                  KR
                </span>
              </button>
              <button
                onClick={toggleDarkMode}
                className="hidden items-center rounded-full border border-white/20 px-3 py-2.5 text-white text-sm font-semibold transition hover:bg-white/10 lg:flex"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                  {language === 'ko' ? '로그아웃' : 'Logout'}
                </button>
              ) : (
                <button
                  onClick={() => router.push('/login')}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                >
                  <LogIn className="h-4 w-4" />
                  {language === 'ko' ? '로그인' : 'Login'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile nav trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          <button onClick={() => router.push('/')} className="hover:opacity-80 transition-opacity touch-manipulation">
            <div className="text-xl font-semibold tracking-tight text-black">SAYU</div>
          </button>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white z-[9999] shadow-2xl border-r border-neutral-200 lg:hidden overflow-y-auto"
            >
              <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-900">{language === 'ko' ? '메뉴' : 'Menu'}</h2>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 -mr-2 rounded-lg hover:bg-neutral-100 transition-colors touch-manipulation"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="px-6 py-4 space-y-6">
                {navGroups.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {section.label[language]}
                    </div>
                    <div className="rounded-2xl border border-neutral-200 overflow-hidden">
                      {section.items.map((item, idx) => {
                        const isActive = pathname === item.path;
                        const isDisabled = item.requiresAuth && !user;
                        return (
                          <button
                            key={item.path}
                            onClick={() => !isDisabled && handleNavigate(item)}
                            disabled={isDisabled}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                              isActive
                                ? 'bg-neutral-100 text-black'
                                : isDisabled
                                  ? 'text-neutral-400'
                                  : 'text-neutral-800 hover:bg-neutral-50'
                            } ${idx !== section.items.length - 1 ? 'border-b border-neutral-200' : ''}`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span className="flex-1">{item.label[language]}</span>
                            {isDisabled && <span className="text-xs text-neutral-400">Login</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-3">
                  {/* Language Toggle - Mobile */}
                  <button
                    onClick={toggleLanguage}
                    className="flex items-center text-sm tracking-wider text-neutral-600"
                    aria-label="Toggle language"
                  >
                    <span className={`px-1.5 py-1 ${language === 'en' ? 'text-black font-medium' : 'text-neutral-400'}`}>
                      EN
                    </span>
                    <span className="text-neutral-300">|</span>
                    <span className={`px-1.5 py-1 ${language === 'ko' ? 'text-black font-medium' : 'text-neutral-400'}`}>
                      KR
                    </span>
                  </button>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {isDarkMode ? 'Light' : 'Dark'}
                  </button>
                  {user ? (
                    <button
                      onClick={handleSignOut}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {language === 'ko' ? '로그아웃' : 'Logout'}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        router.push('/login');
                      }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-900"
                    >
                      <LogIn className="h-4 w-4" />
                      {language === 'ko' ? '로그인' : 'Login'}
                    </button>
                  )}
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Breadcrumb / Page indicator */}
      {currentLabel && (
        <div className="hidden lg:block fixed top-[70px] left-0 right-0 z-[990] bg-white/95 backdrop-blur-sm border-b border-neutral-200">
          <div className="mx-auto max-w-6xl px-6 h-11 flex items-center gap-2 text-sm text-neutral-700">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1 text-neutral-700 hover:text-black transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>{language === 'ko' ? '홈' : 'Home'}</span>
            </button>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-neutral-900">{currentLabel}</span>
          </div>
        </div>
      )}
    </div>
  );
}
