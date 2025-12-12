'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  narrativeQuestions, 
  getPersonalizedTransition,
  getPersonalizedTransition_ko,
  encouragingFeedback,
  encouragingFeedback_ko,
  type NarrativeQuestion
} from '@/data/narrative-quiz-questions-enhanced';
import { 
  getBackgroundForQuestion, 
  getPhaseByQuestion, 
  fallbackGradients,
  questionBackgrounds 
} from '@/data/quiz-backgrounds';
import { GlassCard, GlassButton, GlassIconButton } from '@/components/ui/glass';
import { EmotionalButton, EmotionalToast } from '@/components/emotional/EmotionalCard';
import { 
  ChevronRight, ChevronLeft, Home, Play, Pause, 
  SkipBack, SkipForward, Volume2, Map, Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/lib/responsive';
import { MobileQuiz } from './MobileQuiz';
import LanguageToggle from '@/components/ui/LanguageToggle';
import { useImagePreloader, useImageBatchPreloader } from '@/hooks/useImagePreloader';
import '@/styles/audio-guide.css';
import '@/styles/quiz-animations.css';

interface QuizResponse {
  questionId: number;
  choice: string;
  weight: Record<string, number>;
  emotional: string;
}

export const AudioGuideQuiz: React.FC = () => {
  const router = useRouter();
  const { language } = useLanguage();
  const { isMobile } = useResponsive();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [personalityScores, setPersonalityScores] = useState({
    L: 0, S: 0, A: 0, R: 0, E: 0, M: 0, F: 0, C: 0
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [showGalleryMap, setShowGalleryMap] = useState(false);
  const [showAPTTransition, setShowAPTTransition] = useState(false);
  const [componentVisibility, setComponentVisibility] = useState({
    setup: false,
    question: false,
    choices: false
  });

  const question = narrativeQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / narrativeQuestions.length) * 100;
  const audioGuideNumber = String(currentQuestion + 1).padStart(3, '0');

  // Gallery room based on question phase and number
  const getGalleryRoom = () => {
    if (currentQuestion >= 10 && currentQuestion <= 11) {
      return language === 'ko' ? '아트샵' : 'Museum Shop';
    } else if (currentQuestion >= 12 && currentQuestion <= 14) {
      return language === 'ko' ? '일상 속에서' : 'In Daily Life';
    } else {
      return {
        'curiosity': language === 'ko' ? '입구 홀' : 'Entrance Hall',
        'exploration': language === 'ko' ? '메인 갤러리' : 'Main Gallery',
        'revelation': language === 'ko' ? '성찰의 방' : 'Reflection Room'
      }[question.act] || (language === 'ko' ? '입구 홀' : 'Entrance Hall');
    }
  };
  const galleryRoom = getGalleryRoom();

  const handleGoBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      router.push('/quiz');
    }
  };

  const handleExitQuiz = () => {
    setShowExitConfirm(true);
  };

  const handleChoice = async (optionId: string) => {
    const selectedOption = question.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    // Save response
    const newResponse: QuizResponse = {
      questionId: question.id,
      choice: optionId,
      weight: selectedOption.weight,
      emotional: selectedOption.emotional
    };
    
    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    // Update personality scores
    const newScores = { ...personalityScores };
    Object.entries(selectedOption.weight).forEach(([key, value]) => {
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
    
    setTimeout(() => {
      if (currentQuestion < narrativeQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
      } else {
        completeQuiz(updatedResponses, newScores);
      }
    }, 800);
  };

  const completeQuiz = (allResponses: QuizResponse[], finalScores: typeof personalityScores) => {
    // Calculate personality type
    const type = [
      finalScores.L > finalScores.S ? 'L' : 'S',
      finalScores.A > finalScores.R ? 'A' : 'R',
      finalScores.M > finalScores.E ? 'M' : 'E',
      finalScores.F > finalScores.C ? 'F' : 'C'
    ].join('');

    // APT 축별 scores 계산 (각 축의 비율을 0-100으로 정규화)
    const aptAxisScores = {
      L: Math.round((finalScores.L / (finalScores.L + finalScores.S)) * 100) || 50,  // Lone
      S: Math.round((finalScores.S / (finalScores.S + finalScores.L)) * 100) || 50,  // Social
      A: Math.round((finalScores.A / (finalScores.A + finalScores.R)) * 100) || 50,  // Abstract
      R: Math.round((finalScores.R / (finalScores.R + finalScores.A)) * 100) || 50,  // Representational
      E: Math.round((finalScores.E / (finalScores.E + finalScores.M)) * 100) || 50,  // Emotional
      M: Math.round((finalScores.M / (finalScores.M + finalScores.E)) * 100) || 50,  // Meaning-driven
      F: Math.round((finalScores.F / (finalScores.F + finalScores.C)) * 100) || 50,  // Flow
      C: Math.round((finalScores.C / (finalScores.C + finalScores.F)) * 100) || 50   // Constructive
    };

    // Prepare results with both raw scores and APT axis scores
    const quizResults = {
      personalityType: type,
      scores: finalScores,
      aptScores: aptAxisScores,  // 추가: APT 축별 비율 점수
      responses: allResponses,
      completedAt: new Date().toISOString()
    };
    
    // Store results with backend sync
    import('@/lib/quiz-api').then(({ saveQuizResultsWithSync }) => {
      saveQuizResultsWithSync(quizResults);
    });

    // Show APT transition screen briefly
    setShowAPTTransition(true);
    
    // Navigate to results after showing transition
    setTimeout(() => {
      router.push(`/results?type=${type}`);
    }, 2500);
  };

  const getTransitionText = () => {
    if (currentQuestion === 0) {
      return language === 'ko' && question.narrative.setup_ko 
        ? question.narrative.setup_ko 
        : question.narrative.setup;
    }
    
    const previousResponse = responses[responses.length - 1];
    if (previousResponse) {
      return language === 'ko' 
        ? getPersonalizedTransition_ko(
            currentQuestion,
            currentQuestion + 1,
            previousResponse.choice
          )
        : getPersonalizedTransition(
            currentQuestion,
            currentQuestion + 1,
            previousResponse.choice
          );
    }
    
    return language === 'ko' && question.narrative.transition_ko 
      ? question.narrative.transition_ko 
      : question.narrative.transition || '';
  };
  
  const phase = getPhaseByQuestion(currentQuestion + 1);
  const backgroundData = getBackgroundForQuestion(currentQuestion + 1);

  // Preload current and next background images - Use direct mapping
  const currentBackgroundUrl = useMemo(() => {
    const questionNumber = currentQuestion + 1;
    return questionBackgrounds[questionNumber] || null;
  }, [currentQuestion]);

  const { isLoaded: bgLoaded, currentSrc: bgSrc } = useImagePreloader(currentBackgroundUrl, {
    priority: true,
    blur: true
  });

  // Preload next 3 background images - Use direct mapping
  const nextBackgroundUrls = useMemo(() => {
    const urls: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const nextQuestionNumber = currentQuestion + 1 + i;
      if (nextQuestionNumber <= narrativeQuestions.length) {
        const bgUrl = questionBackgrounds[nextQuestionNumber];
        if (bgUrl) urls.push(bgUrl);
      }
    }
    return urls;
  }, [currentQuestion]);

  const { loadedImages: preloadedImages } = useImageBatchPreloader(nextBackgroundUrls);

  // Staggered component appearance
  useEffect(() => {
    // Reset visibility
    setComponentVisibility({ setup: false, question: false, choices: false });
    
    // Stagger animations with more noticeable delays
    const timers: NodeJS.Timeout[] = [];
    
    timers.push(setTimeout(() => {
      setComponentVisibility(prev => ({ ...prev, setup: true }));
    }, 200)); // (a) 상황 설명 - 0.2초 후
    
    timers.push(setTimeout(() => {
      setComponentVisibility(prev => ({ ...prev, question: true }));
    }, 700)); // (b) 질문 - 0.7초 후 (0.5초 간격)
    
    timers.push(setTimeout(() => {
      setComponentVisibility(prev => ({ ...prev, choices: true }));
    }, 1200)); // (c) 선택지 - 1.2초 후 (0.5초 간격)
    
    return () => timers.forEach(clearTimeout);
  }, [currentQuestion]);
  
  return (
    <div className="audio-guide-quiz-container">
      {/* Hidden Preload Images - Force browser to cache backgrounds */}
      <div style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {/* Preload first 5 backgrounds immediately */}
        {[1, 2, 3, 4, 5].map(questionNum => {
          const bgUrl = questionBackgrounds[questionNum];
          return bgUrl ? (
            <img
              key={`preload-${questionNum}`}
              src={bgUrl}
              alt=""
              loading="eager"
              fetchPriority={questionNum === 1 ? "high" : "auto"}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
            />
          ) : null;
        })}
      </div>

      {/* Minimal Top Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Progress */}
          <div className="flex-1 max-w-md">
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden mb-1.5">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "easeOut", duration: 0.8 }}
              />
            </div>
            <p className="text-xs text-white/90 font-medium">
              {currentQuestion + 1} / {narrativeQuestions.length} · {galleryRoom}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleGoBack}
              disabled={currentQuestion === 0}
              className="p-2 text-white/80 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={language === 'ko' ? '이전' : 'Back'}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleExitQuiz}
              className="p-2 text-white/80 hover:text-white transition-colors"
              title={language === 'ko' ? '나가기' : 'Exit'}
            >
              <Home className="w-5 h-5" />
            </button>

            <div className="ml-2">
              <LanguageToggle variant="glass" size="sm" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Gallery Room Experience */}
      <div className="gallery-room-experience relative min-h-screen overflow-hidden">
        {/* Background with smooth loading */}
        <div className="absolute inset-0">
          {/* Static placeholder while loading - Museum entrance theme */}
          {!bgLoaded && (
            <div
              className="absolute inset-0"
              style={{
                background: currentQuestion === 0
                  ? 'linear-gradient(135deg, #e8dfd0 0%, #c9b8a0 50%, #a89578 100%)'
                  : backgroundData.overlay.gradient ||
                    'linear-gradient(135deg, #4a5568 0%, #2d3748 50%, #1a202c 100%)'
              }}
            />
          )}

          {/* Actual background image with fade-in */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: bgLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              backgroundImage: bgSrc ? `url(${bgSrc})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
        </div>
        {/* Strong Vignette Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, transparent 10%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%)`
          }}
        />

        {/* Bottom Gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none" />

        {/* Main Content - Frameless Floating Cards */}
        <div className="gallery-content">
          <AnimatePresence mode="wait">
            {!isTransitioning && (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto space-y-6"
              >
                {/* Narrative Setup - Light Floating Card */}
                {(question.narrative.setup || question.narrative.transition) && (
                  <motion.div
                    className="bg-amber-50/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-md"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{
                      opacity: componentVisibility.setup ? 1 : 0,
                      y: componentVisibility.setup ? 0 : -10
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    <p className="text-sm sm:text-base leading-relaxed text-gray-900 text-center font-medium" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                      {getTransitionText()}
                    </p>
                  </motion.div>
                )}

                {/* Question - Emphasized Floating Card */}
                <motion.div
                  className="bg-white/80 backdrop-blur-md rounded-2xl px-6 py-8 shadow-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{
                    opacity: componentVisibility.question ? 1 : 0,
                    y: componentVisibility.question ? 0 : 10
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: 0.1
                  }}
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-center leading-relaxed text-gray-900" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                    {(language === 'ko' && question.question_ko ? question.question_ko : question.question)
                      .split('\n')
                      .map((line, index) => (
                        <React.Fragment key={index}>
                          {line}
                          {index < (language === 'ko' && question.question_ko ? question.question_ko : question.question).split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                  </h2>
                </motion.div>

                {/* Choice Buttons - Floating Cards */}
                <motion.div
                  className="grid md:grid-cols-2 gap-4"
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
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleChoice(option.id)}
                      className="w-full p-5 bg-white/75 backdrop-blur-md hover:bg-white/90 hover:shadow-2xl text-left rounded-xl border border-white/60 hover:border-gray-300 transition-all group"
                    >
                      <div className="flex flex-col gap-3">
                        {/* Option Label */}
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 text-white font-bold text-base">
                            {index === 0 ? 'A' : 'B'}
                          </span>
                          <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                        </div>

                        {/* Text Content */}
                        <div>
                          <h4 className="text-base sm:text-lg font-medium mb-2 text-gray-900 leading-relaxed" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                            {language === 'ko' && option.text_ko ? option.text_ko : option.text}
                          </h4>

                          {option.subtext && (
                            <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                              {language === 'ko' && option.subtext_ko ? option.subtext_ko : option.subtext}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Atmosphere indicator */}
                {question.narrative.atmosphere && (
                  <motion.div
                    className="atmosphere-indicator"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
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
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Gallery Map Modal */}
      <AnimatePresence>
        {showGalleryMap && (
          <motion.div
            className="gallery-map-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowGalleryMap(false)}
          >
            <motion.div
              className="map-content"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>{language === 'ko' ? '갤러리 여정 지도' : 'Gallery Journey Map'}</h3>
              <div className="map-rooms">
                <div className={`map-room ${currentQuestion >= 0 && currentQuestion <= 4 ? 'active' : ''}`}>
                  <span className="room-number">1-5</span>
                  <span className="room-name">{language === 'ko' ? '입구 홀' : 'Entrance Hall'}</span>
                </div>
                <div className={`map-room ${currentQuestion >= 5 && currentQuestion <= 9 ? 'active' : ''}`}>
                  <span className="room-number">6-10</span>
                  <span className="room-name">{language === 'ko' ? '메인 갤러리' : 'Main Gallery'}</span>
                </div>
                <div className={`map-room ${currentQuestion >= 10 && currentQuestion <= 11 ? 'active' : ''}`}>
                  <span className="room-number">11-12</span>
                  <span className="room-name">{language === 'ko' ? '아트샵' : 'Museum Shop'}</span>
                </div>
                <div className={`map-room ${currentQuestion >= 12 && currentQuestion <= 14 ? 'active' : ''}`}>
                  <span className="room-number">13-15</span>
                  <span className="room-name">{language === 'ko' ? '일상 속에서' : 'In Daily Life'}</span>
                </div>
              </div>
              <p className="current-location">You are here: Stop {currentQuestion + 1}</p>
              <button 
                className="close-map"
                onClick={() => setShowGalleryMap(false)}
              >
                Close Map
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Encouragement Toast */}
      <EmotionalToast
        message={encouragementMessage}
        emoji="✨"
        isVisible={showEncouragement}
      />
      
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExitConfirm(false)}
          >
            <GlassCard
              className="max-w-md w-full"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4">
                  <Home className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {language === 'ko' ? '갤러리 투어를 종료하시겠습니까?' : 'End Gallery Tour?'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {language === 'ko' ? '진행 상황이 사라집니다. 정말 나가시겠습니까?' : 'Your progress will be lost. Are you sure you want to exit?'}
                </p>
                <div className="flex gap-3">
                  <GlassButton
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push('/')}
                  >
                    {language === 'ko' ? '나가기' : 'Exit tour'}
                  </GlassButton>
                  <GlassButton
                    variant="primary"
                    className="flex-1"
                    onClick={() => setShowExitConfirm(false)}
                  >
                    {language === 'ko' ? '계속하기' : 'Continue'}
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
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
                className="mb-12"
              >
                <p className="text-2xl md:text-3xl font-semibold text-white mb-2">
                  {language === 'ko' 
                    ? '당신의 Art Persona Type을 분석중...' 
                    : 'Analyzing your Art Persona Type...'}
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
                className="max-w-2xl mx-auto"
              >
                <div className="grid grid-cols-4 gap-3 md:gap-4">
                  {['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC', 
                    'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'].map((type, index) => (
                    <motion.div
                      key={type}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      className="bg-white/5 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-white/10"
                    >
                      <span className="text-base md:text-lg font-mono font-bold text-white">
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