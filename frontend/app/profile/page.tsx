'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Mail,
  Palette,
  Calendar,
  Share2,
  Edit,
  Award,
  TrendingUp,
  Users,
  Heart,
  Lock,
  Unlock,
  Settings,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useResponsive } from '@/lib/responsive';
import { useGamificationV2 } from '@/hooks/useGamificationV2';
import { getAnimalByType } from '@/data/personality-animals';
import { SAYUTypeCode } from '@/types/sayu-shared';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import ShareModal from '@/components/share/ShareModal';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { cn } from '@/lib/utils';

// Translations
const t = {
  en: {
    profile: 'Profile',
    activity: 'Activity',
    artworksViewed: 'Artworks Viewed',
    collections: 'Collections',
    exhibitionsVisited: 'Exhibitions Visited',
    followers: 'Followers',
    savedArtworks: 'Saved Artworks',
    viewAll: 'View All',
    achievements: 'Achievements',
    unlocked: 'Unlocked',
    inProgress: 'In Progress',
    defaultBio: 'An explorer in the world of art.',
    defaultNickname: 'SAYU Explorer',
  },
  ko: {
    profile: '프로필',
    activity: '활동',
    artworksViewed: '감상한 작품',
    collections: '컬렉션',
    exhibitionsVisited: '방문한 전시',
    followers: '팔로워',
    savedArtworks: '저장한 작품',
    viewAll: '전체 보기',
    achievements: '성취',
    unlocked: '획득함',
    inProgress: '진행 중',
    defaultBio: '예술의 세계를 탐험하는 여행자',
    defaultNickname: 'SAYU 탐험가',
  },
};

const MobileProfile = dynamic(() => import('@/components/mobile/MobileProfile'), { ssr: false });

const mockBadges = [
  { id: 'first-visit', name: { en: 'First Steps', ko: '첫 발걸음' }, unlocked: true, progress: 1, maxProgress: 1 },
  { id: 'art-lover', name: { en: 'Art Lover', ko: '아트 러버' }, unlocked: true, progress: 10, maxProgress: 10 },
  { id: 'explorer', name: { en: 'Explorer', ko: '탐험가' }, unlocked: false, progress: 2, maxProgress: 5 },
  { id: 'collector', name: { en: 'Collector', ko: '컬렉터' }, unlocked: false, progress: 24, maxProgress: 50 },
];

export default function ProfilePage() {
  const { language } = useLanguage();
  const texts = t[language];
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { isMobile } = useResponsive();
  const { stats: gameStats } = useGamificationV2();

  const [isClient, setIsClient] = useState(false);
  const [renderMobile, setRenderMobile] = useState(false);
  const [userPersonalityType, setUserPersonalityType] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [savedArtworks, setSavedArtworks] = useState<Array<{
    id: string | number;
    title: string;
    artist: string;
    imageUrl?: string;
  }>>([]);
  const [artworksLoading, setArtworksLoading] = useState(true);
  const isGuest = !user;

  useEffect(() => {
    setIsClient(true);
    setRenderMobile(isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (user?.personalityType) {
      setUserPersonalityType(user.personalityType);
    } else {
      const quizResults = localStorage.getItem('quizResults');
      if (quizResults) {
        try {
          setUserPersonalityType(JSON.parse(quizResults).personalityType);
        } catch (e) {
          console.error('Error parsing quiz results:', e);
        }
      }
    }
  }, [user]);

  // Fetch saved artworks
  useEffect(() => {
    const fetchSavedArtworks = async () => {
      if (!user?.id) {
        setArtworksLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/gallery/collection?userId=${user.id}`);
        const data = await res.json();
        if (data.success && data.items?.length > 0) {
          setSavedArtworks(data.items.slice(0, 4).map((item: any) => ({
            id: item.id,
            title: item.title,
            artist: item.artist,
            imageUrl: item.imageUrl,
          })));
        }
      } catch (e) {
        console.error('Error fetching saved artworks:', e);
      } finally {
        setArtworksLoading(false);
      }
    };
    fetchSavedArtworks();
  }, [user?.id]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200 border-t-black" />
      </div>
    );
  }

  if (renderMobile) {
    return <MobileProfile gameStats={gameStats} user={user} />;
  }

  const userAnimal = userPersonalityType ? getAnimalByType(userPersonalityType as SAYUTypeCode) : null;
  const bio = (language === 'ko' ? userAnimal?.description_ko : userAnimal?.description) || texts.defaultBio;

  const stats = [
    { label: texts.artworksViewed, value: gameStats?.total_points || 1250 },
    { label: texts.collections, value: 12 },
    { label: texts.exhibitionsVisited, value: gameStats?.level || 3 },
    { label: texts.followers, value: 8 },
  ];

  // Placeholder artworks (shown when user has no saved artworks)
  const placeholderArtworks = [
    { id: 'p1', title: '구성', artist: '김창열', imageUrl: '/mmca-tour-kcy/artwork/구성_1.jpg' },
    { id: 'p2', title: '물방울', artist: '김창열', imageUrl: '/mmca-tour-kcy/artwork/물방울_00.jpg' },
    { id: 'p3', title: 'Il Pleut', artist: '김창열', imageUrl: '/mmca-tour-kcy/artwork/il pleut.png' },
    { id: 'p4', title: '드로잉', artist: '김창열', imageUrl: '/mmca-tour-kcy/artwork/드로잉_1.png' },
  ];

  const displayArtworks = savedArtworks.length > 0 ? savedArtworks : placeholderArtworks;

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 py-12">
        {/* Profile Header */}
        <header className="py-12 border-b border-neutral-100">
          <div className="flex flex-col md:flex-row items-start gap-12">
            <div className="relative w-32 h-32 md:w-40 md:h-40 border border-neutral-200 group flex-shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.nickname || 'User'}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-5xl grayscale group-hover:grayscale-0 transition-all duration-700">
                  {userAnimal?.emoji || '🌌'}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm uppercase tracking-widest text-neutral-500 mb-3 font-medium">{texts.profile}</p>
                <div className="flex items-center gap-2">
                   <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-neutral-100 transition-colors"><Settings className="w-4 h-4 text-neutral-500"/></button>
                   <button onClick={() => setShowShareModal(true)} className="p-2 rounded-full hover:bg-neutral-100 transition-colors"><Share2 className="w-4 h-4 text-neutral-500"/></button>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">{user?.nickname || texts.defaultNickname}</h1>
              <p className="text-base text-neutral-500 mb-6 max-w-xl font-light">{bio}</p>

              <div className="flex items-center gap-4">
                {userPersonalityType && (
                  <div className="inline-block px-5 py-2 border border-neutral-300 hover:border-black transition-colors">
                    <p className="text-sm uppercase tracking-wider text-neutral-700 font-medium">
                      APT: {userPersonalityType}
                    </p>
                  </div>
                )}
                 <div className="inline-flex items-center text-sm text-neutral-500 gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user?.auth?.email || 'user@sayu.app'}</span>
                  </div>
              </div>
            </div>
          </div>
        </header>

        {/* Profile Stats */}
        <section>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">{texts.activity}</h2>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <div key={index} className="border border-neutral-200 p-6 hover:border-neutral-400 transition-colors">
                <p className="text-4xl lg:text-5xl font-light text-black tracking-tight">{typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-neutral-500 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Saved Artworks */}
        <section>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">{texts.savedArtworks}</h2>
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-500 hover:text-black cursor-pointer transition-colors flex items-center gap-1">
                {texts.viewAll} <ArrowRight className="w-3 h-3"/>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {artworksLoading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-neutral-100 mb-3" />
                  <div className="h-4 bg-neutral-100 w-3/4 mb-1" />
                  <div className="h-3 bg-neutral-100 w-1/2" />
                </div>
              ))
            ) : (
              displayArtworks.map((artwork) => (
                <motion.div key={artwork.id} whileHover={{ y: -4 }} className="group cursor-pointer">
                  <div className="aspect-square border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden mb-3 relative bg-neutral-50">
                    {artwork.imageUrl ? (
                      <Image
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">
                        <Palette className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-medium text-black line-clamp-1">{artwork.title}</h3>
                    <p className="text-xs text-neutral-500 font-light">{artwork.artist}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Achievements */}
        <section>
           <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">{texts.achievements}</h2>
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">{mockBadges.filter(b => b.unlocked).length} / {mockBadges.length} {texts.unlocked}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">{texts.inProgress}</h3>
                <div className="space-y-4">
                    {mockBadges.filter(b => !b.unlocked).map((badge) => (
                      <div key={badge.id}>
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-medium text-neutral-700">{language === 'ko' ? badge.name.ko : badge.name.en}</p>
                            <span className="text-xs font-mono text-neutral-500">{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-neutral-900"
                              initial={{ width: 0 }}
                              animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                            />
                        </div>
                      </div>
                    ))}
                </div>
             </div>
             <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">{texts.unlocked}</h3>
                <div className="flex flex-wrap gap-3">
                    {mockBadges.filter(b => b.unlocked).map((badge) => (
                        <div key={badge.id} className="px-4 py-2 border border-neutral-200 hover:bg-neutral-50 transition-colors">
                           <p className="text-sm font-medium text-neutral-800">{language === 'ko' ? badge.name.ko : badge.name.en}</p>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </section>

        <ProfileSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userInfo={{
            nickname: user?.nickname || undefined,
            email: user?.auth?.email,
            personalityType: userPersonalityType,
          }}
          onUpdate={() => window.location.reload()}
        />

        {showShareModal && userPersonalityType && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            quizResult={{
              personalityType: userPersonalityType as SAYUTypeCode,
              scores: {},
              responses: [],
            }}
          />
        )}
        <FeedbackButton pageName="profile" />
      </div>
    </div>
  );
}