'use client';

import React, { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  PerspectiveCamera,
  Environment,
  Float,
  useTexture,
  MeshReflectorMaterial,
  Text,
  Sparkles as DreiSparkles
} from '@react-three/drei';
import * as THREE from 'three';

// Artwork data with real images
const ARTWORKS = [
  {
    id: 1,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/600px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    title: 'Starry Night',
    position: [-4, 0.5, -2] as [number, number, number],
    rotation: [0, 0.3, 0] as [number, number, number],
    scale: 1.2,
  },
  {
    id: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_016.jpg/400px-Gustav_Klimt_016.jpg',
    title: 'The Kiss',
    position: [0, 1, -3] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: 1.4,
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/400px-1665_Girl_with_a_Pearl_Earring.jpg',
    title: 'Girl with Pearl Earring',
    position: [4, 0.5, -2] as [number, number, number],
    rotation: [0, -0.3, 0] as [number, number, number],
    scale: 1.2,
  },
  {
    id: 4,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Monet_Water_Lilies_1916.jpg/600px-Monet_Water_Lilies_1916.jpg',
    title: 'Water Lilies',
    position: [-2.5, -0.5, -1] as [number, number, number],
    rotation: [0, 0.15, 0] as [number, number, number],
    scale: 0.9,
  },
  {
    id: 5,
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/The_Great_Wave_off_Kanagawa.jpg/600px-The_Great_Wave_off_Kanagawa.jpg',
    title: 'The Great Wave',
    position: [2.5, -0.5, -1] as [number, number, number],
    rotation: [0, -0.15, 0] as [number, number, number],
    scale: 0.9,
  },
];

// Single Artwork Frame Component
function ArtworkFrame({
  image,
  position,
  rotation,
  scale,
  index
}: {
  image: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  index: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Load texture
  const texture = useTexture(image);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Calculate aspect ratio
  const aspectRatio = texture.image ? texture.image.width / texture.image.height : 1;
  const frameWidth = 1.5 * scale;
  const frameHeight = frameWidth / aspectRatio;

  useFrame((state) => {
    if (meshRef.current) {
      // Subtle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.05;

      // Subtle rotation on hover
      if (hovered) {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1] + 0.1, 0.1);
      } else {
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation[1], 0.1);
      }
    }
  });

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.1}
      floatIntensity={0.3}
    >
      <group position={position} rotation={rotation}>
        {/* Frame */}
        <mesh
          ref={meshRef}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        >
          {/* Main artwork plane */}
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshStandardMaterial
            map={texture}
            toneMapped={false}
            emissive={hovered ? '#ffffff' : '#000000'}
            emissiveIntensity={hovered ? 0.1 : 0}
          />
        </mesh>

        {/* Frame border */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[frameWidth + 0.1, frameHeight + 0.1, 0.05]} />
          <meshStandardMaterial
            color="#1a1a1a"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Glass reflection overlay */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[frameWidth, frameHeight]} />
          <meshStandardMaterial
            transparent
            opacity={0.1}
            color="#ffffff"
            metalness={1}
            roughness={0}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Ambient Particles
function AmbientParticles() {
  const count = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  const particlesRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#d4a520"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Mouse-following camera
function CameraController() {
  const { camera } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame(() => {
    // Subtle camera movement based on mouse position
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouseRef.current.x * 0.5, 0.02);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1 + mouseRef.current.y * 0.3, 0.02);
    camera.lookAt(0, 0, -2);
  });

  return null;
}

// Floor with reflections
function ReflectiveFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#101010"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  );
}

// 3D Scene Component
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <spotLight
        position={[10, 10, 5]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
        color="#fff5e6"
      />
      <spotLight
        position={[-10, 10, 5]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#e6f0ff"
      />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#d4a520" />

      {/* Environment */}
      <Environment preset="apartment" />

      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 1, 6]} fov={45} />
      <CameraController />

      {/* Reflective Floor */}
      <ReflectiveFloor />

      {/* Artwork Frames */}
      <Suspense fallback={null}>
        {ARTWORKS.map((artwork, index) => (
          <ArtworkFrame
            key={artwork.id}
            image={artwork.image}
            position={artwork.position}
            rotation={artwork.rotation}
            scale={artwork.scale}
            index={index}
          />
        ))}
      </Suspense>

      {/* Ambient Particles */}
      <AmbientParticles />

      {/* Golden Sparkles */}
      <DreiSparkles
        count={50}
        scale={10}
        size={2}
        speed={0.3}
        color="#d4a520"
      />

      {/* Background gradient sphere */}
      <mesh position={[0, 0, -15]} scale={30}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#0a0a0a"
          side={THREE.BackSide}
        />
      </mesh>

      {/* Fog effect */}
      <fog attach="fog" args={['#0a0a0a', 5, 25]} />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-2 border-[#d4a520] border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-white/60 text-sm">Loading Gallery...</p>
      </div>
    </div>
  );
}

export const Hero3DSection: React.FC = () => {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[700px] flex items-center justify-center overflow-hidden bg-black">
      {/* React Three Fiber Canvas */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<LoadingFallback />}>
          <Canvas
            shadows
            dpr={[1, 2]}
            gl={{
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.2
            }}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20"
            >
              <Sparkles size={14} className="text-[#d4a520]" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/90">
                Art Discovery Platform
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-white leading-[1.1]"
            >
              예술과 함께,
              <br />
              <span className="font-serif italic font-medium bg-gradient-to-r from-[#d4a520] to-[#f0d878] bg-clip-text text-transparent">
                나만의 취향을
              </span>
              <br />
              찾아가는 시간
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="text-base md:text-lg lg:text-xl text-white/70 leading-relaxed max-w-xl"
            >
              당신만의 예술적 성향을 발견하고,
              <br className="hidden sm:block" />
              세계의 명작들을 탐험하며,
              <br className="hidden sm:block" />
              같은 취향의 사람들과 연결되세요.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <button
                onClick={() => router.push('/quiz')}
                className="group px-8 py-4 bg-gradient-to-r from-[#d4a520] to-[#b8860b] text-white rounded-2xl font-semibold shadow-2xl hover:shadow-[#d4a520]/25 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 justify-center"
              >
                APT 테스트 시작
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => router.push('/gallery')}
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-semibold hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] transition-all duration-300 flex items-center gap-2 justify-center"
              >
                갤러리 둘러보기
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-[#d4a520]">16</p>
                <p className="text-xs text-white/50">Art Personas</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-xs text-white/50">Artworks</p>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">47</p>
                <p className="text-xs text-white/50">Today&apos;s Users</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Empty space for 3D content to show through */}
          <div className="hidden lg:block" />
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-white/60 font-medium">
            스크롤하여 더 알아보기
          </span>
          <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
            <motion.div
              className="w-1 h-3 bg-[#d4a520] rounded-full mx-auto"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[#d4a520]/30 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[#d4a520]/30 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[#d4a520]/30 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[#d4a520]/30 pointer-events-none z-10" />
    </section>
  );
};
