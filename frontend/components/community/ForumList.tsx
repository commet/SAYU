'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { MessageSquare, Clock } from 'lucide-react';
import { Card } from '@/components/design-system/Card';

type ForumItem = {
  id: string;
  title: string;
  excerpt: string;
  category: 'exhibition' | 'artwork' | 'discussion';
  replies: number;
  lastActivity: string;
  author: string;
  slug: string;
};

const seededForums: ForumItem[] = [
  {
    id: 'kimchangyeol-visit',
    title: 'MMCA 김창열전 주말 동행 구합니다',
    excerpt: '토요일 오후 3시 관람 예정인데 함께 보실 분 계실까요? 관람 후 카페에서 감상 공유해요.',
    category: 'exhibition',
    replies: 12,
    lastActivity: '1시간 전',
    author: '@sj.moment',
    slug: 'kimchangyeol-visit'
  },
  {
    id: 'warhol-pop',
    title: '앤디 워홀 전시에서 가장 인상 깊었던 작품은?',
    excerpt: '실크스크린 작업과 드로잉 중 무엇이 더 강렬했나요? 작품별로 느낀 점 나눠봐요.',
    category: 'discussion',
    replies: 8,
    lastActivity: '오늘',
    author: '@art_weather',
    slug: 'warhol-pop'
  },
  {
    id: 'lee-bul',
    title: '이불 개인전: 시작은 모든 것을 바꾼다 관람 후기',
    excerpt: '설치 작업에서 공간감이 대단했어요. 같이 본 분들 전시 동선 추천해주시면 감사!',
    category: 'exhibition',
    replies: 5,
    lastActivity: '어제',
    author: '@gallery_buddy',
    slug: 'lee-bul'
  },
  {
    id: 'favorite-abstract',
    title: '추상화 입문자를 위한 추천 작가 리스트',
    excerpt: 'APT 유형별로 입문하기 좋은 작가 5명 정리했습니다. 의견 주세요!',
    category: 'artwork',
    replies: 14,
    lastActivity: '3일 전',
    author: '@ur.fav.muse',
    slug: 'favorite-abstract'
  }
];

function categoryBadge(category: ForumItem['category']) {
  switch (category) {
    case 'exhibition':
      return 'bg-neutral-100 text-neutral-800 border border-neutral-200';
    case 'artwork':
      return 'bg-white text-neutral-800 border border-neutral-200';
    case 'discussion':
    default:
      return 'bg-neutral-50 text-neutral-800 border border-neutral-200';
  }
}

interface ForumListProps {
  className?: string;
}

export function ForumList({ className = '' }: ForumListProps) {
  const forums = seededForums;

  return (
    <div className={`space-y-4 ${className}`}>
      {forums.map((forum, index) => (
        <motion.div
          key={forum.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
        >
          <Link href={`/community/forums/${forum.slug}`} className="block">
            <Card className="p-5 border-neutral-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-black line-clamp-1">{forum.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryBadge(forum.category)}`}>
                      {forum.category === 'exhibition'
                        ? '전시'
                        : forum.category === 'artwork'
                        ? '작품'
                        : '토론'}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-600 line-clamp-2">{forum.excerpt}</p>

                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-neutral-500" />
                      <span>{forum.replies} 댓글</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-500" />
                      <span>{forum.lastActivity}</span>
                    </div>
                    <span className="text-neutral-500">{forum.author}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      ))}

      {forums.length === 0 && (
        <Card className="p-8 text-center border-neutral-200">
          <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6 text-neutral-500" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">아직 토론이 없어요</h3>
          <p className="text-sm text-neutral-600">첫 글을 작성해보세요.</p>
        </Card>
      )}
    </div>
  );
}
