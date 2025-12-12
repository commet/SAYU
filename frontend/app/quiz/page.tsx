'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Clock, Stars, ShieldCheck } from 'lucide-react';
import LanguageToggle from '@/components/ui/LanguageToggle';
import '@/styles/emotional-palette.css';

export default function QuizIntroPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const startQuiz = () => {
    router.push('/quiz/narrative');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Language Toggle */}
      <div className="absolute top-1 right-1 z-50 scale-75">
        <LanguageToggle variant="glass" size="sm" />
      </div>

      {/* Gallery Background */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/backgrounds/traditional-gallery-skylight-paintings-mint.jpg")',
            opacity: 0.8
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/40" />
      </div>

      <motion.div
        initial={{ opacity: 0.9, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 max-w-5xl mx-auto px-4 py-16 md:py-24"
      >
        <div className="bg-white/85 backdrop-blur-md rounded-3xl shadow-lg border border-white/60 p-6 md:p-10 space-y-8">
          <div className="text-center space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-600">
              {language === 'ko' ? '3-5분 시나리오 테스트' : '3–5 min scenario test'}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 leading-tight">
              {language === 'ko'
                ? '짧은 여정으로 당신의 미술 취향을 발견하세요'
                : 'Find your art taste with a short story journey'}
            </h1>
            <p className="text-base md:text-lg text-neutral-700 max-w-3xl mx-auto leading-relaxed">
              {language === 'ko'
                ? '전시장에 들어서고 작품 앞에 설 때 느끼는 감정을 따라가면, 당신만의 감상 패턴과 APT 유형이 드러납니다.'
                : 'Follow how you feel from the entrance to each artwork—your viewing patterns and APT type will surface in minutes.'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: <Clock className="w-5 h-5" />,
                title: language === 'ko' ? '3-5분' : '3–5 min',
                desc: language === 'ko' ? '짧게 끝나는 시나리오' : 'Short, focused flow'
              },
              {
                icon: <Stars className="w-5 h-5" />,
                title: language === 'ko' ? '몰입형 질문' : 'Immersive prompts',
                desc: language === 'ko' ? '전시 동선 따라 진행' : 'Follows a gallery path'
              },
              {
                icon: <Sparkles className="w-5 h-5" />,
                title: language === 'ko' ? 'Art Persona Type 결과' : 'Art Persona Type result',
                desc: language === 'ko' ? '취향 유형 바로 확인' : 'See your type instantly'
              },
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: language === 'ko' ? '맞춤 추천' : 'Personalized picks',
                desc: language === 'ko' ? '작품·전시 제안 제공' : 'Art & show suggestions'
              }
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-neutral-200 bg-white/80 p-4 flex flex-col gap-1 text-neutral-800"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                  {item.icon}
                </div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-neutral-600 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <button
              onClick={startQuiz}
              className="mx-auto flex items-center justify-center gap-2 px-10 md:px-14 py-4 md:py-5 text-lg font-semibold bg-neutral-900 text-white rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <Sparkles className="w-6 h-6" />
              {language === 'ko' ? '지금 시작하기' : 'Start now'}
            </button>
            <p className="text-sm text-neutral-600">
              {language === 'ko' ? '로그인 없이 바로 시작할 수 있어요.' : 'Start instantly — no login required.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
