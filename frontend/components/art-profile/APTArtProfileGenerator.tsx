'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Share2, Download, RefreshCw, Info, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { SAYU_TYPES } from '@/shared/SAYUTypeDefinitions';
import {
  ART_STYLES,
  getRecommendedStylesForAPT,
  getArtProfileDescription
} from '@/shared/apt-ai-prompt-mapping';

interface APTArtProfileGeneratorProps {
  aptCode: string;
  onComplete?: (imageUrl: string) => void;
  onClose?: () => void;
}

type GenerationStep = 'style' | 'generating' | 'result';

interface GeneratedResult {
  imageUrl: string;
  artStyle: string;
  artStyleName: string;
  description: string;
  descriptionEn: string;
  generatedAt: string;
}

export default function APTArtProfileGenerator({
  aptCode,
  onComplete,
  onClose
}: APTArtProfileGeneratorProps) {
  const [step, setStep] = useState<GenerationStep>('style');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [gender, setGender] = useState<'neutral' | 'male' | 'female'>('neutral');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recommendedStyles, setRecommendedStyles] = useState<string[]>([]);

  // APT 정보
  const aptInfo = SAYU_TYPES[aptCode];

  // 추천 스타일 로드
  useEffect(() => {
    if (aptCode) {
      const recommended = getRecommendedStylesForAPT(aptCode);
      setRecommendedStyles(recommended);
      setSelectedStyle(recommended[0] || 'impressionism');
    }
  }, [aptCode]);

  // 생성 핸들러
  const handleGenerate = async () => {
    if (!selectedStyle) {
      toast.error('아트 스타일을 선택해주세요');
      return;
    }

    setStep('generating');
    setIsGenerating(true);
    setProgress(0);
    setError(null);

    // 프로그레스 시뮬레이션 (실제 API는 비동기)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const response = await fetch('/api/art-profile/generate-apt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aptCode,
          artStyle: selectedStyle,
          gender
        })
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Generation failed');
      }

      const data = await response.json();
      setProgress(100);

      if (data.success) {
        setResult({
          imageUrl: data.data.imageUrl,
          artStyle: data.data.artStyle,
          artStyleName: data.data.artStyleName,
          description: data.data.description,
          descriptionEn: data.data.descriptionEn,
          generatedAt: data.data.metadata.generatedAt
        });
        setStep('result');
        toast.success('당신만의 명화가 완성되었습니다!');
        onComplete?.(data.data.imageUrl);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      clearInterval(progressInterval);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      setError(errorMessage);
      setStep('style');
      toast.error(`생성 실패: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 다운로드 핸들러
  const handleDownload = async () => {
    if (!result?.imageUrl) return;

    try {
      const link = document.createElement('a');
      link.href = result.imageUrl;
      link.download = `sayu-art-profile-${aptCode}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('이미지가 다운로드되었습니다!');
    } catch (err) {
      toast.error('다운로드에 실패했습니다');
    }
  };

  // 공유 핸들러
  const handleShare = async () => {
    if (!result) return;

    const shareText = `나는 ${aptInfo?.name} (${aptCode}) - ${aptInfo?.animal}! 🎨\n${result.description}\n\n당신의 예술 성격은? 👉 sayu.app/art-profile`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SAYU 나를 닮은 명화',
          text: shareText,
          url: 'https://sayu.app/art-profile'
        });
      } catch (err) {
        // 사용자가 공유 취소
      }
    } else {
      // Clipboard fallback
      await navigator.clipboard.writeText(shareText);
      toast.success('공유 텍스트가 복사되었습니다!');
    }
  };

  // 리셋 핸들러
  const handleReset = () => {
    setStep('style');
    setResult(null);
    setProgress(0);
    setError(null);
  };

  if (!aptInfo) {
    return (
      <div className="text-center p-8">
        <p className="text-red-400">유효하지 않은 APT 코드입니다: {aptCode}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 mb-4">
          <span className="text-2xl">{aptInfo.emoji}</span>
          <span className="font-semibold text-purple-300">{aptCode}</span>
          <span className="text-gray-400">·</span>
          <span className="text-gray-300">{aptInfo.name}</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          나를 닮은 명화 만들기
        </h1>
        <p className="text-gray-400">
          당신의 예술 성격을 명화로 표현해보세요
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Style Selection */}
        {step === 'style' && (
          <motion.div
            key="style"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            {/* Gender Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Info className="inline w-4 h-4 mr-1" />
                표현 스타일
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'neutral', label: '중성적' },
                  { id: 'female', label: '여성적' },
                  { id: 'male', label: '남성적' }
                ].map(option => (
                  <button
                    key={option.id}
                    onClick={() => setGender(option.id as typeof gender)}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm transition-all ${
                      gender === option.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Art Style Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                <Palette className="inline w-4 h-4 mr-1" />
                아트 스타일 선택
              </label>

              {/* Recommended Styles */}
              {recommendedStyles.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-purple-400 mb-2">
                    ✨ {aptCode} 유형 추천 스타일
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {recommendedStyles.map(styleId => {
                      const style = ART_STYLES[styleId];
                      return (
                        <motion.button
                          key={styleId}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedStyle(styleId)}
                          className={`p-3 rounded-lg text-left transition-all ${
                            selectedStyle === styleId
                              ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400'
                              : 'bg-white/10 border border-white/10 hover:bg-white/20'
                          }`}
                        >
                          <p className="font-medium text-white text-sm">{style.nameKo}</p>
                          <p className="text-xs text-gray-400 mt-1">{style.artistReference}</p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Styles */}
              <div>
                <p className="text-xs text-gray-500 mb-2">모든 스타일</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(ART_STYLES)
                    .filter(([id]) => !recommendedStyles.includes(id))
                    .map(([styleId, style]) => (
                      <motion.button
                        key={styleId}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedStyle(styleId)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedStyle === styleId
                            ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400'
                            : 'bg-white/5 border border-white/5 hover:bg-white/10'
                        }`}
                      >
                        <p className="font-medium text-gray-300 text-sm">{style.nameKo}</p>
                        <p className="text-xs text-gray-500">{style.description}</p>
                      </motion.button>
                    ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!selectedStyle}
              className="w-full py-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold text-lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              나만의 명화 생성하기
            </Button>

            <p className="text-center text-xs text-gray-500 mt-3">
              AI가 당신의 성격을 담은 유일무이한 작품을 만들어드려요
            </p>
          </motion.div>
        )}

        {/* Step 2: Generating */}
        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/10"
          >
            <motion.div
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="w-24 h-24 mx-auto mb-6"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            <h3 className="text-xl font-semibold text-white mb-2">
              AI가 당신의 명화를 그리는 중...
            </h3>
            <p className="text-gray-400 mb-6">
              {aptInfo.emoji} {aptInfo.name}의 영혼을 {ART_STYLES[selectedStyle!]?.nameKo} 스타일로 표현합니다
            </p>

            {/* Progress */}
            <div className="w-full max-w-md mx-auto">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-400">{Math.round(progress)}%</p>
            </div>

            {/* Fun Messages */}
            <motion.p
              key={Math.floor(progress / 20)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-sm text-purple-300 italic"
            >
              {progress < 20 && "영감을 모으는 중... ✨"}
              {progress >= 20 && progress < 40 && "색채를 배합하는 중... 🎨"}
              {progress >= 40 && progress < 60 && "붓을 놀리는 중... 🖌️"}
              {progress >= 60 && progress < 80 && "디테일을 더하는 중... 🔍"}
              {progress >= 80 && "마지막 터치 중... 💫"}
            </motion.p>
          </motion.div>
        )}

        {/* Step 3: Result */}
        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10"
          >
            {/* Generated Image */}
            <div className="relative aspect-square bg-gradient-to-br from-purple-900/50 to-pink-900/50">
              <img
                src={result.imageUrl}
                alt="Generated Art Profile"
                className="w-full h-full object-cover"
              />

              {/* Overlay Badge */}
              <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-sm text-white flex items-center gap-2">
                <span>{aptInfo.emoji}</span>
                <span>{aptCode}</span>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">
                  {aptInfo.name}
                </h3>
                <p className="text-purple-300 text-sm">
                  {result.artStyleName} 스타일
                </p>
                <p className="text-gray-400 text-sm mt-3 italic">
                  "{result.description}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
                >
                  <Download className="w-5 h-5 mb-1" />
                  <span className="text-xs">저장</span>
                </Button>

                <Button
                  onClick={handleShare}
                  className="flex-col h-auto py-3 bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  <Share2 className="w-5 h-5 mb-1" />
                  <span className="text-xs">공유</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-col h-auto py-3 border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className="w-5 h-5 mb-1" />
                  <span className="text-xs">다시</span>
                </Button>
              </div>

              {/* Viral CTA */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <p className="text-center text-sm text-gray-300">
                  친구들도 자신의 명화를 만들게 해보세요!
                </p>
                <p className="text-center text-xs text-purple-400 mt-1">
                  👉 sayu.app/art-profile
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Close Button */}
      {onClose && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            닫기
          </Button>
        </div>
      )}
    </div>
  );
}
