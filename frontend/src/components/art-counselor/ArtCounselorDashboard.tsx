'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Calendar,
  Brain,
  Settings,
  Heart,
  Palette,
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import { ArtCounselorChat } from './ArtCounselorChat';
import { DailyArtRecommendation } from './DailyArtRecommendation';
import { EmotionalBoundary } from './EmotionalBoundary';
import { SessionHistory } from './SessionHistory';

interface ArtCounselorDashboardProps {
  userId: string;
}

interface EmotionalProfile {
  current_emotions: Record<string, number>;
  dominant_emotion: string;
  therapeutic_goals: string[];
  conversation_style: string;
}

export function ArtCounselorDashboard({ userId }: ArtCounselorDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'chat' | 'history' | 'settings'>('dashboard');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [emotionalProfile, setEmotionalProfile] = useState<EmotionalProfile | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBoundaryMessage, setShowBoundaryMessage] = useState(false);
  const [boundaryType, setBoundaryType] = useState<'heavy_topic' | 'medical_advice' | null>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadEmotionalProfile(),
        loadRecentSessions()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
        setRecentSessions(data.data);
      }
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
    }
  };

  const startNewSession = async (sessionType: string = 'general') => {
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
        setActiveSession(data.data);
        setCurrentView('chat');
      } else if (data.requiresConsent) {
        // Handle consent requirements
        alert('Please complete safety disclaimers first');
      } else if (data.sessionEnded) {
        // Handle session limits
        alert(data.limitWarning || 'Session limit reached. Please take a break.');
      } else {
        alert('Failed to start session: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
      alert('Error starting session. Please try again.');
    }
  };

  const handleBoundaryTrigger = (type: 'heavy_topic' | 'medical_advice') => {
    setBoundaryType(type);
    setShowBoundaryMessage(true);
  };

  const getDominantEmotionEmoji = () => {
    const emotion = emotionalProfile?.dominant_emotion;
    const emojis: Record<string, string> = {
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
    return emojis[emotion || 'neutral'] || '😐';
  };

  if (isLoading) {
    return (
      <div className=\"flex items-center justify-center min-h-[400px]\">
        <div className=\"text-center\">
          <div className=\"animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4\"></div>
          <p className=\"text-gray-600\">Loading your art companion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className=\"max-w-7xl mx-auto\">
      {/* Navigation */}
      <div className=\"bg-white rounded-lg shadow-sm border border-gray-200 mb-6\">
        <nav className=\"flex space-x-8 px-6\">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Calendar },
            { id: 'chat', label: 'Art Companion', icon: MessageSquare },
            { id: 'history', label: 'Journey', icon: Brain },
            { id: 'settings', label: 'Preferences', icon: Settings }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id as any)}
              className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className=\"w-4 h-4 mr-2\" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <AnimatePresence mode=\"wait\">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <motion.div
            key=\"dashboard\"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className=\"space-y-8\"
          >
            {/* Welcome Section */}
            <div className=\"bg-white rounded-xl shadow-lg p-6\">
              <div className=\"flex items-start justify-between\">
                <div>
                  <h2 className=\"text-2xl font-bold text-gray-900 mb-2\">
                    Welcome to Your Art Companion
                  </h2>
                  <p className=\"text-gray-600\">
                    How are you feeling today? Let's explore art together.
                  </p>
                  {emotionalProfile && (
                    <div className=\"mt-4 flex items-center\">
                      <span className=\"text-2xl mr-2\">{getDominantEmotionEmoji()}</span>
                      <span className=\"text-sm text-gray-600\">
                        Current mood: <span className=\"capitalize font-medium\">{emotionalProfile.dominant_emotion}</span>
                      </span>
                    </div>
                  )}
                </div>
                <div className=\"flex space-x-3\">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => startNewSession('general')}
                    className=\"px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium\"
                  >
                    <MessageSquare className=\"w-4 h-4 inline mr-2\" />
                    Start Conversation
                  </motion.button>
                </div>
              </div>
            </div>

            <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">
              {/* Daily Art Recommendation */}
              <div>
                <h3 className=\"text-lg font-semibold text-gray-900 mb-4 flex items-center\">
                  <Palette className=\"w-5 h-5 mr-2 text-purple-500\" />
                  Art for You Today
                </h3>
                <DailyArtRecommendation
                  userId={userId}
                  onStartSession={() => startNewSession('general')}
                />
              </div>

              {/* Quick Stats & Recent Activity */}
              <div className=\"space-y-6\">
                {/* Emotional Wellness Card */}
                {emotionalProfile && (
                  <div className=\"bg-white rounded-xl shadow-lg p-6\">
                    <h3 className=\"text-lg font-semibold text-gray-900 mb-4 flex items-center\">
                      <Heart className=\"w-5 h-5 mr-2 text-pink-500\" />
                      Your Wellness Journey
                    </h3>

                    <div className=\"space-y-4\">
                      <div>
                        <label className=\"text-sm font-medium text-gray-700\">Goals</label>
                        <div className=\"mt-1 flex flex-wrap gap-2\">
                          {emotionalProfile.therapeutic_goals?.map((goal, index) => (
                            <span
                              key={index}
                              className=\"px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium\"
                            >
                              {goal.replace('_', ' ')}
                            </span>
                          )) || <span className=\"text-gray-500 text-sm\">No goals set</span>}
                        </div>
                      </div>

                      <div>
                        <label className=\"text-sm font-medium text-gray-700\">Conversation Style</label>
                        <p className=\"text-sm text-gray-600 capitalize mt-1\">
                          {emotionalProfile.conversation_style || 'supportive'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Session History Preview */}
                <div className=\"bg-white rounded-xl shadow-lg p-6\">
                  <h3 className=\"text-lg font-semibold text-gray-900 mb-4 flex items-center\">
                    <Clock className=\"w-5 h-5 mr-2 text-green-500\" />
                    Recent Conversations
                  </h3>

                  {recentSessions.length > 0 ? (
                    <div className=\"space-y-3\">
                      {recentSessions.slice(0, 3).map((session, index) => (
                        <div
                          key={index}
                          className=\"border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors\"
                          onClick={() => setCurrentView('history')}
                        >
                          <div className=\"flex items-center justify-between\">
                            <div>
                              <p className=\"text-sm font-medium text-gray-900\">
                                Art Conversation
                              </p>
                              <p className=\"text-xs text-gray-500\">
                                {new Date(session.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <MessageSquare className=\"w-4 h-4 text-gray-400\" />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => setCurrentView('history')}
                        className=\"w-full text-sm text-blue-600 hover:text-blue-700 font-medium\"
                      >
                        View all conversations →
                      </button>
                    </div>
                  ) : (
                    <div className=\"text-center py-4\">
                      <MessageSquare className=\"w-8 h-8 text-gray-400 mx-auto mb-2\" />
                      <p className=\"text-gray-600 text-sm\">No conversations yet</p>
                      <button
                        onClick={() => startNewSession('general')}
                        className=\"text-blue-600 hover:text-blue-700 text-sm font-medium mt-2\"
                      >
                        Start your first conversation
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Chat View */}
        {currentView === 'chat' && (
          <motion.div
            key=\"chat\"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className=\"h-[600px]\"
          >
            <div className=\"bg-white rounded-xl shadow-lg overflow-hidden h-full\">
              <ArtCounselorChat
                sessionId={activeSession?.sessionId}
                userId={userId}
                onSessionStart={(data) => setActiveSession(data)}
                onBoundaryTrigger={handleBoundaryTrigger}
                onEmotionDetected={(emotion) => {
                  // Update emotional profile
                  setEmotionalProfile(prev => prev ? {
                    ...prev,
                    current_emotions: emotion.primary_emotions || {},
                    dominant_emotion: Object.keys(emotion.primary_emotions || {})
                      .reduce((a, b) => (emotion.primary_emotions?.[a] || 0) > (emotion.primary_emotions?.[b] || 0) ? a : b)
                  } : null);
                }}
              />
            </div>
          </motion.div>
        )}

        {/* History View */}
        {currentView === 'history' && (
          <motion.div
            key=\"history\"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <SessionHistory userId={userId} />
          </motion.div>
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <motion.div
            key=\"settings\"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className=\"bg-white rounded-xl shadow-lg p-6\">
              <h3 className=\"text-lg font-semibold text-gray-900 mb-4 flex items-center\">
                <Settings className=\"w-5 h-5 mr-2 text-gray-500\" />
                Companion Preferences
              </h3>
              <div className=\"space-y-6\">
                <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4\">
                  <div className=\"flex items-start\">
                    <Shield className=\"w-5 h-5 text-blue-500 mt-0.5 mr-3\" />
                    <div>
                      <h4 className=\"font-medium text-blue-900\">Safety Settings</h4>
                      <p className=\"text-sm text-blue-800 mt-1\">
                        Your safety settings are managed automatically to ensure your wellbeing.
                        Session limits, content filtering, and crisis detection are always active.
                      </p>
                    </div>
                  </div>
                </div>

                <div className=\"text-center py-8\">
                  <Settings className=\"w-12 h-12 text-gray-400 mx-auto mb-4\" />
                  <p className=\"text-gray-600\">Preference settings coming soon</p>
                  <p className=\"text-sm text-gray-500 mt-2\">
                    We're working on personalization options while maintaining safety standards
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emotional Boundary Modal */}
      <EmotionalBoundary
        isOpen={showBoundaryMessage}
        onClose={() => setShowBoundaryMessage(false)}
        boundaryType={boundaryType}
      />
    </div>
  );
}