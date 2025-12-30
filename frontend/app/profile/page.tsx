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

const MobileProfile = dynamic(() => import('@/components/mobile/MobileProfile'), { ssr: false });

const mockBadges = [
  { id: 'first-visit', name: { en: 'First Steps', ko: '첫 발걸음' }, unlocked: true, progress: 1, maxProgress: 1 },
  { id: 'art-lover', name: { en: 'Art Lover', ko: '아트 러버' }, unlocked: true, progress: 10, maxProgress: 10 },
  { id: 'explorer', name: { en: 'Explorer', ko: '탐험가' }, unlocked: false, progress: 2, maxProgress: 5 },
  { id: 'collector', name: { en: 'Collector', ko: '컬렉터' }, unlocked: false, progress: 24, maxProgress: 50 },
];

export default function ProfilePage() {
  const { language } = useLanguage();
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
  const bio = (language === 'ko' ? userAnimal?.description_ko : userAnimal?.description) || (language === 'ko' ? '예술의 세계를 탐험하는 여행자' : 'An explorer in the world of art.');

  const stats = [
    { label: 'Artworks Viewed', value: gameStats?.total_points || 1250 },
    { label: 'Collections', value: 12 },
    { label: 'Exhibitions Visited', value: gameStats?.level || 3 },
    { label: 'Followers', value: 8 },
  ];
  
  const savedArtworks = [
    { id: 1, title: '별이 빛나는 밤', artist: 'Vincent van Gogh', image: 'https://images.unsplash.com/photo-1583573636253-12a883d644c2?w=500' },
    { id: 2, title: '진주 귀걸이를 한 소녀', artist: 'Johannes Vermeer', image: 'https://images.unsplash.com/photo-1579602934133-7c536b0ce5c6?w=500' },
    { id: 3, title: '절규', artist: 'Edvard Munch', image: 'https://images.unsplash.com/photo-1569919253754-b382b35c3a8e?w=500' },
    { id: 4, title: '게르니카', artist: 'Pablo Picasso', image: 'https://images.unsplash.com/photo-1618995961955-22b6c2075a44?w=500' },
  ];

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
                <p className="text-sm uppercase tracking-widest text-neutral-500 mb-3 font-medium">Profile</p>
                <div className="flex items-center gap-2">
                   <button onClick={() => setShowSettings(true)} className="p-2 rounded-full hover:bg-neutral-100 transition-colors"><Settings className="w-4 h-4 text-neutral-500"/></button>
                   <button onClick={() => setShowShareModal(true)} className="p-2 rounded-full hover:bg-neutral-100 transition-colors"><Share2 className="w-4 h-4 text-neutral-500"/></button>
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-black mb-4 tracking-tight">{user?.nickname || 'SAYU Explorer'}</h1>
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
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Activity</h2>
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
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Saved Artworks</h2>
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-500 hover:text-black cursor-pointer transition-colors flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3"/>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {savedArtworks.map((artwork) => (
              <motion.div key={artwork.id} whileHover={{ y: -4 }} className="group cursor-pointer">
                <div className="aspect-square border border-neutral-200 hover:border-neutral-900 transition-all overflow-hidden mb-3 relative bg-neutral-50">
                  <Image
                    src={artwork.image}
                    alt={artwork.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                  />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium text-black line-clamp-1">{artwork.title}</h3>
                  <p className="text-xs text-neutral-500 font-light">{artwork.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section>
           <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">Achievements</h2>
            <div className="h-px flex-1 bg-neutral-200" />
            <span className="text-xs text-neutral-400">{mockBadges.filter(b => b.unlocked).length} / {mockBadges.length} Unlocked</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">In Progress</h3>
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
                <h3 className="text-xs uppercase tracking-wider text-neutral-500 mb-4">Unlocked</h3>
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