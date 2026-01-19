'use client';

import React, { useState, useCallback, Fragment, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSwipeable } from 'react-swipeable';
import { 
  narrativeQuestions, 
  getPersonalizedTransition,
  getPersonalizedTransition_ko,
  encouragingFeedback,
  encouragingFeedback_ko,
  type NarrativeQuestion
} from '@/data/narrative-quiz-questions-enhanced';
import { getBackgroundForQuestion, questionBackgrounds } from '@/data/quiz-backgrounds';
import { ChevronLeft, ChevronRight, Home, Volume2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useImagePreloader, useImageBatchPreloader } from '@/hooks/useImagePreloader';
import '@/styles/audio-guide.css';
import '@/styles/quiz-animations.css';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const MobileQuiz: React.FC = () => {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showAPTTransition, setShowAPTTransition] = useState(false);
  const [componentVisibility, setComponentVisibility] = useState({
    setup: false,
    question: false,
    choices: false
  });

  const question = narrativeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / narrativeQuestions.length) * 100;

  // Preload ALL quiz backgrounds immediately on mount
  useEffect(() => {
    // Collect all background URLs
    const allBackgroundUrls: string[] = [];
    Object.values(questionBackgrounds).forEach(bgData => {
      if (Array.isArray(bgData.backgrounds)) {
        allBackgroundUrls.push(...bgData.backgrounds);
      }
    });
    
    // Preload all images immediately with high priority
    allBackgroundUrls.forEach((url, index) => {
      const img = new Image();
      // First 5 images get highest priority
      img.fetchPriority = index < 5 ? 'high' : 'low';
      img.decoding = 'async';
      img.src = url;
    });
  }, []); // Only run once on mount

  // Preload next 3 questions' backgrounds
  const nextBackgroundUrls = useMemo(() => {
    const urls: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const nextIndex = currentQuestion + i;
      if (nextIndex < narrativeQuestions.length) {
        const bg = getBackgroundForQuestion(nextIndex + 1);
        if (bg) urls.push(bg);
      }
    }
    return urls;
  }, [currentQuestion]);

  // Use the batch preloader for next backgrounds
  const { loadedImages: preloadedImages } = useImageBatchPreloader(nextBackgroundUrls);

  // 컴포넌트 단계적 등장
  useEffect(() => {
    setComponentVisibility({ setup: false, question: false, choices: false });
    
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => {
      setComponentVisibility(prev => ({ ...prev, setup: true }));
    }, 150)); // (a) 상황 설명 - 0.15초 후
    
    timers.push(setTimeout(() => {
      setComponentVisibility(prev => ({ ...prev, question: true }));
    }, 500)); // (b) 질문 - 0.5초 후 (0.35초 간격)
    
    timers.push(setTimeout(() => {
      setComponentVisibility(prev => ({ ...prev, choices: true }));
    }, 850)); // (c) 선택지 - 0.85초 후 (0.35초 간격)
    
    return () => timers.forEach(clearTimeout);
  }, [currentQuestion]);

  // 햅틱 피드백
  const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      };
      navigator.vibrate(patterns[intensity]);
    }
  }, []);

  // 스와이프 핸들러 - 이전/다음 질문
  const handlers = useSwipeable({
    onSwipedRight: () => {
      if (currentQuestion > 0 && !isTransitioning) {
        handleGoBack();
      }
    },
    onSwipedLeft: () => {
      // 다음 질문으로 스와이프는 답변 선택 후에만 가능
      if (selectedOption && !isTransitioning) {
        handleChoice(selectedOption);
      }
    },
    trackMouse: false,
    trackTouch: true,
    swipeDuration: 500,
    preventScrollOnSwipe: true,
  });

  const handleGoBack = () => {
    triggerHaptic('light');
    if (currentQuestion > 0) {
      // 현재 질문 이후의 모든 응답 제거 및 점수 재계산
      const filteredResponses = responses.filter(r => r.questionId < currentQuestion + 1);
      setResponses(filteredResponses);
      
      // 점수 재계산
      const recalculatedScores = { L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0 };
      filteredResponses.forEach(response => {
        Object.entries(response.weight).forEach(([key, value]) => {
          if (key in recalculatedScores) {
            recalculatedScores[key as keyof typeof recalculatedScores] += value;
          }
        });
      });
      setPersonalityScores(recalculatedScores);
      
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
    } else {
      router.push('/quiz');
    }
  };

  const handleChoice = async (optionId: string) => {
    const option = question.options.find(opt => opt.id === optionId);
    if (!option) return;

    triggerHaptic('medium');

    // Save response
    const newResponse: QuizResponse = {
      questionId: question.id,
      choice: optionId,
      weight: option.weight,
      emotional: option.emotional
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Update personality scores
    const newScores = { ...personalityScores };
    Object.entries(option.weight).forEach(([key, value]) => {
      newScores[key as keyof typeof newScores] += value;
    });
    setPersonalityScores(newScores);

    // Show encouraging feedback
    if (currentQuestion % 3 === 2) {
      const feedbackArray = language === 'ko' ? encouragingFeedback_ko : encouragingFeedback;
      const message = feedbackArray[Math.floor(Math.random() * feedbackArray.length)];
      setEncouragementMessage(message);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 3000);
    }

    // Transition to next question or complete
    setIsTransitioning(true);
    setSelectedOption(null);
    
    setTimeout(() => {
      if (currentQuestion < narrativeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        completeQuiz(updatedResponses, newScores);
      }
    }, 600);
  };

  const completeQuiz = (allResponses: QuizResponse[], finalScores: typeof personalityScores) => {
    // Calculate personality type
    const type = [
      finalScores.L > finalScores.S ? 'L' : 'S',
      finalScores.A > finalScores.R ? 'A' : 'R',
      finalScores.M > finalScores.E ? 'M' : 'E',
      finalScores.F > finalScores.C ? 'F' : 'C'
    ].join('');

    // Prepare results
    const quizResults = {
      personalityType: type,
      scores: finalScores,
      responses: allResponses,
      completedAt: new Date().toISOString()
    };
    
    // Store results
    import('@/lib/quiz-api').then(({ saveQuizResultsWithSync }) => {
      saveQuizResultsWithSync(quizResults);
    });

    triggerHaptic('heavy');
    
    // Show APT transition screen briefly
    setShowAPTTransition(true);
    console.log('APT Transition started, type:', type);
    
    // Navigate to results after showing transition
    setTimeout(() => {
      console.log('Navigating to results page with type:', type);
      router.push(`/results?type=${type}`);
    }, 2500);
  };

  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);
  // Use direct question-to-background mapping for exact 1:1 matching
  const currentBackground = questionBackgrounds[currentQuestion + 1] || '';

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        backgroundImage: currentBackground ? `url(${currentBackground})` : undefined,
        backgroundColor: currentBackground ? undefined : '#1a1a2e',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
      {...handlers}
    >
      {/* Hidden Preload Images - Force browser to cache all backgrounds */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Object.values(questionBackgrounds).map((url, idx) => (
          <img 
            key={`preload-${idx}`}
            src={url} 
            alt=""
            loading="eager"
            fetchPriority={idx < 3 ? "high" : "auto"}
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
          />
        ))}
      </div>

      {/* 배경 오버레이 - 데스크톱과 동일 */}
      {currentBackground && (
        <div 
          className="absolute inset-0 bg-gradient-to-br"
          style={{ 
            background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.6) 100%)`,
            pointerEvents: 'none'
          }}
        />
      )}
      
      {/* 상단 헤더 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-lg active:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="flex-1 mx-4">
            <div className="text-center text-white/90 text-base font-medium mb-1">
              {currentQuestion + 1}/{narrativeQuestions.length} {currentQuestion >= 10 && currentQuestion <= 11
                ? (language === 'ko' ? '아트샵' : 'Shop')
                : currentQuestion >= 12 && currentQuestion <= 14
                ? (language === 'ko' ? '일상' : 'Daily')
                : currentQuestion >= 6 && currentQuestion <= 9
                ? (language === 'ko' ? '갤러리' : 'Gallery')
                : currentQuestion >= 3 && currentQuestion <= 5
                ? (language === 'ko' ? '탐색' : 'Explore')
                : (language === 'ko' ? '입구홀' : 'Entrance')}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
              className="p-2 rounded-lg active:bg-white/10 transition-colors"
            >
              <span className="text-white text-xs font-medium">
                {language === 'ko' ? 'EN' : '한글'}
              </span>
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="p-2 -mr-2 rounded-lg active:bg-white/10 transition-colors"
            >
              <Home className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 질문 콘텐츠 - Floating Card Style (웹과 동일한 디자인) */}
      <div className="pt-20 pb-8 px-4 min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-md space-y-5"
          >
            {/* Setup + Question Combined Card (웹 버전과 동일) */}
            <motion.div
              className="bg-white/95 backdrop-blur-md rounded-2xl px-5 py-6 shadow-xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: componentVisibility.setup && componentVisibility.question ? 1 : 0,
                y: componentVisibility.setup && componentVisibility.question ? 0 : 10
              }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              {/* Narrative Setup - Left Gold Accent */}
              {question.narrative && (question.narrative.setup || question.narrative.transition || question.narrative.setup_ko || question.narrative.transition_ko) && (
                <motion.div
                  className="border-l-3 pl-4 mb-6"
                  style={{ borderLeftWidth: '3px', borderLeftColor: '#D4A520' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{
                    opacity: componentVisibility.setup ? 1 : 0,
                    x: componentVisibility.setup ? 0 : -10
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1
                  }}
                >
                  <p className="text-sm leading-relaxed text-gray-600 font-normal" style={{ fontFamily: 'var(--font-noto-serif-kr), var(--font-cormorant), serif', fontWeight: 400 }}>
                    {(language === 'ko'
                      ? (question.narrative.setup_ko || question.narrative.transition_ko)
                      : (question.narrative.setup || question.narrative.transition))
                      ?.split('\n')
                      .map((line, index, array) => (
                        <Fragment key={index}>
                          {line}
                          {index < array.length - 1 && <br />}
                        </Fragment>
                      ))}
                  </p>
                </motion.div>
              )}

              {/* Question - Emphasized */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: componentVisibility.question ? 1 : 0
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2
                }}
              >
                <h2 className="text-xl sm:text-2xl font-normal text-center leading-relaxed text-gray-900" style={{ fontFamily: 'var(--font-noto-serif-kr), var(--font-cormorant), serif', fontWeight: 400 }}>
                  {(language === 'ko' && question.question_ko ? question.question_ko : question.question)
                    .split('\n')
                    .map((line, index) => (
                      <Fragment key={index}>
                        {line}
                        {index < (language === 'ko' && question.question_ko ? question.question_ko : question.question).split('\n').length - 1 && <br />}
                      </Fragment>
                    ))}
                </h2>
              </motion.div>
            </motion.div>

            {/* Choice Buttons - Floating Cards */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{
                opacity: componentVisibility.choices ? 1 : 0
              }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
                delay: 0.2
              }}
            >
              {question.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                    opacity: componentVisibility.choices ? 1 : 0,
                    y: componentVisibility.choices ? 0 : 20
                  }}
                  transition={{
                    delay: componentVisibility.choices ? 0.2 + index * 0.1 : 0,
                    duration: 0.4,
                    ease: "easeOut"
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!isTransitioning) {
                      setSelectedOption(option.id);
                      setTimeout(() => handleChoice(option.id), 200);
                    }
                  }}
                  disabled={isTransitioning}
                  className={cn(
                    "w-full p-4 bg-white/75 backdrop-blur-md hover:bg-white/90 active:bg-white/95 text-left rounded-xl border border-white/60 transition-all group disabled:opacity-50",
                    selectedOption === option.id && "bg-white/90 shadow-xl"
                  )}
                >
                  <div className="flex flex-col gap-3">
                    {/* Option Label */}
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold text-base">
                        {index === 0 ? 'A' : 'B'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-gray-900 transition-all flex-shrink-0" />
                    </div>

                    {/* Text Content */}
                    <div>
                      <h4 className="text-base font-medium mb-1 text-gray-900 leading-relaxed" style={{ fontFamily: 'var(--font-noto-serif-kr), var(--font-cormorant), serif', fontWeight: 400 }}>
                        {language === 'ko' && option.text_ko ? option.text_ko : option.text}
                      </h4>

                      {option.subtext && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {language === 'ko' && option.subtext_ko ? option.subtext_ko : option.subtext}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            {/* Swipe Hint */}
            <motion.p 
              className="text-white/70 text-xs text-center mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              transition={{ delay: 0.8 }}
            >
              {language === 'ko' 
                ? '← 스와이프하여 이전 질문으로'
                : '← Swipe to go back'}
            </motion.p>

            {/* Atmosphere indicator */}
            {question.narrative.atmosphere && (
              <motion.div
                className="text-center mt-4 text-xs text-white/60 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                <p>
                  {language === 'ko' ? '갤러리 분위기: ' : 'Gallery atmosphere: '}
                  {language === 'ko' ? 
                    {
                      'anticipation': '기대감',
                      'wonder': '경이로움',
                      'threshold': '문턱',
                      'immersion': '몰입',
                      'discovery': '발견',
                      'connection': '연결',
                      'depth': '깊이',
                      'transformation': '변화',
                      'reflection': '성찰',
                      'curiosity': '호기심',
                      'decision': '결정',
                      'memory': '기억',
                      'integration': '통합'
                    }[question.narrative.atmosphere] || question.narrative.atmosphere
                    : question.narrative.atmosphere
                  }
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 격려 메시지 */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-6 right-6 bg-black/60 backdrop-blur-md text-white/90 rounded-xl p-3 shadow-lg border border-white/10"
          >
            <p className="text-center text-sm font-light">{encouragementMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APT Transition Screen */}
      <AnimatePresence>
        {showAPTTransition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
          >
            {/* Museum Cafe Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url("/images/backgrounds/museum-cafe-empty-shadows-monochrome.jpg")',
              }}
            >
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-center px-4 relative z-10"
            >
              {/* Analyzing message at top */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <p className="text-xl md:text-2xl font-semibold text-white mb-2 whitespace-pre-line">
                  {language === 'ko' 
                    ? '당신의 Art Persona Type을\n분석중...' 
                    : 'Analyzing your\nArt Persona Type...'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </motion.div>

              {/* 16 Types Grid */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="max-w-xs mx-auto"
              >
                <div className="grid grid-cols-4 gap-2">
                  {['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 
                    'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'].map((type, index) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10"
                    >
                      <span className="text-xs font-mono font-bold text-white">
                        {type}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};