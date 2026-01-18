'use client';

import { useState, useEffect } from 'react';
import type { PersonalityDescription } from '@/data/personality-descriptions';
import type { SAYUTypeCode } from '@/types/sayu-shared';

// Cache for loaded data
let personalityDescriptionsCache: Record<string, PersonalityDescription> | null = null;
let loadingPromise: Promise<Record<string, PersonalityDescription>> | null = null;

// Lazy load personality descriptions
async function loadPersonalityDescriptions(): Promise<Record<string, PersonalityDescription>> {
  if (personalityDescriptionsCache) {
    return personalityDescriptionsCache;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = import('@/data/personality-descriptions').then(module => {
    personalityDescriptionsCache = module.personalityDescriptions;
    return personalityDescriptionsCache;
  });

  return loadingPromise;
}

// Hook to get personality description for a specific type
export function usePersonalityDescription(type: SAYUTypeCode | string | null) {
  const [description, setDescription] = useState<PersonalityDescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    loadPersonalityDescriptions().then(descriptions => {
      if (!cancelled) {
        setDescription(descriptions[type] || null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [type]);

  return { description, loading };
}

// Hook to get all personality descriptions
export function useAllPersonalityDescriptions() {
  const [descriptions, setDescriptions] = useState<Record<string, PersonalityDescription> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    loadPersonalityDescriptions().then(data => {
      if (!cancelled) {
        setDescriptions(data);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { descriptions, loading };
}

// Preload function for critical paths
export function preloadPersonalityDescriptions() {
  loadPersonalityDescriptions();
}
