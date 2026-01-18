'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { getActivityTracker, ActivityType, trackActivityImmediate } from '@/lib/activity-tracker';
import { useAuthSelector, authSelectors } from '@/hooks/useAuth';

export interface TrackingOptions {
  immediate?: boolean; // Send immediately instead of batching
}

export function useActivityTracker() {
  // Selector pattern: only re-renders when user changes
  const user = useAuthSelector(authSelectors.user);
  const tracker = useMemo(() => getActivityTracker(), []);

  // Track generic activity
  const trackActivity = useCallback((
    type: ActivityType,
    target?: {
      id?: string;
      type?: string;
      title?: string;
      subtitle?: string;
      image?: string;
    },
    metadata?: Record<string, any>,
    options?: TrackingOptions
  ) => {
    if (!user) return; // Don't track if not authenticated

    const activity = {
      activity_type: type,
      target_id: target?.id,
      target_type: target?.type,
      target_title: target?.title,
      target_subtitle: target?.subtitle,
      target_image_url: target?.image,
      metadata
    };

    if (options?.immediate) {
      trackActivityImmediate(activity);
    } else {
      tracker.track(activity);
    }
  }, [tracker, user]);

  // Convenience methods for common activities
  const trackArtworkView = useCallback((artwork: {
    id: string;
    title: string;
    artist?: string;
    image?: string;
  }) => {
    if (!user) return;
    tracker.trackArtworkView(artwork);
  }, [tracker, user]);

  const trackExhibitionView = useCallback((exhibition: {
    id: string;
    title: string;
    venue?: string;
    image?: string;
  }) => {
    if (!user) return;
    tracker.trackExhibitionView(exhibition);
  }, [tracker, user]);

  const trackCollectionSave = useCallback((collection: {
    id: string;
    name: string;
    artworkCount?: number;
  }) => {
    if (!user) return;
    tracker.trackCollectionSave(collection);
  }, [tracker, user]);

  const trackQuizComplete = useCallback((
    quizType: string,
    result?: string
  ) => {
    if (!user) return;
    tracker.trackQuizComplete(quizType, result);
  }, [tracker, user]);

  const trackProfileView = useCallback(() => {
    if (!user) return;
    trackActivity('page_view', {
      id: 'profile',
      type: 'profile',
      title: 'Profile Page',
      subtitle: user.nickname || user.email || 'User Profile'
    }, { 
      page: 'profile',
      userId: user.id 
    }, { immediate: true });
  }, [trackActivity, user]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (tracker) {
        tracker.flush();
      }
    };
  }, [tracker]);

  return {
    trackActivity,
    trackArtworkView,
    trackExhibitionView,
    trackCollectionSave,
    trackQuizComplete,
    trackProfileView,
    // Expose queue size for debugging
    getQueueSize: () => tracker?.getQueueSize() || 0
  };
}

// Hook to fetch recent activities
import { useQuery } from '@tanstack/react-query';

export function useRecentActivities(limit: number = 20) {
  const user = useAuthSelector(authSelectors.user);

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['activities', 'recent', limit, user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/activities/recent?limit=${limit}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch activities');
      }

      return res.json();
    },
    enabled: !!user,
    refetchInterval: 60000,
    refetchOnWindowFocus: false,
    staleTime: 10000,
  });

  return {
    activities: data || [],
    isLoading,
    isError: !!error,
    refresh: refetch
  };
}

// Hook to fetch activity statistics
export function useActivityStats() {
  const user = useAuthSelector(authSelectors.user);

  const { data, error, isLoading } = useQuery({
    queryKey: ['activities', 'stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/activities/recent', {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      return res.json();
    },
    enabled: !!user,
    refetchInterval: 300000,
    refetchOnWindowFocus: false,
  });

  return {
    stats: data || { total: 0, byType: {} },
    isLoading,
    isError: !!error
  };
}