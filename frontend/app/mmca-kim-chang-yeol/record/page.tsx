'use client';

import { useState, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Search, Heart, Meh, ThumbsDown, Upload, X, Check } from 'lucide-react';
import { MMCA_ARTWORKS, searchArtworks } from '@/data/mmca-tour-data';
import { EMOTION_TAG_PRESETS } from '@/types/mmca-tour';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

type Rating = 'love' | 'like' | 'neutral' | 'dislike';
type Mode = 'select' | 'custom';

// Supabase Storage 키는 특수문자/공백/한글에 민감할 수 있으므로 업로드 파일명을 ASCII 슬러그로 정규화한다.
const slugifyAscii = (str: string) => {
  const normalized = str
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // 결합 문자 제거
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-') // 영문/숫자/대시만 허용
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return normalized || 'custom';
};

export default function RecordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Search & select state
  const [mode, setMode] = useState<Mode>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  // Form state
  const [rating, setRating] = useState<Rating>('like');
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSearch = (query: string) => {
    if (mode === 'custom') return;
    setSearchQuery(query);
    if (query.trim()) {
      const results = searchArtworks(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectArtwork = (artwork: any) => {
    setSelectedArtwork(artwork);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleEmotion = (emotionId: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionId)
        ? prev.filter(id => id !== emotionId)
        : [...prev, emotionId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('로그인이 필요합니다');
      router.push('/login');
      return;
    }

    if (mode === 'select' && !selectedArtwork) {
      toast.error('작품을 선택해주세요');
      return;
    }

    if (mode === 'custom') {
      if (!customTitle.trim()) {
        toast.error('직접 업로드 시 제목을 입력해주세요');
        return;
      }
      if (!photoFile) {
        toast.error('직접 찍은 사진을 업로드해주세요');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let photoUrl: string | null = null;
      // Upload photo if exists
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop() || 'jpg';
        const baseName =
          mode === 'custom'
            ? `custom-${slugifyAscii(customTitle)}`
            : selectedArtwork?.id || 'artwork';
        const fileName = `${user.id}-${baseName}-${Date.now()}.${fileExt}`;
        const filePath = `mmca-impressions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('artworks')
          .upload(filePath, photoFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('artworks')
          .getPublicUrl(filePath);

        photoUrl = publicUrl;
      }

      const artworkId =
        mode === 'custom'
          ? `custom:${customTitle.trim()}-${Date.now()}`
          : selectedArtwork?.id;

      const finalMemo =
        mode === 'custom'
          ? memo
            ? `${customTitle.trim()} - ${memo}`
            : customTitle.trim()
          : memo || null;

      // Save impression to database
      const { error } = await supabase
        .from('mmca_tour_impressions')
        .insert({
          user_id: user.id,
          artwork_id: artworkId,
          rating,
          emotion_tags: selectedEmotions,
          memo: finalMemo,
          photo_url: photoUrl,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('감상이 기록되었습니다!');

      // Reset form
      setSelectedArtwork(null);
      setRating('like');
      setSelectedEmotions([]);
      setMemo('');
      setCustomTitle('');
      setPhotoFile(null);
      setPhotoPreview(null);
      setMode('select');
    } catch (error: any) {
      console.error('Error saving impression:', error);
      toast.error('기록 저장에 실패했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingOptions = [
    { value: 'love' as Rating, icon: Heart, label: '정말 좋아요', color: 'text-pink-500' },
    { value: 'like' as Rating, icon: Heart, label: '좋아요', color: 'text-purple-500' },
    { value: 'neutral' as Rating, icon: Meh, label: '보통이에요', color: 'text-gray-500' },
    { value: 'dislike' as Rating, icon: ThumbsDown, label: '별로예요', color: 'text-gray-600' }
  ];

  // Memo examples
  const memoExamples = [
    '물방울이 정말 투명하게 느껴진다',
    '마음이 고요해지는 순간',
    '존재와 소멸을 묻는 물방울',
    '빛과 그림자가 만드는 시간'
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">작품 감상 기록</h1>
              <p className="text-sm text-gray-400">마음에 드는 작품을 기록하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMode('select');
                setCustomTitle('');
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className={`w-full py-3 rounded-xl border transition-all ${mode === 'select' ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500/50'}`}
            >
              전시 작품 선택
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('custom');
                setSelectedArtwork(null);
                setSearchQuery('');
                setSearchResults([]);
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className={`w-full py-3 rounded-xl border transition-all ${mode === 'custom' ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-blue-500/50'}`}
            >
              직접 찍은 사진 업로드
            </button>
          </div>

          {/* Artwork Search */}
          {mode === 'select' && !selectedArtwork ? (
            <div>
              <label className="block text-sm font-medium mb-3">작품 검색</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="작품 제목이나 작가 이름을 검색하세요 (예: 물방울, 상흔)"
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              {/* Search Results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-3 bg-gray-800 rounded-xl border border-gray-700 overflow-hidden max-h-80 overflow-y-auto"
                  >
                    {searchResults.map((artwork) => (
                      <button
                        key={artwork.id}
                        type="button"
                        onClick={() => handleSelectArtwork(artwork)}
                        className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-700/50 transition-colors border-b border-gray-700/50 last:border-0"
                      >
                        {artwork.imageUrl && (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
                          <img
                            src={encodeURI(artwork.imageUrl)}
                            alt={artwork.title}
                            className="w-full h-full object-cover"
                          />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <div className="font-medium text-white">{artwork.title}</div>
                          <div className="text-sm text-gray-400">{artwork.year}</div>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Popular Artworks */}
              <div className="mt-6">
                <div className="text-sm font-medium mb-3">인기 작품</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MMCA_ARTWORKS.slice(0, 6).map((artwork) => (
                    <button
                      key={artwork.id}
                      type="button"
                      onClick={() => handleSelectArtwork(artwork)}
                      className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 hover:ring-2 hover:ring-purple-500 transition-all group"
                    >
                      <img
                        src={encodeURI(artwork.imageUrl)}
                        alt={artwork.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                        <div className="text-xs font-medium text-white">{artwork.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            mode === 'select' && selectedArtwork && (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium">선택된 작품</div>
                  <button
                    type="button"
                    onClick={() => setSelectedArtwork(null)}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    변경
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-900">
                    <img
                      src={encodeURI(selectedArtwork.imageUrl)}
                      alt={selectedArtwork.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-white">{selectedArtwork.title}</div>
                    <div className="text-sm text-gray-400">{selectedArtwork.year}</div>
                  </div>
                </div>
              </div>
            )
          )}

          {mode === 'custom' && (
            <div className="rounded-2xl bg-gradient-to-r from-blue-900/60 via-slate-900 to-indigo-900/60 border border-blue-700/60 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-300" />
                <div className="text-sm font-semibold text-blue-100">당신의 시선으로 포착한 순간</div>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="예: 마음을 멈춘 물방울의 빛"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-blue-700/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-gray-500"
                />
                <div className="text-xs text-blue-100/80">당신만의 감상이 소중한 예술 여정으로 남습니다.</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-blue-100/90">마음에 담은 장면 (필수)</label>
                {!photoPreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-blue-500/60 bg-blue-500/5 hover:bg-blue-500/10 transition-all"
                  >
                    <Upload className="w-8 h-8 text-blue-200" />
                    <div className="text-sm text-blue-100/80">당신의 시선을 이곳에 담아주세요</div>
                  </button>
                ) : (
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-900 border border-blue-700/60">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">평가</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ratingOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = rating === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRating(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? option.color : 'text-gray-500'}`} />
                    <div className="text-xs font-medium text-center">{option.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emotion Tags */}
          <div>
            <label className="block text-sm font-medium mb-3">느낀 감정 (선택)</label>
            <div className="flex flex-wrap gap-2">
              {EMOTION_TAG_PRESETS.map((tag) => {
                const isSelected = selectedEmotions.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleEmotion(tag.id)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {tag.emoji} {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium mb-3">한 줄 감상 (선택)</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={mode === 'custom' ? '이 순간이 당신에게 남긴 것을 적어보세요' : '이 작품이 당신에게 남긴 것을 적어보세요'}
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 resize-none"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-xs text-gray-500">{memo.length}/200</div>
              <div className="flex flex-wrap gap-1">
                {memoExamples.map((example, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMemo(example)}
                    className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-400 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !user}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                기록하는 중...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                감상 기록하기
              </>
            )}
          </button>

          {!user && (
            <p className="text-sm text-center text-amber-400">
              로그인 후 감상을 기록할 수 있습니다
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
