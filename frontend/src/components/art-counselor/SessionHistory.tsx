'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Heart, TrendingUp, Filter, Clock } from 'lucide-react';

interface SessionHistoryProps {
  userId: string;
}

export function SessionHistory({ userId }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    loadSessionHistory();
  }, [userId, filter]);

  const loadSessionHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/art-counselor/memory?limit=20&timeframe=${filter}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (error) {
      console.error('Error loading session history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className=\"bg-white rounded-xl shadow-lg p-6\">
        <div className=\"animate-pulse space-y-4\">
          {[...Array(5)].map((_, i) => (
            <div key={i} className=\"h-16 bg-gray-200 rounded\"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className=\"bg-white rounded-xl shadow-lg p-6\">
      <div className=\"flex items-center justify-between mb-6\">
        <h3 className=\"text-lg font-semibold text-gray-900 flex items-center\">
          <Calendar className=\"w-5 h-5 mr-2 text-blue-500\" />
          Your Art Journey
        </h3>

        <div className=\"flex items-center space-x-2\">
          <Filter className=\"w-4 h-4 text-gray-500\" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className=\"text-sm border border-gray-300 rounded px-2 py-1\"
          >
            <option value=\"all\">All Time</option>
            <option value=\"week\">This Week</option>
            <option value=\"month\">This Month</option>
          </select>
        </div>
      </div>

      {sessions.length > 0 ? (
        <div className=\"space-y-4\">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className=\"border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors\"
            >
              <div className=\"flex items-start justify-between\">
                <div className=\"flex-1\">
                  <div className=\"flex items-center mb-2\">
                    <MessageSquare className=\"w-4 h-4 text-blue-500 mr-2\" />
                    <span className=\"font-medium text-gray-900\">Art Conversation</span>
                    {session.therapeutic_theme && (
                      <span className=\"ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs\">
                        {session.therapeutic_theme.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  <p className=\"text-sm text-gray-600 mb-2 line-clamp-2\">
                    {session.content || 'Art discussion and emotional exploration'}
                  </p>
                  <div className=\"flex items-center text-xs text-gray-500\">
                    <Clock className=\"w-3 h-3 mr-1\" />
                    {formatDate(session.created_at)}
                  </div>
                </div>

                {session.emotion_detected && (
                  <div className=\"ml-4 text-right\">
                    <div className=\"text-xs text-gray-500 mb-1\">Mood</div>
                    <div className=\"flex items-center\">
                      <Heart className=\"w-3 h-3 text-pink-500 mr-1\" />
                      <span className=\"text-sm capitalize\">
                        {Object.keys(session.emotion_detected.primary_emotions || {})[0] || 'Neutral'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className=\"text-center py-12\">
          <MessageSquare className=\"w-16 h-16 text-gray-400 mx-auto mb-4\" />
          <h4 className=\"text-lg font-medium text-gray-900 mb-2\">No conversations yet</h4>
          <p className=\"text-gray-600 mb-6\">
            Start your first conversation to begin your art journey
          </p>
        </div>
      )}
    </div>
  );
}