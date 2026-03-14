'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Heart,
  Clock,
  Share2,
  ExternalLink,
  Tag,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExhibitionPlaceholder } from '@/components/exhibitions/ExhibitionPlaceholder';

// Visit recording system
import StartVisitButton from '@/components/exhibition/StartVisitButton';
import VisitProgressHeader from '@/components/exhibition/VisitProgressHeader';
import FloatingRecordButton from '@/components/exhibition/FloatingRecordButton';
import ArtworkSearchModal from '@/components/exhibition/ArtworkSearchModal';
import { useVisitStore } from '@/lib/stores/visit-store';

interface Exhibition {
  id: string;
  title: string;
  titleEn?: string | null;
  titleLocal?: string | null;
  venue: string;
  location: string;
  country?: string;
  address?: string;
  startDate: string;
  endDate: string;
  description: string;
  image?: string | null;
  price?: string | null;
  status: 'ongoing' | 'upcoming' | 'ended';
  closingSoon?: boolean;
  daysLeft?: number | null;
  artists?: string[] | null;
  tags?: string[] | null;
  source?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
}

interface RelatedExhibition {
  id: string;
  title: string;
  venue: string;
  location: string;
  image?: string | null;
  status: 'ongoing' | 'upcoming' | 'ended';
}

const t = {
  en: {
    back: 'Back',
    ongoing: 'Now Open',
    upcoming: 'Upcoming',
    ended: 'Ended',
    closingIn: (days: number) => `Closing in ${days} days`,
    about: 'About',
    visitInfo: 'Visit Information',
    artists: 'Artists',
    admission: 'Admission',
    address: 'Address',
    source: 'Source',
    viewSource: 'View original',
    related: 'Related Exhibitions',
    startVisit: 'Start Visit Recording',
    share: 'Share',
    noDescription: 'No description available.',
    free: 'Free',
    backToList: 'Browse Exhibitions',
    notFound: 'Exhibition not found',
    notFoundDesc: 'This exhibition may have been removed or the link is incorrect.',
    loading: 'Loading exhibition...',
  },
  ko: {
    back: '뒤로',
    ongoing: '전시 중',
    upcoming: '예정',
    ended: '종료',
    closingIn: (days: number) => `${days}일 후 종료`,
    about: '전시 소개',
    visitInfo: '관람 정보',
    artists: '참여 작가',
    admission: '입장료',
    address: '주소',
    source: '출처',
    viewSource: '원본 보기',
    related: '관련 전시',
    startVisit: '관람 기록 시작',
    share: '공유',
    noDescription: '전시 설명이 제공되지 않았습니다.',
    free: '무료',
    backToList: '전시 목록',
    notFound: '전시를 찾을 수 없습니다',
    notFoundDesc: '전시가 삭제되었거나 링크가 잘못되었을 수 있습니다.',
    loading: '전시 정보를 불러오는 중...',
  },
};

export default function ExhibitionDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const { language } = useLanguage();
  const texts = t[language];
  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [related, setRelated] = useState<RelatedExhibition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    currentVisit,
    isRecording,
    elapsedSeconds,
    recordedArtworks,
    openRecordModal,
    closeRecordModal,
    isRecordModalOpen,
  } = useVisitStore();

  const isCurrentExhibitionVisit = isRecording && currentVisit?.exhibition_id === id;

  useEffect(() => {
    setImageError(false);
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/exhibitions/${id}`);
        if (!res.ok) throw new Error('Not found');
        const result = await res.json();
        if (result.success && result.data) {
          setExhibition(result.data);
          setRelated(result.related || []);
        } else {
          throw new Error('No data');
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleShare = async () => {
    if (!exhibition) return;
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: exhibition.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
    }
  };

  const handleLike = () => setLiked(v => !v);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    const locale = language === 'ko' ? 'ko-KR' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const statusConfig = {
    ongoing: { label: texts.ongoing, color: 'bg-green-600' },
    upcoming: { label: texts.upcoming, color: 'bg-blue-600' },
    ended: { label: texts.ended, color: 'bg-neutral-500' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4" />
          <p className="text-neutral-500 text-sm">{texts.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !exhibition) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h2 className="text-2xl font-light text-black mb-3">{texts.notFound}</h2>
          <p className="text-neutral-500 mb-8 text-sm">{texts.notFoundDesc}</p>
          <button
            onClick={() => router.push('/exhibitions')}
            className="px-6 py-2.5 bg-black text-white text-sm rounded-sm hover:bg-neutral-800 transition-colors"
          >
            {texts.backToList}
          </button>
        </div>
      </div>
    );
  }

  const sc = statusConfig[exhibition.status];
  const hasDates = exhibition.startDate || exhibition.endDate;
  const hasArtists = exhibition.artists && exhibition.artists.length > 0;
  const hasTags = exhibition.tags && exhibition.tags.length > 0;
  const hasDescription = exhibition.description && exhibition.description.length > 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Visit progress header */}
      {isCurrentExhibitionVisit && currentVisit && (
        <div className="sticky top-0 z-30">
          <VisitProgressHeader
            visit={currentVisit}
            elapsedSeconds={elapsedSeconds}
            recordCount={recordedArtworks.length}
            onEndVisit={() => router.push('/exhibitions/history')}
          />
        </div>
      )}

      {/* Back button */}
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {texts.back}
        </button>
      </div>

      {/* Hero Image */}
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 mt-6">
        <div className="relative aspect-[16/9] sm:aspect-[2/1] overflow-hidden bg-neutral-100 border border-neutral-200">
          {exhibition.image && !imageError ? (
            <Image
              src={exhibition.image}
              alt={exhibition.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              onError={() => setImageError(true)}
            />
          ) : (
            <ExhibitionPlaceholder
              title={exhibition.title}
              venue={exhibition.venue}
              variant="featured"
            />
          )}
          {/* Status badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white rounded-sm ${sc.color}`}>
              {exhibition.closingSoon && exhibition.daysLeft != null && exhibition.daysLeft >= 0
                ? texts.closingIn(exhibition.daysLeft)
                : sc.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-black tracking-tight leading-tight">
                {exhibition.title}
              </h1>
              {exhibition.titleEn && exhibition.titleLocal && exhibition.titleEn !== exhibition.title && (
                <p className="text-lg text-neutral-400 font-light mt-2">{exhibition.titleEn}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm text-neutral-600">
                <span className="font-medium">{exhibition.venue}</span>
                {exhibition.location && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {exhibition.location}{exhibition.country ? `, ${exhibition.country}` : ''}
                  </span>
                )}
                {hasDates && (
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(exhibition.startDate)}{exhibition.endDate ? ` \u2013 ${formatDate(exhibition.endDate)}` : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 border rounded-sm text-sm transition-colors ${
                  liked ? 'bg-red-50 border-red-200 text-red-600' : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} />
                {liked ? (language === 'ko' ? '저장됨' : 'Saved') : (language === 'ko' ? '저장' : 'Save')}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-200 rounded-sm text-sm text-neutral-600 hover:border-neutral-400 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {texts.share}
              </button>
              {!isCurrentExhibitionVisit && exhibition.status === 'ongoing' && (
                <StartVisitButton
                  exhibitionId={exhibition.id}
                  exhibitionTitle={exhibition.title}
                  onStarted={() => {}}
                  className="px-4 py-2 bg-black text-white text-sm rounded-sm hover:bg-neutral-800 transition-colors"
                />
              )}
            </div>

            {/* Description */}
            {hasDescription && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-4">{texts.about}</h2>
                <div className="h-px bg-neutral-200 mb-4" />
                <p className="text-neutral-600 leading-relaxed text-sm whitespace-pre-line">
                  {exhibition.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}
                </p>
              </section>
            )}

            {/* Artists */}
            {hasArtists && (
              <section>
                <h2 className="text-xs uppercase tracking-widest text-neutral-900 font-medium mb-4 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  {texts.artists}
                </h2>
                <div className="h-px bg-neutral-200 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {exhibition.artists!.map((artist, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-neutral-100 text-neutral-700 text-sm rounded-sm"
                    >
                      {artist}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Tags */}
            {hasTags && (
              <section>
                <div className="flex flex-wrap gap-2">
                  {exhibition.tags!.map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 px-2.5 py-1 border border-neutral-200 text-neutral-500 text-xs rounded-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Visit Info Card */}
            <div className="border border-neutral-200 p-6 space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-neutral-900 font-medium">{texts.visitInfo}</h3>
              <div className="h-px bg-neutral-100" />

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{language === 'ko' ? '장소' : 'Venue'}</p>
                  <p className="text-neutral-900 font-medium">{exhibition.venue}</p>
                </div>

                {exhibition.address && (
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{texts.address}</p>
                    <p className="text-neutral-600">{exhibition.address}</p>
                  </div>
                )}

                {exhibition.location && (
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{language === 'ko' ? '도시' : 'City'}</p>
                    <p className="text-neutral-600">{exhibition.location}{exhibition.country ? `, ${exhibition.country}` : ''}</p>
                  </div>
                )}

                {hasDates && (
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{language === 'ko' ? '기간' : 'Dates'}</p>
                    <p className="text-neutral-600">
                      {formatDate(exhibition.startDate)}
                      {exhibition.endDate ? ` \u2013 ${formatDate(exhibition.endDate)}` : ''}
                    </p>
                  </div>
                )}

                {exhibition.price && (
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{texts.admission}</p>
                    <p className="text-neutral-600">{exhibition.price}</p>
                  </div>
                )}

                {exhibition.source && (
                  <div>
                    <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">{texts.source}</p>
                    <p className="text-neutral-500 text-xs">{exhibition.sourceLabel || exhibition.source}</p>
                  </div>
                )}
              </div>

              {exhibition.sourceUrl && (
                <a
                  href={exhibition.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 border border-neutral-200 text-sm text-neutral-600 hover:border-neutral-400 hover:text-black transition-colors rounded-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  {texts.viewSource}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Related Exhibitions */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-sm uppercase tracking-widest text-neutral-900 font-medium">{texts.related}</h2>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/exhibitions/${r.id}`}
                  className="group"
                >
                  <div className="aspect-[3/4] border border-neutral-200 group-hover:border-neutral-900 transition-colors duration-300 overflow-hidden mb-3 relative bg-neutral-50">
                    {r.image ? (
                      <Image
                        src={r.image}
                        alt={r.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    ) : (
                      <ExhibitionPlaceholder
                        title={r.title}
                        venue={r.venue}
                        variant="card"
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-black line-clamp-2 leading-snug">{r.title}</h3>
                  <p className="text-xs text-neutral-500 font-light mt-1">{r.venue}</p>
                  {r.location && (
                    <p className="text-[11px] text-neutral-400 font-light">{r.location}</p>
                  )}
                  <div className="h-px bg-neutral-900 mt-2 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back to list */}
        <div className="mt-16 mb-8 text-center">
          <Link
            href="/exhibitions"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black text-white text-sm rounded-sm hover:bg-neutral-800 transition-colors"
          >
            {texts.backToList}
          </Link>
        </div>
      </div>

      {/* Floating record button */}
      {isCurrentExhibitionVisit && currentVisit && (
        <FloatingRecordButton
          visitId={currentVisit.id}
          onClick={openRecordModal}
          recordCount={recordedArtworks.length}
        />
      )}

      {/* Artwork search modal */}
      {isCurrentExhibitionVisit && currentVisit && (
        <ArtworkSearchModal
          isOpen={isRecordModalOpen}
          onClose={closeRecordModal}
          exhibitionId={exhibition.id}
          visitId={currentVisit.id}
          onArtworkSelected={() => {}}
        />
      )}
    </div>
  );
}
