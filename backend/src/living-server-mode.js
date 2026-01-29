// SAYU Living Identity Server Mode - Railway 배포용
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3005;

// 기본 미들웨어
app.use(express.json({ limit: '50mb' }));  // 이미지 base64를 위해 크기 증가
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: function(origin, callback) {
    // 개발 환경에서는 모든 origin 허용
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // 프로덕션 환경 - 구체적인 도메인 허용
    const allowedOrigins = [
      'https://sayu.vercel.app',
      'https://sayu-git-main.vercel.app',
      'https://sayu-*.vercel.app',
      'https://*.vercel.app',
      'https://sayu-production.up.railway.app',
      'https://*.railway.app',
      'https://www.sayu.my',
      'https://sayu.my'
    ];
    
    // origin이 허용된 패턴과 일치하는지 확인
    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern.includes('*')) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(origin);
      }
      return pattern === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // 24시간 캐시
}));

// 전역 rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 2000, // 더 많은 요청 허용
  message: { error: 'Too many requests from this IP' }
});
app.use(globalLimiter);

// ===========================================
// SAYU LIVING IDENTITY API ENDPOINTS
// ===========================================

// 홈 페이지 - 새로운 기능 소개
app.get('/', (req, res) => {
  res.json({
    service: 'SAYU Living Identity API',
    version: '2.0.0',
    status: 'running',
    lastUpdated: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    features: {
      immersiveQuiz: 'Visual A/B choice quiz with gradients',
      livingIdentityCard: 'Evolving identity cards with progression',
      villageSystem: '4 art viewing style clusters',
      tokenEconomy: 'Quiz retake tokens and daily rewards',
      cardExchange: 'Social identity card trading',
      evolutionTracking: 'Identity growth and change monitoring',
      dailyArtHabit: 'Daily art viewing habits with personalized recommendations'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mode: 'living',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Basic API endpoints for living mode
app.get('/api/personality-types', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, code: 'LAEF', name: 'Fox', description: 'Creative Explorer' },
      { id: 2, code: 'LAEC', name: 'Cat', description: 'Analytical Observer' }
      // Add more personality types as needed
    ]
  });
});

// Art Profile Routes
const artProfileRouter = require('../routes/art-profile');
app.use('/api/art-profile', artProfileRouter);

// Gamification V2 Routes (Supabase 기반)
const gamificationV2Routes = require('./routes/gamificationV2');
app.use('/api/gamification-v2', gamificationV2Routes);

// ===========================================
// QUIZ RESULTS API ENDPOINTS
// ===========================================

// In-memory storage for quiz results (for living mode)
const quizResultsStore = new Map();

// Save quiz results
app.post('/api/quiz/results', (req, res) => {
  try {
    const { personalityType, scores, responses, completedAt } = req.body;
    
    // Get user ID from auth token or generate guest ID
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const userId = token ? `user-${token.slice(-8)}` : `guest-${Date.now()}`;
    
    const result = {
      id: Date.now().toString(),
      userId,
      personalityType,
      scores,
      responses,
      completedAt: completedAt || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Store result (in real app, this would go to database)
    if (!quizResultsStore.has(userId)) {
      quizResultsStore.set(userId, []);
    }
    quizResultsStore.get(userId).push(result);
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error saving quiz results:', error);
    res.status(500).json({ error: 'Failed to save quiz results' });
  }
});

// Get user's quiz results
app.get('/api/quiz/results', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const userId = token ? `user-${token.slice(-8)}` : null;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const results = quizResultsStore.get(userId) || [];
    const latestResult = results[results.length - 1] || null;
    
    res.json({ 
      success: true, 
      data: {
        latest: latestResult,
        history: results
      }
    });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ error: 'Failed to fetch quiz results' });
  }
});

// ===========================================
// DAILY HABIT API ENDPOINTS - Living Mode Implementation
// ===========================================

// Simple auth middleware for living mode
const simpleAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  // In living mode, we'll accept any token for testing
  req.user = { userId: `demo-user-${token.slice(-8)}` };
  next();
};

// Daily Habit Settings
app.get('/api/daily-habit/settings', simpleAuth, (req, res) => {
  res.json({
    morningTime: '08:00',
    lunchTime: '12:30',
    nightTime: '22:00',
    morningEnabled: true,
    lunchEnabled: true,
    nightEnabled: true,
    pushEnabled: true,
    emailReminder: false,
    timezone: 'Asia/Seoul',
    activeDays: [1, 2, 3, 4, 5]
  });
});

app.put('/api/daily-habit/settings', simpleAuth, (req, res) => {
  const settings = req.body;
  res.json({
    ...settings,
    message: 'Settings updated successfully (Living Mode Demo)'
  });
});

// Today's Entry
app.get('/api/daily-habit/today', simpleAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.json({
    entry: {
      id: `demo-entry-${today}`,
      entry_date: today,
      morning_completed_at: null,
      lunch_completed_at: null,
      night_completed_at: null,
      daily_completion_rate: 0
    },
    streak: {
      current_streak: 3,
      longest_streak: 7,
      total_days: 15,
      last_activity_date: today,
      achieved_7_days: true,
      achieved_30_days: false,
      achieved_100_days: false
    }
  });
});

// Date Entry
app.get('/api/daily-habit/entry/:date', simpleAuth, (req, res) => {
  const { date } = req.params;
  res.json({
    id: `demo-entry-${date}`,
    entry_date: date,
    morning_completed_at: null,
    lunch_completed_at: null,
    night_completed_at: null,
    daily_completion_rate: 0
  });
});

// Record Activities
app.post('/api/daily-habit/morning', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    entry: {
      ...data,
      morning_completed_at: new Date().toISOString(),
      daily_completion_rate: 0.33
    },
    rewards: [],
    message: 'Morning activity recorded (Living Mode Demo)'
  });
});

app.post('/api/daily-habit/lunch', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    entry: {
      ...data,
      lunch_completed_at: new Date().toISOString(),
      daily_completion_rate: 0.66
    },
    rewards: [],
    message: 'Lunch activity recorded (Living Mode Demo)'
  });
});

app.post('/api/daily-habit/night', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    entry: {
      ...data,
      night_completed_at: new Date().toISOString(),
      daily_completion_rate: 1.0
    },
    rewards: [
      { type: 'badge', name: 'Daily Completionist', days: 1 }
    ],
    message: 'Night activity recorded (Living Mode Demo)'
  });
});

// Recommendations
app.get('/api/daily-habit/recommendation/:timeSlot', simpleAuth, (req, res) => {
  const { timeSlot } = req.params;

  const sampleArtworks = {
    morning: {
      id: 'demo-artwork-morning',
      title: 'Sunrise Over The Seine',
      artist_display_name: 'Claude Monet',
      primary_image_url: 'https://images.metmuseum.org/CRDImages/ep/original/DT1932.jpg',
      medium: 'Oil on canvas',
      date: '1897'
    },
    lunch: {
      id: 'demo-artwork-lunch',
      title: 'The Luncheon of the Boating Party',
      artist_display_name: 'Pierre-Auguste Renoir',
      primary_image_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Luncheon_of_the_Boating_Party.jpg',
      medium: 'Oil on canvas',
      date: '1880-1881'
    },
    night: {
      id: 'demo-artwork-night',
      title: 'The Starry Night',
      artist_display_name: 'Vincent van Gogh',
      primary_image_url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
      medium: 'Oil on canvas',
      date: '1889'
    }
  };

  const questions = {
    morning: '이 작품이 당신의 하루를 시작하는 색이라면?',
    lunch: '지금 이 순간, 이 작품과 어떤 감정을 나누고 싶나요?',
    night: '오늘 하루를 이 작품의 한 부분으로 표현한다면?'
  };

  res.json({
    artwork: sampleArtworks[timeSlot] || sampleArtworks.morning,
    question: questions[timeSlot] || questions.morning,
    timeSlot
  });
});

// Emotion Check-in
app.post('/api/daily-habit/emotion/checkin', simpleAuth, (req, res) => {
  const data = req.body;
  res.json({
    id: `demo-checkin-${Date.now()}`,
    user_id: req.user.userId,
    checkin_time: new Date().toISOString(),
    ...data,
    message: 'Emotion check-in recorded (Living Mode Demo)'
  });
});

// Push Notifications
app.post('/api/daily-habit/push/subscribe', simpleAuth, (req, res) => {
  res.json({
    message: '푸시 알림 구독 완료 (Living Mode Demo)',
    subscription: req.body
  });
});

app.post('/api/daily-habit/push/test', simpleAuth, (req, res) => {
  res.json({
    message: '테스트 알림 전송 완료 (Living Mode Demo)',
    results: [{ success: true, endpoint: 'demo-endpoint' }]
  });
});

// Statistics
app.get('/api/daily-habit/streak', simpleAuth, (req, res) => {
  res.json({
    streak: {
      current_streak: 5,
      longest_streak: 12,
      total_days: 25,
      last_activity_date: new Date().toISOString().split('T')[0],
      achieved_7_days: true,
      achieved_30_days: false,
      achieved_100_days: false
    },
    rewards: [
      { type: 'badge', name: '일주일의 예술가', days: 7 }
    ]
  });
});

app.get('/api/daily-habit/patterns', simpleAuth, (req, res) => {
  res.json([
    {
      day_of_week: 1,
      hour_of_day: 8,
      activity_count: 15,
      avg_completion_time: 180,
      last_activity: new Date().toISOString()
    },
    {
      day_of_week: 1,
      hour_of_day: 12,
      activity_count: 12,
      avg_completion_time: 300,
      last_activity: new Date().toISOString()
    }
  ]);
});

app.get('/api/daily-habit/stats/:year/:month', simpleAuth, (req, res) => {
  const { year, month } = req.params;
  res.json({
    total_days: 30,
    active_days: 22,
    perfect_days: 8,
    avg_completion_rate: 0.73,
    unique_artworks_viewed: 66
  });
});

// ===========================================
// EXHIBITIONS API ENDPOINTS (Living Mode Demo)
// ===========================================

// Demo exhibition data
const demoExhibitions = [
  {
    id: 'demo-exhibition-1',
    title: '한국 현대미술의 새로운 시선',
    venue_name: '국립현대미술관 서울관',
    venue_city: '서울',
    start_date: '2024-01-15',
    end_date: '2024-04-30',
    description: '한국 현대미술의 다양한 표현 양식과 새로운 시각을 제시하는 특별전시입니다.',
    tags: ['현대미술', '한국', '회화', '조각'],
    status: 'ongoing',
    like_count: 45,
    view_count: 1250,
    admission_fee: 8000,
    venues: {
      name: '국립현대미술관 서울관',
      city: '서울',
      website: 'https://www.mmca.go.kr'
    }
  },
  {
    id: 'demo-exhibition-2',
    title: '부산, 바다와 예술의 만남',
    venue_name: '부산시립미술관',
    venue_city: '부산',
    start_date: '2024-02-01',
    end_date: '2024-05-15',
    description: '부산의 해양 문화와 예술이 어우러진 특별 기획전시입니다.',
    tags: ['해양', '부산', '설치미술', '미디어아트'],
    status: 'ongoing',
    like_count: 32,
    view_count: 890,
    admission_fee: 5000,
    venues: {
      name: '부산시립미술관',
      city: '부산',
      website: 'https://art.busan.go.kr'
    }
  },
  {
    id: 'demo-exhibition-3',
    title: 'Digital Art Revolution',
    venue_name: 'D Museum',
    venue_city: '서울',
    start_date: '2024-03-01',
    end_date: '2024-06-30',
    description: '디지털 기술과 예술의 융합을 통한 새로운 예술 경험을 제안합니다.',
    tags: ['디지털아트', '인터렉티브', '뉴미디어'],
    status: 'upcoming',
    like_count: 78,
    view_count: 2100,
    admission_fee: 12000,
    venues: {
      name: 'D Museum',
      city: '서울',
      website: 'https://dmuseum.co.kr'
    }
  }
];

// Get exhibitions
app.get('/api/exhibitions', (req, res) => {
  const { limit = 50, status, city } = req.query;

  let exhibitions = [...demoExhibitions];

  // Apply filters
  if (status) {
    exhibitions = exhibitions.filter(ex => ex.status === status);
  }

  if (city) {
    exhibitions = exhibitions.filter(ex => ex.venue_city.toLowerCase() === city.toLowerCase());
  }

  // Limit results
  exhibitions = exhibitions.slice(0, parseInt(limit));

  res.json({
    success: true,
    data: exhibitions,
    total: exhibitions.length
  });
});

// Get single exhibition
app.get('/api/exhibitions/:id', (req, res) => {
  const { id } = req.params;

  const exhibition = demoExhibitions.find(ex => ex.id === id);

  if (!exhibition) {
    return res.status(404).json({
      success: false,
      error: 'Exhibition not found'
    });
  }

  res.json({
    success: true,
    data: exhibition
  });
});

// ===========================================
// VENUE API ENDPOINTS (Living Mode Demo)
// ===========================================

// Demo venue data
const demoVenues = [
  {
    id: '1',
    name: 'National Museum of Modern and Contemporary Art, Seoul',
    name_ko: '국립현대미술관 서울관',
    name_en: 'National Museum of Modern and Contemporary Art, Seoul',
    city: 'Seoul',
    city_ko: '서울',
    city_en: 'Seoul',
    country: 'South Korea',
    venue_type: 'museum',
    tier: 1,
    rating: 4.5,
    review_count: 123,
    latitude: 37.5665,
    longitude: 126.9780,
    address: '30 Samcheong-ro, Jongno-gu, Seoul',
    address_ko: '서울특별시 종로구 삼청로 30',
    description: 'National Museum of Modern and Contemporary Art, Seoul branch, located in the heart of Seoul showcasing contemporary Korean and international art.',
    description_ko: '서울 중심부에 위치한 국립현대미술관 서울관, 한국과 국제 현대미술을 전시',
    phone: '02-3701-9500',
    website: 'https://www.mmca.go.kr',
    google_maps_uri: 'https://maps.google.com/?q=37.5665,126.9780',
    opening_hours: {
      'tuesday': '10:00-18:00',
      'wednesday': '10:00-18:00',
      'thursday': '10:00-18:00',
      'friday': '10:00-21:00',
      'saturday': '10:00-18:00',
      'sunday': '10:00-18:00'
    }
  },
  {
    id: '2',
    name: 'Busan Museum of Art',
    name_ko: '부산시립미술관',
    name_en: 'Busan Museum of Art',
    city: 'Busan',
    city_ko: '부산',
    city_en: 'Busan',
    country: 'South Korea',
    venue_type: 'museum',
    tier: 2,
    rating: 4.2,
    review_count: 87,
    latitude: 35.1796,
    longitude: 129.0756,
    address: '58 APEC-ro, Haeundae-gu, Busan',
    address_ko: '부산광역시 해운대구 APEC로 58',
    description: 'Busan Museum of Art, the premier art museum in Korea\'s second largest city, featuring diverse contemporary exhibitions.',
    description_ko: '한국 제2도시 부산의 대표 미술관으로 다양한 현대미술 전시',
    phone: '051-744-2602',
    website: 'https://art.busan.go.kr',
    google_maps_uri: 'https://maps.google.com/?q=35.1796,129.0756'
  }
];

// Get venues with search and filters
app.get('/api/venues', (req, res) => {
  const { search, city, country, type, lang = 'ko', page = 1, limit = 20 } = req.query;

  let venues = [...demoVenues];

  // Apply filters
  if (search) {
    venues = venues.filter(v =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.name_ko?.toLowerCase().includes(search.toLowerCase()) ||
      v.city.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (city) {
    venues = venues.filter(v => v.city.toLowerCase() === city.toLowerCase());
  }

  if (country) {
    venues = venues.filter(v => v.country.toLowerCase() === country.toLowerCase());
  }

  if (type) {
    venues = venues.filter(v => v.venue_type === type);
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedVenues = venues.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedVenues,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: venues.length,
      totalPages: Math.ceil(venues.length / limit),
      hasNext: endIndex < venues.length,
      hasPrev: page > 1
    },
    language: lang
  });
});

// Get single venue
app.get('/api/venues/:id', (req, res) => {
  const { id } = req.params;
  const { lang = 'ko' } = req.query;

  const venue = demoVenues.find(v => v.id === id);

  if (!venue) {
    return res.status(404).json({
      success: false,
      error: 'Venue not found'
    });
  }

  res.json({
    success: true,
    data: venue,
    language: lang
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Living server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===========================================
// ARTVEE API ENDPOINTS (Living Mode) - TEMPORARILY DISABLED FOR DEBUGGING
// ===========================================

// Import cloudinary service directly (temporarily disabled for debugging)
// const cloudinaryArtveeService = require('./services/cloudinaryArtveeService');

/*
// Artvee random artworks
app.get('/api/artvee/random', (req, res) => {
  cloudinaryArtveeService.getRandomArtworks(parseInt(req.query.limit) || 10)
    .then(artworks => {
      res.json({
        success: true,
        data: artworks,
        count: artworks.length
      });
    })
    .catch(error => {
      console.error('Artvee random error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
});

// Artvee images (general endpoint)
app.get('/api/artvee/images', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  cloudinaryArtveeService.getRandomArtworks(limit)
    .then(artworks => {
      res.json({
        success: true,
        data: artworks,
        count: artworks.length
      });
    })
    .catch(error => {
      console.error('Artvee images error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
});

// Artvee by personality type
app.get('/api/artvee/personality/:type', (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 10;
  const { emotionFilter } = req.query;

  cloudinaryArtveeService.getArtworksForPersonality(type, { limit, emotionFilter })
    .then(artworks => {
      res.json({
        success: true,
        data: artworks,
        personality_type: type,
        count: artworks.length
      });
    })
    .catch(error => {
      console.error('Artvee personality error:', error);
      res.status(500).json({ success: false, error: error.message });
    });
});
*/

// ===========================================
// USER MATCHING API ENDPOINTS (Living Mode Demo)
// ===========================================

// Demo users data for matching
const demoUsers = [
  {
    id: '1',
    nickname: 'ArtLover123',
    age: 28,
    user_purpose: 'dating',
    type_code: 'LAEF',
    archetype_name: 'Creative Fox',
    generated_image_url: 'https://picsum.photos/150/150?random=1'
  },
  {
    id: '2',
    nickname: 'FamilyArt',
    age: 35,
    user_purpose: 'family',
    type_code: 'LAEC',
    archetype_name: 'Wise Cat',
    generated_image_url: 'https://picsum.photos/150/150?random=2'
  },
  {
    id: '3',
    nickname: 'SocialBee',
    age: 26,
    user_purpose: 'social',
    type_code: 'CAEF',
    archetype_name: 'Social Butterfly',
    generated_image_url: 'https://picsum.photos/150/150?random=3'
  },
  {
    id: '4',
    nickname: 'ArtCurator',
    age: 42,
    user_purpose: 'professional',
    type_code: 'CAEC',
    archetype_name: 'Art Expert',
    generated_image_url: 'https://picsum.photos/150/150?random=4'
  },
  {
    id: '5',
    nickname: 'Explorer99',
    age: 24,
    user_purpose: 'exploring',
    type_code: 'LBEF',
    archetype_name: 'Curious Explorer',
    generated_image_url: 'https://picsum.photos/150/150?random=5'
  }
];

// Get compatible users
app.get('/api/matching/compatible', simpleAuth, (req, res) => {
  const { purpose } = req.query;
  const targetPurpose = purpose || 'exploring';

  let compatibleUsers = demoUsers.filter(user => user.id !== req.user.userId);

  // Simple purpose-based filtering
  if (targetPurpose !== 'exploring') {
    compatibleUsers = compatibleUsers.filter(user => {
      switch (targetPurpose) {
        case 'dating':
          return user.user_purpose === 'dating';
        case 'family':
          return ['family', 'social'].includes(user.user_purpose);
        case 'professional':
          return ['professional', 'exploring'].includes(user.user_purpose);
        case 'social':
          return ['social', 'exploring', 'family'].includes(user.user_purpose);
        default:
          return true;
      }
    });
  }

  res.json({
    purpose: targetPurpose,
    users: compatibleUsers,
    total: compatibleUsers.length
  });
});

// Get users by specific purpose
app.get('/api/matching/purpose/:purpose', simpleAuth, (req, res) => {
  const { purpose } = req.params;

  const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
  if (!validPurposes.includes(purpose)) {
    return res.status(400).json({ error: 'Invalid purpose' });
  }

  const filteredUsers = demoUsers.filter(user =>
    user.id !== req.user.userId && user.user_purpose === purpose
  );

  res.json({
    purpose,
    users: filteredUsers,
    total: filteredUsers.length
  });
});

// Update user purpose
app.patch('/api/auth/purpose', simpleAuth, (req, res) => {
  const { userPurpose } = req.body;

  if (!userPurpose) {
    return res.status(400).json({ error: 'User purpose is required' });
  }

  const validPurposes = ['exploring', 'dating', 'social', 'family', 'professional'];
  if (!validPurposes.includes(userPurpose)) {
    return res.status(400).json({ error: 'Invalid user purpose' });
  }

  res.json({
    message: 'User purpose updated successfully',
    userPurpose
  });
});

// ===========================================
// CHATBOT API ENDPOINTS - Simple Implementation
// ===========================================

// Import the actual chatbot service
let chatbotService;
try {
  chatbotService = require('./services/chatbotService');
  console.log('✅ Chatbot service loaded successfully');
} catch (error) {
  console.error('❌ Failed to load chatbot service:', error.message);
  chatbotService = null;
}

// Real chatbot endpoint using Gemini API
app.post('/api/chatbot/message', async (req, res) => {
  try {
    const { message, artworkId, artwork, pageContext, personalityType } = req.body;
    
    // Use a default user ID for living mode
    const userId = req.headers['x-user-id'] || 'guest-' + Date.now();
    const userType = personalityType || 'LAEF';
    
    // If chatbot service is available, use it
    if (chatbotService && chatbotService.processMessage) {
      const result = await chatbotService.processMessage(
        userId,
        message,
        artwork || { 
          id: artworkId || 'unknown',
          title: 'Unknown Artwork',
          artist: 'Unknown Artist',
          year: 2024
        },
        userType
      );
      
      res.json({
        success: true,
        data: {
          response: result.message,
          sessionId: result.sessionId || `session-${Date.now()}`,
          suggestions: result.suggestions,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      // Fallback to simple responses if service not available
      let response = `"${message}"에 대해 생각해보고 있어요... SAYU는 계속 발전하고 있답니다! 🌟`;
      
      res.json({
        success: true,
        data: {
          response,
          sessionId: `session-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Chatbot service temporarily unavailable',
      fallbackResponse: '잠시 후 다시 시도해주세요 💫' 
    });
  }
});

// ===========================================
// ART COUNSELOR HYBRID API ENDPOINTS (Simplified)
// ===========================================

// Demo artwork data
const demoArtworks = {
  'kitchen-scene-7': {
    id: 'kitchen-scene-7',
    title: 'Kitchen Scene',
    artist: 'Unknown Artist',
    year: '19th Century'
  },
  'starry-night': {
    id: 'starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889'
  }
};

// Opening messages by personality
const openingMessages = {
  LRMC: '이 작품 앞에 서니 어떤 생각이 드시나요? 천천히 감상해보세요.',
  LAEF: '와, 이 작품이 눈에 들어왔군요! 첫인상이 어떠세요?',
  SAEF: '함께 이 작품을 보게 되어 기뻐요! 어떤 느낌이 드시나요?',
  default: '이 작품과 함께하는 시간이에요. 지금 어떤 느낌이 드시나요?'
};

// Hybrid Opening
app.get('/api/art-counselor/hybrid/opening/:artworkId/:personality', (req, res) => {
  const { artworkId, personality } = req.params;

  const artwork = demoArtworks[artworkId] || {
    id: artworkId,
    title: 'Unknown Artwork',
    artist: 'Unknown Artist',
    year: ''
  };

  const message = openingMessages[personality] || openingMessages.default;

  res.json({
    success: true,
    data: {
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      artworkArtist: artwork.artist,
      artworkYear: artwork.year,
      personality,
      emoji: '🎨',
      message,
      stage: 'opening',
      options: [
        { id: 'calm', label: '차분하고 평화로운 느낌이에요', tone: 'gentle' },
        { id: 'curious', label: '무언가 탐구하고 싶어지는 느낌이에요', tone: 'curious' },
        { id: 'nostalgic', label: '과거의 기억이 떠올라요', tone: 'grounding' },
        { id: 'free_input', label: '다른 느낌이에요', tone: 'playful' }
      ]
    }
  });
});

// Hybrid Exploration
app.post('/api/art-counselor/hybrid/exploration', express.json(), (req, res) => {
  const { artworkId, personality, userSelection, freeText, sessionId } = req.body;

  const explorationResponses = {
    calm: '평화로움을 느끼셨군요. 작품 속 어떤 요소가 특히 그런 안정감을 주었나요?',
    curious: '호기심이 생기셨네요. 작품에서 더 알고 싶은 부분이 있다면 무엇인가요?',
    nostalgic: '과거의 기억과 연결되셨군요. 어떤 시간이나 장소가 떠오르셨나요?',
    free_input: freeText
      ? `"${freeText}"라고 느끼셨군요. 그 감정을 조금 더 자세히 이야기해주실 수 있나요?`
      : '직접 표현해주셔서 감사해요. 더 깊이 탐색해볼까요?'
  };

  const message = explorationResponses[userSelection] || explorationResponses.free_input;

  res.json({
    success: true,
    data: {
      artworkId,
      personality,
      stage: 'connection',
      message,
      method: 'exploration',
      options: [
        { id: 'deeper', label: '더 깊이 느껴보고 싶어요', tone: 'curious' },
        { id: 'connect', label: '제 경험과 연결해보고 싶어요', tone: 'grounding' },
        { id: 'free_input', label: '다른 이야기를 해볼게요', tone: 'playful' }
      ]
    }
  });
});

// Hybrid Connection
app.post('/api/art-counselor/hybrid/connection', express.json(), (req, res) => {
  const { artworkId, personality, userInput, sessionId } = req.body;

  const message = userInput && userInput.length > 0
    ? `나눠주신 이야기가 참 의미있네요. "${userInput.substring(0, 50)}${userInput.length > 50 ? '...' : ''}" - 이 감정과 경험이 오늘 이 작품과 만나게 된 것 같아요.`
    : '오늘의 감상이 당신에게 의미있는 시간이었기를 바라요.';

  res.json({
    success: true,
    data: {
      artworkId,
      personality,
      stage: 'connection',
      message,
      method: 'connection'
    }
  });
});

// Hybrid Complete
app.post('/api/art-counselor/hybrid/complete', express.json(), (req, res) => {
  const { artworkId, personality, sessionId } = req.body;

  res.json({
    success: true,
    data: {
      journalId: `journal-${Date.now()}`,
      summary: '오늘 작품과 함께한 시간이 의미있었기를 바랍니다. 당신의 감정과 생각을 작품과 연결하며 새로운 시각을 발견하셨네요.',
      artworkTitle: 'Artwork',
      createdAt: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found in living mode' });
});

// Start server
console.log(`🔵 Attempting to start server on port ${PORT}...`);
app.listen(PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error('🔴 Failed to start server:', err);
    process.exit(1);
  }
  console.log(`🎨 SAYU Living Identity Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🏘️ Village System: Active`);
  console.log(`🪙 Token Economy: Active`);
  console.log(`🔄 Evolution Tracking: Active`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
}).on('error', (error) => {
  console.error('🔴 Server error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
