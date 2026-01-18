'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles, Play, ChevronDown } from 'lucide-react';
import Image from 'next/image';

// Famous artworks for the gallery
const ARTWORKS = [
  {
    id: 1,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: 'Starry Night',
    artist: 'Vincent van Gogh',
  },
  {
    id: 2,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/400px-Gustav_Klimt_016.jpg',
    title: 'The Kiss',
    artist: 'Gustav Klimt',
  },
  {
    id: 3,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/400px-1665_Girl_with_a_Pearl_Earring.jpg',
    title: 'Girl with Pearl Earring',
    artist: 'Johannes Vermeer',
  },
  {
    id: 4,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/600px-Monet_Water_Lilies_1916.jpg',
    title: 'Water Lilies',
    artist: 'Claude Monet',
  },
  {
    id: 5,
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/600px-The_Great_Wave_off_Kanagawa.jpg',
    title: 'The Great Wave',
    artist: 'Hokusai',
  },
];

// Floating particles component - CSS 애니메이션으로 GPU 가속
const PARTICLE_POSITIONS = Array.from({ length: 30 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  delay: `${(i * 0.15) % 2}s`,
  duration: `${3 + (i % 3)}s`,
}));

function FloatingParticles() {
  return (
    <>
      <style jsx>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
        }
        .particle {
          animation: float-particle var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {PARTICLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="particle absolute w-1 h-1 bg-[#d4a520] rounded-full"
            style={{
              left: pos.left,
              top: pos.top,
              '--delay': pos.delay,
              '--duration': pos.duration,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </>
  );
}

// Artwork card component
function ArtworkCard({
  artwork,
  index,
  isActive,
}: {
  artwork: typeof ARTWORKS[0];
  index: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
      animate={{
        opacity: isActive ? 1 : 0.3,
        scale: isActive ? 1 : 0.85,
        rotateY: isActive ? 0 : -10,
        z: isActive ? 50 : 0,
      }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Frame */}
      <div className="absolute inset-0 p-1 bg-gradient-to-br from-[#d4a520] via-[#b8860b] to-[#8b6914] rounded-2xl">
        <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
          <Image
            src={artwork.src}
            alt={artwork.title}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="text-white font-semibold text-sm">{artwork.title}</p>
            <p className="text-white/70 text-xs">{artwork.artist}</p>
          </div>
        </div>
      </div>
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 5,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
}

export const Hero3DSection: React.FC = () => {
  const router = useRouter();
  const [currentArtwork, setCurrentArtwork] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    setIsLoaded(true);

    // Auto-rotate artworks
    const interval = setInterval(() => {
      setCurrentArtwork((prev) => (prev + 1) % ARTWORKS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-black"
    >
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={{ y: backgroundY }}
      >
        {/* Dark gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(212, 165, 32, 0.15) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(212, 165, 32, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(212, 165, 32, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </motion.div>

      {/* Floating Particles */}
      <FloatingParticles />

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 py-20"
        style={{ y: textY, opacity }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10"
            >
              <Sparkles size={16} className="text-[#d4a520]" />
              <span className="text-sm font-medium text-white/90 tracking-wide">
                Art Discovery Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-tight text-white leading-[0.95]">
                예술과 함께,
                <br />
                <span className="font-serif italic font-normal bg-gradient-to-r from-[#d4a520] via-[#f0d878] to-[#d4a520] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  나만의 취향을
                </span>
                <br />
                찾아가는 시간
              </h1>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg md:text-xl text-white/60 leading-relaxed max-w-lg"
            >
              당신만의 예술적 성향을 발견하고, 세계의 명작들을 탐험하며,
              같은 취향의 사람들과 연결되세요.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => router.push('/quiz')}
                className="group relative px-8 py-4 bg-gradient-to-r from-[#d4a520] to-[#b8860b] text-white rounded-2xl font-semibold overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-[#d4a520]/30"
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  APT 테스트 시작
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#f0d878] to-[#d4a520]"
                  initial={{ x: '100%' }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </button>

              <button
                onClick={() => router.push('/gallery?tab=discover')}
                className="group px-8 py-4 bg-white/5 backdrop-blur-md text-white border border-white/20 rounded-2xl font-semibold hover:bg-white/10 hover:border-white/30 transition-all duration-300 flex items-center gap-2 justify-center"
              >
                <Play size={18} className="group-hover:scale-110 transition-transform" />
                갤러리 둘러보기
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-8 pt-4"
            >
              {[
                { value: '16', label: 'Art Personas', color: 'text-[#d4a520]' },
                { value: '10K+', label: 'Artworks', color: 'text-white' },
                { value: '47', label: "Today's Users", color: 'text-white' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-white/40 mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Artwork Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative h-[500px] hidden lg:flex items-center justify-center"
            style={{ perspective: '1000px' }}
          >
            {/* Artwork cards */}
            <div className="relative w-full h-full flex items-center justify-center">
              {ARTWORKS.map((artwork, index) => {
                const isActive = index === currentArtwork;
                const offset = index - currentArtwork;
                const absOffset = Math.abs(offset);

                if (absOffset > 2) return null;

                return (
                  <motion.div
                    key={artwork.id}
                    className="absolute w-[240px]"
                    animate={{
                      x: offset * 100,
                      z: isActive ? 100 : -absOffset * 50,
                      rotateY: offset * -8,
                      opacity: isActive ? 1 : 0.5 - absOffset * 0.15,
                      scale: isActive ? 1 : 0.9 - absOffset * 0.05,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <ArtworkCard
                      artwork={artwork}
                      index={index}
                      isActive={isActive}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation dots */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
              {ARTWORKS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentArtwork(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentArtwork
                      ? 'w-8 bg-[#d4a520]'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/50 font-medium">스크롤</span>
          <ChevronDown size={20} className="text-[#d4a520]" />
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-[#d4a520]/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-[#d4a520]/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l border-b border-[#d4a520]/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-[#d4a520]/20 pointer-events-none" />

      {/* Gradient text animation keyframe */}
      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </section>
  );
};
