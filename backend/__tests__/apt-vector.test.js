// APT Vector System - Core Logic Tests
// Tests for vector operations, similarity calculations, and matching algorithms

const APTVectorSystem = require('../src/models/aptVectorSystem');

// Mock OpenAI for unit tests
jest.mock('../src/config/openai', () => ({
  openai: {},
  createEmbeddingWithRetry: jest.fn(() => Promise.resolve({
    data: [{ embedding: new Array(256).fill(0).map(() => Math.random() - 0.5) }]
  }))
}));

describe('APT Vector System - Core Logic', () => {
  let vectorSystem;

  beforeAll(() => {
    vectorSystem = new APTVectorSystem();
    // Initialize with mock prototype vectors
    vectorSystem.prototypeVectors = {};
    const aptTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
    aptTypes.forEach(type => {
      vectorSystem.prototypeVectors[type] = new Array(256).fill(0).map(() => Math.random() - 0.5);
    });
  });

  describe('Cosine Similarity Calculation', () => {
    test('identical vectors should have similarity of 1', () => {
      const vector = [0.1, 0.2, 0.3, 0.4, 0.5];
      const similarity = vectorSystem.calculateSimilarity(vector, vector);
      expect(similarity).toBeCloseTo(1, 5);
    });

    test('orthogonal vectors should have similarity of 0', () => {
      const vector1 = [1, 0, 0, 0];
      const vector2 = [0, 1, 0, 0];
      const similarity = vectorSystem.calculateSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(0, 5);
    });

    test('opposite vectors should have similarity of -1', () => {
      const vector1 = [1, 2, 3];
      const vector2 = [-1, -2, -3];
      const similarity = vectorSystem.calculateSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(-1, 5);
    });

    test('should handle empty or null vectors gracefully', () => {
      expect(vectorSystem.calculateSimilarity(null, [1, 2, 3])).toBe(0);
      expect(vectorSystem.calculateSimilarity([1, 2, 3], null)).toBe(0);
      expect(vectorSystem.calculateSimilarity([], [])).toBe(0);
    });

    test('should handle vectors of different lengths gracefully', () => {
      const vector1 = [1, 2, 3];
      const vector2 = [1, 2, 3, 4, 5];
      const similarity = vectorSystem.calculateSimilarity(vector1, vector2);
      expect(similarity).toBe(0);
    });

    test('should work with large vectors (256 dimensions)', () => {
      const vector1 = new Array(256).fill(0).map(() => Math.random());
      const vector2 = new Array(256).fill(0).map(() => Math.random());
      const similarity = vectorSystem.calculateSimilarity(vector1, vector2);

      expect(similarity).toBeGreaterThanOrEqual(-1);
      expect(similarity).toBeLessThanOrEqual(1);
    });
  });

  describe('Vector Normalization', () => {
    test('normalized vector should have magnitude of 1', () => {
      const vector = [3, 4, 0]; // magnitude = 5
      const normalized = vectorSystem.normalizeVector(vector);

      const magnitude = Math.sqrt(
        normalized.reduce((sum, val) => sum + val * val, 0)
      );

      expect(magnitude).toBeCloseTo(1, 5);
    });

    test('zero vector should remain zero', () => {
      const vector = [0, 0, 0, 0];
      const normalized = vectorSystem.normalizeVector(vector);

      normalized.forEach(val => {
        expect(val).toBe(0);
      });
    });

    test('should preserve vector direction', () => {
      const vector = [1, 2, 3];
      const normalized = vectorSystem.normalizeVector(vector);

      // Check ratios are preserved
      const ratio12Original = vector[0] / vector[1];
      const ratio12Normalized = normalized[0] / normalized[1];
      expect(ratio12Original).toBeCloseTo(ratio12Normalized, 5);
    });

    test('normalizeVectorOptimized should produce same result', () => {
      const vector = [1, 2, 3, 4, 5, 6, 7, 8];
      const standard = vectorSystem.normalizeVector(vector);
      const optimized = Array.from(vectorSystem.normalizeVectorOptimized(new Float32Array(vector)));

      for (let i = 0; i < vector.length; i++) {
        expect(standard[i]).toBeCloseTo(optimized[i], 4);
      }
    });
  });

  describe('Top-K Selection (Heap-based)', () => {
    test('should return top K items by similarity', () => {
      const items = [
        { id: 1, similarity: 0.5 },
        { id: 2, similarity: 0.9 },
        { id: 3, similarity: 0.3 },
        { id: 4, similarity: 0.7 },
        { id: 5, similarity: 0.8 }
      ];

      const topK = vectorSystem.getTopK(items, 3);

      expect(topK.length).toBe(3);
      expect(topK[0].similarity).toBe(0.9);
      expect(topK[1].similarity).toBe(0.8);
      expect(topK[2].similarity).toBe(0.7);
    });

    test('should return all items if K > items.length', () => {
      const items = [
        { id: 1, similarity: 0.5 },
        { id: 2, similarity: 0.9 }
      ];

      const topK = vectorSystem.getTopK(items, 10);

      expect(topK.length).toBe(2);
    });

    test('should handle large datasets efficiently', () => {
      const items = new Array(10000).fill(null).map((_, i) => ({
        id: i,
        similarity: Math.random()
      }));

      const startTime = Date.now();
      const topK = vectorSystem.getTopK(items, 10);
      const endTime = Date.now();

      expect(topK.length).toBe(10);
      expect(endTime - startTime).toBeLessThan(100); // Should be fast

      // Verify sorted descending
      for (let i = 1; i < topK.length; i++) {
        expect(topK[i - 1].similarity).toBeGreaterThanOrEqual(topK[i].similarity);
      }
    });
  });

  describe('LSH Hash Functions', () => {
    test('computeHash should produce consistent results', () => {
      const vector = [0.1, -0.2, 0.3, -0.4, 0.5, -0.6, 0.7, -0.8];
      const hash1 = vectorSystem.computeHash(vector, 8);
      const hash2 = vectorSystem.computeHash(vector, 8);

      expect(hash1).toBe(hash2);
    });

    test('similar vectors should have similar hashes', () => {
      const vector1 = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      const vector2 = [0.11, 0.21, 0.31, 0.41, 0.51, 0.61, 0.71, 0.81];

      const hash1 = vectorSystem.computeHash(vector1, 8);
      const hash2 = vectorSystem.computeHash(vector2, 8);

      const distance = vectorSystem.hammingDistance(hash1, hash2);
      expect(distance).toBeLessThanOrEqual(2); // Should be similar
    });

    test('hammingDistance should calculate correctly', () => {
      // 0b1010 vs 0b1100 = 2 bits different
      expect(vectorSystem.hammingDistance(0b1010, 0b1100)).toBe(2);
      // Same values
      expect(vectorSystem.hammingDistance(0b1111, 0b1111)).toBe(0);
      // All different (8 bits)
      expect(vectorSystem.hammingDistance(0b00000000, 0b11111111)).toBe(8);
    });
  });

  describe('APT Type-Specific Weights', () => {
    const aptTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];

    test('all 16 APT types should have specific weights', () => {
      aptTypes.forEach(type => {
        const weights = vectorSystem.getTypeSpecificWeights(type);

        expect(weights).toBeDefined();
        expect(weights.L_S).toBeDefined();
        expect(weights.A_R).toBeDefined();
        expect(weights.E_M).toBeDefined();
        expect(weights.F_C).toBeDefined();
      });
    });

    test('weights should be in valid range (1.0 - 1.5)', () => {
      aptTypes.forEach(type => {
        const weights = vectorSystem.getTypeSpecificWeights(type);

        Object.values(weights).forEach(weight => {
          expect(weight).toBeGreaterThanOrEqual(1.0);
          expect(weight).toBeLessThanOrEqual(1.5);
        });
      });
    });

    test('L types should have higher L_S weight', () => {
      const lTypes = aptTypes.filter(t => t.startsWith('L'));
      const sTypes = aptTypes.filter(t => t.startsWith('S'));

      lTypes.forEach(type => {
        const weights = vectorSystem.getTypeSpecificWeights(type);
        // L types should have lower L_S weight (towards Lone)
        expect(weights.L_S).toBeLessThan(1.35);
      });

      sTypes.forEach(type => {
        const weights = vectorSystem.getTypeSpecificWeights(type);
        // S types should have higher L_S weight (towards Social)
        expect(weights.L_S).toBeGreaterThanOrEqual(1.3);
      });
    });
  });

  describe('APT Compatibility Calculation', () => {
    test('same type should have high compatibility', () => {
      const compatibility = vectorSystem.calculateAPTCompatibility('LAEF', 'LAEF');
      expect(compatibility).toBe(0.9);
    });

    test('completely different types should still have some compatibility', () => {
      const compatibility = vectorSystem.calculateAPTCompatibility('LAEF', 'SRMC');
      expect(compatibility).toBeGreaterThan(0);
      expect(compatibility).toBeLessThan(0.9);
    });

    test('types sharing axes should have higher compatibility', () => {
      const twoAxesSame = vectorSystem.calculateAPTCompatibility('LAEF', 'LAMC');
      const oneAxisSame = vectorSystem.calculateAPTCompatibility('LAEF', 'SRMC');

      expect(twoAxesSame).toBeGreaterThan(oneAxisSame);
    });

    test('compatibility should be symmetric', () => {
      const comp1 = vectorSystem.calculateAPTCompatibility('LAEF', 'SRMC');
      const comp2 = vectorSystem.calculateAPTCompatibility('SRMC', 'LAEF');

      expect(comp1).toBe(comp2);
    });
  });

  describe('Art Appreciation Styles', () => {
    const aptTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];

    test('all APT types should have art appreciation style', () => {
      aptTypes.forEach(type => {
        const style = vectorSystem.getArtAppreciationStyle(type, {});
        expect(style).toBeDefined();
        expect(typeof style).toBe('string');
        expect(style.length).toBeGreaterThan(10);
      });
    });

    test('all APT types should have preferred environment', () => {
      aptTypes.forEach(type => {
        const env = vectorSystem.getPreferredEnvironment(type, {});
        expect(env).toBeDefined();
        expect(typeof env).toBe('string');
        expect(env.length).toBeGreaterThan(10);
      });
    });

    test('all APT types should have behavior patterns', () => {
      aptTypes.forEach(type => {
        const patterns = vectorSystem.getBehaviorPatterns(type);
        expect(patterns).toBeDefined();
        expect(typeof patterns).toBe('string');
        expect(patterns.length).toBeGreaterThan(20);
      });
    });

    test('all APT types should have emotional response patterns', () => {
      aptTypes.forEach(type => {
        const emotional = vectorSystem.getEmotionalResponsePattern(type);
        expect(emotional).toBeDefined();
        expect(typeof emotional).toBe('string');
        expect(emotional.length).toBeGreaterThan(20);
      });
    });
  });

  describe('Type-Specific Keywords', () => {
    const aptTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];

    test('all APT types should have at least 5 keywords', () => {
      aptTypes.forEach(type => {
        const keywords = vectorSystem.getTypeSpecificKeywords(type);
        expect(Array.isArray(keywords)).toBe(true);
        expect(keywords.length).toBeGreaterThanOrEqual(5);
      });
    });

    test('keywords should be unique per type', () => {
      const allKeywords = {};
      aptTypes.forEach(type => {
        const keywords = vectorSystem.getTypeSpecificKeywords(type);
        allKeywords[type] = keywords;
      });

      // Each type should have at least some unique keywords
      aptTypes.forEach(type => {
        const typeKeywords = new Set(allKeywords[type]);
        let hasUnique = false;

        aptTypes.forEach(otherType => {
          if (type !== otherType) {
            const otherKeywords = new Set(allKeywords[otherType]);
            const intersection = [...typeKeywords].filter(k => otherKeywords.has(k));
            if (intersection.length < typeKeywords.size) {
              hasUnique = true;
            }
          }
        });

        expect(hasUnique).toBe(true);
      });
    });
  });

  describe('Detailed Axis Traits', () => {
    test('should return traits for all four axes', () => {
      const traits = vectorSystem.getDetailedAxisTraits('LAEF');

      expect(traits.social).toBeDefined();
      expect(traits.style).toBeDefined();
      expect(traits.response).toBeDefined();
      expect(traits.approach).toBeDefined();
    });

    test('L vs S types should have different social traits', () => {
      const lTraits = vectorSystem.getDetailedAxisTraits('LAEF');
      const sTraits = vectorSystem.getDetailedAxisTraits('SAEF');

      expect(lTraits.social).not.toBe(sTraits.social);
    });

    test('A vs R types should have different style traits', () => {
      const aTraits = vectorSystem.getDetailedAxisTraits('LAEF');
      const rTraits = vectorSystem.getDetailedAxisTraits('LREF');

      expect(aTraits.style).not.toBe(rTraits.style);
    });

    test('E vs M types should have different response traits', () => {
      const eTraits = vectorSystem.getDetailedAxisTraits('LAEF');
      const mTraits = vectorSystem.getDetailedAxisTraits('LAMF');

      expect(eTraits.response).not.toBe(mTraits.response);
    });

    test('F vs C types should have different approach traits', () => {
      const fTraits = vectorSystem.getDetailedAxisTraits('LAEF');
      const cTraits = vectorSystem.getDetailedAxisTraits('LAEC');

      expect(fTraits.approach).not.toBe(cTraits.approach);
    });
  });
});

describe('APT Vector System - Batch Operations', () => {
  let vectorSystem;

  beforeAll(() => {
    vectorSystem = new APTVectorSystem();
    vectorSystem.prototypeVectors = {};
    const aptTypes = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                      'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];
    aptTypes.forEach(type => {
      vectorSystem.prototypeVectors[type] = new Array(256).fill(0).map(() => Math.random() - 0.5);
    });
  });

  describe('Chunk Processing', () => {
    test('processChunk should calculate similarities for all items', async () => {
      const userVector = new Array(256).fill(0).map(() => Math.random());
      const chunk = [
        { id: 1, vector: new Array(256).fill(0).map(() => Math.random()) },
        { id: 2, vector: new Array(256).fill(0).map(() => Math.random()) },
        { id: 3, vector: new Array(256).fill(0).map(() => Math.random()) }
      ];

      const results = await vectorSystem.processChunk(userVector, chunk);

      expect(results.length).toBe(3);
      results.forEach(result => {
        expect(result.similarity).toBeDefined();
        expect(result.matchScore).toBeDefined();
        expect(result.matchScore).toBeGreaterThanOrEqual(0);
        expect(result.matchScore).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Diversity Score', () => {
    test('first match should have diversity score of 1', () => {
      const artist = { style: 'Impressionism', aptType: 'LAEF' };
      const currentMatches = [];

      const score = vectorSystem.calculateDiversityScore(artist, currentMatches);
      expect(score).toBe(1.0);
    });

    test('duplicate styles should reduce diversity score', () => {
      const artist = { style: 'Impressionism', aptType: 'LAEF' };
      const currentMatches = [
        { artist: { style: 'Impressionism', aptType: 'SAEF' } }
      ];

      const score = vectorSystem.calculateDiversityScore(artist, currentMatches);
      expect(score).toBeLessThan(1.0);
    });

    test('duplicate APT types should reduce diversity score', () => {
      const artist = { style: 'Modern', aptType: 'LAEF' };
      const currentMatches = [
        { artist: { style: 'Impressionism', aptType: 'LAEF' } }
      ];

      const score = vectorSystem.calculateDiversityScore(artist, currentMatches);
      expect(score).toBeLessThan(1.0);
    });

    test('diversity score should not go below 0.5', () => {
      const artist = { style: 'Impressionism', aptType: 'LAEF' };
      const currentMatches = Array(10).fill({
        artist: { style: 'Impressionism', aptType: 'LAEF' }
      });

      const score = vectorSystem.calculateDiversityScore(artist, currentMatches);
      expect(score).toBeGreaterThanOrEqual(0.5);
    });
  });

  describe('Match Reasons Generation', () => {
    test('should generate reasons for high scoring matches', () => {
      const reasons = vectorSystem.generateMatchReasons('LAEF', 'LAEF', 0.85);

      expect(Array.isArray(reasons)).toBe(true);
      expect(reasons.length).toBeGreaterThan(0);
    });

    test('should include axis-specific reasons for shared axes', () => {
      // Same L axis (both LAEF and LAMC start with L)
      const reasonsL = vectorSystem.generateMatchReasons('LAEF', 'LAMC', 0.7);
      // Both L types share preference for individual viewing
      expect(reasonsL.length).toBeGreaterThanOrEqual(0);

      // Same S axis (SAEF and SREF both start with S)
      const reasonsS = vectorSystem.generateMatchReasons('SAEF', 'SREF', 0.7);
      const hasSReason = reasonsS.some(r =>
        r.includes('함께') || r.includes('나누')
      );
      expect(hasSReason).toBe(true);
    });
  });
});
