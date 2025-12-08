'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { FormattedEssence } from '@/components/ui/FormattedEssence';

interface PersonalityStorySliderProps {
  personality: any;
  sayuType: any;
  language: 'ko' | 'en';
}

export function PersonalityStorySlider({ personality, sayuType, language }: PersonalityStorySliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Prepare all slides
  const allSlides: Array<{
    type: 'intro' | 'strength' | 'challenge' | 'growth';
    icon: string;
    title: string;
    description: string;
    category: string;
  }> = [];

  // Add intro slide with essence
  allSlides.push({
    type: 'intro',
    icon: '🎨',
    title: language === 'ko' ? '갤러리에서의 당신' : 'You at the Gallery',
    description: language === 'ko' && personality.essence_ko ? personality.essence_ko : personality.essence,
    category: language === 'ko' ? '소개' : 'Intro'
  });

  // Add strengths
  if (personality.strengths) {
    personality.strengths.forEach((strength: any) => {
      allSlides.push({
        type: 'strength',
        icon: strength.icon,
        title: language === 'ko' && strength.title_ko ? strength.title_ko : strength.title,
        description: language === 'ko' && strength.description_ko ? strength.description_ko : strength.description,
        category: language === 'ko' ? '강점' : 'Strength'
      });
    });
  }

  // Add challenges
  if (sayuType) {
    const challenges = language === 'ko' ? sayuType.challenges : sayuType.challengesEn;
    challenges.forEach((challenge: string) => {
      allSlides.push({
        type: 'challenge',
        icon: '💡',
        title: challenge.split(':')[0] || challenge.substring(0, 50),
        description: challenge,
        category: language === 'ko' ? '도전과제' : 'Challenge'
      });
    });
  }

  // Add growth
  if (personality.growth) {
    personality.growth.forEach((growthItem: any) => {
      allSlides.push({
        type: 'growth',
        icon: growthItem.icon,
        title: language === 'ko' && growthItem.title_ko ? growthItem.title_ko : growthItem.title,
        description: language === 'ko' && growthItem.description_ko ? growthItem.description_ko : growthItem.description,
        category: language === 'ko' ? '성장' : 'Growth'
      });
    });
  }

  const totalSlides = allSlides.length;
  const currentSlideData = allSlides[currentSlide];

  if (!currentSlideData) return null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Progress bar */}
      <div className="flex gap-1 p-4 pb-0">
        {allSlides.map((_, index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-all ${
              index === currentSlide ? 'bg-black' : 'bg-neutral-200'
            }`}
          />
        ))}
      </div>

      {/* Current slide */}
      <div className="p-6 sm:p-12 min-h-[400px] flex flex-col justify-center">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          {/* Category badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-full mb-6">
            <span className="text-xs font-medium text-neutral-600">
              {currentSlideData.category} {currentSlide + 1}/{totalSlides}
            </span>
          </div>

          {/* Icon */}
          <div className="text-7xl mb-6">{currentSlideData.icon}</div>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold text-black mb-4">
            {currentSlideData.title}
          </h3>

          {/* Description */}
          {currentSlideData.type === 'intro' ? (
            <div className="max-w-2xl mx-auto text-left">
              <FormattedEssence
                text={currentSlideData.description}
                className="text-sm sm:text-base leading-relaxed text-black"
              />
            </div>
          ) : (
            <p className="text-base sm:text-lg text-black leading-relaxed max-w-2xl mx-auto">
              {currentSlideData.description}
            </p>
          )}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-t border-neutral-200">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentSlide === 0
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-black hover:bg-neutral-50'
          }`}
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span className="text-sm font-medium">
            {language === 'ko' ? '이전' : 'Previous'}
          </span>
        </button>

        <button
          onClick={() => setCurrentSlide(Math.min(totalSlides - 1, currentSlide + 1))}
          disabled={currentSlide === totalSlides - 1}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            currentSlide === totalSlides - 1
              ? 'text-neutral-400 cursor-not-allowed'
              : 'text-black hover:bg-neutral-50'
          }`}
        >
          <span className="text-sm font-medium">
            {language === 'ko' ? '다음' : 'Next'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile swipe hint */}
      <div className="sm:hidden p-2 text-center">
        <p className="text-xs text-neutral-500">
          {language === 'ko' ? '← 버튼을 눌러 넘기기 →' : '← Tap buttons to navigate →'}
        </p>
      </div>
    </div>
  );
}
