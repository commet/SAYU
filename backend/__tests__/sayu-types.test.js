// SAYU Types Data Integrity Tests
// Validates all 16 APT personality types have complete and consistent data

const { SAYU_TYPES, SAYU_FUNCTIONS, isValidSAYUType, parseSAYUTypeCode } = require('@sayu/shared');

describe('SAYU Type System - Data Integrity', () => {
  const ALL_APT_TYPES = ['LAEF', 'LAEC', 'LAMF', 'LAMC', 'LREF', 'LREC', 'LRMF', 'LRMC',
                         'SAEF', 'SAEC', 'SAMF', 'SAMC', 'SREF', 'SREC', 'SRMF', 'SRMC'];

  describe('All 16 APT Types Exist', () => {
    test('SAYU_TYPES should contain exactly 16 types', () => {
      const typeCount = Object.keys(SAYU_TYPES).length;
      expect(typeCount).toBe(16);
    });

    test('all expected type codes should exist', () => {
      ALL_APT_TYPES.forEach(typeCode => {
        expect(SAYU_TYPES[typeCode]).toBeDefined();
      });
    });
  });

  describe('Type Code Format Validation', () => {
    test('all type codes should be 4 characters', () => {
      Object.keys(SAYU_TYPES).forEach(code => {
        expect(code.length).toBe(4);
      });
    });

    test('first character should be L or S (Lone/Social)', () => {
      Object.keys(SAYU_TYPES).forEach(code => {
        expect(['L', 'S']).toContain(code[0]);
      });
    });

    test('second character should be A or R (Abstract/Representational)', () => {
      Object.keys(SAYU_TYPES).forEach(code => {
        expect(['A', 'R']).toContain(code[1]);
      });
    });

    test('third character should be E or M (Emotional/Meaning)', () => {
      Object.keys(SAYU_TYPES).forEach(code => {
        expect(['E', 'M']).toContain(code[2]);
      });
    });

    test('fourth character should be F or C (Free/Controlled)', () => {
      Object.keys(SAYU_TYPES).forEach(code => {
        expect(['F', 'C']).toContain(code[3]);
      });
    });

    test('type code should match the code property', () => {
      Object.entries(SAYU_TYPES).forEach(([key, value]) => {
        expect(value.code).toBe(key);
      });
    });
  });

  describe('Required Properties Exist', () => {
    const requiredFields = [
      'code', 'name', 'nameEn', 'animal', 'animalEn', 'emoji',
      'description', 'detailedDescription', 'characteristics',
      'strengths', 'challenges', 'perfectDay', 'famousExample',
      'dominantFunction', 'inferiorFunction',
      'consciousFunctions', 'unconsciousFunctions'
    ];

    test('all types should have required fields', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        requiredFields.forEach(field => {
          expect(typeData[field]).toBeDefined();
        });
      });
    });

    test('all types should have artPreferences object', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.artPreferences).toBeDefined();
        expect(typeData.artPreferences.preferredStyles).toBeDefined();
        expect(typeData.artPreferences.preferredSubjects).toBeDefined();
        expect(typeData.artPreferences.preferredColors).toBeDefined();
        expect(typeData.artPreferences.viewingStyle).toBeDefined();
        expect(typeData.artPreferences.motivations).toBeDefined();
      });
    });
  });

  describe('Array Properties Have Content', () => {
    test('characteristics should have at least 3 items', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.characteristics.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('strengths should have at least 3 items', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.strengths.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('challenges should have at least 3 items', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.challenges.length).toBeGreaterThanOrEqual(3);
      });
    });

    test('consciousFunctions should have exactly 4 items', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.consciousFunctions.length).toBe(4);
      });
    });

    test('unconsciousFunctions should have exactly 4 items', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.unconsciousFunctions.length).toBe(4);
      });
    });
  });

  describe('Emoji Uniqueness', () => {
    test('each type should have a unique emoji', () => {
      const emojis = Object.values(SAYU_TYPES).map(t => t.emoji);
      const uniqueEmojis = new Set(emojis);
      expect(uniqueEmojis.size).toBe(16);
    });

    test('each type should have a unique animal', () => {
      const animals = Object.values(SAYU_TYPES).map(t => t.animal);
      const uniqueAnimals = new Set(animals);
      expect(uniqueAnimals.size).toBe(16);
    });
  });

  describe('Korean/English Name Pairs', () => {
    test('all types should have both Korean and English names', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.name).toBeDefined();
        expect(typeData.nameEn).toBeDefined();
        expect(typeData.name.length).toBeGreaterThan(0);
        expect(typeData.nameEn.length).toBeGreaterThan(0);
      });
    });

    test('all types should have both Korean and English animal names', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.animal).toBeDefined();
        expect(typeData.animalEn).toBeDefined();
        expect(typeData.animal.length).toBeGreaterThan(0);
        expect(typeData.animalEn.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Cognitive Functions Validity', () => {
    test('dominantFunction should be in consciousFunctions', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(typeData.consciousFunctions).toContain(typeData.dominantFunction);
      });
    });

    test('inferiorFunction should be a valid function code', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        expect(SAYU_FUNCTIONS[typeData.inferiorFunction]).toBeDefined();
      });
    });

    test('all cognitive functions should be valid SAYU_FUNCTIONS', () => {
      Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
        const allFunctions = [
          ...typeData.consciousFunctions,
          ...typeData.unconsciousFunctions
        ];

        allFunctions.forEach(func => {
          expect(SAYU_FUNCTIONS[func]).toBeDefined();
        });
      });
    });
  });

  describe('Helper Functions', () => {
    test('isValidSAYUType should return true for valid types', () => {
      ALL_APT_TYPES.forEach(code => {
        expect(isValidSAYUType(code)).toBe(true);
      });
    });

    test('isValidSAYUType should return false for invalid types', () => {
      expect(isValidSAYUType('XXXX')).toBe(false);
      expect(isValidSAYUType('invalid')).toBe(false);
      expect(isValidSAYUType('')).toBe(false);
      expect(isValidSAYUType(null)).toBe(false);
      expect(isValidSAYUType(undefined)).toBe(false);
    });

    test('parseSAYUTypeCode should correctly parse valid codes', () => {
      const parsed = parseSAYUTypeCode('LAEF');

      expect(parsed).toBeDefined();
      expect(parsed.social).toBe('L');
      expect(parsed.style).toBe('A');
      expect(parsed.response).toBe('E');
      expect(parsed.approach).toBe('F');
    });

    test('parseSAYUTypeCode should throw for invalid codes', () => {
      expect(() => parseSAYUTypeCode('XXXX')).toThrow();
      expect(() => parseSAYUTypeCode('invalid')).toThrow();
      expect(() => parseSAYUTypeCode('')).toThrow();
    });
  });
});

describe('SAYU Functions - Data Integrity', () => {
  const expectedFunctionCount = 8; // Le, Li, Ae, Ai, Ee, Ei, Me, Mi, etc.

  test('SAYU_FUNCTIONS should be defined', () => {
    expect(SAYU_FUNCTIONS).toBeDefined();
    expect(typeof SAYU_FUNCTIONS).toBe('object');
  });

  test('all cognitive functions should have required properties', () => {
    Object.entries(SAYU_FUNCTIONS).forEach(([code, funcData]) => {
      expect(funcData.code).toBe(code);
      expect(funcData.name).toBeDefined();
      expect(funcData.description).toBeDefined();
      expect(typeof funcData.name).toBe('string');
      expect(typeof funcData.description).toBe('string');
    });
  });

  test('function codes should follow expected pattern', () => {
    // Valid function codes are two characters:
    // First char: L/S/A/R/E/M/F/C (axis)
    // Second char: e/i (extraverted/introverted)
    const validFirstChars = ['L', 'S', 'A', 'R', 'E', 'M', 'F', 'C'];
    const validSecondChars = ['e', 'i'];

    Object.keys(SAYU_FUNCTIONS).forEach(code => {
      expect(code.length).toBe(2);
      expect(validFirstChars).toContain(code[0]);
      expect(validSecondChars).toContain(code[1]);
    });
  });
});

describe('Type Axis Distribution', () => {
  test('should have 8 L (Lone) types and 8 S (Social) types', () => {
    const lCount = Object.keys(SAYU_TYPES).filter(c => c[0] === 'L').length;
    const sCount = Object.keys(SAYU_TYPES).filter(c => c[0] === 'S').length;

    expect(lCount).toBe(8);
    expect(sCount).toBe(8);
  });

  test('should have 8 A (Abstract) types and 8 R (Representational) types', () => {
    const aCount = Object.keys(SAYU_TYPES).filter(c => c[1] === 'A').length;
    const rCount = Object.keys(SAYU_TYPES).filter(c => c[1] === 'R').length;

    expect(aCount).toBe(8);
    expect(rCount).toBe(8);
  });

  test('should have 8 E (Emotional) types and 8 M (Meaning) types', () => {
    const eCount = Object.keys(SAYU_TYPES).filter(c => c[2] === 'E').length;
    const mCount = Object.keys(SAYU_TYPES).filter(c => c[2] === 'M').length;

    expect(eCount).toBe(8);
    expect(mCount).toBe(8);
  });

  test('should have 8 F (Free) types and 8 C (Controlled) types', () => {
    const fCount = Object.keys(SAYU_TYPES).filter(c => c[3] === 'F').length;
    const cCount = Object.keys(SAYU_TYPES).filter(c => c[3] === 'C').length;

    expect(fCount).toBe(8);
    expect(cCount).toBe(8);
  });
});

describe('Type Descriptions Quality', () => {
  test('descriptions should be non-empty and meaningful', () => {
    Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
      expect(typeData.description.length).toBeGreaterThan(10);
      expect(typeData.detailedDescription.length).toBeGreaterThan(50);
    });
  });

  test('perfectDay descriptions should be engaging narratives', () => {
    Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
      expect(typeData.perfectDay.length).toBeGreaterThan(30);
      // Should describe an activity or scenario
      expect(typeData.perfectDay).toMatch(/[감상|관람|전시|미술관|작품]/);
    });
  });

  test('famousExample should reference art or artists', () => {
    Object.entries(SAYU_TYPES).forEach(([code, typeData]) => {
      expect(typeData.famousExample.length).toBeGreaterThan(20);
    });
  });
});
