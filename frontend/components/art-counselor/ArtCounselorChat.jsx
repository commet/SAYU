import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, Palette, Brain, Smile, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ArtCounselorChat = ({
  sessionId,
  onSessionStart,
  onEmotionDetected,
  artworkContext = null,
  personalityType = 'LAEF'
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      loadConversationHistory();
    }
  }, [sessionId]);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/art-counselor/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessages(data.data.conversation.map(msg => ({
          id: `${msg.created_at}-${msg.message_type}`,
          type: msg.message_type,
          content: msg.content,
          emotion: msg.emotion_detected,
          theme: msg.therapeutic_theme,
          timestamp: new Date(msg.created_at)
        })));
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch(`/api/art-counselor/session/${sessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          artworkContext
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentEmotion(data.data.emotionDetected);
        onEmotionDetected?.(data.data.emotionDetected);

        // Simulate typing delay
        setTimeout(() => {
          const counselorMessage = {
            id: Date.now() + 1,
            type: 'counselor',
            content: data.data.response,
            theme: data.data.therapeuticTheme,
            suggestedActions: data.data.suggestedActions,
            artworkRecommendations: data.data.artworkRecommendations,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, counselorMessage]);
          setIsTyping(false);
        }, Math.random() * 2000 + 1000); // 1-3 second delay

      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: '죄송합니다. 메시지를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalityBasedWelcome = () => {
    const welcomes = {
      'LAEF': '안녕하세요! 호기심 많은 여우님, 오늘은 어떤 예술적 탐험을 떠나볼까요? 🦊',
      'LAEC': '안녕하세요! 감성적인 고양이님, 아름다운 예술과 함께 마음을 나누어요 🐱',
      'LAMF': '안녕하세요! 지혜로운 올빼미님, 깊이 있는 예술의 의미를 함께 탐구해봐요 🦉',
      'LAMC': '안녕하세요! 차분한 거북이님, 안정적인 공간에서 천천히 이야기해봐요 🐢'
    };

    return welcomes[personalityType] || '안녕하세요! 예술을 통해 마음을 나누는 시간을 가져봐요 🎨';
  };

  const EmotionIndicator = ({ emotion }) => {
    if (!emotion) return null;

    const getEmotionColor = (emotion) => {
      const colors = {
        joy: 'text-yellow-500 bg-yellow-100',
        sadness: 'text-blue-500 bg-blue-100',
        anger: 'text-red-500 bg-red-100',
        fear: 'text-purple-500 bg-purple-100',
        surprise: 'text-green-500 bg-green-100',
        neutral: 'text-gray-500 bg-gray-100'
      };

      const dominantEmotion = Object.keys(emotion.primary_emotions || {})
        .reduce((a, b) => emotion.primary_emotions[a] > emotion.primary_emotions[b] ? a : b);

      return colors[dominantEmotion] || colors.neutral;
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getEmotionColor(emotion)}`}
      >
        <Heart className="w-3 h-3 mr-1" />
        감정 감지됨
      </motion.div>
    );
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isCounselor = message.type === 'counselor';
    const isSystem = message.type === 'system';

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
          isUser ? 'order-2' : 'order-1'
        }`}>
          {!isUser && (
            <div className="flex items-center mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-2">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-600 font-medium">MIYU</span>
              {message.theme && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {message.theme}
                </span>
              )}
            </div>
          )}

          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-500 text-white'
              : isCounselor
                ? 'bg-white border border-gray-200 text-gray-800'
                : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            <p className="whitespace-pre-wrap">{message.content}</p>

            {message.emotion && (
              <div className="mt-2">
                <EmotionIndicator emotion={message.emotion} />
              </div>
            )}

            {message.suggestedActions && message.suggestedActions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600 mb-2">제안 활동:</p>
                <ul className="space-y-1">
                  {message.suggestedActions.map((action, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <Palette className="w-3 h-3 mt-1 mr-2 text-purple-500 flex-shrink-0" />
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className={`text-xs text-gray-500 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </motion.div>
    );
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mr-2">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">MIYU - 예술 상담사</h3>
              <p className="text-sm text-gray-600">감정과 예술의 연결고리</p>
            </div>
          </div>

          {currentEmotion && (
            <div className="flex items-center space-x-2">
              <EmotionIndicator emotion={currentEmotion} />
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
              <Smile className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              {getPersonalityBasedWelcome()}
            </h4>
            <p className="text-gray-600 max-w-md mx-auto">
              예술을 통해 마음을 탐구하고 감정을 나누는 시간을 가져봐요.
              무엇이든 편안하게 이야기해주세요.
            </p>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isTyping && <TypingIndicator />}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="마음을 편하게 표현해보세요..."
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            {artworkContext && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Palette className="w-4 h-4 text-purple-500" title="작품 관련 대화" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-2 text-xs text-gray-500 text-center">
          MIYU는 전문 치료를 대체하지 않습니다. 위급한 상황에서는 전문가의 도움을 받으세요.
        </div>
      </div>
    </div>
  );
};

export default ArtCounselorChat;