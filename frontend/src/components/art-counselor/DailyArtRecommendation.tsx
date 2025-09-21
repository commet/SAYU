'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Heart, Clock, Eye, MessageSquare } from 'lucide-react';

interface DailyArtRecommendationProps {
  userId: string;
  onStartSession: () => void;
}

interface ArtRecommendation {
  id: string;
  artwork_data: {
    title: string;
    artist: string;
    year?: number;
    imageUrl: string;
    description?: string;
  };
  recommendation_reason: string;
  therapeutic_goal: string;
  viewed: boolean;
}

export function DailyArtRecommendation({ userId, onStartSession }: DailyArtRecommendationProps) {
  const [recommendation, setRecommendation] = useState<ArtRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasViewed, setHasViewed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDailyRecommendation();
  }, [userId]);

  const loadDailyRecommendation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/art-counselor/daily-art', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setRecommendation(data.data);
        setHasViewed(data.data.viewed);
      } else {
        setError(data.message || 'Failed to load recommendation');
      }
    } catch (error) {
      console.error('Error loading daily recommendation:', error);
      setError('Failed to load daily art recommendation');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsViewed = async () => {
    if (!recommendation || hasViewed) return;

    try {
      await fetch(`/api/art-counselor/daily-art/${recommendation.id}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          interactionTimeSeconds: 10
        })
      });

      setHasViewed(true);
    } catch (error) {
      console.error('Error marking as viewed:', error);
    }
  };

  const handleDiscussArt = () => {
    markAsViewed();
    onStartSession();
  };

  if (isLoading) {
    return (
      <div className=\"bg-white rounded-xl shadow-lg p-6\">
        <div className=\"animate-pulse\">
          <div className=\"bg-gray-200 h-48 rounded-lg mb-4\"></div>
          <div className=\"h-4 bg-gray-200 rounded mb-2\"></div>
          <div className=\"h-4 bg-gray-200 rounded w-3/4\"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"bg-white rounded-xl shadow-lg p-6\">
        <div className=\"text-center py-8\">
          <Palette className=\"w-12 h-12 text-gray-400 mx-auto mb-4\" />
          <p className=\"text-gray-600 mb-4\">{error}</p>
          <button
            onClick={loadDailyRecommendation}
            className=\"px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors\"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className=\"bg-white rounded-xl shadow-lg p-6\">
        <div className=\"text-center py-8\">
          <Palette className=\"w-12 h-12 text-gray-400 mx-auto mb-4\" />
          <p className=\"text-gray-600\">No art recommendation available today</p>
        </div>
      </div>
    );
  }

  const { artwork_data } = recommendation;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className=\"bg-white rounded-xl shadow-lg overflow-hidden\"
    >
      {/* Art Image */}
      <div className=\"relative aspect-video bg-gray-100\">
        {artwork_data.imageUrl ? (
          <img
            src={artwork_data.imageUrl}
            alt={artwork_data.title}
            className=\"w-full h-full object-cover\"
            onLoad={markAsViewed}
          />
        ) : (
          <div className=\"w-full h-full flex items-center justify-center\">
            <Palette className=\"w-16 h-16 text-gray-400\" />
          </div>
        )}

        {/* Viewed indicator */}
        {hasViewed && (
          <div className=\"absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center\">
            <Eye className=\"w-3 h-3 mr-1\" />
            Viewed
          </div>
        )}
      </div>

      {/* Content */}
      <div className=\"p-6\">
        <div className=\"mb-4\">
          <h3 className=\"text-xl font-bold text-gray-900 mb-1\">{artwork_data.title}</h3>
          <p className=\"text-gray-600\">
            by {artwork_data.artist}
            {artwork_data.year && ` (${artwork_data.year})`}
          </p>
        </div>

        {/* Recommendation Reason */}
        <div className=\"mb-4\">
          <div className=\"flex items-center mb-2\">
            <Heart className=\"w-4 h-4 text-pink-500 mr-2\" />
            <span className=\"text-sm font-medium text-gray-700\">Why this artwork for you:</span>
          </div>
          <p className=\"text-sm text-gray-600 bg-pink-50 p-3 rounded-lg\">
            {recommendation.recommendation_reason}
          </p>
        </div>

        {/* Therapeutic Goal */}
        <div className=\"mb-6\">
          <div className=\"flex items-center mb-2\">
            <Clock className=\"w-4 h-4 text-blue-500 mr-2\" />
            <span className=\"text-sm font-medium text-gray-700\">Focus area:</span>
          </div>
          <span className=\"inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm\">
            {recommendation.therapeutic_goal.replace('_', ' ')}
          </span>
        </div>

        {/* Actions */}
        <div className=\"flex space-x-3\">
          <button
            onClick={handleDiscussArt}
            className=\"flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center\"
          >
            <MessageSquare className=\"w-4 h-4 mr-2\" />
            Discuss This Art
          </button>

          <button
            onClick={markAsViewed}
            className=\"px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors\"
          >
            <Eye className=\"w-4 h-4\" />
          </button>
        </div>

        {/* Description */}
        {artwork_data.description && (
          <div className=\"mt-4 pt-4 border-t border-gray-200\">
            <p className=\"text-sm text-gray-600\">{artwork_data.description}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}