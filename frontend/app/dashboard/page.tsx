'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Eye, Heart, Palette, MapPin, Calendar, ArrowRight, Sparkles, Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { isFeatureEnabled } from '@/lib/features/flags';
import Image from 'next/image';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { useResponsive } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { useRecentActivities } from '@/hooks/useActivityTracker';

// Lazy load mobile component
const MobileDashboard = dynamic(() => import('@/components/mobile/MobileDashboard'), {
  ssr: false
});

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { isMobile } = useResponsive();

  // Render mobile component for mobile devices
  if (isMobile) {
    return <MobileDashboard />;
  }

  const [currentTime, setCurrentTime] = useState(new Date());
  const [artworks, setArtworks] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [savedExhibitionsCount, setSavedExhibitionsCount] = useState(0);

  // Fetch real recent activities
  const { activities, isLoading: activitiesLoading } = useRecentActivities(10);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch artworks data
  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await fetch('/api/artworks');
        const data = await response.json();
        setArtworks(data.artworks || []);
      } catch (error) {
        console.error('Failed to fetch artworks:', error);
      }
    };
    fetchArtworks();
  }, []);

  // Fetch saved exhibitions count
  useEffect(() => {
    const fetchSavedExhibitions = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/exhibitions/save');
        if (response.ok) {
          const { data } = await response.json();
          setSavedExhibitionsCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch saved exhibitions:', error);
      }
    };
    fetchSavedExhibitions();
  }, [user]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      const useRealTimeStats = isFeatureEnabled('realtime_dashboard_stats', user?.id);

      if (!useRealTimeStats) {
        setDashboardStats({
          artworksViewed: 0,
          artistsDiscovered: 0,
          exhibitionsVisited: 0,
          savedArtworks: 0
        });
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);
        const userId = user?.id || null;
        const response = await fetch(`/api/dashboard/stats${userId ? `?userId=${userId}` : ''}`);
        const data = await response.json();

        if (data.success) {
          setDashboardStats(data.data);
        } else {
          setDashboardStats({
            artworksViewed: 0,
            artistsDiscovered: 0,
            exhibitionsVisited: 0,
            savedArtworks: 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setDashboardStats({
          artworksViewed: 0,
          artistsDiscovered: 0,
          exhibitionsVisited: 0,
          savedArtworks: 0
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (user && !loading) {
      fetchDashboardStats();
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-8">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-600">Dashboard</p>
            <h1 className="text-4xl font-bold">로그인하고 맞춤 대시보드를 확인하세요</h1>
            <p className="text-neutral-700">
              최근 본 작품, 저장한 전시, APT 기반 통계를 한곳에서 볼 수 있습니다. 로그인 후 개인화된 데이터를 불러올게요.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push('/login?redirect=/dashboard')}
              className="px-4 py-3 rounded-lg bg-black text-white font-semibold hover:bg-neutral-900 transition"
            >
              로그인
            </button>
            <button
              onClick={() => router.push('/register?redirect=/dashboard')}
              className="px-4 py-3 rounded-lg border border-neutral-200 text-neutral-800 font-semibold hover:bg-neutral-50 transition"
            >
              회원가입
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: '최근 본 작품', value: '—' },
              { label: '저장한 전시', value: '—' },
              { label: '발견한 작가', value: '—' },
              { label: 'APT 통계', value: '로그인 필요' }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <p className="text-sm text-neutral-600">{item.label}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get quiz status and personality type
  const hasCompletedQuiz = user?.quizCompleted || !!user?.personalityType;
  const personalityType = user?.personalityType || user?.aptType;

  // Contextual greeting based on time
  const getContextualGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return {
        title: "좋은 아침이에요",
        subtitle: personalityType ?
          `${personalityType}인 당신에게 오늘은 새로운 발견의 시간입니다` :
          "오늘은 어떤 예술을 만나볼까요?"
      };
    } else if (hour < 18) {
      return {
        title: "좋은 오후에요",
        subtitle: personalityType ?
          `잠시 멈춰서 ${personalityType}인 당신의 감성을 깨워보세요` :
          "잠시 쉬어가며 예술과 함께 호흡해보세요"
      };
    } else {
      return {
        title: "좋은 저녁이에요",
        subtitle: "하루를 마무리하며 마음을 채워줄 작품을 찾아보세요"
      };
    }
  };

  const greeting = getContextualGreeting();

  // Get random artworks for recommendations
  const randomArtworks = artworks.length > 0
    ? artworks.sort(() => 0.5 - Math.random()).slice(0, 6)
    : [];

  // Featured artwork (first one)
  const featuredArtwork = randomArtworks[0];

  // For You recommendations (next 5)
  const forYouArtworks = randomArtworks.slice(1, 6).map((artwork, index) => {
    const reasons = [
      '당신의 감성적 성향과 잘 맞아요',
      '최근 본 작품과 비슷한 스타일',
      '추상적 표현을 선호하시는군요',
      '이 아티스트를 좋아하실 것 같아요',
      '오늘 아침의 분위기와 어울립니다'
    ];
    return {
      ...artwork,
      reason: reasons[index % reasons.length]
    };
  });

  // Recent artworks (for Continue Exploring)
  const recentArtworks = artworks.slice(0, 5);

  // Use real stats from API
  const journeyStats = dashboardStats || {
    artworksViewed: 0,
    artistsDiscovered: 0,
    exhibitionsVisited: 0,
    savedArtworks: 0
  };

  // Quiz 미완료 사용자를 위한 화면
  if (!hasCompletedQuiz) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Quiz CTA Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-50 rounded-2xl p-12 text-center mb-12"
          >
            <Sparkles className="w-16 h-16 text-black mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-black mb-4">
              당신의 예술 여정을 시작하세요
            </h1>
            <p className="text-lg text-neutral-600 mb-8 max-w-2xl mx-auto">
              5분 테스트로 당신만의 예술 성향을 발견하고
              <br />
              맞춤 추천을 받아보세요
            </p>
            <button
              onClick={() => router.push('/quiz')}
              className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-neutral-800 transition-colors"
            >
              테스트 시작하기
            </button>
          </motion.section>

          {/* Popular Artworks */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-black mb-6">인기 작품</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {randomArtworks.slice(0, 6).map((artwork, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push('/gallery')}
                >
                  <div className="aspect-[4/3] bg-neutral-100 relative">
                    {artwork.cloudinaryUrl || artwork.primaryImage ? (
                      <Image
                        src={artwork.cloudinaryUrl || artwork.primaryImage}
                        alt={artwork.title || 'Artwork'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Palette className="w-12 h-12 text-neutral-300" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-black mb-1 line-clamp-1">
                      {artwork.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-neutral-600 line-clamp-1">
                      {artwork.artist || 'Unknown Artist'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Popular Exhibitions */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-black mb-6">진행 중인 전시</h2>
            <div className="bg-neutral-50 rounded-lg p-8 text-center">
              <MapPin className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">
                전시 정보는 곧 업데이트됩니다
              </p>
            </div>
          </motion.section>
        </div>

        <FeedbackButton
          position="fixed"
          variant="primary"
          contextData={{
            page: 'dashboard',
            hasCompletedQuiz: false
          }}
        />
      </div>
    );
  }

  // Quiz 완료 사용자를 위한 메인 Dashboard
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Welcome Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-50 rounded-2xl p-8"
        >
          <h1 className="text-3xl font-bold text-black mb-2">
            {greeting.title}, {user.username || user.displayName || user.email?.split('@')[0]}님
          </h1>
          <p className="text-lg text-neutral-600">
            {greeting.subtitle}
          </p>
        </motion.section>

        {/* Your Journey - Integrated Stats + Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-black">나의 여정</h2>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-3xl font-bold text-black">{journeyStats.artworksViewed}</p>
              <p className="text-sm text-neutral-600 mt-1">탐험한 작품</p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-3xl font-bold text-black">{journeyStats.savedArtworks}</p>
              <p className="text-sm text-neutral-600 mt-1">저장한 작품</p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <Palette className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-3xl font-bold text-black">{journeyStats.artistsDiscovered}</p>
              <p className="text-sm text-neutral-600 mt-1">발견한 아티스트</p>
            </div>

            <div className="bg-white rounded-lg border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-3xl font-bold text-black">{journeyStats.exhibitionsVisited}</p>
              <p className="text-sm text-neutral-600 mt-1">방문한 전시</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-neutral-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-600" />
              최근 활동
            </h3>
            <div className="space-y-3">
              {activitiesLoading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-neutral-200 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <div className="w-32 h-4 bg-neutral-200 rounded animate-pulse mb-1" />
                      <div className="w-20 h-3 bg-neutral-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : activities.length > 0 ? (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    <span className="text-lg">{activity.icon || '📍'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-black line-clamp-1">
                        {activity.title || '활동'}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {activity.formattedTime || '방금 전'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-neutral-600">아직 활동 기록이 없습니다</p>
                  <p className="text-xs text-neutral-500 mt-1">갤러리를 둘러보며 시작해보세요!</p>
                </div>
              )}
            </div>
            {activities.length > 0 && (
              <button
                onClick={() => router.push('/activity')}
                className="w-full mt-4 text-sm text-black hover:underline"
              >
                전체 활동 보기 →
              </button>
            )}
          </div>
        </motion.section>

        {/* Today's Featured */}
        {featuredArtwork && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-black mb-6">오늘의 작품</h2>
            <div
              className="relative aspect-[21/9] rounded-2xl overflow-hidden cursor-pointer group"
              onClick={() => router.push('/gallery')}
            >
              {featuredArtwork.cloudinaryUrl || featuredArtwork.primaryImage ? (
                <Image
                  src={featuredArtwork.cloudinaryUrl || featuredArtwork.primaryImage}
                  alt={featuredArtwork.title || 'Featured Artwork'}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="100vw"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center">
                  <Palette className="w-24 h-24 text-neutral-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-sm text-white/80 mb-2">오늘의 작품</p>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {featuredArtwork.title || 'Untitled'}
                </h2>
                <p className="text-white/90 mb-4">
                  {featuredArtwork.artist || 'Unknown Artist'}
                </p>
                <p className="text-white/80 text-sm max-w-2xl">
                  {personalityType ?
                    `${personalityType}인 당신의 감성과 이 작품의 색채가 오늘 특히 잘 어울립니다` :
                    '오늘 아침의 분위기와 완벽하게 어울리는 작품입니다'
                  }
                </p>
              </div>
            </div>
          </motion.section>
        )}

        {/* Exhibitions For You - Moved up */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-black mb-6">당신을 위한 전시</h2>
          <div className="bg-neutral-50 rounded-lg p-8 text-center">
            <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <p className="text-neutral-600 mb-2">
              {personalityType ?
                `${personalityType}인 당신의 취향에 맞는 전시를 준비하고 있습니다` :
                '당신의 취향에 맞는 전시를 준비하고 있습니다'
              }
            </p>
            <button
              onClick={() => router.push('/exhibitions')}
              className="text-sm text-black hover:underline"
            >
              전시 둘러보기 →
            </button>
          </div>
        </motion.section>

        {/* For You */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-black mb-6">당신을 위한 추천</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Artwork cards */}
            {forYouArtworks.map((artwork, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="bg-white rounded-lg border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group"
                onClick={() => router.push('/gallery')}
              >
                <div className="aspect-[4/3] bg-neutral-100 relative">
                  {artwork.cloudinaryUrl || artwork.primaryImage ? (
                    <Image
                      src={artwork.cloudinaryUrl || artwork.primaryImage}
                      alt={artwork.title || 'Artwork'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Palette className="w-12 h-12 text-neutral-300" />
                    </div>
                  )}
                  {/* Reason badge */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-xs text-black font-medium">
                      {artwork.reason}
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-black mb-1 line-clamp-1 group-hover:underline">
                    {artwork.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-neutral-600 line-clamp-1">
                    {artwork.artist || 'Unknown Artist'}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA Card as 6th item */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + forYouArtworks.length * 0.05 }}
              className="bg-neutral-50 rounded-lg border border-neutral-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all group flex flex-col"
              onClick={() => router.push('/gallery')}
            >
              <div className="aspect-[4/3] flex flex-col items-center justify-center p-6">
                <Palette className="w-12 h-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-bold text-black mb-2 text-center">
                  더 많은 작품
                </h3>
                <p className="text-sm text-neutral-600 text-center mb-4">
                  수천 개의 작품을 탐험하세요
                </p>
              </div>
              <div className="p-4 mt-auto">
                <div className="text-center">
                  <span className="text-sm font-medium text-black group-hover:underline">
                    갤러리 전체 보기 →
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>

      <FeedbackButton
        position="fixed"
        variant="primary"
        contextData={{
          page: 'dashboard',
          hasCompletedQuiz: hasCompletedQuiz,
          personalityType: personalityType
        }}
      />
    </div>
  );
}
