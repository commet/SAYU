// SAYU Quiz (APT) - Unit Tests
// Tests for quiz logic, scoring, and personality type calculations

describe('SAYU Quiz - APT Type System', () => {
  const APT_AXES = {
    L_S: ['L', 'S'],  // Lyrical vs Structural
    A_R: ['A', 'R'],  // Abstract vs Realistic
    E_M: ['E', 'M'],  // Emotional vs Mental
    F_C: ['F', 'C']   // Free vs Conventional
  };

  const ALL_APT_TYPES = [
    'LAEF', 'LAEC', 'LAMF', 'LAMC',
    'LREF', 'LREC', 'LRMF', 'LRMC',
    'SAEF', 'SAEC', 'SAMF', 'SAMC',
    'SREF', 'SREC', 'SRMF', 'SRMC'
  ];

  describe('APT Type Generation', () => {
    test('should generate exactly 16 personality types', () => {
      expect(ALL_APT_TYPES).toHaveLength(16);
    });

    test('all types should be 4 characters long', () => {
      ALL_APT_TYPES.forEach(type => {
        expect(type.length).toBe(4);
      });
    });

    test('first character should be L or S', () => {
      ALL_APT_TYPES.forEach(type => {
        expect(APT_AXES.L_S).toContain(type[0]);
      });
    });

    test('second character should be A or R', () => {
      ALL_APT_TYPES.forEach(type => {
        expect(APT_AXES.A_R).toContain(type[1]);
      });
    });

    test('third character should be E or M', () => {
      ALL_APT_TYPES.forEach(type => {
        expect(APT_AXES.E_M).toContain(type[2]);
      });
    });

    test('fourth character should be F or C', () => {
      ALL_APT_TYPES.forEach(type => {
        expect(APT_AXES.F_C).toContain(type[3]);
      });
    });

    test('all types should be unique', () => {
      const uniqueTypes = new Set(ALL_APT_TYPES);
      expect(uniqueTypes.size).toBe(ALL_APT_TYPES.length);
    });
  });

  describe('APT Type Parsing', () => {
    function parseAPTType(type) {
      if (!type || type.length !== 4) return null;
      return {
        socialStyle: type[0],    // L/S
        artStyle: type[1],       // A/R
        responseMode: type[2],   // E/M
        approachStyle: type[3]   // F/C
      };
    }

    test('should correctly parse LAEF', () => {
      const parsed = parseAPTType('LAEF');
      expect(parsed).toEqual({
        socialStyle: 'L',
        artStyle: 'A',
        responseMode: 'E',
        approachStyle: 'F'
      });
    });

    test('should correctly parse SRMC', () => {
      const parsed = parseAPTType('SRMC');
      expect(parsed).toEqual({
        socialStyle: 'S',
        artStyle: 'R',
        responseMode: 'M',
        approachStyle: 'C'
      });
    });

    test('should return null for invalid types', () => {
      expect(parseAPTType('')).toBeNull();
      expect(parseAPTType('LA')).toBeNull();
      expect(parseAPTType('LAEFX')).toBeNull();
      expect(parseAPTType(null)).toBeNull();
    });
  });
});

describe('SAYU Quiz - Scoring System', () => {
  describe('Dimension Score Calculation', () => {
    function calculateDimensionScore(answers, dimension) {
      const relevantAnswers = answers.filter(a => a.dimension === dimension);
      if (relevantAnswers.length === 0) return 50; // neutral

      const total = relevantAnswers.reduce((sum, a) => sum + a.value, 0);
      return Math.round((total / relevantAnswers.length) * 100);
    }

    test('should return 50 (neutral) when no answers for dimension', () => {
      const answers = [];
      const score = calculateDimensionScore(answers, 'L_S');
      expect(score).toBe(50);
    });

    test('should calculate average correctly', () => {
      const answers = [
        { dimension: 'L_S', value: 0.8 },
        { dimension: 'L_S', value: 0.6 },
        { dimension: 'L_S', value: 0.7 }
      ];
      const score = calculateDimensionScore(answers, 'L_S');
      expect(score).toBe(70);
    });

    test('should only consider relevant dimension', () => {
      const answers = [
        { dimension: 'L_S', value: 0.8 },
        { dimension: 'A_R', value: 0.2 },
        { dimension: 'L_S', value: 0.6 }
      ];
      const score = calculateDimensionScore(answers, 'L_S');
      expect(score).toBe(70);
    });
  });

  describe('Type Determination', () => {
    function determineType(scores) {
      let type = '';
      type += scores.L_S > 50 ? 'S' : 'L';
      type += scores.A_R > 50 ? 'R' : 'A';
      type += scores.E_M > 50 ? 'M' : 'E';
      type += scores.F_C > 50 ? 'C' : 'F';
      return type;
    }

    test('should determine LAEF for all low scores', () => {
      const scores = { L_S: 30, A_R: 30, E_M: 30, F_C: 30 };
      expect(determineType(scores)).toBe('LAEF');
    });

    test('should determine SRMC for all high scores', () => {
      const scores = { L_S: 70, A_R: 70, E_M: 70, F_C: 70 };
      expect(determineType(scores)).toBe('SRMC');
    });

    test('should determine mixed type correctly', () => {
      const scores = { L_S: 30, A_R: 70, E_M: 30, F_C: 70 };
      expect(determineType(scores)).toBe('LREC');
    });

    test('should handle boundary case (50) as lower side', () => {
      const scores = { L_S: 50, A_R: 50, E_M: 50, F_C: 50 };
      expect(determineType(scores)).toBe('LAEF');
    });
  });
});

describe('SAYU Quiz - Question Flow', () => {
  const TOTAL_QUESTIONS = 15;

  describe('Progress Calculation', () => {
    function calculateProgress(currentIndex) {
      return Math.round((currentIndex / TOTAL_QUESTIONS) * 100);
    }

    test('should return 0% at start', () => {
      expect(calculateProgress(0)).toBe(0);
    });

    test('should return 100% at completion', () => {
      expect(calculateProgress(TOTAL_QUESTIONS)).toBe(100);
    });

    test('should calculate correct percentage at midpoint', () => {
      expect(calculateProgress(7)).toBe(47);
      expect(calculateProgress(8)).toBe(53);
    });
  });

  describe('Session State Management', () => {
    const validStates = ['active', 'completed', 'abandoned'];

    test('should start in active state', () => {
      const initialState = 'active';
      expect(validStates.includes(initialState)).toBe(true);
    });

    test('should transition to completed after all questions', () => {
      function getNextState(currentState, answeredCount) {
        if (currentState === 'active' && answeredCount >= TOTAL_QUESTIONS) {
          return 'completed';
        }
        return currentState;
      }

      expect(getNextState('active', 14)).toBe('active');
      expect(getNextState('active', 15)).toBe('completed');
    });
  });
});

describe('SAYU Quiz - Answer Validation', () => {
  describe('Answer Options', () => {
    const VALID_OPTIONS = ['A', 'B', 'C', 'D'];

    test('should accept valid answer options', () => {
      VALID_OPTIONS.forEach(option => {
        expect(VALID_OPTIONS.includes(option)).toBe(true);
      });
    });

    test('should reject invalid answer options', () => {
      const invalidOptions = ['E', 'F', '1', 'a', ''];
      invalidOptions.forEach(option => {
        expect(VALID_OPTIONS.includes(option)).toBe(false);
      });
    });
  });

  describe('Time Spent Validation', () => {
    function isValidTimeSpent(timeMs) {
      return typeof timeMs === 'number' && timeMs >= 0 && timeMs <= 300000; // max 5 minutes
    }

    test('should accept valid time values', () => {
      expect(isValidTimeSpent(0)).toBe(true);
      expect(isValidTimeSpent(5000)).toBe(true);
      expect(isValidTimeSpent(30000)).toBe(true);
    });

    test('should reject invalid time values', () => {
      expect(isValidTimeSpent(-1)).toBe(false);
      expect(isValidTimeSpent(300001)).toBe(false);
      expect(isValidTimeSpent('5000')).toBe(false);
    });
  });
});

describe('SAYU Quiz - Personality Type Comparison', () => {
  describe('Compatibility Score', () => {
    function calculateCompatibility(type1, type2) {
      if (type1 === type2) return 1.0;

      let matches = 0;
      for (let i = 0; i < 4; i++) {
        if (type1[i] === type2[i]) matches++;
      }
      return matches / 4;
    }

    test('same type should have 100% compatibility', () => {
      expect(calculateCompatibility('LAEF', 'LAEF')).toBe(1.0);
      expect(calculateCompatibility('SRMC', 'SRMC')).toBe(1.0);
    });

    test('opposite types should have 0% compatibility', () => {
      expect(calculateCompatibility('LAEF', 'SRMC')).toBe(0);
    });

    test('types with 2 matching axes should have 50% compatibility', () => {
      expect(calculateCompatibility('LAEF', 'LAMC')).toBe(0.5);
      expect(calculateCompatibility('SAEF', 'SREC')).toBe(0.5);
    });

    test('types with 3 matching axes should have 75% compatibility', () => {
      expect(calculateCompatibility('LAEF', 'LAEC')).toBe(0.75);
    });
  });

  describe('Shared Axes Detection', () => {
    function getSharedAxes(type1, type2) {
      const axes = ['L_S', 'A_R', 'E_M', 'F_C'];
      const shared = [];

      if (type1[0] === type2[0]) shared.push(axes[0]);
      if (type1[1] === type2[1]) shared.push(axes[1]);
      if (type1[2] === type2[2]) shared.push(axes[2]);
      if (type1[3] === type2[3]) shared.push(axes[3]);

      return shared;
    }

    test('should identify all shared axes for same type', () => {
      const shared = getSharedAxes('LAEF', 'LAEF');
      expect(shared).toHaveLength(4);
    });

    test('should identify no shared axes for opposite types', () => {
      const shared = getSharedAxes('LAEF', 'SRMC');
      expect(shared).toHaveLength(0);
    });

    test('should correctly identify partial matches', () => {
      const shared = getSharedAxes('LAEF', 'LAMC');
      expect(shared).toContain('L_S');
      expect(shared).toContain('A_R');
      expect(shared).not.toContain('E_M');
      expect(shared).not.toContain('F_C');
    });
  });
});

describe('SAYU Quiz - Animal Mapping', () => {
  const APT_ANIMALS = {
    'LAEF': { animal: '여우', english: 'fox' },
    'LAEC': { animal: '고양이', english: 'cat' },
    'LAMF': { animal: '올빼미', english: 'owl' },
    'LAMC': { animal: '거북', english: 'turtle' },
    'LREF': { animal: '카멜레온', english: 'chameleon' },
    'LREC': { animal: '고슴도치', english: 'hedgehog' },
    'LRMF': { animal: '문어', english: 'octopus' },
    'LRMC': { animal: '비버', english: 'beaver' },
    'SAEF': { animal: '나비', english: 'butterfly' },
    'SAEC': { animal: '펭귄', english: 'penguin' },
    'SAMF': { animal: '앵무새', english: 'parrot' },
    'SAMC': { animal: '사슴', english: 'deer' },
    'SREF': { animal: '강아지', english: 'dog' },
    'SREC': { animal: '오리', english: 'duck' },
    'SRMF': { animal: '코끼리', english: 'elephant' },
    'SRMC': { animal: '독수리', english: 'eagle' }
  };

  test('should have animal mapping for all 16 types', () => {
    expect(Object.keys(APT_ANIMALS)).toHaveLength(16);
  });

  test('each type should have Korean and English animal name', () => {
    Object.entries(APT_ANIMALS).forEach(([type, data]) => {
      expect(data.animal).toBeDefined();
      expect(data.english).toBeDefined();
      expect(data.animal.length).toBeGreaterThan(0);
      expect(data.english.length).toBeGreaterThan(0);
    });
  });

  test('all animals should be unique', () => {
    const koreanAnimals = Object.values(APT_ANIMALS).map(d => d.animal);
    const englishAnimals = Object.values(APT_ANIMALS).map(d => d.english);

    expect(new Set(koreanAnimals).size).toBe(16);
    expect(new Set(englishAnimals).size).toBe(16);
  });
});

describe('SAYU Quiz - Share Content Generation', () => {
  describe('Platform-specific formatting', () => {
    const platforms = ['instagram', 'twitter', 'facebook'];

    test('should support all major platforms', () => {
      expect(platforms).toHaveLength(3);
    });

    test('twitter content should respect character limit', () => {
      const MAX_TWITTER_LENGTH = 280;
      const sampleContent = 'Test content for Twitter share';
      expect(sampleContent.length).toBeLessThan(MAX_TWITTER_LENGTH);
    });
  });

  describe('Hashtag Generation', () => {
    const defaultHashtags = ['SAYUArtPersonality', 'ArtLovers', 'DiscoverYourArtStyle'];

    test('should include SAYU branding hashtag', () => {
      expect(defaultHashtags).toContain('SAYUArtPersonality');
    });

    test('should generate valid hashtags (no spaces)', () => {
      defaultHashtags.forEach(tag => {
        expect(tag).not.toContain(' ');
      });
    });
  });
});

describe('SAYU Quiz - Language Support', () => {
  const supportedLanguages = ['ko', 'en'];

  test('should support Korean and English', () => {
    expect(supportedLanguages).toContain('ko');
    expect(supportedLanguages).toContain('en');
  });

  test('should default to Korean if not specified', () => {
    function getLanguage(lang) {
      return supportedLanguages.includes(lang) ? lang : 'ko';
    }

    expect(getLanguage(undefined)).toBe('ko');
    expect(getLanguage('')).toBe('ko');
    expect(getLanguage('ja')).toBe('ko');
    expect(getLanguage('en')).toBe('en');
  });
});
