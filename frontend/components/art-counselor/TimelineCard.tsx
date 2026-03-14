'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { TimelineItem } from '@/lib/art-counselor/types';

interface TimelineCardProps {
  item: TimelineItem;
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}달 전`;
  return `${Math.floor(diffDays / 365)}년 전`;
}

export function TimelineCard({ item }: TimelineCardProps) {
  return (
    <Link
      href={`/art-counselor/session/${encodeURIComponent(item.id)}`}
      className={cn(
        'flex gap-3.5 px-4 py-4',
        'border-b border-white/[0.06]',
        'hover:bg-white/[0.02]',
        'transition-colors duration-200'
      )}
    >
      {/* Thumbnail */}
      {item.artworkThumbnailUrl ? (
        <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-white/[0.03]">
          <Image
            src={item.artworkThumbnailUrl}
            alt={item.artworkTitle}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded shrink-0 bg-white/[0.04]" />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm text-white/80 truncate">
            {item.artworkTitle}
          </h3>
          <span className="text-[11px] text-white/25 shrink-0">
            {formatRelativeDate(item.completedAt)}
          </span>
        </div>

        {item.artworkArtist && (
          <p className="text-xs text-white/35 mt-0.5">{item.artworkArtist}</p>
        )}

        {item.summary && (
          <p className="text-xs text-white/45 mt-1.5 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        )}

        {item.moodTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.moodTags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] text-white/30 border border-white/10 rounded-full px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
