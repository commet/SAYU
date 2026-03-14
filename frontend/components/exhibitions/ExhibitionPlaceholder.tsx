'use client';

import { useMemo } from 'react';

interface ExhibitionPlaceholderProps {
  title: string;
  venue: string;
  category?: string;
  variant?: 'card' | 'featured';
}

// Deterministic hash from string
function hashStr(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// Extract hash bits as a value in a range
function pick(hash: number, shift: number, min: number, max: number): number {
  return min + (((hash >> shift) & 0xff) % (max - min + 1));
}

// Curated palettes: sophisticated gallery-worthy tones
const PALETTES = [
  { bg: '#F0E8DE', a: '#C09060', b: '#D8B898' }, // cream & sienna
  { bg: '#E2EAE2', a: '#7A9878', b: '#A8C0A8' }, // sage & moss
  { bg: '#ECE2E2', a: '#B87878', b: '#D0A4A4' }, // blush & mauve
  { bg: '#E2E6F0', a: '#7888B8', b: '#A0ACCE' }, // periwinkle
  { bg: '#F0EADA', a: '#C0A060', b: '#D8C498' }, // buttercream
  { bg: '#E6E6EC', a: '#8888A0', b: '#AAABBC' }, // fog & pewter
  { bg: '#ECDCD2', a: '#B07858', b: '#D09878' }, // terracotta
  { bg: '#DAE8EC', a: '#588A98', b: '#88B0BD' }, // seafoam
  { bg: '#E6DFEA', a: '#9878B0', b: '#B8A0CC' }, // wisteria
  { bg: '#E2E8D6', a: '#889858', b: '#A8B480' }, // lichen & olive
  { bg: '#EAE0D6', a: '#A07868', b: '#C09888' }, // sandstone
  { bg: '#E0E8EE', a: '#6080A0', b: '#88A8C0' }, // arctic blue
];

type Composition = 'circle-line' | 'overlap' | 'arc-dot' | 'blocks' | 'stripe';
const COMPOSITIONS: Composition[] = ['circle-line', 'overlap', 'arc-dot', 'blocks', 'stripe'];

export function ExhibitionPlaceholder({
  title,
  venue,
  variant = 'card'
}: ExhibitionPlaceholderProps) {
  const visual = useMemo(() => {
    const seed = title + (venue || '');
    const h = hashStr(seed);

    const palette = PALETTES[h % PALETTES.length];
    const comp = COMPOSITIONS[(h >> 4) % COMPOSITIONS.length];

    return {
      palette,
      comp,
      // shape positions & sizes derived from hash bits
      x1: pick(h, 8, 15, 65),
      y1: pick(h, 12, 5, 55),
      s1: pick(h, 16, 45, 75),
      x2: pick(h, 20, 20, 70),
      y2: pick(h, 24, 25, 65),
      s2: pick(h, 6, 20, 40),
      rot: pick(h, 10, -15, 15),
    };
  }, [title, venue]);

  const { palette, comp, x1, y1, s1, x2, y2, s2, rot } = visual;

  const shapes = (() => {
    switch (comp) {
      case 'circle-line':
        return (
          <>
            {/* Large floating circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s1}%`,
                aspectRatio: '1',
                top: `${y1 - 10}%`,
                right: `${-s1 * 0.2}%`,
                backgroundColor: palette.a,
                opacity: 0.14,
              }}
            />
            {/* Thin accent line */}
            <div
              className="absolute left-[8%] right-[8%]"
              style={{
                top: `${y2 + 15}%`,
                height: '1px',
                backgroundColor: palette.a,
                opacity: 0.25,
                transform: `rotate(${rot * 0.4}deg)`,
              }}
            />
            {/* Small accent dot */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s2 * 0.35}%`,
                aspectRatio: '1',
                bottom: `${y1 * 0.4 + 10}%`,
                left: `${x2 * 0.5 + 8}%`,
                backgroundColor: palette.b,
                opacity: 0.3,
              }}
            />
          </>
        );

      case 'overlap':
        return (
          <>
            {/* Primary circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s1}%`,
                aspectRatio: '1',
                top: `${-s1 * 0.15}%`,
                left: `${x1 * 0.5}%`,
                backgroundColor: palette.a,
                opacity: 0.13,
              }}
            />
            {/* Secondary circle */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s2 * 1.3}%`,
                aspectRatio: '1',
                bottom: `${y2 * 0.3}%`,
                right: `${x1 * 0.4 - 5}%`,
                backgroundColor: palette.b,
                opacity: 0.22,
              }}
            />
          </>
        );

      case 'arc-dot':
        return (
          <>
            {/* Large ring (stroke only) */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s1 * 2}%`,
                aspectRatio: '1',
                top: `${-s1 * 0.9}%`,
                right: `${-s1 * 0.7}%`,
                border: `1.5px solid ${palette.a}`,
                opacity: 0.18,
              }}
            />
            {/* Accent dot */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s2 * 0.35}%`,
                aspectRatio: '1',
                bottom: `${y2 * 0.5 + 10}%`,
                left: `${x1 * 0.5 + 10}%`,
                backgroundColor: palette.a,
                opacity: 0.35,
              }}
            />
            {/* Thin line from ring to dot */}
            <div
              className="absolute left-[15%] right-[50%]"
              style={{
                bottom: `${y2 * 0.5 + 12}%`,
                height: '1px',
                backgroundColor: palette.b,
                opacity: 0.15,
              }}
            />
          </>
        );

      case 'blocks':
        return (
          <>
            {/* Horizontal block */}
            <div
              className="absolute"
              style={{
                width: `${s1 * 0.85}%`,
                height: `${s2 * 0.28}%`,
                top: `${y1}%`,
                left: `${-s1 * 0.1}%`,
                backgroundColor: palette.a,
                opacity: 0.12,
                transform: `rotate(${rot * 0.6}deg)`,
              }}
            />
            {/* Vertical block */}
            <div
              className="absolute"
              style={{
                width: `${s2 * 0.35}%`,
                height: `${s1 * 0.55}%`,
                bottom: `${y2 * 0.25}%`,
                right: `${x1 * 0.4}%`,
                backgroundColor: palette.b,
                opacity: 0.18,
              }}
            />
            {/* Small square */}
            <div
              className="absolute"
              style={{
                width: `${s2 * 0.2}%`,
                aspectRatio: '1',
                top: `${y2 + 5}%`,
                left: `${x2 * 0.6 + 10}%`,
                backgroundColor: palette.a,
                opacity: 0.22,
              }}
            />
          </>
        );

      case 'stripe':
        return (
          <>
            {/* Wide horizontal band */}
            <div
              className="absolute left-0 right-0"
              style={{
                top: `${y1 * 0.5 + 15}%`,
                height: `${s2 * 0.7}%`,
                backgroundColor: palette.a,
                opacity: 0.09,
              }}
            />
            {/* Circle sitting on the band */}
            <div
              className="absolute rounded-full"
              style={{
                width: `${s2 * 0.6}%`,
                aspectRatio: '1',
                top: `${y1 * 0.5 + 5}%`,
                right: `${x2 * 0.5 + 8}%`,
                backgroundColor: palette.b,
                opacity: 0.25,
              }}
            />
            {/* Thin lower line */}
            <div
              className="absolute left-[12%] right-[25%]"
              style={{
                bottom: `${25 + y2 * 0.2}%`,
                height: '1px',
                backgroundColor: palette.a,
                opacity: 0.18,
              }}
            />
          </>
        );
    }
  })();

  if (variant === 'featured') {
    return (
      <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: palette.bg }}>
        {shapes}
        {/* Gradient overlay for featured text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: palette.bg }}>
      {shapes}
    </div>
  );
}

export default ExhibitionPlaceholder;
