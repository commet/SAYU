"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  Sparkles, 
  ChevronDown, 
  Share2, 
  Download, 
  Palette,
  Heart,
  Eye,
  Zap,
  ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button-enhanced'

interface APTResultRevealProps {
  aptCode: string // e.g., "LAEF"
  animalName: string // e.g., "여우"
  animalEmoji: string // e.g., "🦊"
  description: string
  artStyle: string
  traits?: string[] // 특성들
  strengths?: string[] // 강점들
  color: string // 대표 색상
  onComplete?: () => void
  onShare?: () => void
  imageUrl?: string // 동물 캐릭터 이미지
}

export default function APTResultReveal({
  aptCode,
  animalName,
  animalEmoji,
  description,
  artStyle,
  traits = [],
  strengths = [],
  color,
  onComplete,
  onShare,
  imageUrl
}: APTResultRevealProps) {
  const { language } = useLanguage()
  const [stage, setStage] = useState<'intro' | 'reveal' | 'complete'>('intro')
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // 자동 진행 타이머
    const timer1 = setTimeout(() => setStage('reveal'), 2000)
    const timer2 = setTimeout(() => setStage('complete'), 4500)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  // 그라데이션 배경색 생성
  const gradientStyle = {
    background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`
  }

  const cardGradient = {
    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <AnimatePresence mode="wait">
        {/* Stage 1: 도입부 */}
        {stage === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
              className="mb-8"
            >
              <Sparkles className="w-20 h-20 text-[#6B5B95] mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {language === 'ko' ? '당신의 Art Persona Type을 분석중...' : 'Analyzing your Art Persona Type...'}
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              {language === 'ko' 
                ? 'APT는 당신의 예술 감상 스타일을 16가지 동물로 표현합니다' 
                : 'APT expresses your art appreciation style with 16 animals'}
            </p>
            {/* 로딩 바 */}
            <motion.div 
              className="w-64 h-2 bg-gray-200 rounded-full mx-auto mt-8 overflow-hidden"
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Stage 2: 카드 뒤집기 */}
        {stage === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-md w-full"
          >
            <motion.div
              className="relative w-full h-[500px] preserve-3d"
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
            >
              {/* 카드 앞면 */}
              <div className="absolute inset-0 backface-hidden">
                <motion.div 
                  className="h-full rounded-3xl shadow-2xl overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {/* 상단 그라데이션 영역 */}
                  <div 
                    className="h-2/3 relative overflow-hidden"
                    style={cardGradient}
                  >
                    {/* 반짝이는 효과 */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ 
                        background: [
                          `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                          `radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
                          `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                    
                    {/* 동물 이모지 또는 이미지 */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 1, 
                        type: "spring", 
                        stiffness: 200,
                        damping: 15
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={animalName}
                          className="w-48 h-48 object-contain drop-shadow-2xl"
                        />
                      ) : (
                        <span className="text-[140px] filter drop-shadow-2xl">
                          {animalEmoji}
                        </span>
                      )}
                    </motion.div>

                    {/* APT 코드 배지 */}
                    <motion.div
                      initial={{ y: -50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="absolute top-6 left-6 bg-white/20 backdrop-blur-md rounded-2xl px-4 py-2"
                    >
                      <p className="text-white font-bold text-xl">{aptCode}</p>
                    </motion.div>
                  </div>
                  
                  {/* 하단 정보 영역 */}
                  <div className="h-1/3 bg-white p-6 flex flex-col justify-center">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.3 }}
                    >
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {aptCode} - {animalName}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'ko' ? '당신의 Art Persona Type' : 'Your Art Persona Type'}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
              
              {/* 카드 뒷면 */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <div className="h-full bg-gradient-to-br from-[#6B5B95] to-[#8B7BAB] rounded-3xl shadow-2xl flex items-center justify-center">
                  <div className="text-white text-center p-8">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-16 h-16 mx-auto mb-4" />
                    </motion.div>
                    <p className="text-2xl font-bold mb-2">SAYU</p>
                    <p className="text-lg opacity-90">Art Persona Type</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: 상세 정보 */}
        {stage === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl w-full"
          >
            {/* 메인 결과 카드 */}
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* 헤더 - 시각적 임팩트 강화 */}
              <div className="relative h-64 overflow-hidden" style={cardGradient}>
                {/* 패턴 배경 */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                  }}
                />
                
                <div className="relative z-10 h-full flex items-center justify-between px-8">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-5xl font-bold text-white mb-2">{aptCode}</h2>
                    <p className="text-2xl text-white/90">
                      {animalEmoji} {animalName}
                    </p>
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-8xl filter drop-shadow-xl"
                  >
                    {animalEmoji}
                  </motion.div>
                </div>

                {/* 하단 웨이브 */}
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 1440 60" className="w-full h-12">
                    <path fill="white" d="M0,20 C480,60 960,60 1440,20 L1440,60 L0,60 Z" />
                  </svg>
                </div>
              </div>
              
              {/* 컨텐츠 영역 */}
              <div className="p-8 space-y-6">
                {/* 주요 설명 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-xl text-gray-700 leading-relaxed">
                    {description}
                  </p>
                </motion.div>

                {/* 특성 카드들 */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* 예술 스타일 */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center">
                        <Palette className="w-5 h-5 text-purple-700" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ko' ? '선호 예술 스타일' : 'Preferred Art Style'}
                      </h4>
                    </div>
                    <p className="text-gray-600">{artStyle}</p>
                  </div>

                  {/* 핵심 특성 */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-blue-700" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ko' ? '핵심 특성' : 'Key Traits'}
                      </h4>
                    </div>
                    <p className="text-gray-600">
                      {traits.length > 0 ? traits.join(', ') : 
                        (language === 'ko' ? '독창적, 감성적, 직관적' : 'Creative, Emotional, Intuitive')}
                    </p>
                  </div>

                  {/* 감상 스타일 */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-green-700" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ko' ? '감상 스타일' : 'Viewing Style'}
                      </h4>
                    </div>
                    <p className="text-gray-600">
                      {language === 'ko' 
                        ? '작품과의 깊은 교감을 추구하며, 숨겨진 의미를 탐구합니다'
                        : 'Seeks deep connection with artworks and explores hidden meanings'}
                    </p>
                  </div>

                  {/* 강점 */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
                        <Heart className="w-5 h-5 text-orange-700" />
                      </div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'ko' ? '당신의 강점' : 'Your Strengths'}
                      </h4>
                    </div>
                    <p className="text-gray-600">
                      {strengths.length > 0 ? strengths.join(', ') :
                        (language === 'ko' 
                          ? '예술적 감수성, 창의적 해석, 깊은 몰입'
                          : 'Artistic sensitivity, Creative interpretation, Deep immersion')}
                    </p>
                  </div>
                </motion.div>

                {/* 더보기 섹션 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center gap-2 text-[#6B5B95] font-medium hover:opacity-80 transition-all group"
                  >
                    <span>
                      {showDetails 
                        ? (language === 'ko' ? '간단히 보기' : 'Show Less')
                        : (language === 'ko' ? '더 자세히 알아보기' : 'Learn More About Your Type')
                      }
                    </span>
                    <ChevronDown className={cn(
                      "w-5 h-5 transition-transform group-hover:translate-y-0.5",
                      showDetails && "rotate-180"
                    )} />
                  </button>
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 space-y-4">
                          <div className="bg-gray-50 rounded-2xl p-6">
                            <h5 className="font-semibold text-gray-900 mb-3">
                              {language === 'ko' ? '당신과 잘 맞는 전시 스타일' : 'Exhibition Styles That Suit You'}
                            </h5>
                            <ul className="space-y-2 text-gray-600">
                              <li className="flex items-start gap-2">
                                <span className="text-[#6B5B95] mt-1">•</span>
                                <span>{language === 'ko' ? '몰입형 미디어 아트 전시' : 'Immersive media art exhibitions'}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[#6B5B95] mt-1">•</span>
                                <span>{language === 'ko' ? '감각적 체험이 가능한 설치 미술' : 'Sensory installation art'}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[#6B5B95] mt-1">•</span>
                                <span>{language === 'ko' ? '스토리텔링이 있는 기획 전시' : 'Curated exhibitions with storytelling'}</span>
                              </li>
                            </ul>
                          </div>

                          <div className="bg-gray-50 rounded-2xl p-6">
                            <h5 className="font-semibold text-gray-900 mb-3">
                              {language === 'ko' ? '추천 활동' : 'Recommended Activities'}
                            </h5>
                            <ul className="space-y-2 text-gray-600">
                              <li className="flex items-start gap-2">
                                <span className="text-[#6B5B95] mt-1">•</span>
                                <span>{language === 'ko' ? '아티스트 토크 참여하기' : 'Participate in artist talks'}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[#6B5B95] mt-1">•</span>
                                <span>{language === 'ko' ? '도슨트 투어 신청하기' : 'Join docent tours'}</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-[#6B5B95] mt-1">•</span>
                                <span>{language === 'ko' ? '예술 워크숍 체험하기' : 'Experience art workshops'}</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
              
              {/* 액션 버튼 - 개선된 디자인 */}
              <div className="p-8 pt-0">
                <div className="flex gap-4">
                  <Button
                    variant="primary"
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-[#6B5B95] to-[#8B7BAB] hover:from-[#5A4A84] hover:to-[#7A6A9A] text-white font-semibold py-4 rounded-2xl transform transition-all hover:scale-[1.02] hover:shadow-lg"
                    onClick={onComplete}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {language === 'ko' ? '나만의 갤러리 만들기' : 'Create My Gallery'}
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                  
                  <Button
                    variant="gallery"
                    size="lg"
                    className="flex-1 bg-white border-2 border-[#6B5B95] text-[#6B5B95] hover:bg-[#6B5B95] hover:text-white font-semibold py-4 rounded-2xl transform transition-all hover:scale-[1.02] hover:shadow-lg group"
                    onClick={onShare}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      {language === 'ko' ? '결과 공유하기' : 'Share Result'}
                    </span>
                  </Button>
                </div>

                {/* 결과 저장 안내 */}
                <p className="text-center text-sm text-gray-500 mt-4">
                  <Download className="w-4 h-4 inline mr-1" />
                  {language === 'ko' 
                    ? '결과는 자동으로 저장됩니다' 
                    : 'Your results are automatically saved'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// CSS 스타일 (tailwind.config.js에 추가 필요)
// .preserve-3d { transform-style: preserve-3d; }
// .backface-hidden { backface-visibility: hidden; }
// .rotate-y-180 { transform: rotateY(180deg); }