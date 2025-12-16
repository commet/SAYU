'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
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
  Sun,
  Moon
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useResponsive } from '@/lib/responsive';
import { useGamificationV2 } from '@/hooks/useGamificationV2';
import { getAnimalByType } from '@/data/personality-animals';
import { getGradientStyle, personalityGradients } from '@/constants/personality-gradients';
import { SAYUTypeCode } from '@/types/sayu-shared';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';
import { Container } from '@/components/design-system/Container';
import ProfileSettingsModal from '@/components/profile/ProfileSettingsModal';
import ShareModal from '@/components/share/ShareModal';
import FeedbackButton from '@/components/feedback/FeedbackButton';

const MobileProfile = dynamic(() => import('@/components/mobile/MobileProfile'), { ssr: false });

const badgeCopy = {
  firstVisit: {
    ko: '첫 전시 방문 완료',
    en: 'Completed your first visit'
  },
  artLover: {
    ko: '작품 10개 좋아요',
    en: 'Liked 10 artworks'
  },
  explorer: {
    ko: '미술관 5곳 탐험',
    en: 'Visited 5 museums'
  },
  collector: {
    ko: '작품 50개 저장',
    en: 'Saved 50 artworks'
  }
};

const mockBadges = [
  {
    id: 'first-visit',
    name: { en: 'First Steps', ko: '첫 발걸음' },
    description: badgeCopy.firstVisit,
    icon: '🎉',
    unlocked: true,
    unlockedAt: '2024-01-10',
    progress: 1,
    maxProgress: 1
  },
  {
    id: 'art-lover',
    name: { en: 'Art Lover', ko: '아트 러버' },
    description: badgeCopy.artLover,
    icon: '💜',
    unlocked: true,
    unlockedAt: '2024-01-15',
    progress: 10,
    maxProgress: 10
  },
  {
    id: 'explorer',
    name: { en: 'Explorer', ko: '탐험가' },
    description: badgeCopy.explorer,
    icon: '🧭',
    unlocked: false,
    progress: 2,
    maxProgress: 5
  },
  {
    id: 'collector',
    name: { en: 'Collector', ko: '컬렉터' },
    description: badgeCopy.collector,
    icon: '📦',
    unlocked: false,
    progress: 24,
    maxProgress: 50
  }
];

const personalitySnippets: Record<string, { ko: string; en: string }> = {
  LAEF: {
    ko: '조용히 몰입하며 색과 감정에 깊게 공감하는 타입. 작품 앞에서 오래 머물며 자신만의 해석을 즐깁니다.',
    en: 'Quietly immersive; you linger with color and emotion to find your own meaning.'
  },
  LREF: {
    ko: '구조와 흐름을 차분히 읽고 맥락을 짚어내는 분석가형 감상가입니다.',
    en: 'Calm and analytical; you read structure and flow to uncover context.'
  },
  SAMC: {
    ko: '사람들과 함께 감상을 즐기며 활기찬 전시와 대화를 좋아합니다.',
    en: 'Social and lively; you enjoy new shows and conversation with others.'
  }
};

export default function ProfilePage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const router = useRouter();
  const { isMobile } = useResponsive();
  const { stats: gameStats } = useGamificationV2();

  const [isClient, setIsClient] = useState(false);
  const [renderMobile, setRenderMobile] = useState(false);
  const [userPersonalityType, setUserPersonalityType] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [followStats] = useState({ followerCount: 12, followingCount: 8 });
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
      return;
    }
    const quizResults = localStorage.getItem('quizResults');
    if (quizResults) {
      try {
        const results = JSON.parse(quizResults);
        setUserPersonalityType(results.personalityType);
      } catch (e) {
        console.error('Error parsing quiz results:', e);
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

  const personaText = useMemo(() => {
    if (!userPersonalityType) return null;
    return personalitySnippets[userPersonalityType] || {
      ko: '당신만의 감상 패턴을 발견하고 있어요.',
      en: 'We are discovering your unique viewing style.'
    };
  }, [userPersonalityType]);

  const getGradientByType = (type?: string | null) => {
    if (!type) return 'linear-gradient(135deg, #111827, #1f2937)';
    const map = personalityGradients[type as SAYUTypeCode];
    if (map?.colors?.length) return `linear-gradient(135deg, ${map.colors.join(', ')})`;
    return 'linear-gradient(135deg, #111827, #1f2937)';
  };

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

  const statGroups = [
    {
      title: language === 'ko' ? '활동 리듬' : 'Activity',
      items: [
        { label: language === 'ko' ? '레벨' : 'Level', value: gameStats?.level || 3, icon: TrendingUp },
        { label: language === 'ko' ? '포인트' : 'Points', value: gameStats?.total_points || 1250, icon: Award },
        { label: language === 'ko' ? '전시 방문' : 'Exhibitions', value: profileVisitCount, icon: Calendar }
      ]
    },
    {
      title: language === 'ko' ? '커뮤니티 & 컬렉션' : 'Community & Collection',
      items: [
        { label: language === 'ko' ? '팔로워' : 'Followers', value: followStats.followerCount, icon: Users },
        { label: language === 'ko' ? '팔로잉' : 'Following', value: followStats.followingCount, icon: Heart },
        { label: language === 'ko' ? '저장 작품' : 'Saved Artworks', value: 124, icon: Palette }
      ]
    }
  ];

  const unlockedBadges = mockBadges.filter((b) => b.unlocked);
  const inProgressBadges = mockBadges.filter((b) => !b.unlocked);
  const compatibleTypes = ['LAEF', 'SAMC', 'LREF'];

  return (
    <div className="min-h-screen bg-white">
      <Container size="2xl" className="py-12 space-y-8">
        {/* Profile Header */}
        <Card
          className="p-8 border-neutral-200 shadow-xl backdrop-blur-md"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))'
          }}
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex justify-center md:justify-start">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-neutral-100 flex items-center justify-center text-5xl overflow-hidden border-4 border-white shadow-lg">
                  {user?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.nickname || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{userAnimal?.emoji || '🦊'}</span>
                  )}
                </div>
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
                <div>
                  <h1 className="text-3xl font-bold text-black mb-2">{user?.nickname || user?.auth?.email || 'SAYU Explorer'}</h1>
                  <div className="flex items-center gap-2 text-neutral-600 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span>{user?.auth?.email || 'user@sayu.app'}</span>
                  </div>
                </div>

                {userPersonalityType && (
                  <div className="space-y-3">
                    <div
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-md text-white"
                      style={{
                        background: getGradientByType(userPersonalityType),
                        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
                      }}
                    >
                      <Palette className="w-5 h-5" />
                      <span className="text-lg">{userPersonalityType}</span>
                      <span className="text-sm opacity-80">·</span>
                      <span className="text-sm">{userAnimal?.animal_ko || userAnimal?.animal}</span>
                    </div>
                    {personaText && (
                      <p className="text-base text-neutral-700 max-w-2xl leading-relaxed">
                        {language === 'ko' ? personaText.ko : personaText.en}
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
                        requireAuth({ message: '프로필을 편집하려면 로그인해 주세요.' });
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
                        requireAuth({ message: '프로필을 공유하려면 로그인해 주세요.' });
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
                        requireAuth({ message: '공개 설정을 변경하려면 로그인해 주세요.' });
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
                    <span>게스트 모드입니다. APT 결과와 여정 기록을 저장하려면 가입해 주세요.</span>
                    <Button size="sm" onClick={() => requireAuth({ message: '회원가입 후 전체 기능을 이용해 주세요.' })}>
                      {language === 'ko' ? '회원가입' : 'Sign up'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Level & XP */}
            <div className="flex flex-col items-center justify-center md:items-end gap-2 min-w-[140px]">
              <div className="text-center md:text-right">
                <p className="text-sm text-neutral-600">{language === 'ko' ? '레벨' : 'Level'}</p>
                <p className="text-4xl font-bold text-black">{gameStats?.level || 3}</p>
              </div>
              <div className="w-full max-w-[140px]">
                <div className="flex justify-between text-xs text-neutral-600 mb-1">
                  <span>XP</span>
                  <span>
                    {gameStats?.current_exp || 450} / {gameStats?.nextLevelExp || 1000}
                  </span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all"
                    style={{
                      width: `${((gameStats?.current_exp || 450) / (gameStats?.nextLevelExp || 1000)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-black">{language === 'ko' ? '나의 통계' : 'My Stats'}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {statGroups.map((group, groupIndex) => (
              <Card key={group.title} className="p-5 border-neutral-200 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-neutral-700">{group.title}</h3>
                  <div className="h-px flex-1 bg-neutral-200 ml-4" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {group.items.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (groupIndex * 3 + index) * 0.04 }}
                      className="rounded-2xl bg-neutral-50 border border-neutral-200 p-3 text-center shadow-sm hover:shadow-lg transition-shadow"
                    >
                      <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center mx-auto mb-2">
                        {(() => {
                          const Icon = stat.icon || Palette;
                          return <Icon className="w-5 h-5" />;
                        })()}
                      </div>
                      <p className="text-xl font-bold text-black leading-tight">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-neutral-600 mt-1">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements & Badges */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">{language === 'ko' ? '업적 & 배지' : 'Achievements & Badges'}</h2>
            <div className="text-sm text-neutral-600">
              {language === 'ko' ? '획득' : 'Unlocked'}:{' '}
              <span className="font-bold text-black">{unlockedBadges.length}</span> / {mockBadges.length}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4 border-neutral-200 bg-white/95 backdrop-blur-md shadow-md">
              <p className="text-sm font-semibold text-neutral-700 mb-3">
                {language === 'ko' ? '획득한 배지' : 'Unlocked Badges'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {unlockedBadges.map((badge) => (
                  <div key={badge.id} className="rounded-2xl bg-white border border-neutral-200 p-4 text-center shadow-md hover:shadow-lg transition-shadow">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-black text-sm mb-1">{language === 'ko' ? badge.name.ko : badge.name.en}</p>
                    <p className="text-xs text-neutral-600">{language === 'ko' ? badge.description.ko : badge.description.en}</p>
                    {badge.unlockedAt && (
                      <p className="text-[11px] text-neutral-500 mt-2">{new Date(badge.unlockedAt).toLocaleDateString()}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 border-neutral-200 shadow-md">
              <p className="text-sm font-semibold text-neutral-700 mb-3">
                {language === 'ko' ? '진행 중' : 'In Progress'}
              </p>
              <div className="space-y-3">
                {inProgressBadges.map((badge) => (
                  <div key={badge.id} className="rounded-2xl border border-dashed border-neutral-300 p-3 bg-neutral-50">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl grayscale">{badge.icon}</div>
                      <div className="flex-1">
                        <p className="font-semibold text-black text-sm">{language === 'ko' ? badge.name.ko : badge.name.en}</p>
                        <p className="text-xs text-neutral-600 mb-1">
                          {language === 'ko' ? badge.description.ko : badge.description.en}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-600">
                          <span>{badge.progress}</span>
                          <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-neutral-500"
                              style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                            />
                          </div>
                          <span>{badge.maxProgress}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* APT Compatibility */}
        {userPersonalityType && (
          <Card className="p-6 border-neutral-200 bg-white/95 backdrop-blur-md shadow-xl">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-bold text-black">
                {language === 'ko' ? '나와 잘 맞는 APT 타입' : 'Compatible APT Types'}
              </h3>
              <p className="text-sm text-neutral-600">
                {language === 'ko' ? '함께 전시를 보면 좋은 유형들을 추천해요.' : 'Great companions for museum visits.'}
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                {compatibleTypes.map((type) => {
                  const animal = getAnimalByType(type);
                  return (
                    <div
                      key={type}
                      className="px-4 py-3 bg-white border-2 border-neutral-200 rounded-lg shadow-md hover:shadow-xl hover:border-black transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{animal?.emoji || '🦊'}</span>
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

        <ProfileSettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          userInfo={{
            nickname: user?.nickname || undefined,
            email: user?.auth?.email,
            personalityType: userPersonalityType
          }}
          onUpdate={async () => window.location.reload()}
        />

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
