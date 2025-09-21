/**
 * SAYU Art Counselor - 간단한 API 테스트 서버
 * MVP 테스트를 위한 최소한의 Express 서버
 */

// 백엔드 환경변수 로드
require('dotenv').config({ path: './backend/.env' });

// 환경변수 매핑 (백엔드 → 프론트엔드 형식)
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.SUPABASE_URL;
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_KEY;

const express = require('express');
const cors = require('cors');

// Supabase 서비스 import
const supabaseArtService = require('./backend/src/services/supabaseArtService');

const app = express();
const PORT = 3009;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAYU Art Counselor API Test Server',
    timestamp: new Date().toISOString()
  });
});

// 모든 작품 조회
app.get('/api/art-counselor/artworks', async (req, res) => {
  try {
    console.log('📋 Fetching all artworks...');
    const artworks = await supabaseArtService.getAllArtworks();

    res.json({
      success: true,
      data: artworks,
      count: artworks.length
    });
  } catch (error) {
    console.error('❌ Error fetching artworks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 오늘의 작품 추천
app.get('/api/art-counselor/today', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '') || 'test-user-123';
    console.log(`🎯 Selecting daily artwork for user: ${userId}`);

    const result = await supabaseArtService.selectDailyArtwork(userId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error selecting daily artwork:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 작품 프레젠테이션 생성
app.get('/api/art-counselor/artwork/:artworkId/presentation', async (req, res) => {
  try {
    const { artworkId } = req.params;
    const userId = req.headers.authorization?.replace('Bearer ', '') || 'test-user-123';

    console.log(`🎨 Generating presentation for artwork: ${artworkId}`);

    const presentation = await supabaseArtService.generatePresentation(artworkId, userId);

    res.json({
      success: true,
      data: presentation
    });
  } catch (error) {
    console.error('❌ Error generating presentation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 저널 엔트리 저장 (스텁)
app.post('/api/art-counselor/journal', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '') || 'test-user-123';
    const { artworkId, entry } = req.body;

    console.log(`📝 Saving journal entry for user: ${userId}, artwork: ${artworkId}`);

    const result = await supabaseArtService.saveJournalEntry(userId, artworkId, entry);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Error saving journal:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 사용자 컬렉션 조회 (스텁)
app.get('/api/art-counselor/collection', async (req, res) => {
  try {
    const userId = req.headers.authorization?.replace('Bearer ', '') || 'test-user-123';
    const limit = parseInt(req.query.limit) || 20;

    console.log(`📚 Fetching collection for user: ${userId}`);

    const collection = await supabaseArtService.getUserCollection(userId, limit);

    res.json({
      success: true,
      data: collection
    });
  } catch (error) {
    console.error('❌ Error fetching collection:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 에러 핸들링
app.use((error, req, res, next) => {
  console.error('💥 Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log('🚀 SAYU Art Counselor Test Server Started!');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log('🎨 Available endpoints:');
  console.log('   GET  /health');
  console.log('   GET  /api/art-counselor/artworks');
  console.log('   GET  /api/art-counselor/today');
  console.log('   GET  /api/art-counselor/artwork/:id/presentation');
  console.log('   POST /api/art-counselor/journal');
  console.log('   GET  /api/art-counselor/collection');
  console.log('');
  console.log('✅ Ready for testing!');
});

module.exports = app;