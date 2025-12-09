'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useResponsive } from '@/lib/responsive';
import { useGamificationV2 } from '@/hooks/useGamificationV2';
import dynamic from 'next/dynamic';
import {
  Trophy,
  Settings,
  Sparkles,
  User,
  Mail,
  Heart,
  Palette,
  Calendar,
  Share2,
  Edit,
  Award,
  TrendingUp,
  Users,
  Eye,
  Lock,
  Unlock,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Container } from '@/components/design-system/Container';
import { getAnimalByType } from '@/data/personality-animals';
import { personalityDescriptions } from '@/data/personality-descriptions';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import ShareModal from '@/components/share/ShareModal';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { useAuthGate } from '@/hooks/useAuthGate';

const MobileProfile = dynamic(() => import('@/components/mobile/MobileProfile'), {
  ssr: false
});

// Mock badges data
const mockBadges = [
  {
    id: 'first-visit',
    name: { en: 'First Steps', ko: '첫 발걸음' },
    description: { en: 'Complete your first museum visit', ko: '첫 미술관 방문을 완료하세요' },
    icon: '🎨',
    unlocked: true,
    progress: 1,
    maxProgress: 1,
    unlockedAt: '2024-01-10'
  },
  {
    id: 'art-lover',
    name: { en: 'Art Lover', ko: '예술 애호가' },
    description: { en: 'Like 10 artworks', ko: '10개의 작품에 좋아요를 누르세요' },
    icon: '❤️',
    unlocked: true,
    progress: 10,
    maxProgress: 10,
    unlockedAt: '2024-01-15'
  },
  {
    id: 'explorer',
    name: { en: 'Explorer', ko: '탐험가' },
    description: { en: 'Visit 5 different museums', ko: '5개의 다른 미술관을 방문하세요' },
    icon: '🗺️',
    unlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: 'collector',
    name: { en: 'Collector', ko: '수집가' },
    description: { en: 'Save 50 artworks', ko: '50개의 작품을 저장하세요' },
    icon: '📚',
    unlocked: false,
    progress: 24,
    maxProgress: 50
  }
];

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { stats: gameStats, loading: gameLoading } = useGamificationV2();

  const [isClient, setIsClient] = useState(false);
  const [renderMobile, setRenderMobile] = useState(false);
  const [userPersonalityType, setUserPersonalityType] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followStats, setFollowStats] = useState({ followerCount: 12, followingCount: 8 });
  const [profileVisitCount, setProfileVisitCount] = useState(8);
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
          const results = JSON.parse(quizResults);
          setUserPersonalityType(results.personalityType);
        } catch (e) {
          console.error('Error parsing quiz results:', e);
        }
      }
    }
  }, [user]);

  useEffect(() => {
    if (user && isClient) {
      const storageKey = `profile_visits_${user.id}`;
      const savedVisits = parseInt(localStorage.getItem(storageKey) || '8');
      setProfileVisitCount(savedVisits);
    }
  }, [user, isClient]);

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

  const userAnimal = userPersonalityType ? getAnimalByType(userPersonalityType) : null;
  const personalityDesc = userPersonalityType ? personalityDescriptions[userPersonalityType] : null;

  const stats = [
    {
      label: language === 'ko' ? '레벨' : 'Level',
      value: gameStats?.level || 3,
      icon: TrendingUp,
      color: 'bg-black'
    },
    {
      label: language === 'ko' ? '포인트' : 'Points',
      value: gameStats?.total_points || 1250,
      icon: Award,
      color: 'bg-neutral-900'
    },
    {
      label: language === 'ko' ? '전시 관람' : 'Exhibitions',
      value: profileVisitCount,
      icon: Calendar,
      color: 'bg-neutral-800'
    },
    {
      label: language === 'ko' ? '팔로워' : 'Followers',
      value: followStats.followerCount,
      icon: Users,
      color: 'bg-neutral-700'
    },
    {
      label: language === 'ko' ? '팔로잉' : 'Following',
      value: followStats.followingCount,
      icon: Heart,
      color: 'bg-neutral-600'
    },
    {
      label: language === 'ko' ? '저장 작품' : 'Artworks',
      value: 124,
      icon: Palette,
      color: 'bg-neutral-500'
    }
  ];

  const unlockedBadges = mockBadges.filter(b => b.unlocked);
  const inProgressBadges = mockBadges.filter(b => !b.unlocked);

  // APT Compatibility - mock data
  const compatibleTypes = ['LAEF', 'SAMC', 'LREF'];

  return (
    <div className="min-h-screen bg-white">
      <Container size="2xl" className="py-12 space-y-8">
        {/* Profile Header */}
        <Card className="p-8 border-neutral-200">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center text-5xl overflow-hidden border-4 border-white shadow-lg">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.nickname || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userAnimal?.emoji || '🎨'}</span>
                  )}
                </div>
                {/* AI Art Badge */}
                <motion.div
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-black flex items-center justify-center shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="space-y-4">
                {/* Name & Email */}
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">
                    {user?.nickname || user?.auth?.email || 'SAYU Explorer'}
                  </h1>
                  <div className="flex items-center gap-2 text-neutral-600 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span>{user?.auth?.email || 'user@sayu.app'}</span>
                  </div>
                </div>

                {/* APT Badge & Description */}
                {userPersonalityType && (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full font-bold shadow-md">
                      <Palette className="w-5 h-5" />
                      <span className="text-lg">{userPersonalityType}</span>
                      <span className="text-sm opacity-80">·</span>
                      <span className="text-sm">{userAnimal?.animal_ko || userAnimal?.animal}</span>
                    </div>

                    {personalityDesc && (
                      <p className="text-base text-neutral-700 max-w-2xl">
                        {personalityDesc.description || personalityDesc.essence}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-center md:justify-start flex-wrap">
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (isGuest) {
                        requireAuth({ message: '프로필 편집은 회원 전용입니다. 로그인 후 이용해주세요.' });
                        return;
                      }
                      setShowSettings(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                    {language === 'ko' ? '프로필 편집' : 'Edit Profile'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (isGuest) {
                        requireAuth({ message: '프로필 공유는 로그인 후 이용할 수 있습니다.' });
                        return;
                      }
                      setShowShareModal(true);
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    {language === 'ko' ? '공유하기' : 'Share'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (isGuest) {
                        requireAuth({ message: '공개 설정 변경은 로그인 후 이용해주세요.' });
                        return;
                      }
                      setIsProfilePublic(!isProfilePublic);
                    }}
                  >
                    {isProfilePublic ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        {language === 'ko' ? '공개' : 'Public'}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {language === 'ko' ? '비공개' : 'Private'}
                      </>
                    )}
                  </Button>
                </div>

                {isGuest && (
                  <div className="mt-4 inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-700">
                    <Lock className="w-4 h-4" />
                    <span>데모 프로필입니다. 가입 후 내 APT 타입과 활동을 저장하세요.</span>
                    <Button
                      size="sm"
                      onClick={() => requireAuth({ message: '회원가입 후 실제 프로필을 볼 수 있습니다.' })}
                    >
                      {language === 'ko' ? '회원가입' : 'Sign up'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Level & XP */}
            <div className="flex flex-col items-center justify-center md:items-end gap-2 min-w-[120px]">
              <div className="text-center md:text-right">
                <p className="text-sm text-neutral-600">{language === 'ko' ? '레벨' : 'Level'}</p>
                <p className="text-4xl font-bold text-black">{gameStats?.level || 3}</p>
              </div>
              <div className="w-full max-w-[120px]">
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>XP</span>
                  <span>{gameStats?.current_exp || 450} / {gameStats?.nextLevelExp || 1000}</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${((gameStats?.current_exp || 450) / (gameStats?.nextLevelExp || 1000)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div>
          <h2 className="text-xl font-bold text-black mb-4">
            {language === 'ko' ? '나의 통계' : 'My Stats'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-5 border-neutral-200 text-center hover:shadow-md transition-shadow">
                  <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-3`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-black mb-1">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-neutral-600">{stat.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Achievements & Badges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-black">
              {language === 'ko' ? '업적 & 배지' : 'Achievements & Badges'}
            </h2>
            <div className="text-sm text-neutral-600">
              {language === 'ko' ? '획득' : 'Unlocked'}: <span className="font-bold text-black">{unlockedBadges.length}</span> / {mockBadges.length}
            </div>
          </div>

          {/* Unlocked Badges */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-700 mb-3">
              {language === 'ko' ? '획득한 배지' : 'Unlocked Badges'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unlockedBadges.map((badge) => (
                <Card key={badge.id} className="p-4 border-neutral-200 bg-neutral-50">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-black text-sm mb-1">
                      {language === 'ko' ? badge.name.ko : badge.name.en}
                    </p>
                    <p className="text-xs text-neutral-600">
                      {language === 'ko' ? badge.description.ko : badge.description.en}
                    </p>
                    {badge.unlockedAt && (
                      <p className="text-xs text-neutral-500 mt-2">
                        {new Date(badge.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* In Progress Badges */}
          <div>
            <p className="text-sm font-semibold text-neutral-700 mb-3">
              {language === 'ko' ? '진행 중' : 'In Progress'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {inProgressBadges.map((badge) => (
                <Card key={badge.id} className="p-4 border-neutral-200 opacity-75">
                  <div className="text-center">
                    <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                    <p className="font-semibold text-black text-sm mb-1">
                      {language === 'ko' ? badge.name.ko : badge.name.en}
                    </p>
                    <p className="text-xs text-neutral-600 mb-2">
                      {language === 'ko' ? badge.description.ko : badge.description.en}
                    </p>
                    <div>
                      <div className="flex justify-between text-xs text-neutral-600 mb-1">
                        <span>{badge.progress}</span>
                        <span>{badge.maxProgress}</span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-400 transition-all"
                          style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* APT Compatibility */}
        {userPersonalityType && (
          <Card className="p-6 border-neutral-200 bg-neutral-50">
            <div className="text-center">
              <h3 className="text-lg font-bold text-black mb-2">
                {language === 'ko' ? '나와 잘 맞는 APT 타입' : 'Compatible APT Types'}
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                {language === 'ko'
                  ? '이 타입들과 함께 전시를 보면 좋은 대화를 나눌 수 있어요'
                  : 'Great conversation partners for museum visits'}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {compatibleTypes.map((type) => {
                  const animal = getAnimalByType(type);
                  return (
                    <div
                      key={type}
                      className="px-4 py-3 bg-white border-2 border-neutral-200 rounded-lg hover:border-black transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{animal?.emoji || '🎨'}</span>
                        <div className="text-left">
                          <p className="font-bold text-black text-sm">{type}</p>
                          <p className="text-xs text-neutral-600">{animal?.animal_ko || animal?.animal}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* Settings Modal */}
        <ProfileSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userInfo={{
            nickname: user?.nickname || undefined,
            email: user?.auth?.email,
            personalityType: userPersonalityType
          }}
          onUpdate={async (updates) => {
            window.location.reload();
          }}
        />

        {/* Share Modal */}
        {showShareModal && userPersonalityType && (
          <ShareModal
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
            quizResult={{
              personalityType: userPersonalityType,
              scores: {},
              responses: []
            }}
          />
        )}

        <FeedbackButton pageName="profile" />
      </Container>
    </div>
  );
}
