'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';

interface ShelfCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  path: string;
  color: string;
  accentColor: string;
}

// 3D Scene Component
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={0.8} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />

      {/* Environment map for reflections */}
      <Environment preset="city" />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

      {/* Dev Controls - 개발 중 카메라 조작용 */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />

      {/* Placeholder: 여기에 GLB 모델들이 들어갈 예정 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#667eea" />
      </mesh>

      <mesh position={[-3, 0, 0]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#f093fb" />
      </mesh>

      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color="#4facfe" />
      </mesh>
    </>
  );
}

export const Hero3DSection: React.FC = () => {
  const router = useRouter();

  // SAYU 기능들 - Shopify Edition 스타일
  const topShelfCards: ShelfCard[] = [
    {
      id: 'quiz',
      title: 'Personality',
      subtitle: 'Test',
      icon: '🦊',
      path: '/quiz',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentColor: '#667eea'
    },
    {
      id: 'gallery',
      title: 'Art',
      subtitle: 'Gallery',
      icon: '🖼️',
      path: '/gallery',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accentColor: '#f093fb'
    },
    {
      id: 'exhibition',
      title: 'Exhibitions',
      subtitle: 'Curated',
      icon: '🏛️',
      path: '/exhibitions',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      accentColor: '#4facfe'
    }
  ];

  const bottomShelfCards: ShelfCard[] = [
    {
      id: 'community',
      title: 'Community',
      subtitle: 'Connect',
      icon: '👥',
      path: '/community',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      accentColor: '#43e97b'
    },
    {
      id: 'counselor',
      title: 'Art',
      subtitle: 'Counselor',
      icon: '💭',
      path: '/art-counselor',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      accentColor: '#fa709a'
    },
    {
      id: 'profile',
      title: 'My',
      subtitle: 'Profile',
      icon: '⚙️',
      path: '/profile',
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      accentColor: '#30cfd0'
    },
    {
      id: 'special',
      title: 'Special',
      subtitle: 'Events',
      icon: '✨',
      path: '/exhibitions',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      accentColor: '#a8edea'
    }
  ];

  return (
    <section className="relative w-full h-screen min-h-[800px] flex items-center justify-center overflow-hidden bg-white">

      {/* React Three Fiber Canvas - Full Background */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Canvas shadows>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-white/20 pointer-events-none z-[1]" />

      {/* Main Container */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-8">

          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-2xl space-y-8"
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 backdrop-blur-xl border border-black/5 shadow-lg">
              <Sparkles size={14} className="text-black" />
              <span className="text-xs font-semibold uppercase tracking-widest text-black">
                Art Discovery Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-black leading-[1.15]">
              예술과 함께,
              <br />
              <span className="font-serif italic font-medium">
                나만의 취향을
              </span>
              <br />
              찾아가는 시간
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-black/70 leading-relaxed max-w-xl">
              당신만의 예술적 성향을 발견하고,
              세계의 명작들을 탐험하며,
              같은 취향의 사람들과 연결되세요.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => router.push('/quiz')}
                className="group px-8 py-4 bg-black text-white rounded-2xl font-semibold shadow-2xl hover:shadow-3xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 justify-center"
              >
                APT 테스트 시작
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push('/gallery')}
                className="px-8 py-4 bg-white/95 backdrop-blur-md text-black border-2 border-black/10 rounded-2xl font-semibold hover:bg-white hover:border-black/20 hover:scale-[1.02] transition-all shadow-lg flex items-center gap-2 justify-center"
              >
                갤러리 둘러보기
              </button>
            </div>

            {/* Stats */}
            <div className="text-sm text-black/60">
              💫 오늘 47명이 자신의 예술 성향을 발견했어요
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-black/60 font-medium bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
            스크롤하여 더 알아보기
          </span>
          <div className="w-6 h-10 border-2 border-black/20 rounded-full p-1 bg-white/50 backdrop-blur-sm">
            <motion.div
              className="w-1 h-3 bg-black/40 rounded-full mx-auto"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
