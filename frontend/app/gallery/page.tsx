'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Heart, Bookmark, Eye, Sparkles, User, ArrowLeft, Palette, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useResponsive } from '@/lib/responsive';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useCloudinaryArtworks } from '@/hooks/useCloudinaryArtworks';
import { useActivityTracker } from '@/hooks/useActivityTracker';

interface GalleryArtwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  imageUrl: string;
  museum?: string;
  style?: string;
  matchPercent?: number;
  description?: string;
}

const CATEGORIES = [
  { id: 'all', name: '전체', description: '모든 작품' },
  { id: 'impressionism', name: '인상주의', description: '빛과 색채의 순간' },
  { id: 'abstract', name: '추상', description: '형태와 감정' },
  { id: 'photography', name: '사진', description: '순간의 포착' },
  { id: 'asian', name: '동양미술', description: '전통과 조화' },
  { id: 'contemporary', name: '현대미술', description: '지금 이 순간' },
];

function GalleryContent() {
  const { user, loading } = useAuth();
  const { requireAuth } = useAuthGate();
  const { isMobile } = useResponsive();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuestMode = searchParams?.get('guest') === 'true';

  const [activeTab, setActiveTab] = useState<'collections' | 'discover' | 'saved'>('collections');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set());
  const [savedArtworks, setSavedArtworks] = useState<Set<string>>(new Set());
  const [savedArtworksData, setSavedArtworksData] = useState<GalleryArtwork[]>([]);

  // Get user APT type
  const userAptType = user?.personalityType || user?.aptType || 'SREF';

  // Activity tracking
  const { trackArtworkView } = useActivityTracker();

  // Cloudinary artworks hook
  const {
    artworks: cloudinaryArtworks,
    loading: loadingArtworks,
    refresh: refreshArtworks
  } = useCloudinaryArtworks({
    userType: userAptType,
    limit: 30,
    random: true,
    autoLoad: true
  });

  // Load user preferences
  useEffect(() => {
    loadUserPreferences();
  }, [user, isGuestMode]);

  const loadUserPreferences = async () => {
    const guestMode = !user || isGuestMode;

    if (guestMode) {
      const { GuestStorage } = await import('@/lib/guest-storage');
      const guestData = GuestStorage.getData();
      setLikedArtworks(new Set(guestData.savedArtworks));
      setSavedArtworks(new Set(guestData.savedArtworks));
    } else {
      try {
        const response = await fetch(`/api/gallery/collection?userId=${user.id}`);
        const result = await response.json();

        if (result.success && result.items) {
          const savedIds = result.items.map(item => item.id);
          setSavedArtworks(new Set(savedIds));
          setSavedArtworksData(result.items);
        }
      } catch (error) {
        console.error('Error loading saved artworks:', error);
      }

      const liked = localStorage.getItem('likedArtworks');
      if (liked) setLikedArtworks(new Set(JSON.parse(liked)));
    }
  };

  const handleLike = async (artworkId: string) => {
    const gate = requireAuth({ message: '작품을 좋아요하려면 로그인이 필요합니다.' });
    if (!gate.allowed) return;

    const newLiked = new Set(likedArtworks);
    const isLiking = !newLiked.has(artworkId);

    if (isLiking) {
      newLiked.add(artworkId);
      toast.success('❤️ 좋아요!');
    } else {
      newLiked.delete(artworkId);
      toast.success('💔 좋아요 취소');
    }

    setLikedArtworks(newLiked);
    localStorage.setItem('likedArtworks', JSON.stringify([...newLiked]));
  };

  const handleSave = async (artworkId: string) => {
    const gate = requireAuth({ message: '작품을 저장하려면 로그인이 필요합니다.' });
    if (!gate.allowed) return;

    const newSaved = new Set(savedArtworks);
    const isSaving = !newSaved.has(artworkId);

    if (isSaving) {
      newSaved.add(artworkId);
      toast.success('📌 컬렉션에 추가되었습니다!');

      const artwork = cloudinaryArtworks.find(a => a.id === artworkId);
      if (artwork) {
        setSavedArtworksData(prev => [{
          id: artwork.id,
          title: artwork.title,
          artist: artwork.artist,
          year: artwork.year,
          imageUrl: artwork.imageUrl,
          museum: artwork.museum,
          style: artwork.style,
          matchPercent: artwork.matchPercent,
          description: artwork.description
        }, ...prev]);
      }
    } else {
      newSaved.delete(artworkId);
      setSavedArtworksData(prev => prev.filter(a => a.id !== artworkId));
      toast.success('📌 컬렉션에서 제거되었습니다');
    }

    setSavedArtworks(newSaved);

    // Save to database if logged in
    if (user && !isGuestMode) {
      try {
        const artwork = cloudinaryArtworks.find(a => a.id === artworkId);
        await fetch('/api/gallery/collection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            artworkId: artworkId,
            action: isSaving ? 'save' : 'remove',
            artworkData: artwork ? {
              title: artwork.title,
              artist: artwork.artist,
              year: artwork.year,
              imageUrl: artwork.imageUrl,
              museum: artwork.museum,
              style: artwork.style,
              description: artwork.description
            } : null
          })
        });
      } catch (error) {
        console.error('Failed to save to database:', error);
      }
    }
  };

  // Filter artworks by category
  const filteredArtworks = selectedCategory === 'all'
    ? cloudinaryArtworks
    : cloudinaryArtworks.filter(artwork => {
        const style = (artwork.style?.toLowerCase() || '');
        const title = (artwork.title?.toLowerCase() || '');

        if (selectedCategory === 'impressionism' && style.includes('impression')) return true;
        if (selectedCategory === 'abstract' && (style.includes('abstract') || style.includes('modern'))) return true;
        if (selectedCategory === 'photography' && title.includes('photo')) return true;
        if (selectedCategory === 'asian' && (style.includes('ukiyo') || style.includes('chinese'))) return true;
        if (selectedCategory === 'contemporary' && (style.includes('contemporary') || style.includes('modern'))) return true;
        return false;
      });

  const recommendedArtworks = cloudinaryArtworks.slice(0, 6);

  if (loading && !isGuestMode) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
          <p className="text-neutral-600 text-sm">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-black mb-2">My Museum</h1>
          <p className="text-lg text-neutral-600 mb-6">당신만의 미술관을 만들어가세요</p>

          {/* Stats */}
          <div className="flex gap-6">
            <div>
              <p className="text-3xl font-bold text-black">{savedArtworks.size}</p>
              <p className="text-sm text-neutral-600">저장된 작품</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black">{likedArtworks.size}</p>
              <p className="text-sm text-neutral-600">좋아요</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-black">0</p>
              <p className="text-sm text-neutral-600">컬렉션</p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-neutral-200 mb-8"
        >
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('collections')}
              className={cn(
                "pb-4 font-medium transition-colors relative",
                activeTab === 'collections'
                  ? "text-black"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              My Collections
              {activeTab === 'collections' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={cn(
                "pb-4 font-medium transition-colors relative",
                activeTab === 'discover'
                  ? "text-black"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              Discover
              {activeTab === 'discover' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={cn(
                "pb-4 font-medium transition-colors relative",
                activeTab === 'saved'
                  ? "text-black"
                  : "text-neutral-600 hover:text-black"
              )}
            >
              All Works
              {activeTab === 'saved' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
                />
              )}
            </button>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'collections' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* New Collection Button */}
            <div
              className="bg-neutral-50 rounded-2xl p-12 text-center border-2 border-dashed border-neutral-300 hover:border-neutral-400 transition-colors cursor-pointer"
              onClick={() => toast('🎨 컬렉션 기능 준비 중입니다!', {
                duration: 3000,
                icon: '✨'
              })}
            >
              <Plus className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-black mb-2">새 컬렉션 만들기</h3>
              <p className="text-neutral-600 max-w-md mx-auto">
                주제별로 작품을 정리하고 당신만의 미술관을 만들어보세요
              </p>
              <p className="text-sm text-neutral-500 mt-4">곧 출시 예정</p>
            </div>

            {/* Mock Collections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Unsorted Collection */}
              <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[4/3] bg-neutral-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Palette className="w-12 h-12 text-neutral-300" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-black mb-2">Unsorted</h3>
                  <p className="text-sm text-neutral-600 mb-4">
                    정리하지 않은 작품들
                  </p>
                  <p className="text-2xl font-bold text-black">{savedArtworks.size}개</p>
                </div>
              </div>

              {/* Coming Soon Collections */}
              <div className="bg-neutral-50 rounded-lg border border-neutral-200 overflow-hidden opacity-60">
                <div className="aspect-[4/3] bg-neutral-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-neutral-300" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-black mb-2">인상주의 컬렉션</h3>
                  <p className="text-sm text-neutral-600 mb-4">빛과 색채의 순간들</p>
                  <p className="text-sm text-neutral-500">곧 출시</p>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-lg border border-neutral-200 overflow-hidden opacity-60">
                <div className="aspect-[4/3] bg-neutral-100 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-neutral-300" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-black mb-2">위로받는 작품들</h3>
                  <p className="text-sm text-neutral-600 mb-4">힘들 때 보는 작품</p>
                  <p className="text-sm text-neutral-500">곧 출시</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'discover' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* For You Section */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">
                {userAptType} 유형을 위한 추천
              </h2>
              <p className="text-neutral-600 mb-6">
                AI Curator가 당신의 성향에 맞춰 선별한 작품들
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedArtworks.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="aspect-[4/3] bg-neutral-100 relative">
                      {artwork.imageUrl && (
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      )}

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(artwork.id);
                          }}
                          className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        >
                          <Heart className={cn(
                            "w-4 h-4",
                            likedArtworks.has(artwork.id) ? "text-red-500 fill-red-500" : "text-neutral-600"
                          )} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(artwork.id);
                          }}
                          className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        >
                          <Bookmark className={cn(
                            "w-4 h-4",
                            savedArtworks.has(artwork.id) ? "text-green-500 fill-green-500" : "text-neutral-600"
                          )} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-black mb-1 line-clamp-1">{artwork.title}</h3>
                      <p className="text-sm text-neutral-600 line-clamp-1">{artwork.artist} · {artwork.year}</p>
                      {artwork.matchPercent && (
                        <p className="text-xs text-neutral-500 mt-2">매치율 {artwork.matchPercent}%</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-2xl font-bold text-black mb-4">카테고리별 탐색</h2>
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all",
                      selectedCategory === category.id
                        ? "bg-black text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    )}
                  >
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Filtered Artworks Grid */}
              {loadingArtworks ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
                  <p className="text-neutral-600">작품을 불러오는 중...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredArtworks.slice(0, 12).map((artwork, index) => (
                    <motion.div
                      key={artwork.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                    >
                      <div className="aspect-square bg-neutral-100 relative">
                        {artwork.imageUrl && (
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 25vw"
                          />
                        )}

                        {/* Action buttons */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(artwork.id);
                            }}
                            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                          >
                            <Heart className={cn(
                              "w-4 h-4",
                              likedArtworks.has(artwork.id) ? "text-red-500 fill-red-500" : "text-neutral-600"
                            )} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(artwork.id);
                            }}
                            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                          >
                            <Bookmark className={cn(
                              "w-4 h-4",
                              savedArtworks.has(artwork.id) ? "text-green-500 fill-green-500" : "text-neutral-600"
                            )} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-black text-sm line-clamp-1">{artwork.title}</h3>
                        <p className="text-xs text-neutral-600 line-clamp-1">{artwork.artist}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold text-black mb-6">모든 저장된 작품</h2>

            {savedArtworksData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {savedArtworksData.map((artwork, index) => (
                  <motion.div
                    key={artwork.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="aspect-square bg-neutral-100 relative">
                      {artwork.imageUrl && (
                        <Image
                          src={artwork.imageUrl}
                          alt={artwork.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 25vw"
                        />
                      )}

                      {/* Action buttons */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(artwork.id);
                          }}
                          className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        >
                          <Heart className={cn(
                            "w-4 h-4",
                            likedArtworks.has(artwork.id) ? "text-red-500 fill-red-500" : "text-neutral-600"
                          )} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave(artwork.id);
                          }}
                          className="p-2 rounded-full bg-white/90 hover:bg-white shadow-lg"
                        >
                          <Bookmark className={cn(
                            "w-4 h-4",
                            savedArtworks.has(artwork.id) ? "text-green-500 fill-green-500" : "text-neutral-600"
                          )} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-black text-sm line-clamp-1">{artwork.title}</h3>
                      <p className="text-xs text-neutral-600 line-clamp-1">{artwork.artist} · {artwork.year}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-neutral-50 rounded-lg p-12 text-center">
                <Bookmark className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <p className="text-neutral-600 mb-4">아직 저장한 작품이 없습니다</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  작품 탐색하기
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function GalleryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-200 border-t-black mx-auto mb-4"></div>
          <p className="text-neutral-600 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <GalleryContent />
    </Suspense>
  );
}
