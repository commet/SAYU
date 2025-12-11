// SAYU Quiz Background System - Dynamic Atmosphere Progression

export interface BackgroundPhase {
  questions: number[];
  backgrounds: string[];
  ambiance: string;
  overlay: {
    color: string;
    opacity: number;
  };
}

// Direct question-to-background mapping (1:1 exact matching)
export const questionBackgrounds: Record<number, string> = {
  1: '/images/backgrounds/modern-museum-entrance-stairs-crowded.jpg',
  2: '/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg',
  3: '/images/backgrounds/minimal-white-gallery-photography-bright.jpg',
  4: '/images/backgrounds/warm-gallery-abstract-art-casual-viewing.jpg',
  5: '/images/backgrounds/modern-staircase-natural-light-transition.jpg',
  6: '/images/backgrounds/dual-viewing-portraits-synchronized-black.jpg',
  7: '/images/backgrounds/modern-gallery-purple-infinity-child.jpg',
  8: '/images/backgrounds/neon-corridor-gradient-light-installation.jpg',
  9: '/images/backgrounds/back-view-landscape-painting-minimal.jpg',
  10: '/images/backgrounds/classical-gallery-floor-sitting-contemplation.jpg',
  11: '/images/backgrounds/bright-cafe-paper-lanterns-social-space.jpg',
  12: '/images/backgrounds/grand-baroque-hall-crowded-tourists.jpg',
  13: '/images/backgrounds/home-studio-abstract-art-warm-vintage.jpg',
  14: '/images/backgrounds/circular-atrium-overhead-view-busy.jpg',
  15: '/images/backgrounds/baroque-gallery-ornate-arches-historical.jpg'
};

export const backgroundProgression: Record<string, BackgroundPhase> = {
  phase1_outside: {
    questions: [1, 2],
    backgrounds: [
      '/images/backgrounds/modern-museum-entrance-stairs-crowded.jpg',
      '/images/backgrounds/stone-gallery-entrance-solitary-figure.jpg'
    ],
    ambiance: 'anticipation',
    overlay: {
      color: 'from-[hsl(var(--journey-dawn-cream)/0.3)] to-[hsl(var(--journey-dawn-peach)/0.4)]',
      opacity: 0.4
    }
  },
  phase2_inside: {
    questions: [3, 4, 5, 6, 7],
    backgrounds: [
      '/images/backgrounds/minimal-white-gallery-photography-bright.jpg',
      '/images/backgrounds/warm-gallery-abstract-art-casual-viewing.jpg',
      '/images/backgrounds/modern-staircase-natural-light-transition.jpg',
      '/images/backgrounds/dual-viewing-portraits-synchronized-black.jpg',
      '/images/backgrounds/modern-gallery-purple-infinity-child.jpg'
    ],
    ambiance: 'exploration',
    overlay: {
      color: 'from-[hsl(var(--journey-lavender)/0.3)] to-[hsl(var(--journey-dusty-rose)/0.4)]',
      opacity: 0.35
    }
  },
  phase3_deeper: {
    questions: [8, 9, 10],
    backgrounds: [
      '/images/backgrounds/neon-corridor-gradient-light-installation.jpg',
      '/images/backgrounds/back-view-landscape-painting-minimal.jpg',
      '/images/backgrounds/classical-gallery-floor-sitting-contemplation.jpg'
    ],
    ambiance: 'revelation',
    overlay: {
      color: 'from-[hsl(var(--journey-amber)/0.3)] to-[hsl(var(--journey-twilight)/0.4)]',
      opacity: 0.4
    }
  },
  phase4_shop: {
    questions: [11, 12],
    backgrounds: [
      '/images/backgrounds/bright-cafe-paper-lanterns-social-space.jpg',
      '/images/backgrounds/grand-baroque-hall-crowded-tourists.jpg'
    ],
    ambiance: 'selection',
    overlay: {
      color: 'from-[hsl(var(--journey-mauve)/0.3)] to-[hsl(var(--journey-dusty-rose)/0.4)]',
      opacity: 0.35
    }
  },
  phase5_personal: {
    questions: [13, 14, 15],
    backgrounds: [
      '/images/backgrounds/home-studio-abstract-art-warm-vintage.jpg',
      '/images/backgrounds/circular-atrium-overhead-view-busy.jpg',
      '/images/backgrounds/baroque-gallery-ornate-arches-historical.jpg'
    ],
    ambiance: 'integration',
    overlay: {
      color: 'from-[hsl(var(--journey-twilight)/0.4)] to-[hsl(var(--journey-midnight)/0.5)]',
      opacity: 0.45
    }
  }
};

export const getPhaseByQuestion = (questionNumber: number): string => {
  for (const [phase, data] of Object.entries(backgroundProgression)) {
    if (data.questions.includes(questionNumber)) {
      return phase;
    }
  }
  return 'phase2_inside';
};

export const getBackgroundForQuestion = (questionNumber: number): BackgroundPhase => {
  const phase = getPhaseByQuestion(questionNumber);
  return backgroundProgression[phase];
};

export const fallbackGradients = {
  phase1_outside: 'bg-gradient-to-br from-[hsl(var(--journey-dawn-cream))] via-[hsl(var(--journey-dawn-peach))] to-[hsl(var(--journey-dawn-blush))]',
  phase2_inside: 'bg-gradient-to-br from-[hsl(var(--journey-lavender))] via-[hsl(var(--gallery-white))] to-[hsl(var(--journey-dusty-rose))]',
  phase3_deeper: 'bg-gradient-to-br from-[hsl(var(--journey-amber))] via-[hsl(var(--journey-dusty-rose))] to-[hsl(var(--journey-mauve))]',
  phase4_shop: 'bg-gradient-to-br from-[hsl(var(--journey-mauve))] via-[hsl(var(--gallery-pearl))] to-[hsl(var(--journey-lavender))]',
  phase5_personal: 'bg-gradient-to-br from-[hsl(var(--journey-twilight))] via-[hsl(var(--journey-amber))] to-[hsl(var(--journey-midnight))]'
};

export const unsplashCollections = {
  museums: '1163637',
  architecture: '1885471',
  minimalist: '778914',
  artGalleries: '2203755'
};

export const imageRequirements = {
  dimensions: {
    width: 1920,
    height: 1080,
    aspectRatio: '16:9'
  },
  format: ['jpg', 'webp'],
  maxSize: '500KB',
  style: ['Natural lighting', 'Minimal people or empty', 'Professional quality', 'Warm, inviting tones', 'Not too busy or distracting']
};
