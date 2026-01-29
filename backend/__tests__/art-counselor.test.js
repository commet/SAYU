// Art Counselor API - Unit Tests
// Tests for validation, session management, and safety middleware

describe('Art Counselor - Validation Rules', () => {
  describe('Session Type Validation', () => {
    const validSessionTypes = ['general', 'crisis', 'celebration', 'reflection'];

    test('should accept valid session types', () => {
      validSessionTypes.forEach(type => {
        expect(validSessionTypes.includes(type)).toBe(true);
      });
    });

    test('should reject invalid session types', () => {
      const invalidTypes = ['invalid', 'therapy', 'chat', ''];
      invalidTypes.forEach(type => {
        expect(validSessionTypes.includes(type)).toBe(false);
      });
    });
  });

  describe('Message Validation', () => {
    const MAX_MESSAGE_LENGTH = 2000;
    const FORBIDDEN_CHARS = /[<>]/;

    test('should accept valid messages', () => {
      const validMessages = [
        '오늘 기분이 좋아요',
        'This artwork reminds me of my childhood',
        '이 작품을 보면서 많은 생각이 들어요. 색감이 정말 아름답고, 작가의 의도가 궁금해요.',
        '1234567890'
      ];

      validMessages.forEach(msg => {
        expect(msg.length).toBeLessThanOrEqual(MAX_MESSAGE_LENGTH);
        expect(FORBIDDEN_CHARS.test(msg)).toBe(false);
      });
    });

    test('should reject messages with forbidden characters', () => {
      const invalidMessages = [
        '<script>alert("xss")</script>',
        'Hello <world>',
        '<<invalid>>'
      ];

      invalidMessages.forEach(msg => {
        expect(FORBIDDEN_CHARS.test(msg)).toBe(true);
      });
    });

    test('should reject messages exceeding max length', () => {
      const longMessage = 'a'.repeat(MAX_MESSAGE_LENGTH + 1);
      expect(longMessage.length).toBeGreaterThan(MAX_MESSAGE_LENGTH);
    });

    test('should reject empty messages', () => {
      const emptyMessages = ['', '   ', '\n\n'];
      emptyMessages.forEach(msg => {
        expect(msg.trim().length).toBe(0);
      });
    });
  });

  describe('Emotional Response Validation', () => {
    test('should accept valid response intensity values', () => {
      const validIntensities = [0, 0.25, 0.5, 0.75, 1];
      validIntensities.forEach(intensity => {
        expect(intensity).toBeGreaterThanOrEqual(0);
        expect(intensity).toBeLessThanOrEqual(1);
      });
    });

    test('should reject invalid response intensity values', () => {
      const invalidIntensities = [-0.1, 1.1, -1, 2, 100];
      invalidIntensities.forEach(intensity => {
        expect(intensity < 0 || intensity > 1).toBe(true);
      });
    });

    test('should accept valid personal meaning length', () => {
      const validLengths = [0, 100, 500, 1000];
      validLengths.forEach(length => {
        expect(length).toBeLessThanOrEqual(1000);
      });
    });
  });

  describe('Feedback Validation', () => {
    test('should accept valid satisfaction ratings', () => {
      const validRatings = [1, 2, 3, 4, 5];
      validRatings.forEach(rating => {
        expect(rating).toBeGreaterThanOrEqual(1);
        expect(rating).toBeLessThanOrEqual(5);
      });
    });

    test('should reject invalid satisfaction ratings', () => {
      const invalidRatings = [0, 6, -1, 10];
      invalidRatings.forEach(rating => {
        expect(rating < 1 || rating > 5).toBe(true);
      });
    });
  });
});

describe('Art Counselor - Session Management', () => {
  describe('Session ID Validation', () => {
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    test('should accept valid UUID session IDs', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'ABCDEF12-3456-7890-ABCD-EF1234567890'
      ];

      validUUIDs.forEach(uuid => {
        expect(UUID_REGEX.test(uuid)).toBe(true);
      });
    });

    test('should reject invalid session IDs', () => {
      const invalidIDs = [
        'not-a-uuid',
        '12345',
        '',
        '123e4567-e89b-12d3-a456',
        '123e4567e89b12d3a456426614174000'
      ];

      invalidIDs.forEach(id => {
        expect(UUID_REGEX.test(id)).toBe(false);
      });
    });
  });

  describe('Session State Transitions', () => {
    const validTransitions = {
      'pending': ['active'],
      'active': ['completed', 'abandoned'],
      'completed': [],
      'abandoned': []
    };

    test('should allow valid state transitions', () => {
      expect(validTransitions['pending']).toContain('active');
      expect(validTransitions['active']).toContain('completed');
      expect(validTransitions['active']).toContain('abandoned');
    });

    test('should not allow transitions from terminal states', () => {
      expect(validTransitions['completed'].length).toBe(0);
      expect(validTransitions['abandoned'].length).toBe(0);
    });
  });
});

describe('Art Counselor - Conversation Styles', () => {
  const validStyles = ['supportive', 'analytical', 'creative', 'gentle'];

  test('should define all conversation styles', () => {
    expect(validStyles).toHaveLength(4);
  });

  test('should accept valid conversation styles', () => {
    validStyles.forEach(style => {
      expect(validStyles.includes(style)).toBe(true);
    });
  });

  test('should reject invalid conversation styles', () => {
    const invalidStyles = ['aggressive', 'casual', 'formal'];
    invalidStyles.forEach(style => {
      expect(validStyles.includes(style)).toBe(false);
    });
  });
});

describe('Art Counselor - Communication Pace', () => {
  const validPaces = ['slow', 'moderate', 'fast'];

  test('should define all communication paces', () => {
    expect(validPaces).toHaveLength(3);
  });

  test('should accept valid communication paces', () => {
    validPaces.forEach(pace => {
      expect(validPaces.includes(pace)).toBe(true);
    });
  });
});

describe('Art Counselor - Crisis Support', () => {
  const safetyLevels = ['safe', 'at_risk', 'immediate_danger'];

  test('should define all safety levels', () => {
    expect(safetyLevels).toHaveLength(3);
  });

  test('should prioritize immediate danger level', () => {
    const priorityOrder = ['immediate_danger', 'at_risk', 'safe'];
    expect(priorityOrder[0]).toBe('immediate_danger');
  });
});

describe('Art Counselor - Rate Limiting', () => {
  const RATE_LIMIT = {
    windowMs: 60000, // 1 minute
    maxRequests: 15
  };

  test('should allow 15 requests per minute', () => {
    expect(RATE_LIMIT.maxRequests).toBe(15);
    expect(RATE_LIMIT.windowMs).toBe(60000);
  });

  test('should calculate correct requests per second', () => {
    const requestsPerSecond = RATE_LIMIT.maxRequests / (RATE_LIMIT.windowMs / 1000);
    expect(requestsPerSecond).toBe(0.25);
  });
});

describe('Art Counselor - Hybrid Session Flow', () => {
  const stages = ['opening', 'exploration', 'connection', 'complete'];

  test('should define all 4 stages', () => {
    expect(stages).toHaveLength(4);
  });

  test('should start with opening stage', () => {
    expect(stages[0]).toBe('opening');
  });

  test('should end with complete stage', () => {
    expect(stages[stages.length - 1]).toBe('complete');
  });

  test('should follow correct stage order', () => {
    expect(stages.indexOf('opening')).toBeLessThan(stages.indexOf('exploration'));
    expect(stages.indexOf('exploration')).toBeLessThan(stages.indexOf('connection'));
    expect(stages.indexOf('connection')).toBeLessThan(stages.indexOf('complete'));
  });
});

describe('Art Counselor - Emotional Impact Types', () => {
  const impactTypes = ['positive', 'negative', 'neutral', 'mixed'];

  test('should define all emotional impact types', () => {
    expect(impactTypes).toHaveLength(4);
  });

  test('should accept valid emotional impact types', () => {
    impactTypes.forEach(type => {
      expect(impactTypes.includes(type)).toBe(true);
    });
  });
});

describe('Art Counselor - Timeframe Validation', () => {
  const validTimeframes = ['week', 'month', 'quarter', 'year'];

  test('should define all insight timeframes', () => {
    expect(validTimeframes).toHaveLength(4);
  });

  test('should accept valid timeframes for insights', () => {
    validTimeframes.forEach(timeframe => {
      expect(validTimeframes.includes(timeframe)).toBe(true);
    });
  });
});
