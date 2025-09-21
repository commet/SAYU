import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Heart,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  AlertCircle,
  Palette,
  Sun,
  Moon
} from 'lucide-react';

import ArtCounselorChat from '../../components/art-counselor/ArtCounselorChat';
import DailyArtRecommendation from '../../components/art-counselor/DailyArtRecommendation';
import EmotionalResponseRecorder from '../../components/art-counselor/EmotionalResponseRecorder';
import MemoryVisualization from '../../components/art-counselor/MemoryVisualization';

const ArtCounselorPage = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, chat, memories, settings
  const [emotionalProfile, setEmotionalProfile] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [showEmotionRecorder, setShowEmotionRecorder] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadEmotionalProfile();
      loadRecentSessions();
    }
  }, [user]);

  const loadEmotionalProfile = async () => {
    try {
      const response = await fetch('/api/art-counselor/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEmotionalProfile(data.data);
      }
    } catch (error) {
      console.error('Failed to load emotional profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecentSessions = async () => {
    try {
      const response = await fetch('/api/art-counselor/memory?limit=5', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Group by session_id and get recent sessions
        const sessions = data.data.reduce((acc, memory) => {
          const sessionId = memory.session_id;
          if (!acc[sessionId]) {
            acc[sessionId] = {
              sessionId,
              lastActivity: memory.created_at,
              messageCount: 0,
              themes: new Set()
            };
          }
          acc[sessionId].messageCount++;
          if (memory.therapeutic_theme) {
            acc[sessionId].themes.add(memory.therapeutic_theme);
          }
          return acc;
        }, {});

        setRecentSessions(Object.values(sessions)
          .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
          .slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    }
  };

  const startNewSession = async (sessionType = 'general', artworkContext = null) => {
    try {
      const response = await fetch('/api/art-counselor/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionType,
          initialEmotion: emotionalProfile?.current_emotions
        })
      });

      const data = await response.json();
      if (data.success) {
        setActiveSession({
          ...data.data,
          artworkContext
        });
        setCurrentView('chat');
      } else {
        alert('세션을 시작할 수 없습니다: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('세션을 시작하는 중 오류가 발생했습니다.');
    }
  };

  const getDominantEmotion = () => {
    if (!emotionalProfile?.current_emotions) return null;
    const emotions = emotionalProfile.current_emotions;
    return Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      joy: '😊',
      sadness: '😢',
      anger: '😠',
      fear: '😰',
      surprise: '😮',
      neutral: '😐',
      peace: '😌',
      anxiety: '😰',
      hope: '🌟',
      comfort: '🤗'
    };
    return emojis[emotion] || '😐';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    return '방금 전';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">마음의 치유 공간을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  const dominantEmotion = getDominantEmotion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MIYU - 예술 상담사</h1>
                <p className="text-sm text-gray-600">감정과 예술이 만나는 치유의 공간</p>
              </div>
            </div>

            {emotionalProfile && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">현재 감정</p>
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getEmotionEmoji(dominantEmotion)}</span>
                    <span className="text-sm font-medium capitalize">{dominantEmotion}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: '대시보드', icon: Calendar },
              { id: 'chat', label: '상담하기', icon: MessageSquare },
              { id: 'memories', label: '기억 탐색', icon: Brain },
              { id: 'settings', label: '설정', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Welcome Section */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      안녕하세요, {user?.username || user?.email}님!
                    </h2>
                    <p className="text-gray-600">
                      오늘은 어떤 감정과 함께 예술을 만나볼까요?
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startNewSession('general')}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                    >
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      상담 시작하기
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startNewSession('crisis')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <AlertCircle className="w-4 h-4 inline mr-2" />
                      긴급 상담
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Daily Art Recommendation */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">오늘의 추천작</h3>
                  <DailyArtRecommendation
                    personalityType={user?.personality_type}
                    onEmotionalResponseRecord={() => loadEmotionalProfile()}
                    onStartCounselorSession={({ artworkContext }) =>
                      startNewSession('general', artworkContext)
                    }
                  />
                </div>

                {/* Recent Sessions & Stats */}
                <div className="space-y-6">
                  {/* Recent Sessions */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 상담</h3>

                    {recentSessions.length > 0 ? (
                      <div className="space-y-3">
                        {recentSessions.map((session) => (
                          <div
                            key={session.sessionId}
                            className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              setActiveSession({ sessionId: session.sessionId });
                              setCurrentView('chat');
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {Array.from(session.themes).join(', ') || '일반 상담'}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {session.messageCount}개 메시지 • {formatTimeAgo(session.lastActivity)}
                                </p>
                              </div>
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 text-sm">아직 상담 기록이 없습니다</p>
                      </div>
                    )}
                  </div>

                  {/* Emotional Profile Summary */}
                  {emotionalProfile && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">감정 프로필</h3>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">치료 목표</label>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {emotionalProfile.therapeutic_goals?.map((goal, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                              >
                                {goal.replace('_', ' ')}
                              </span>
                            )) || <span className="text-gray-500 text-sm">설정된 목표가 없습니다</span>}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700">선호 대화 스타일</label>
                          <p className="text-sm text-gray-600 capitalize">
                            {emotionalProfile.conversation_style || 'supportive'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat View */}
          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-[600px]"
            >
              {activeSession ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full">
                  <ArtCounselorChat
                    sessionId={activeSession.sessionId}
                    artworkContext={activeSession.artworkContext}
                    personalityType={user?.personality_type}
                    onSessionStart={(data) => setActiveSession({ ...activeSession, ...data })}
                    onEmotionDetected={(emotion) => {
                      // Update emotional profile
                      setEmotionalProfile(prev => ({
                        ...prev,
                        current_emotions: emotion.primary_emotions,
                        dominant_emotion: Object.keys(emotion.primary_emotions || {})
                          .reduce((a, b) => emotion.primary_emotions[a] > emotion.primary_emotions[b] ? a : b)
                      }));
                    }}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">새로운 상담 세션</h3>
                  <p className="text-gray-600 mb-6">어떤 종류의 상담을 원하시나요?</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
                    <button
                      onClick={() => startNewSession('general')}
                      className="p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                    >
                      <Sun className="w-6 h-6 text-yellow-500 mb-2" />
                      <h4 className="font-medium text-gray-900">일반 상담</h4>
                      <p className="text-sm text-gray-600">편안한 대화와 감정 나누기</p>
                    </button>

                    <button
                      onClick={() => startNewSession('reflection')}
                      className="p-4 border border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
                    >
                      <Moon className="w-6 h-6 text-blue-500 mb-2" />
                      <h4 className="font-medium text-gray-900">깊은 성찰</h4>
                      <p className="text-sm text-gray-600">내면 탐구와 통찰</p>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Memories View */}
          {currentView === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <MemoryVisualization
                userId={user?.id}
                onMemorySelect={(memory) => {
                  // Could open a detailed view or continue conversation
                  console.log('Selected memory:', memory);
                }}
              />
            </motion.div>
          )}

          {/* Settings View */}
          {currentView === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">상담 설정</h3>
                <p className="text-gray-600">설정 기능은 곧 추가될 예정입니다.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emotion Recorder Modal */}
      <AnimatePresence>
        {showEmotionRecorder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setShowEmotionRecorder(false)}
          >
            <EmotionalResponseRecorder
              onResponseSaved={() => {
                setShowEmotionRecorder(false);
                loadEmotionalProfile();
              }}
              onClose={() => setShowEmotionRecorder(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtCounselorPage;