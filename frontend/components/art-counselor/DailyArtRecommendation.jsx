import React, { useState, useEffect } from 'react';
import { Heart, Palette, Brain, Clock, Share2, BookmarkPlus, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DailyArtRecommendation = ({
  onEmotionalResponseRecord,
  onStartCounselorSession,
  personalityType = 'LAEF'
}) => {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmotionRecorder, setShowEmotionRecorder] = useState(false);
  const [viewStartTime, setViewStartTime] = useState(null);
  const [emotionalResponse, setEmotionalResponse] = useState({});
  const [responseIntensity, setResponseIntensity] = useState(0.5);
  const [personalMeaning, setPersonalMeaning] = useState('');

  useEffect(() => {
    loadDailyRecommendation();
    setViewStartTime(Date.now());
  }, []);

  useEffect(() => {
    // Mark as viewed after 5 seconds
    const timer = setTimeout(() => {
      if (recommendation && !recommendation.viewed) {
        markAsViewed();
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [recommendation]);

  const loadDailyRecommendation = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/art-counselor/daily-art', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRecommendation(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to load daily recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = async () => {
    if (!recommendation || recommendation.viewed) return;

    try {
      const interactionTime = viewStartTime ? Math.floor((Date.now() - viewStartTime) / 1000) : 0;

      await fetch(`/api/art-counselor/daily-art/${recommendation.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interactionTimeSeconds: interactionTime
        })
      });

      setRecommendation(prev => ({ ...prev, viewed: true }));
    } catch (error) {
      console.error('Failed to mark as viewed:', error);
    }
  };

  const recordEmotionalResponse = async () => {
    try {
      const response = await fetch('/api/art-counselor/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          artworkId: recommendation.artwork_id,
          artworkTitle: recommendation.artwork_data?.title,
          artworkArtist: recommendation.artwork_data?.artist,
          artworkYear: recommendation.artwork_data?.year,
          emotionalResponse,
          responseIntensity,
          personalMeaning: personalMeaning.trim() || null
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowEmotionRecorder(false);
        onEmotionalResponseRecord?.(data.data);

        // Show success message
        alert('감정 응답이 기록되었습니다!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Failed to record emotional response:', error);
      alert('감정 응답 기록에 실패했습니다.');
    }
  };

  const getPersonalityBasedMessage = () => {
    const messages = {
      'LAEF': '호기심 가득한 여우님을 위한 새로운 발견! 🦊',
      'LAEC': '감성적인 고양이님의 마음에 닿을 아름다움 🐱',
      'LAMF': '지혜로운 올빼미님을 위한 깊이 있는 작품 🦉',
      'LAMC': '차분한 거북이님을 위한 안정감 있는 예술 🐢',
      'LREF': '적응력 있는 카멜레온님을 위한 다채로운 표현 🦎',
      'LREC': '섬세한 고슴도치님을 위한 내밀한 감성 🦔',
      'LRMF': '복합적인 문어님을 위한 다층적 의미 🐙',
      'LRMC': '실용적인 비버님을 위한 의미 있는 작품 🦫',
      'SAEF': '변화하는 나비님을 위한 영감 🦋',
      'SAEC': '사회적인 펭귄님을 위한 공감의 예술 🐧',
      'SAMF': '표현력 있는 앵무새님을 위한 이야기 🦜',
      'SAMC': '온화한 사슴님을 위한 치유의 예술 🦌',
      'SREF': '활기찬 강아지님을 위한 에너지 넘치는 작품 🐕',
      'SREC': '적응적인 오리님을 위한 유연한 표현 🦆',
      'SRMF': '지혜로운 코끼리님을 위한 깊은 성찰 🐘',
      'SRMC': '통찰력 있는 독수리님을 위한 광활한 시야 🦅'
    };

    return messages[personalityType] || '오늘의 특별한 예술 추천 🎨';
  };

  const EmotionSelector = ({ emotions, onChange }) => {
    const emotionOptions = [
      { key: 'joy', label: '기쁨', emoji: '😊', color: 'bg-yellow-100 text-yellow-800' },
      { key: 'sadness', label: '슬픔', emoji: '😢', color: 'bg-blue-100 text-blue-800' },
      { key: 'peace', label: '평온', emoji: '😌', color: 'bg-green-100 text-green-800' },
      { key: 'inspiration', label: '영감', emoji: '✨', color: 'bg-purple-100 text-purple-800' },
      { key: 'nostalgia', label: '그리움', emoji: '🌅', color: 'bg-orange-100 text-orange-800' },
      { key: 'wonder', label: '경이', emoji: '🤩', color: 'bg-pink-100 text-pink-800' },
      { key: 'contemplation', label: '사색', emoji: '🤔', color: 'bg-gray-100 text-gray-800' },
      { key: 'comfort', label: '위안', emoji: '🤗', color: 'bg-indigo-100 text-indigo-800' }
    ];

    return (
      <div className="grid grid-cols-2 gap-2">
        {emotionOptions.map((emotion) => (
          <button
            key={emotion.key}
            type="button"
            onClick={() => {
              const intensity = emotions[emotion.key] || 0;
              const newIntensity = intensity >= 1 ? 0 : intensity + 0.25;
              onChange({
                ...emotions,
                [emotion.key]: newIntensity
              });
            }}
            className={`p-3 rounded-lg border-2 transition-all duration-200 ${
              emotions[emotion.key] > 0
                ? `${emotion.color} border-current`
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{emotion.emoji}</span>
              <span className="text-sm font-medium">{emotion.label}</span>
            </div>
            {emotions[emotion.key] > 0 && (
              <div className="mt-1 flex space-x-1">
                {Array.from({ length: 4 }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < emotions[emotion.key] * 4 ? 'bg-current' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">오늘의 추천작을 준비하고 있어요...</span>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="text-center p-8">
        <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">오늘의 추천작을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">오늘의 예술 추천</h2>
            <p className="text-purple-100">{getPersonalityBasedMessage()}</p>
          </div>
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Artwork Display */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Artwork Image */}
          <div className="relative rounded-lg overflow-hidden mb-4 group cursor-pointer"
               onClick={() => setShowEmotionRecorder(true)}>
            <img
              src={recommendation.artwork_data?.image_url || '/placeholder-artwork.jpg'}
              alt={recommendation.artwork_data?.title || 'Recommended Artwork'}
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Artwork Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {recommendation.artwork_data?.title || 'Untitled'}
            </h3>

            {recommendation.artwork_data?.artist && (
              <p className="text-gray-600">
                작가: {recommendation.artwork_data.artist}
                {recommendation.artwork_data?.year && ` (${recommendation.artwork_data.year})`}
              </p>
            )}

            {/* Recommendation Reason */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Brain className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-900 mb-1">추천 이유</h4>
                  <p className="text-purple-700 text-sm">
                    {recommendation.recommendation_reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Therapeutic Goal */}
            {recommendation.therapeutic_goal && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Heart className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">치료적 목표</h4>
                    <p className="text-blue-700 text-sm">
                      {recommendation.therapeutic_goal}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowEmotionRecorder(true)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              <Heart className="w-4 h-4 inline mr-2" />
              감정 기록하기
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartCounselorSession?.({
                artworkContext: {
                  id: recommendation.artwork_id,
                  title: recommendation.artwork_data?.title,
                  artist: recommendation.artwork_data?.artist
                }
              })}
              className="flex-1 bg-white border border-purple-300 text-purple-600 px-4 py-3 rounded-lg font-medium hover:bg-purple-50 transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4 inline mr-2" />
              상담하기
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Emotion Recording Modal */}
      <AnimatePresence>
        {showEmotionRecorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowEmotionRecorder(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">감정 응답 기록</h3>

              {/* Emotion Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이 작품을 보며 느낀 감정 (복수 선택 가능)
                </label>
                <EmotionSelector
                  emotions={emotionalResponse}
                  onChange={setEmotionalResponse}
                />
              </div>

              {/* Intensity Slider */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전체적인 감정의 강도: {Math.round(responseIntensity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={responseIntensity}
                  onChange={(e) => setResponseIntensity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Personal Meaning */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  개인적인 의미나 생각 (선택사항)
                </label>
                <textarea
                  value={personalMeaning}
                  onChange={(e) => setPersonalMeaning(e.target.value)}
                  placeholder="이 작품이 나에게 어떤 의미인지, 어떤 기억이나 생각이 드는지 자유롭게 적어보세요..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowEmotionRecorder(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={recordEmotionalResponse}
                  disabled={Object.keys(emotionalResponse).length === 0}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  기록하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DailyArtRecommendation;