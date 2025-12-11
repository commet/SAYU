'use client';

import React, { useMemo, useState } from 'react';
import {
  Users,
  MessageSquare,
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Shield,
  X
} from 'lucide-react';
import { Card } from '@/components/design-system/Card';
import { Container } from '@/components/design-system/Container';
import { Button } from '@/components/design-system/Button';
import { ForumList } from '@/components/community/ForumList';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useLanguage } from '@/contexts/LanguageContext';
import FeedbackButton from '@/components/feedback/FeedbackButton';

type MatchCard = {
  id: string;
  nickname: string;
  personalityType: string;
  compatibility: 'perfect' | 'good' | 'learning' | 'contrast';
  compatibilityScore: number;
  lastActive: string;
  exhibitions: number;
  artworks: number;
  avatar?: string;
  distanceKm?: number;
};

type ExhibitionMatch = {
  id: string;
  title: string;
  museum: string;
  image: string;
  matchingUsers: number;
  endDate: string;
};

const exhibitionMatchesData: ExhibitionMatch[] = [
  {
    id: 'mmca-kim-chang-yeol',
    title: '김창열: 물방울',
    museum: '국립현대미술관 서울관',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=1200&h=900&fit=crop',
    matchingUsers: 28,
    endDate: '2025.02.23'
  },
  {
    id: 'leeum-andy-warhol',
    title: '앤디 워홀: 비전 앤 팩트',
    museum: '리움미술관',
    image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1200&h=900&fit=crop',
    matchingUsers: 34,
    endDate: '2025.03.30'
  },
  {
    id: 'sema-lee-bul',
    title: '이불: 시작은 모든 것을 바꾼다',
    museum: '서울시립미술관 서소문본관',
    image: 'https://images.unsplash.com/photo-1529429617124-aee11bad5112?w=1200&h=900&fit=crop',
    matchingUsers: 21,
    endDate: '2025.01.12'
  }
];

const mockMatches: MatchCard[] = [
  {
    id: '1',
    nickname: 'sj.moment',
    personalityType: 'SAEF',
    compatibility: 'perfect',
    compatibilityScore: 95,
    lastActive: '2시간 전',
    exhibitions: 42,
    artworks: 156,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
    distanceKm: 3.5
  },
  {
    id: '2',
    nickname: 'wooj1n',
    personalityType: 'LREF',
    compatibility: 'good',
    compatibilityScore: 88,
    lastActive: '어제',
    exhibitions: 38,
    artworks: 142,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
    distanceKm: 8.2
  },
  {
    id: '3',
    nickname: 'gallery_buddy',
    personalityType: 'LAMF',
    compatibility: 'learning',
    compatibilityScore: 74,
    lastActive: '3일 전',
    exhibitions: 24,
    artworks: 98,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face',
    distanceKm: 15.7
  }
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'matches' | 'exhibitions' | 'forums'>('matches');
  const [currentIndex, setCurrentIndex] = useState(0);

  const strings = useMemo(
    () => ({
      tabs: {
        matches: language === 'ko' ? '매칭' : 'Matches',
        exhibitions: language === 'ko' ? '전시 동행' : 'Exhibitions',
        forums: language === 'ko' ? '토론' : 'Discussions'
      },
      heroTitle: language === 'ko' ? 'APT 기반으로 바로 만날 준비가 되어 있어요.' : 'Ready to meet by APT match.',
      heroSub:
        language === 'ko'
          ? '비슷한 취향의 사람들과 전시를 함께 보고, 작품 이야기를 나눠보세요.'
          : 'See exhibitions together and talk about art with people who match your taste.',
      gateMessage: language === 'ko' ? '이 기능은 회원 전용입니다. 가입 후 이용해주세요.' : 'Please sign up to use this feature.',
      writeLabel: language === 'ko' ? '글쓰기' : 'New post',
      suggestVisit: language === 'ko' ? '동행 제안' : 'Suggest visit',
      save: language === 'ko' ? '저장' : 'Save',
      joinDiscussion: language === 'ko' ? '토론 참여' : 'Join discussion'
    }),
    [language]
  );

  const handleLike = (id: string) => {
    if (!user) return requireAuth({ message: strings.gateMessage });
    setCurrentIndex((prev) => Math.min(prev + 1, mockMatches.length - 1));
  };

  const handlePass = (id: string) => {
    if (!user) return requireAuth({ message: strings.gateMessage });
    setCurrentIndex((prev) => Math.min(prev + 1, mockMatches.length - 1));
  };

  const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const currentMatch = mockMatches[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-black">
      <Container size="2xl" className="pt-24 pb-16 space-y-10">
        {/* Hero */}
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-neutral-600 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {language === 'ko' ? '커뮤니티' : 'Community'}
          </p>
          <h1 className="text-4xl font-bold leading-tight">{strings.heroTitle}</h1>
          <p className="text-neutral-700">{strings.heroSub}</p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-black text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {language === 'ko' ? 'APT 기반 매칭' : 'APT matching'}
            </span>
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              {language === 'ko' ? '전시 동행 제안' : 'Co-visit'}
            </span>
            <span className="px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              {language === 'ko' ? '토론 참여' : 'Discussion'}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          {(['matches', 'exhibitions', 'forums'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200'
              }`}
            >
              {strings.tabs[tab]}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'matches' && currentMatch && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-sm text-neutral-600">
              <span>{language === 'ko' ? '매칭 제안' : 'Matches for you'}</span>
              <span className="font-medium text-neutral-800">
                {currentIndex + 1} / {mockMatches.length}
              </span>
            </div>
            <Card className="p-6 md:p-8 border-neutral-200 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-neutral-100 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentMatch.avatar} alt={currentMatch.nickname} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-xl font-semibold">{currentMatch.nickname}</p>
                  <p className="text-sm text-neutral-600">
                    {currentMatch.personalityType} · {currentMatch.lastActive}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black text-white">
                  {currentMatch.compatibilityScore}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-neutral-700">
                <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3">
                  <p className="text-neutral-500">{language === 'ko' ? '전시 경험' : 'Exhibitions'}</p>
                  <p className="text-lg font-semibold text-black">{currentMatch.exhibitions}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3">
                  <p className="text-neutral-500">{language === 'ko' ? '작품 감상' : 'Artworks'}</p>
                  <p className="text-lg font-semibold text-black">{currentMatch.artworks}</p>
                </div>
                <div className="rounded-xl bg-neutral-50 border border-neutral-200 p-3">
                  <p className="text-neutral-500">{language === 'ko' ? '거리' : 'Distance'}</p>
                  <p className="text-lg font-semibold text-black">
                    {currentMatch.distanceKm ? `${currentMatch.distanceKm}km` : language === 'ko' ? '근처' : 'Nearby'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" onClick={handlePrev} disabled={currentIndex === 0}>
                  <X className="w-4 h-4 rotate-180" />
                  {language === 'ko' ? '이전' : 'Prev'}
                </Button>
                <Button variant="primary" className="flex-1" onClick={() => handleLike(currentMatch.id)}>
                  <Heart className="w-4 h-4" />
                  {language === 'ko' ? '좋아요' : 'Like'}
                </Button>
                <Button variant="ghost" onClick={() => handlePass(currentMatch.id)} disabled={currentIndex === mockMatches.length - 1}>
                  {language === 'ko' ? '다음' : 'Pass'}
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'exhibitions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exhibitionMatchesData.map((item) => (
              <Card key={item.id} className="overflow-hidden border-neutral-200 hover:shadow-lg transition-shadow">
                <div className="h-48 w-full bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm text-neutral-600">{item.museum}</p>
                      <h3 className="text-xl font-semibold text-black">{item.title}</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                      {language === 'ko' ? `${item.matchingUsers}명 매칭` : `${item.matchingUsers} matches`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{item.endDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{language === 'ko' ? '지도 보기' : 'Open map'}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" className="flex-1" onClick={() => requireAuth({ message: strings.gateMessage })}>
                      {strings.suggestVisit}
                    </Button>
                    <Button variant="ghost" onClick={() => requireAuth({ message: strings.gateMessage })}>
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'forums' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">
                  {language === 'ko' ? '전시·작품 토론과 동행 모집' : 'Discuss exhibitions, artworks, and co-visits.'}
                </p>
                <h2 className="text-2xl font-semibold text-black">
                  {language === 'ko' ? '토론에 참여하거나 글을 남겨보세요' : 'Join a discussion or start one'}
                </h2>
              </div>
              <Button variant="primary" onClick={() => requireAuth({ message: strings.gateMessage })}>
                <MessageSquare className="w-4 h-4" />
                {strings.writeLabel}
              </Button>
            </div>
            <ForumList />
          </div>
        )}
      </Container>

      <FeedbackButton pageName="community" />
    </div>
  );
}
