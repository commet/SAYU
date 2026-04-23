'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

const t = {
  en: {
    badge: 'ART DISCOVERY PLATFORM',
    headline1: 'With Art,',
    headline2: 'Find Your Own',
    headline3: 'Taste',
    description:
      'Discover your artistic personality, explore world masterpieces, and connect with like-minded people.',
    startTest: 'Start APT Test',
    exploreGallery: 'Explore Gallery',
  },
  ko: {
    badge: 'ART DISCOVERY PLATFORM',
    headline1: '예술과,',
    headline2: '나만의 취향을',
    headline3: '발견하다',
    description:
      '당신만의 예술적 성향을 발견하고, 세계의 명작들을 탐험하며, 같은 취향의 사람들과 연결되세요.',
    startTest: 'APT 테스트 시작',
    exploreGallery: '갤러리 둘러보기',
  },
};

const SLIDE_MS = 7000;
const EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];

const ARTWORKS = [
  {
    id: 1,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1920px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    tint: 'rgba(15,20,50,0.35)',
  },
  {
    id: 2,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/1920px-Monet_Water_Lilies_1916.jpg',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: '1916',
    tint: 'rgba(15,35,25,0.35)',
  },
  {
    id: 3,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/1280px-1665_Girl_with_a_Pearl_Earring.jpg',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: 'c. 1665',
    tint: 'rgba(40,30,15,0.35)',
  },
  {
    id: 4,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/1920px-The_Great_Wave_off_Kanagawa.jpg',
    title: 'The Great Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: 'c. 1831',
    tint: 'rgba(20,30,45,0.35)',
  },
  {
    id: 5,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1920px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
    title: 'The Birth of Venus',
    artist: 'Sandro Botticelli',
    year: 'c. 1485',
    tint: 'rgba(45,25,25,0.30)',
  },
];

// clip-path: clips vertically (hides text below) but NOT horizontally (italic safe)
function RevealLine({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <div style={{ clipPath: 'inset(-10% -50% 0% -50%)' }}>
      <motion.div
        initial={{ y: '120%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 1.0, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export const Hero3DSection: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const texts = t[language];
  const [idx, setIdx] = useState(0);
  const [cycle, setCycle] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const d = 0; // animation delay offset

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const fade = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Slide timer
  useEffect(() => {
    const iv = setInterval(() => {
      setIdx((p) => {
        const n = (p + 1) % ARTWORKS.length;
        if (n === 0) setCycle((c) => c + 1);
        return n;
      });
    }, SLIDE_MS);
    return () => clearInterval(iv);
  }, []);

  const art = ARTWORKS[idx];

  return (
    <section ref={ref} className="relative w-full h-screen overflow-hidden bg-black">
      {/* ── Background ── */}
      <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <AnimatePresence>
            <motion.div
              key={art.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ opacity: { duration: 1.5, ease: 'easeInOut' } }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
              >
                <Image
                  src={art.src}
                  alt={art.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                  priority
                />
              </motion.div>
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to bottom, ${art.tint} 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.8) 100%)`,
                }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)' }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <filter id="hg">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hg)" />
        </svg>
      </motion.div>

      {/* ── Marquee ── */}
      <div className="absolute inset-0 z-[5] hidden md:flex items-center overflow-hidden pointer-events-none">
        <motion.div
          className="whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 1].map((i) => (
            <span
              key={i}
              className="text-[18vw] font-extralight text-white/[0.025] select-none tracking-tight"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              사유 · SAYU · 思惟 · ART · CONTEMPLATION ·{' '}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ── Content ── */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
        style={{ y: contentY, opacity: fade }}
      >
        <RevealLine delay={d + 0.3}>
          <span className="text-[11px] text-white/40 font-light" style={{ letterSpacing: '0.3em' }}>
            {texts.badge}
          </span>
        </RevealLine>

        <motion.div
          className="h-[1px] bg-[#d4a520]/40 my-5 md:my-7"
          initial={{ width: 0 }}
          animate={{ width: 40 }}
          transition={{ delay: d + 0.5, duration: 0.8, ease: EASE }}
        />

        <div style={{ fontFamily: 'var(--font-cormorant), var(--font-noto-serif-kr), serif', wordBreak: 'keep-all' }}>
          <RevealLine delay={d + 0.55}>
            <span
              className="block font-light text-white/90 leading-none tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6.5rem)' }}
            >
              {texts.headline1}
            </span>
          </RevealLine>
          <div className="h-2 md:h-3" />
          <RevealLine delay={d + 0.7}>
            <span className="block text-center">
              <span
                className="inline-block font-semibold italic leading-none tracking-[-0.02em]"
                style={{
                  fontSize: 'clamp(2.8rem, 7vw, 6.5rem)',
                  background: 'linear-gradient(135deg, #d4a520 0%, #f0d878 50%, #d4a520 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  paddingInline: '0.25em',
                }}
              >
                {texts.headline2}
              </span>
            </span>
          </RevealLine>
          <div className="h-2 md:h-3" />
          <RevealLine delay={d + 0.85}>
            <span
              className="block font-light text-white/90 leading-none tracking-[-0.02em]"
              style={{ fontSize: 'clamp(2.8rem, 7vw, 6.5rem)' }}
            >
              {texts.headline3}
            </span>
          </RevealLine>
        </div>

        <motion.p
          className="text-white/40 text-sm md:text-base max-w-lg mt-7 md:mt-9"
          style={{ lineHeight: 1.75, wordBreak: 'keep-all' }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d + 1.1, duration: 0.8, ease: EASE }}
        >
          {texts.description}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-3 mt-8 md:mt-10"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: d + 1.3, duration: 0.8, ease: EASE }}
        >
          <button
            onClick={() => router.push('/quiz')}
            className="group px-9 py-3.5 bg-white text-black text-sm font-medium tracking-wide
                       hover:bg-white/90 transition-colors duration-300
                       flex items-center gap-2 justify-center"
          >
            {texts.startTest}
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform duration-300" />
          </button>
          <button
            onClick={() => router.push('/gallery?tab=discover')}
            className="px-9 py-3.5 text-white/60 text-sm font-light tracking-wide
                       border border-white/15 hover:border-white/30 hover:text-white/80
                       transition-all duration-300"
          >
            {texts.exploreGallery}
          </button>
        </motion.div>
      </motion.div>

      {/* ── Bottom bar ── */}
      <motion.div className="absolute bottom-0 left-0 right-0 z-20" style={{ opacity: fade }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: d + 1.8, duration: 1.0 }}
        >
          <div className="flex gap-1 px-8 md:px-16 lg:px-20 mb-4">
            {ARTWORKS.map((_, i) => (
              <div key={i} className="flex-1 h-[2px] bg-white/[0.08] overflow-hidden">
                {i < idx && <div className="h-full w-full bg-white/30" />}
                {i === idx && (
                  <motion.div
                    key={`${cycle}-${i}`}
                    className="h-full bg-white/50"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: SLIDE_MS / 1000, ease: 'linear' }}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] px-8 md:px-16 lg:px-20 py-4 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={art.id}
                className="flex items-center gap-3 text-xs"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-white/20 tabular-nums" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="w-[1px] h-3 bg-white/10" />
                <span className="text-white/30 tracking-wide">{art.artist}</span>
                <span
                  className="text-white/20 italic hidden sm:inline"
                  style={{ fontFamily: 'var(--font-cormorant), serif' }}
                >
                  {art.title}, {art.year}
                </span>
              </motion.div>
            </AnimatePresence>
            <motion.div
              className="hidden md:block w-[1px] h-5"
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2))' }}
            />
          </div>
        </motion.div>
      </motion.div>

    </section>
  );
};
