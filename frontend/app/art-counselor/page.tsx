'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useCloudinaryArtworks, CloudinaryArtwork } from '@/hooks/useCloudinaryArtworks';
import { cn } from '@/lib/utils';

type Emotion = {
  id: string;
  label: string;
  context: string;
  aiResponse: string;
  artworkIntro: string;
};

// 감정 데이터 - 각 감정에 맞는 구체적이고 진심 어린 메시지
const EMOTIONS: Emotion[] = [
  {
    id: 'calm',
    label: '고요한 마음',
    context: '오늘은 평화롭고, 이 순간을 음미하고 싶은',
    aiResponse: '그 고요함을 조금 더 깊이 느껴보면 어떨까요.',
    artworkIntro: '이 작품은 당신의 평온한 마음결과 닮아 있어요.',
  },
  {
    id: 'restless',
    label: '불안한 마음',
    context: '생각이 많고, 마음이 자꾸 다른 곳으로 가는',
    aiResponse: '그런 날이 있죠. 잠시 여기 머물러도 괜찮아요.',
    artworkIntro: '복잡한 마음을 잠시 내려놓고, 이 작품을 바라봐 주세요.',
  },
  {
    id: 'melancholy',
    label: '쓸쓸한 마음',
    context: '혼자라는 느낌이 들고, 누군가와 연결되고 싶은',
    aiResponse: '외로운 밤, 말없이 곁에 있어줄 작품을 골랐어요.',
    artworkIntro: '이 작품도 당신처럼 조용히 혼자 서 있었어요.',
  },
  {
    id: 'heavy',
    label: '무거운 마음',
    context: '설명하기 어려운 무언가가 마음을 누르는',
    aiResponse: '말로 다 표현하지 않아도 돼요.',
    artworkIntro: '이 작품 앞에서 그냥 숨만 쉬어도 충분해요.',
  },
  {
    id: 'curious',
    label: '궁금한 마음',
    context: '새로운 것을 발견하고 싶고, 탐험하고 싶은',
    aiResponse: '좋은 호기심이에요. 함께 들여다볼까요?',
    artworkIntro: '이 작품에는 볼수록 새로운 이야기가 숨어 있어요.',
  },
];

// Typewriter hook
function useTypewriter(text: string, speed: number = 50, startDelay: number = 0) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    setDisplayedText('');
    setIsComplete(false);
    setHasStarted(false);

    if (!text) return;

    const startTimer = setTimeout(() => {
      setHasStarted(true);
      let index = 0;
      const typeTimer = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          setIsComplete(true);
          clearInterval(typeTimer);
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, speed, startDelay]);

  return { displayedText, isComplete, hasStarted };
}

// 배경 - 더 은은하게
function AmbientBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#0a0a0b]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <motion.div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(60,50,40,0.04) 0%, transparent 60%)',
        }}
        animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}

type Step = 'welcome' | 'greeting' | 'emotion' | 'reflection' | 'transition';

export default function ArtCounselorPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>('welcome');
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(null);
  const [recommendedArtwork, setRecommendedArtwork] = useState<CloudinaryArtwork | null>(null);

  const { artworks } = useCloudinaryArtworks({
    userType: user?.personalityType || 'DEFAULT',
    limit: 15,
    random: true,
    autoLoad: true,
  });

  // 초기 진입 시 로그인 상태에 따라 시작점 결정
  useEffect(() => {
    if (authLoading) return;

    // 로그인 안 됐으면 welcome, 됐으면 greeting부터
    if (!user) {
      setStep('welcome');
    } else {
      setStep('greeting');
    }
  }, [authLoading, user]);

  // 시간대별 인사
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.nickname || user?.full_name?.split(' ')[0];
    const greeting = hour < 12 ? '좋은 아침이에요' : hour < 18 ? '안녕하세요' : '편안한 저녁이에요';
    return name ? `${name}님, ${greeting}.` : `${greeting}.`;
  };

  const greetingText = getGreeting();
  const { displayedText: greeting, isComplete: greetingDone } = useTypewriter(
    step === 'greeting' ? greetingText : '',
    60
  );

  useEffect(() => {
    if (greetingDone && step === 'greeting') {
      const timer = setTimeout(() => setStep('emotion'), 1000);
      return () => clearTimeout(timer);
    }
  }, [greetingDone, step]);

  const findMatchingArtwork = useCallback((): CloudinaryArtwork | null => {
    if (!artworks.length) return null;
    return artworks[Math.floor(Math.random() * Math.min(artworks.length, 10))];
  }, [artworks]);

  const handleEmotionSelect = useCallback((emotion: Emotion) => {
    setSelectedEmotion(emotion);
    setRecommendedArtwork(findMatchingArtwork());
    setStep('reflection');
  }, [findMatchingArtwork]);

  const handleStartSession = useCallback(() => {
    if (!recommendedArtwork) return;

    if (!user) {
      router.push('/auth/sign-in?redirect=/art-counselor');
      return;
    }

    if (!user.personalityType) {
      router.push('/quiz?redirect=/art-counselor');
      return;
    }

    setStep('transition');
    setTimeout(() => {
      router.push(`/art-counselor/session/${recommendedArtwork.id}`);
    }, 800);
  }, [recommendedArtwork, router, user]);

  const handleLogin = () => router.push('/auth/sign-in?redirect=/art-counselor');
  const handleSignup = () => router.push('/auth/sign-up?redirect=/art-counselor');
  const handleContinueAsGuest = () => setStep('greeting');

  // Reflection step typewriter
  const { displayedText: aiResponse, isComplete: aiResponseDone } = useTypewriter(
    step === 'reflection' && selectedEmotion ? selectedEmotion.aiResponse : '',
    45,
    300
  );

  const { displayedText: artworkIntro, isComplete: artworkIntroDone } = useTypewriter(
    step === 'reflection' && selectedEmotion && aiResponseDone ? selectedEmotion.artworkIntro : '',
    40,
    500
  );

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10 h-full flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">

            {/* Welcome - 비로그인 상태 */}
            {step === 'welcome' && !authLoading && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/40 text-xs uppercase tracking-[0.3em] mb-8"
                >
                  Art Counselor
                </motion.p>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl md:text-3xl text-white/90 font-light leading-relaxed mb-4"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  예술 작품과 함께<br />
                  마음을 들여다보는 시간
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-white/50 text-sm font-light mb-12 leading-relaxed"
                >
                  AI 큐레이터가 당신의 감정에 맞는 작품을 추천하고,<br />
                  그 작품과 함께 짧은 대화를 나눕니다.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="space-y-3"
                >
                  <button
                    onClick={handleLogin}
                    className="w-full max-w-xs mx-auto block px-6 py-3 bg-white text-neutral-900 text-sm font-medium rounded-sm hover:bg-white/90 transition-colors"
                  >
                    로그인하고 시작하기
                  </button>
                  <button
                    onClick={handleSignup}
                    className="w-full max-w-xs mx-auto block px-6 py-3 border border-white/20 text-white/70 text-sm font-light rounded-sm hover:border-white/40 hover:text-white transition-colors"
                  >
                    회원가입
                  </button>
                  <button
                    onClick={handleContinueAsGuest}
                    className="block mx-auto text-sm text-white/30 hover:text-white/50 transition-colors mt-6"
                  >
                    먼저 둘러보기
                  </button>
                </motion.div>
              </motion.div>
            )}

            {/* Greeting */}
            {step === 'greeting' && (
              <motion.div
                key="greeting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <p
                  className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-light tracking-wide"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  {greeting}
                  {!greetingDone && (
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      className="inline-block w-[2px] h-[0.9em] bg-white/50 ml-1 align-middle"
                    />
                  )}
                </p>
              </motion.div>
            )}

            {/* Emotion Selection - 세로 레이아웃 */}
            {step === 'emotion' && (
              <motion.div
                key="emotion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xl md:text-2xl text-white/80 font-light text-center mb-12"
                  style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                >
                  지금, 어떤 마음인가요?
                </motion.p>

                <div className="space-y-2">
                  {EMOTIONS.map((emotion, index) => (
                    <motion.button
                      key={emotion.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      onClick={() => handleEmotionSelect(emotion)}
                      className={cn(
                        'w-full text-left px-5 py-4 rounded-sm',
                        'border border-white/10 bg-white/[0.02]',
                        'hover:bg-white/[0.06] hover:border-white/20',
                        'transition-all duration-300 group'
                      )}
                    >
                      <span className="block text-white/90 text-base font-light mb-1">
                        {emotion.label}
                      </span>
                      <span className="block text-white/40 text-sm font-light">
                        {emotion.context}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reflection - 작품 추천 */}
            {step === 'reflection' && selectedEmotion && (
              <motion.div
                key="reflection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* AI Response */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8"
                >
                  <p
                    className="text-lg md:text-xl text-white/80 font-light leading-relaxed"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                  >
                    {aiResponse}
                    {!aiResponseDone && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity }}
                        className="inline-block w-[2px] h-[0.8em] bg-white/50 ml-1 align-middle"
                      />
                    )}
                  </p>
                </motion.div>

                {/* Artwork Intro */}
                <AnimatePresence>
                  {aiResponseDone && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-center text-white/50 text-sm font-light mb-8"
                    >
                      {artworkIntro}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Artwork */}
                <AnimatePresence>
                  {artworkIntroDone && recommendedArtwork && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.8 }}
                    >
                      <div
                        className="relative w-full mb-6 cursor-pointer group"
                        onClick={handleStartSession}
                      >
                        {/* 작품 이미지 - 비율 유지, 잘리지 않게 */}
                        <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                          <Image
                            src={recommendedArtwork.imageUrl}
                            alt={recommendedArtwork.title}
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 512px"
                          />
                        </div>

                        {/* 작품 정보 */}
                        <div className="mt-4 text-center">
                          <h3 className="text-white/90 text-base font-light">
                            {recommendedArtwork.title}
                          </h3>
                          <p className="text-white/40 text-sm mt-1">
                            {recommendedArtwork.artist}
                            {recommendedArtwork.year && ` · ${recommendedArtwork.year}`}
                          </p>
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center space-y-4"
                      >
                        <button
                          onClick={handleStartSession}
                          className="px-8 py-3 bg-white/10 border border-white/20 text-white text-sm font-light rounded-sm hover:bg-white/20 transition-colors"
                        >
                          {user ? '이 작품과 대화 나누기' : '로그인하고 대화 시작하기'}
                        </button>

                        <button
                          onClick={() => {
                            setStep('emotion');
                            setSelectedEmotion(null);
                          }}
                          className="block mx-auto text-sm text-white/30 hover:text-white/50 transition-colors"
                        >
                          다른 감정으로 돌아가기
                        </button>
                      </motion.div>
                    </motion.div>
                  )}

                  {artworkIntroDone && !recommendedArtwork && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-white/40 text-sm"
                    >
                      작품을 불러오고 있어요...
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Transition */}
            {step === 'transition' && (
              <motion.div
                key="transition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-white/60 mx-auto mb-6"
                />
                <p className="text-white/40 text-sm font-light">
                  대화를 준비하고 있어요
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
