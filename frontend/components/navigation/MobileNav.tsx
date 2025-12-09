'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Home, 
  Sparkles, 
  Users, 
  User, 
  Menu, 
  X, 
  GalleryVerticalEnd,
  Calendar,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  HeartHandshake,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface NavItem {
  icon: React.ElementType;
  label: { en: string; ko: string };
  path: string;
  requiresAuth?: boolean;
}

// 하단 탭 바 아이템 (5개 핵심 메뉴) - FloatingNav와 동일
const bottomTabItems: NavItem[] = [
  { icon: Home, label: { en: 'Home', ko: '홈' }, path: '/' },
  { icon: Sparkles, label: { en: 'Quiz', ko: '퀴즈' }, path: '/quiz' },
  { icon: Users, label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
  { icon: LayoutDashboard, label: { en: 'Dashboard', ko: '대시보드' }, path: '/dashboard', requiresAuth: true },
  { icon: User, label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
];

// 사이드 드로어 메뉴 아이템 (전체 메뉴) - FloatingNav 구조와 동일하게
const drawerMenuItems = [
  { 
    title: { en: 'Main', ko: '메인' },
    items: [
      { icon: Home, label: { en: 'Home', ko: '홈' }, path: '/' },
      { icon: Sparkles, label: { en: 'Discover', ko: '탐색' }, path: '/quiz' },
      { icon: GalleryVerticalEnd, label: { en: 'MMCA_Kim Tschang-yeul', ko: 'MMCA_김창열' }, path: '/mmca-kim-chang-yeol' },
    ]
  },
  {
    title: { en: 'Art Collection', ko: '아트 컬렉션' },
    items: [
      { icon: LayoutDashboard, label: { en: 'Dashboard', ko: '대시보드' }, path: '/dashboard', requiresAuth: true },
      { icon: GalleryVerticalEnd, label: { en: 'My Collection', ko: '내 컬렉션' }, path: '/gallery', requiresAuth: true },
      { icon: Calendar, label: { en: 'Exhibitions', ko: '전시회' }, path: '/exhibitions', requiresAuth: false },
    ]
  },
  {
    title: { en: 'Art Companion', ko: '아트 컴패니언' },
    items: [
      { icon: HeartHandshake, label: { en: 'Art Counselor', ko: '아트 카운슬러' }, path: '/art-counselor', requiresAuth: true },
      { icon: Users, label: { en: 'Community', ko: '커뮤니티' }, path: '/community', requiresAuth: true },
    ]
  },
  {
    title: { en: 'Account', ko: '계정' },
    items: [
      { icon: User, label: { en: 'Profile', ko: '프로필' }, path: '/profile', requiresAuth: true },
    ]
  }
];

export default function MobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { language } = useLanguage();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const handleNavigation = (path: string, requiresAuth?: boolean) => {
    if (requiresAuth && !user) {
      toast.error(language === 'ko' ? '로그인이 필요합니다' : 'Login required');
      router.push('/login');
      return;
    }
    router.push(path);
    setIsDrawerOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDrawerOpen(false);
      toast.success(language === 'ko' ? '로그아웃되었습니다' : 'Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error(language === 'ko' ? '로그아웃 실패' : 'Logout failed');
    }
  };

  return (
    <>
      {/* 모바일 상단 헤더 */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors touch-manipulation"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-neutral-700" />
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="hover:opacity-80 transition-opacity touch-manipulation"
          >
            <div className="text-xl font-semibold tracking-tight text-black">SAYU</div>
          </button>
          
          <div className="w-10" /> {/* 균형을 위한 spacer */}
        </div>
      </div>

      {/* 사이드 드로어 */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* 배경 오버레이 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />
            
            {/* 드로어 */}
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white z-[9999] shadow-2xl border-r border-neutral-200 lg:hidden overflow-y-auto"
            >
              {/* 드로어 헤더 */}
              <div className="p-6 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-neutral-900">
                    {language === 'ko' ? '메뉴' : 'Menu'}
                  </h2>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 -mr-2 rounded-lg hover:bg-neutral-100 transition-colors touch-manipulation"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {/* 사용자 정보 */}
                {user && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-black font-bold">
                      {user.nickname?.[0] || user.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900">
                        {user.nickname || user.email}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {user.personalityType || 'SAYU Explorer'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* 로그인 버튼 (비로그인 시) */}
                {!user && (
                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      router.push('/login');
                    }}
                    className="w-full px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-neutral-900 transition-colors touch-manipulation"
                  >
                    {language === 'ko' ? '로그인' : 'Login'}
                  </button>
                )}
              </div>
              
              {/* 메뉴 섹션들 */}
              <div className="py-4">
                {drawerMenuItems.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="mb-6">
                    <h3 className="px-6 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      {section.title[language]}
                    </h3>
                    <div>
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        const isDisabled = item.requiresAuth && !user;
                        
                        return (
                          <button
                            key={itemIndex}
                            onClick={() => !isDisabled && handleNavigation(item.path, item.requiresAuth)}
                            disabled={isDisabled}
                            className={`
                              w-full px-6 py-3 flex items-center gap-3 transition-colors touch-manipulation
                              ${isActive 
                                ? 'bg-neutral-100 text-black border-r-4 border-black' 
                                : isDisabled
                                  ? 'text-neutral-400 cursor-not-allowed'
                                  : 'text-neutral-800 hover:bg-neutral-50'
                              }
                            `}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="flex-1 text-left">
                              {item.label[language]}
                            </span>
                            {item.requiresAuth && !user && (
                              <span className="text-xs bg-neutral-200 px-2 py-1 rounded">
                                {language === 'ko' ? '로그인 필요' : 'Login'}
                              </span>
                            )}
                            {isActive && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                
                {/* 로그아웃 버튼 (로그인 시) */}
                {user && (
                  <div className="px-6 pt-4 border-t border-neutral-200">
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-3 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors touch-manipulation"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{language === 'ko' ? '로그아웃' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* 하단 탭 바 */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 border-t border-neutral-200 backdrop-blur-sm z-[100]"
           style={{
             paddingBottom: 'env(safe-area-inset-bottom)',
             position: 'fixed',
             WebkitBackfaceVisibility: 'hidden',
             backfaceVisibility: 'hidden',
             transform: 'translateZ(0)',
             willChange: 'transform'
           }}>
        <div className="flex items-center justify-around">
          {bottomTabItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            const isDisabled = item.requiresAuth && !user;
            
            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleNavigation(item.path, item.requiresAuth)}
                disabled={isDisabled}
                className={`
                  flex-1 py-2 px-2 flex flex-col items-center gap-1 transition-colors touch-manipulation
                  ${isActive 
                    ? 'text-black bg-neutral-100 rounded-lg'
                    : isDisabled
                      ? 'text-neutral-400'
                      : 'text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-black rounded-full"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">
                  {item.label[language]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
