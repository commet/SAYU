'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getTranslatedText, getColorCodes, getArtEmoji } from '@/lib/artTranslations';
import { getArtworkRecommendations } from '@/lib/artworkRecommendations';
import { calculatePersonalityFromSimulation } from '@/lib/simulationDesign';
import { getExhibitionRecommendation } from '@/lib/exhibitionRecommendations';
import PersonalityIconFixed from '@/components/PersonalityIconFixed';
import IDCard from '@/components/IDCard';
import { Container, Card, Button } from '@/components/design-system';
import { Sparkles, ArrowRight, Heart, Share2 } from 'lucide-react';

interface PersonalityResult {
  personalityType: string;
  personality?: {
    name?: { en: string; ko: string };
    description?: { en: string; ko: string };
    strengths?: { en: string[]; ko: string[] };
    artPreferences?: {
      movements: string[];
      colors: string[];
      themes: string[];
    };
  };
  confidence?: number;
  scores?: Record<string, number>;
  isScenarioQuiz?: boolean;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [language, setLanguage] = useState<'en' | 'ko'>('ko');
  const [loading, setLoading] = useState(true);
  const [detailedData, setDetailedData] = useState<any>(null);
  const [showIDCard, setShowIDCard] = useState(false);

  useEffect(() => {
    const loadResultData = async () => {
      try {
        const storedResult = localStorage.getItem('quizResult');
        const personalityType = searchParams?.get('type');

        let currentResult: PersonalityResult & { isScenarioQuiz?: boolean } | null = null;

        if (storedResult) {
          currentResult = JSON.parse(storedResult);
        } else if (personalityType) {
          currentResult = { personalityType };
        } else {
          router.push('/quiz');
          return;
        }

        if (!currentResult) {
          return;
        }

        const quizType = searchParams?.get('type') || searchParams?.get('quizType') || localStorage.getItem('lastQuizType');
        if (quizType === 'scenario') {
          currentResult.isScenarioQuiz = true;

          const scenarioResponses = localStorage.getItem('scenarioResponses');
          if (scenarioResponses) {
            const responses = JSON.parse(scenarioResponses);
            const { type } = calculatePersonalityFromSimulation(responses);
            currentResult.personalityType = type;
          }
        }

        setResult(currentResult);

        if (currentResult?.personalityType) {
          const response = await fetch(`/api/personality-types?type=${currentResult.personalityType}`);
          const data = await response.json();

          if (data.success) {
            let personalityData = null;

            if (data.data) {
              personalityData = data.data.personalityData || data.data.personality || data.data;
            } else if (data.personalityData) {
              personalityData = data.personalityData;
            } else if (data.personality) {
              personalityData = data.personality;
            }

            if (!personalityData && data.type) {
              personalityData = {
                code: data.type,
                name: data.name,
                description: data.description,
                strengths: data.strengths,
                artPreferences: data.artPreferences
              } as any;
            }

            setDetailedData(personalityData);
          }
        }
      } catch (error) {
        console.error('Failed to load personality data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResultData();
  }, [searchParams, router]);

  const shareResult = () => {
    const text = `나의 미적 성향을 발견했어요: ${result?.personality?.name?.[language] || result?.personalityType}! SAYU 퀴즈로 당신의 성향도 찾아보세요.`;
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({ title: 'My SAYU Art Personality', text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert('링크가 클립보드에 복사되었습니다!');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-neutral-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-black">결과를 찾을 수 없습니다</h2>
          <Button variant="primary" onClick={() => router.push('/quiz')}>
            퀴즈 다시 하기
          </Button>
        </div>
      </div>
    );
  }

  const displayData = detailedData || result.personality;
  const artworkRecommendations = getArtworkRecommendations(result.personalityType);

  return (
    <div className="min-h-screen bg-white">
      {/* Language Toggle */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
          className="px-4 py-2 border border-neutral-300 text-black rounded-lg hover:bg-neutral-50 transition-colors text-sm"
        >
          {language === 'en' ? '한국어' : 'English'}
        </button>
      </div>

      {/* Hero Section */}
      <section className="py-32 bg-neutral-50">
        <Container size="xl">
          <div className="text-center">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <PersonalityIconFixed type={result.personalityType} size="large" animated={true} />
            </div>

            {/* APT Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white rounded-full mb-8">
              <Sparkles className="w-5 h-5" />
              <span className="text-lg font-bold text-white">{result.personalityType}</span>
            </div>

            {/* Name */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black">
              {displayData?.name?.[language] || (result.isScenarioQuiz
                ? (language === 'ko' ? '당신의 예술적 성향' : 'Your Artistic Personality')
                : `${result.personalityType} 성향`)
              }
            </h1>

            {/* Description */}
            <p className="text-xl text-black max-w-2xl mx-auto mb-8">
              {displayData?.description?.[language] || (result.isScenarioQuiz
                ? (language === 'ko'
                  ? '시나리오를 통해 발견한 당신만의 예술적 취향과 성향입니다.'
                  : 'Your unique artistic taste discovered through scenarios.')
                : '당신의 독특한 미적 성향을 발견했습니다!')
              }
            </p>

            {/* Confidence */}
            {result.confidence && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-black rounded-full text-sm">
                <span>신뢰도:</span>
                <span className="font-bold">{Math.round(result.confidence)}%</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Philosophical Message for Scenario Quiz */}
      {result.isScenarioQuiz && (
        <section className="py-20">
          <Container size="xl">
            <Card className="p-12 text-center bg-neutral-50">
              <span className="text-5xl mb-6 block">🌊</span>
              <h3 className="text-3xl font-bold mb-6 text-black">
                {language === 'ko' ? '당신의 미술 취향은 여정입니다' : 'Your Art Taste is a Journey'}
              </h3>
              <div className="space-y-4 text-lg leading-relaxed text-black max-w-3xl mx-auto">
                <p>
                  {language === 'ko'
                    ? 'APT와 달리, 당신의 미술 취향은 고정되어 있지 않습니다. 그것은 당신과 함께 성장하고, 진화하며, 새로운 경험과 감정에 따라 변화합니다.'
                    : 'Unlike APT, your art taste is not fixed. It grows with you, evolves, and transforms with new experiences and emotions.'
                  }
                </p>
                <p className="text-neutral-600">
                  {language === 'ko'
                    ? `오늘의 ${result.personalityType}는 내일의 다른 모습으로 변할 수 있습니다. 이것이 예술의 아름다움입니다 - 끊임없이 변화하는 당신을 반영합니다.`
                    : `Today's ${result.personalityType} may transform into something different tomorrow. That's the beauty of art - it reflects your ever-changing self.`
                  }
                </p>
              </div>
            </Card>
          </Container>
        </section>
      )}

      {/* Strengths */}
      {displayData?.strengths?.[language] && (
        <section className="py-20 bg-neutral-50">
          <Container size="xl">
            <h2 className="text-4xl font-bold mb-12 text-black">당신의 강점</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayData.strengths[language].map((strength: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">✨</span>
                    <span className="text-lg font-medium text-black">{strength}</span>
                  </div>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Art Preferences */}
      {displayData?.artPreferences && (
        <section className="py-20">
          <Container size="xl">
            <h2 className="text-4xl font-bold mb-12 text-black">당신의 예술 성격</h2>

            <div className="space-y-12">
              {/* Movements */}
              {displayData.artPreferences.movements && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-black flex items-center gap-2">
                    <span>🏛️</span>
                    선호 사조
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {displayData.artPreferences.movements.map((movement: any, index: number) => {
                      const translatedMovement = getTranslatedText('movements', movement, language);
                      const emoji = getArtEmoji('movements', movement);
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-black rounded-full text-sm font-medium"
                        >
                          <span>{emoji}</span>
                          {translatedMovement}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colors */}
              {displayData.artPreferences.colors && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-black flex items-center gap-2">
                    <span>🎨</span>
                    색상 팔레트
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {displayData.artPreferences.colors.map((color: any, index: number) => {
                      const translatedColor = getTranslatedText('colors', color, language);
                      const colorCodes = getColorCodes(color);
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-black rounded-full text-sm font-medium"
                        >
                          <div className="flex gap-1">
                            {colorCodes.slice(0, 3).map((colorCode, i) => (
                              <div
                                key={i}
                                className="w-3 h-3 rounded-full border border-neutral-300"
                                style={{ backgroundColor: colorCode }}
                              />
                            ))}
                          </div>
                          {translatedColor}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Themes */}
              {displayData.artPreferences.themes && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-black flex items-center gap-2">
                    <span>💭</span>
                    관심 주제
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {displayData.artPreferences.themes.map((theme: any, index: number) => {
                      const translatedTheme = getTranslatedText('themes', theme, language);
                      const emoji = getArtEmoji('themes', theme);
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-black rounded-full text-sm font-medium"
                        >
                          <span>{emoji}</span>
                          {translatedTheme}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* Representative Artwork */}
      {artworkRecommendations && (
        <section className="py-20 bg-neutral-50">
          <Container size="xl">
            <h2 className="text-4xl font-bold mb-12 text-black">당신을 위한 대표 작품</h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Main Image */}
              <div className="relative aspect-[3/4] bg-neutral-200 overflow-hidden">
                <Image
                  src={artworkRecommendations.representativeWork.image}
                  alt={artworkRecommendations.representativeWork.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex flex-col justify-center">
                <h3 className="text-4xl font-bold mb-4 text-black">
                  {artworkRecommendations.representativeWork.title}
                </h3>
                <p className="text-2xl text-neutral-600 mb-2">
                  {artworkRecommendations.representativeWork.artist}
                </p>
                <p className="text-lg text-neutral-600 mb-6">
                  {artworkRecommendations.representativeWork.year} • {artworkRecommendations.representativeWork.museum}
                </p>
                <p className="text-lg text-black leading-relaxed mb-8">
                  {artworkRecommendations.representativeWork.description[language]}
                </p>

                {/* Additional Works */}
                {'additionalWorks' in artworkRecommendations && artworkRecommendations.additionalWorks && artworkRecommendations.additionalWorks.length > 0 && (
                  <div>
                    <p className="text-sm text-neutral-600 mb-4">다른 추천 작품들:</p>
                    <div className="grid grid-cols-3 gap-4">
                      {artworkRecommendations?.additionalWorks?.slice(0, 3).map((work: any, index: number) => (
                        <div key={index} className="relative aspect-square bg-neutral-200 overflow-hidden group cursor-pointer">
                          <Image
                            src={work.image}
                            alt={work.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Action Buttons */}
      <section className="py-20">
        <Container size="xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-6 text-black">다음 단계</h2>
            <p className="text-xl text-black mb-12">이제 당신만의 예술 여정을 시작하세요</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" onClick={() => router.push('/gallery')}>
                <Sparkles className="w-5 h-5" />
                갤러리 탐험하기
              </Button>

              <Button variant="outline" size="lg" onClick={shareResult}>
                <Share2 className="w-5 h-5" />
                결과 공유하기
              </Button>

              {result.isScenarioQuiz && (
                <Button variant="outline" size="lg" onClick={() => setShowIDCard(true)}>
                  ID 카드 발급받기
                </Button>
              )}

              <Button variant="outline" size="lg" onClick={() => router.push('/quiz')}>
                퀴즈 다시하기
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ID Card Modal */}
      {showIDCard && (
        <IDCard
          personalityType={result.personalityType}
          userName="SAYU Explorer"
          joinDate={new Date()}
          stats={{
            exhibitionsVisited: 5,
            artworksViewed: 42,
            hoursSpent: 12
          }}
          level={1}
          badges={['초보 감상가', '시나리오 퀴즈 완료', '예술 탐험가']}
          language={language}
          onClose={() => setShowIDCard(false)}
        />
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
