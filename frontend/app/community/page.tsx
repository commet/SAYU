'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Heart,
  X,
  Star,
  Sparkles,
  MapPin,
  Eye,
  MessageCircle,
  Users,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAnimalByType } from '@/data/personality-animals';
import { SAYUTypeCode } from '@/types/sayu-shared';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import { cn } from '@/lib/utils';

// Simplified mock data to match the new design
const mockUsers = [
  {
    id: '1',
    nickname: 'sohee.moment',
    age: 28,
    personalityType: 'SAEF',
    bio: 'Loves capturing sensory moments. Currently fascinated by Impressionism and Abstract Expressionism.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 42, artworks: 156, followers: 128 },
    compatibility: 95,
  },
  {
    id: '2',
    nickname: 'woojin.archive',
    age: 32,
    personalityType: 'LREF',
    bio: 'Enjoys observing changes in color and light. A slow, deep appreciator of art.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 38, artworks: 142, followers: 98 },
    compatibility: 88,
  },
  {
    id: '3',
    nickname: 'minjee.curator',
    age: 25,
    personalityType: 'LAMF',
    bio: 'Values deep interpretation and context. Highly interested in the curatorial concepts of exhibitions.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&h=800&fit=crop&crop=face',
    stats: { exhibitions: 28, artworks: 89, followers: 204 },
    compatibility: 74,
  },
];

export default function CommunityPage() {
  const { user } = useAuth();
  const { requireAuth } = useAuthGate();
  const [users, setUsers] = useState(mockUsers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const handleSwipe = (action: 'like' | 'pass') => {
    setDirection(action === 'like' ? 'right' : 'left');
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDirection(null);
    }, 200);
  };

  const activeUser = users[currentIndex];

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex flex-col">
        <header className="py-8 md:py-12 flex-shrink-0">
          <p className="text-sm uppercase tracking-widest text-neutral-500 mb-4">Community</p>
          <h1 className="text-5xl md:text-6xl font-light text-black mb-3 tracking-tight">Connect & Share</h1>
          <p className="text-lg text-neutral-500 font-light max-w-3xl">Discover art lovers and share your perspective.</p>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative pb-20">
          {/* Progress Indicator */}
          <div className="absolute top-0 right-0 p-4">
            <span className="text-sm uppercase tracking-widest text-neutral-400">
              {users.length - currentIndex} Profiles Left
            </span>
          </div>

          <AnimatePresence mode="popLayout">
            {activeUser ? (
              <motion.div
                key={activeUser.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{
                  x: direction === 'right' ? 500 : direction === 'left' ? -500 : 0,
                  opacity: 0,
                  rotate: direction === 'right' ? 20 : direction === 'left' ? -20 : 0
                }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md aspect-[3/4] bg-white border border-neutral-200 shadow-2xl"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipeThreshold = 100;
                  if (offset.x > swipeThreshold) {
                    handleSwipe('like');
                  } else if (offset.x < -swipeThreshold) {
                    handleSwipe('pass');
                  }
                }}
              >
                {/* Card Content */}
                <div className="absolute inset-0 select-none">
                  <div className="relative w-full h-3/4 bg-neutral-100 overflow-hidden">
                    <Image
                      src={activeUser.avatar}
                      alt={activeUser.nickname}
                      fill
                      className="object-cover grayscale"
                      draggable={false}
                    />
                    <div className="absolute top-6 right-6 px-4 py-2 bg-white/90 backdrop-blur border border-white/50">
                      <p className="text-xs uppercase tracking-wider text-black font-medium">
                        APT: {activeUser.personalityType}
                      </p>
                    </div>
                  </div>

                  <div className="h-1/4 p-6 flex flex-col justify-between bg-white border-t border-neutral-100">
                    <div>
                      <h2 className="text-2xl font-light text-black tracking-tight mb-1">
                        {activeUser.nickname}, {activeUser.age}
                      </h2>
                      <p className="text-sm text-neutral-500 line-clamp-2">{activeUser.bio}</p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-center">
                        <p className="text-lg font-light text-black">{activeUser.stats.exhibitions}</p>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">Exhibitions</p>
                      </div>
                      <div className="h-8 w-px bg-neutral-200" />
                      <div className="text-center">
                        <p className="text-lg font-light text-black">{activeUser.stats.artworks}</p>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">Artworks</p>
                      </div>
                      <div className="h-8 w-px bg-neutral-200" />
                      <div className="text-center">
                        <p className="text-lg font-light text-black">{activeUser.stats.followers}</p>
                        <p className="text-[10px] uppercase tracking-wider text-neutral-400">Followers</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Swipe Overlays */}
                <div className="absolute top-10 left-10 transform -rotate-12 border-4 border-emerald-500 px-4 py-2 opacity-0">
                  <span className="text-4xl font-bold text-emerald-500 uppercase tracking-widest">CONNECT</span>
                </div>
                <div className="absolute top-10 right-10 transform rotate-12 border-4 border-red-500 px-4 py-2 opacity-0">
                  <span className="text-4xl font-bold text-red-500 uppercase tracking-widest">SKIP</span>
                </div>

              </motion.div>
            ) : (
              <div className="text-center py-20">
                <p className="text-lg font-light text-neutral-400 mb-6">No more profiles</p>
                <button
                  onClick={() => setCurrentIndex(0)}
                  className="px-8 py-3 border border-neutral-200 hover:border-black text-sm uppercase tracking-wider transition-colors"
                >
                  Review Again
                </button>
              </div>
            )}
          </AnimatePresence>

          {/* Controls */}
          {activeUser && (
            <div className="flex items-center gap-6 mt-10">
              <button
                onClick={() => handleSwipe('pass')}
                className="w-16 h-16 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-all"
              >
                <X className="w-6 h-6 text-neutral-400" />
              </button>
              <button
                onClick={() => handleSwipe('like')}
                className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        <FeedbackButton pageName="community" />
      </div>
    </div>
  );
}