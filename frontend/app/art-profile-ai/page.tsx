'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import APTArtProfileGenerator from '@/components/art-profile/APTArtProfileGenerator';
import { SAYU_TYPES } from '@/shared/SAYUTypeDefinitions';

function ArtProfileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 APT 코드 가져오기 (없으면 선택 UI 표시)
  const aptCodeParam = searchParams.get('apt');
  const [selectedAPT, setSelectedAPT] = useState<string | null>(aptCodeParam);
  const [showTypeSelector, setShowTypeSelector] = useState(!aptCodeParam);

  // APT 코드 유효성 검사
  useEffect(() => {
    if (aptCodeParam && !SAYU_TYPES[aptCodeParam]) {
      setShowTypeSelector(true);
      setSelectedAPT(null);
    }
  }, [aptCodeParam]);

  // APT 유형 선택 핸들러
  const handleSelectAPT = (code: string) => {
    setSelectedAPT(code);
    setShowTypeSelector(false);
    // URL 업데이트 (히스토리에 추가)
    router.push(`/art-profile-ai?apt=${code}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
                           radial-gradient(circle at 75% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)`
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gray-900/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </Button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="font-semibold text-white">나를 닮은 명화</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              onClick={() => setShowTypeSelector(true)}
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 pt-8">
          {showTypeSelector ? (
            // APT 유형 선택 UI
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  당신의 예술 유형을 선택하세요
                </h1>
                <p className="text-gray-400">
                  APT 테스트 결과가 없다면 아래에서 직접 선택해보세요
                </p>
              </div>

              {/* Type Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(SAYU_TYPES).map(([code, type]) => (
                  <motion.button
                    key={code}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSelectAPT(code)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedAPT === code
                        ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.emoji}</div>
                    <div className="font-semibold text-white text-sm">{code}</div>
                    <div className="text-xs text-gray-400 truncate">{type.name}</div>
                  </motion.button>
                ))}
              </div>

              {/* Quiz CTA */}
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                <p className="text-center text-sm text-gray-300 mb-3">
                  아직 예술 성격 테스트를 안 해보셨나요?
                </p>
                <Button
                  onClick={() => router.push('/quiz')}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  APT 테스트 하러 가기
                </Button>
              </div>
            </motion.div>
          ) : selectedAPT ? (
            // 선택된 APT로 프로필 생성기 표시
            <APTArtProfileGenerator
              aptCode={selectedAPT}
              onClose={() => setShowTypeSelector(true)}
              onComplete={(imageUrl) => {
                console.log('Generated:', imageUrl);
              }}
            />
          ) : null}
        </main>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-lg border-t border-white/10 py-3">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            SAYU | 예술을 통한 자기 발견
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ArtProfileAIPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
      </div>
    }>
      <ArtProfileContent />
    </Suspense>
  );
}
