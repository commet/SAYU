'use client';

import { useMemo } from 'react';

interface ExhibitionPlaceholderProps {
  title: string;
  venue: string;
  category?: string;
  variant?: 'card' | 'featured';
}

// Category to gradient and icon mapping
const categoryStyles: Record<string, { gradient: string; icon: React.ReactNode }> = {
  '현대미술': {
    gradient: 'from-slate-900 via-indigo-950 to-slate-800',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <rect x="3" y="3" width="18" height="18" rx="1" />
        <circle cx="12" cy="12" r="4" />
        <path d="M3 12h4M17 12h4M12 3v4M12 17v4" />
      </svg>
    ),
  },
  '회화': {
    gradient: 'from-amber-900 via-orange-950 to-stone-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <rect x="2" y="3" width="20" height="18" rx="1" />
        <path d="M6 21V3M18 21V3" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  '조각': {
    gradient: 'from-stone-800 via-zinc-900 to-neutral-950',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  '사진': {
    gradient: 'from-neutral-900 via-gray-950 to-zinc-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="1.5" />
      </svg>
    ),
  },
  '설치미술': {
    gradient: 'from-emerald-950 via-teal-950 to-slate-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <path d="M3 21h18M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-6h6v6" />
      </svg>
    ),
  },
  '미디어아트': {
    gradient: 'from-violet-950 via-purple-950 to-indigo-950',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  '공예': {
    gradient: 'from-rose-950 via-pink-950 to-stone-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <path d="M12 2C8 2 6 5 6 8c0 4 6 6 6 14 0-8 6-10 6-14 0-3-2-6-6-6z" />
      </svg>
    ),
  },
  '판화': {
    gradient: 'from-cyan-950 via-sky-950 to-slate-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <rect x="4" y="4" width="16" height="16" rx="1" />
        <rect x="7" y="7" width="10" height="10" rx="1" />
        <path d="M4 4L7 7M20 4L17 7M4 20L7 17M20 20L17 17" />
      </svg>
    ),
  },
  '드로잉': {
    gradient: 'from-warmGray-900 via-stone-950 to-neutral-900',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
  },
  '미술': {
    gradient: 'from-slate-800 via-gray-900 to-zinc-950',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
};

const defaultStyle = {
  gradient: 'from-slate-800 via-neutral-900 to-zinc-950',
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-8 h-8 opacity-30">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),
};

export function ExhibitionPlaceholder({
  title,
  venue,
  category = '미술',
  variant = 'card'
}: ExhibitionPlaceholderProps) {
  const style = useMemo(() => {
    return categoryStyles[category] || defaultStyle;
  }, [category]);

  const truncatedTitle = useMemo(() => {
    if (variant === 'featured') {
      return title.length > 40 ? title.slice(0, 40) + '...' : title;
    }
    return title.length > 24 ? title.slice(0, 24) + '...' : title;
  }, [title, variant]);

  const truncatedVenue = useMemo(() => {
    return venue.length > 16 ? venue.slice(0, 16) + '...' : venue;
  }, [venue]);

  if (variant === 'featured') {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Decorative elements */}
        <div className="absolute top-8 left-8 text-white/20">
          {style.icon}
        </div>
        <div className="absolute bottom-24 right-12 text-white/10 scale-150">
          {style.icon}
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} flex flex-col justify-between p-5`}>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Category icon */}
      <div className="relative z-10 text-white/20">
        {style.icon}
      </div>

      {/* Title and venue */}
      <div className="relative z-10 space-y-2">
        <h4 className="text-white/90 text-sm font-light leading-tight tracking-wide">
          {truncatedTitle}
        </h4>
        <p className="text-white/50 text-xs font-light uppercase tracking-widest">
          {truncatedVenue}
        </p>
      </div>

      {/* Subtle corner accent */}
      <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
        <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-white/[0.03] rounded-full" />
      </div>
    </div>
  );
}

export default ExhibitionPlaceholder;
