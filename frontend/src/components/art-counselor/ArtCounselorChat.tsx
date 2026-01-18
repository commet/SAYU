'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  AlertTriangle,
  Shield,
  Heart,
  Clock,
  Palette,
  MessageSquare,
  Phone
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'counselor' | 'system';
  content: string;
  timestamp: Date;
  emotionDetected?: any;
  safetyWarning?: string;
  isRedirection?: boolean;
  isCrisisIntervention?: boolean;
  crisisResources?: any;
}

interface ArtCounselorChatProps {
  sessionId?: string;
  userId: string;
  onSessionStart?: (data: any) => void;
  onBoundaryTrigger?: (type: 'heavy_topic' | 'medical_advice') => void;
  onEmotionDetected?: (emotion: any) => void;
}

export function ArtCounselorChat({
  sessionId,
  userId,
  onSessionStart,
  onBoundaryTrigger,
  onEmotionDetected
}: ArtCounselorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showCrisisHelp, setShowCrisisHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentSessionId) {
      startNewSession();
    } else {
      loadSessionHistory();
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSession = async () => {
    try {
      const response = await fetch('/api/art-counselor/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionType: 'general'
        })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentSessionId(data.data.sessionId);
        if (onSessionStart) {
          onSessionStart(data.data);
        }

        // Add welcome message
        const welcomeMessage: Message = {
          id: Date.now().toString(),
          type: 'counselor',
          content: data.data.welcomeMessage || "Hello! I'm your AI art companion. I'm here to explore art and emotions with you in a safe, supportive way. How are you feeling today?",
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      } else {
        throw new Error(data.message || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Sorry, I had trouble starting our conversation. Please try again.',
        timestamp: new Date()
      };
      setMessages([errorMessage]);
    }
  };

  const loadSessionHistory = async () => {
    if (!currentSessionId) return;

    try {
      const response = await fetch(`/api/art-counselor/session/${currentSessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success && data.data.messages) {
        const formattedMessages: Message[] = data.data.messages.map((msg: any) => ({
          id: msg.id,
          type: msg.message_type,
          content: msg.content,
          timestamp: new Date(msg.created_at),
          emotionDetected: msg.emotion_detected
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || isLoading || sessionEnded) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`/api/art-counselor/session/${currentSessionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: currentMessage
        })
      });

      const data = await response.json();

      if (data.success) {
        // Handle crisis intervention
        if (data.isCrisisIntervention) {
          const crisisMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'system',
            content: data.response,
            timestamp: new Date(),
            isCrisisIntervention: true,
            crisisResources: data.crisisResources
          };
          setMessages(prev => [...prev, crisisMessage]);
          setSessionEnded(true);
          setShowCrisisHelp(true);
          return;
        }

        // Handle boundary redirections
        if (data.isRedirection) {
          const redirectMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'counselor',
            content: data.response,
            timestamp: new Date(),
            isRedirection: true
          };
          setMessages(prev => [...prev, redirectMessage]);

          // Trigger boundary UI
          if (onBoundaryTrigger) {
            if (data.response.includes('professional counselor') || data.response.includes('therapist')) {
              onBoundaryTrigger('heavy_topic');
            } else if (data.response.includes('medical') || data.response.includes('healthcare')) {
              onBoundaryTrigger('medical_advice');
            }
          }
          return;
        }

        // Regular counselor response
        const counselorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'counselor',
          content: data.response,
          timestamp: new Date(),
          emotionDetected: data.emotionDetected,
          safetyWarning: data.sessionWarning
        };

        setMessages(prev => [...prev, counselorMessage]);

        // Handle emotion detection
        if (data.emotionDetected && onEmotionDetected) {
          onEmotionDetected(data.emotionDetected);
        }

        // Handle session warnings
        if (data.sessionWarning) {
          const warningMessage: Message = {
            id: (Date.now() + 2).toString(),
            type: 'system',
            content: data.sessionWarning,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, warningMessage]);
        }

      } else if (data.sessionEnded) {
        setSessionEnded(true);
        const endMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'system',
          content: data.limitWarning || 'Session has ended for your wellbeing. Please take a break.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, endMessage]);
      } else {
        throw new Error(data.message || 'Failed to send message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I had trouble understanding. Could you please try again?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-blue-50 border-b border-blue-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-3">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">SAYU Art Companion</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <Shield className="w-3 h-3 mr-1 text-green-500" />
              Safe space for art and emotions
            </p>
          </div>
        </div>

        {sessionEnded && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            Session Ended
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
                {/* Message Bubble */}
                <div
                  className={`rounded-lg p-4 ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'system'
                      ? message.isCrisisIntervention
                        ? 'bg-red-50 border border-red-200 text-red-900'
                        : 'bg-amber-50 border border-amber-200 text-amber-900'
                      : message.isRedirection
                      ? 'bg-purple-50 border border-purple-200 text-purple-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* Crisis Resources */}
                  {message.isCrisisIntervention && message.crisisResources && (
                    <div className="mb-4 p-3 bg-red-100 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Immediate Help Available
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Crisis Hotline:</strong> {message.crisisResources.hotline}</p>
                        {message.crisisResources.text && (
                          <p><strong>Text:</strong> {message.crisisResources.text}</p>
                        )}
                        <p><strong>Emergency:</strong> {message.crisisResources.emergency}</p>
                      </div>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Safety Disclaimer for AI responses */}
                  {message.type === 'counselor' && !message.isRedirection && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                      <Shield className="w-3 h-3 inline mr-1" />
                      AI companion • Not a replacement for professional therapy
                    </div>
                  )}
                </div>

                {/* Timestamp and Status */}
                <div className={`flex items-center mt-1 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    {message.type !== 'user' && (
                      <div className="flex items-center">
                        {message.type === 'system' ? (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        ) : (
                          <Bot className="w-3 h-3 mr-1" />
                        )}
                      </div>
                    )}
                    <span>{formatTime(message.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' ? 'bg-blue-600 order-2 ml-2' : 'bg-gray-300 order-1 mr-2'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : message.type === 'system' ? (
                  <AlertTriangle className="w-4 h-4 text-gray-600" />
                ) : (
                  <Palette className="w-4 h-4 text-gray-600" />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        {sessionEnded ? (
          <div className="text-center py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-amber-800 font-medium">Session Complete</p>
              <p className="text-sm text-amber-700 mt-1">
                Take a break for your wellbeing. You can start a new session anytime.
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start New Session
            </button>
          </div>
        ) : (
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Share your thoughts about art, emotions, or how you're feeling..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
                disabled={isLoading}
              />
              <div className="mt-1 text-xs text-gray-500 flex items-center">
                <Heart className="w-3 h-3 mr-1" />
                This is a safe space focused on art and emotional wellness
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!currentMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}