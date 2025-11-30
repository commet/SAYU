'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Activity, Clock, Heart, Meh, ThumbsDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getArtworkById } from '@/data/mmca-tour-data';
import { EMOTION_TAG_PRESETS } from '@/types/mmca-tour';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Impression {
  id: string;
  user_id: string;
  artwork_id: string;
  rating: 'love' | 'like' | 'neutral' | 'dislike';
  emotion_tags: string[];
  memo: string | null;
  photo_url: string | null;
  created_at: string;
  users?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    personality_type?: string;
  };
}

const placeholderImage = '/placeholder-artwork.jpg';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [impressions, setImpressions] = useState<Impression[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedImpression, setSelectedImpression] = useState<Impression | null>(null);

  const fetchImpressions = async () => {
    try {
      const { data, error } = await supabase
        .from('mmca_tour_impressions')
        .select(`
          *,
          users (
            username,
            full_name,
            avatar_url,
            personality_type
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setImpressions(data || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching impressions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImpressions();

    const interval = setInterval(() => {
      fetchImpressions();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'love': return { icon: Heart, color: 'text-pink-500', label: '정말 좋아요' };
      case 'like': return { icon: Heart, color: 'text-purple-500', label: '좋아요' };
      case 'neutral': return { icon: Meh, color: 'text-gray-500', label: '보통이에요' };
      case 'dislike': return { icon: ThumbsDown, color: 'text-gray-600', label: '별로예요' };
      default: return { icon: Heart, color: 'text-gray-500', label: '' };
    }
  };

  const getEmotionLabel = (emotionId: string) => {
    const emotion = EMOTION_TAG_PRESETS.find(e => e.id === emotionId);
    return emotion ? `${emotion.emoji} ${emotion.label}` : emotionId;
  };

  const getUserDisplay = (impression: Impression) => {
    const user = impression.users;
    if (!user) return '익명';
    return user.full_name || user.username || '사용자';
  };

  const resolveArtworkInfo = (impression: Impression) => {
    const artwork = getArtworkById(impression.artwork_id);
    if (artwork) {
      return {
        title: artwork.title,
        subtitle: artwork.year,
        room: artwork.room,
        imageUrl: artwork.imageUrl || placeholderImage,
        isCustom: false
      };
    }
    if (impression.artwork_id?.startsWith('custom:')) {
      const raw = impression.artwork_id.replace(/^custom:/, '');
      const title = raw.split('-')[0] || '직접 업로드';
      return {
        title,
        subtitle: '직접 촬영',
        room: '',
        imageUrl: impression.photo_url || placeholderImage,
        isCustom: true
      };
    }
    return {
      title: impression.artwork_id || '미확인 작품',
      subtitle: '',
      room: '',
      imageUrl: impression.photo_url || placeholderImage,
      isCustom: true
    };
  };

  const artworkGroups = useMemo(() => {
    return impressions.reduce((acc, imp) => {
      const key = imp.artwork_id || 'unknown';
      if (!acc[key]) acc[key] = [];
      acc[key].push(imp);
      return acc;
    }, {} as Record<string, Impression[]>);
  }, [impressions]);

  const totalImpressions = impressions.length;
  const uniqueUsers = new Set(impressions.map(i => i.user_id)).size;
  const uniqueArtworks = new Set(impressions.map(i => i.artwork_id)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">팀 대시보드</h1>
                <p className="text-sm text-gray-400">
                  마지막 업데이트: {formatDistanceToNow(lastUpdate, { addSuffix: true, locale: ko })}
                </p>
                <p className="text-xs text-gray-500 mt-1">로그인 시 팀 대시보드 기능이 적용됩니다.</p>
              </div>
            </div>
            <button
              onClick={fetchImpressions}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Activity className="w-5 h-5 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{totalImpressions}</div>
            <div className="text-sm text-gray-400">총 감상</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{uniqueUsers}</div>
            <div className="text-sm text-gray-400">참여 인원</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
            <div className="text-2xl font-bold text-white mb-1">{uniqueArtworks}</div>
            <div className="text-sm text-gray-400">감상 작품</div>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-400" />
            최근 활동
          </h2>

          {impressions.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
              <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">아직 감상 기록이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {impressions.slice(0, 10).map((impression, index) => {
                const artworkInfo = resolveArtworkInfo(impression);
                const ratingInfo = getRatingIcon(impression.rating);
                const RatingIcon = ratingInfo.icon;

                return (
                  <motion.div
                    key={impression.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedImpression(impression)}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {getUserDisplay(impression).charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">
                            {getUserDisplay(impression)}
                          </span>
                          {impression.users?.personality_type && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                              {impression.users.personality_type}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(impression.created_at), { addSuffix: true, locale: ko })}
                          </span>
                        </div>

                        <div className="text-sm text-gray-300 mb-2">
                          <span className="font-medium">{artworkInfo.title}</span>
                          <span className="text-gray-500"> 작품을 감상했습니다</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <RatingIcon className={`w-4 h-4 ${ratingInfo.color}`} />
                          <span className="text-sm text-gray-400">{ratingInfo.label}</span>
                        </div>
                      </div>

                      {impression.photo_url && (
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
                          <img
                            src={impression.photo_url}
                            alt="업로드 사진"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Artwork Groups */}
        {impressions.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">작품별 반응</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(artworkGroups).map(([artworkId, artworkImpressions]) => {
                const sample = artworkImpressions[0];
                const info = resolveArtworkInfo(sample);

                return (
                  <div
                    key={artworkId}
                    className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50"
                  >
                    <div className="relative aspect-[4/3] bg-gray-900">
                      <img
                        src={info.imageUrl.startsWith('/mmca-tour-kcy') ? encodeURI(info.imageUrl) : info.imageUrl}
                        alt={info.title}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-medium text-white">
                        {artworkImpressions.length}명
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-white mb-1">{info.title}</h3>
                      <p className="text-sm text-gray-400 mb-3">{info.subtitle}</p>

                      <div className="flex items-center gap-1 flex-wrap">
                        {['love', 'like', 'neutral', 'dislike'].map((rating) => {
                          const count = artworkImpressions.filter(i => i.rating === rating).length;
                          const ratingInfo = getRatingIcon(rating);
                          const RatingIcon = ratingInfo.icon;

                          if (count === 0) return null;

                          return (
                            <div
                              key={rating}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full"
                            >
                              <RatingIcon className={`w-3 h-3 ${ratingInfo.color}`} />
                              <span className="text-xs text-gray-300">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Impression Detail Modal */}
      <AnimatePresence>
        {selectedImpression && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImpression(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
          >
            <div className="min-h-screen flex items-center justify-center p-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl bg-gray-900 rounded-2xl overflow-hidden border border-gray-700"
              >
                {selectedImpression.photo_url && (
                  <div className="relative aspect-[4/3] bg-gray-950">
                    <img
                      src={selectedImpression.photo_url}
                      alt="작품 사진"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                      {getUserDisplay(selectedImpression).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-white">{getUserDisplay(selectedImpression)}</div>
                      <div className="text-sm text-gray-400">
                        {formatDistanceToNow(new Date(selectedImpression.created_at), { addSuffix: true, locale: ko })}
                      </div>
                    </div>
                  </div>

                  {(() => {
                    const info = resolveArtworkInfo(selectedImpression);
                    return (
                      <div className="mb-4">
                        <h3 className="font-bold text-white text-lg">{info.title}</h3>
                        {info.subtitle && <p className="text-sm text-gray-400">{info.subtitle}</p>}
                      </div>
                    );
                  })()}

                  {(() => {
                    const ratingInfo = getRatingIcon(selectedImpression.rating);
                    const RatingIcon = ratingInfo.icon;
                    return (
                      <div className="flex items-center gap-2 mb-4">
                        <RatingIcon className={`w-6 h-6 ${ratingInfo.color}`} />
                        <span className="font-medium text-white">{ratingInfo.label}</span>
                      </div>
                    );
                  })()}

                  {selectedImpression.emotion_tags && selectedImpression.emotion_tags.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-400 mb-2">느낀 감정</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedImpression.emotion_tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                            {getEmotionLabel(tag)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedImpression.memo && (
                    <div className="mb-6">
                      <div className="text-sm font-medium text-gray-400 mb-2">감상</div>
                      <p className="text-white leading-relaxed">"{selectedImpression.memo}"</p>
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedImpression(null)}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
                  >
                    닫기
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
