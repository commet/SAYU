/**
 * SAYU Art Counselor - Supabase 기반 서비스 (간소화)
 * 실제 DB 구조에 맞춘 안전한 버전
 */

const { createClient } = require('@supabase/supabase-js');

class SupabaseArtService {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
    );

    // 16가지 성격 유형별 추천 작품 매핑
    this.personalityRecommendations = {
      LAEF: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440013'],
      LAEC: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440005'],
      LAMF: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440016'],
      LAMC: ['550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010'],
      LREF: ['550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440008'],
      LREC: ['550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440009'],
      LRMF: ['550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013'],
      LRMC: ['550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440007'],
      SAEF: ['550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003'],
      SAEC: ['550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005'],
      SAMF: ['550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001'],
      SAMC: ['550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440012'],
      SREF: ['550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440011'],
      SREC: ['550e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440012'],
      SRMF: ['550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440016'],
      SRMC: ['550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440010']
    };
  }

  /**
   * 오늘의 작품 선정 (간소화 버전)
   */
  async selectDailyArtwork(userId) {
    try {
      // 기본 추천 로직 (사용자별 의사 랜덤)
      const userSeed = parseInt(userId.replace(/-/g, '').slice(0, 8), 16) || 1;
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);

      // 기본 추천 작품들
      const defaultArtworks = [
        '550e8400-e29b-41d4-a716-446655440001', // 별밤
        '550e8400-e29b-41d4-a716-446655440002', // 수련
        '550e8400-e29b-41d4-a716-446655440003', // 키스
        '550e8400-e29b-41d4-a716-446655440005', // 진주소녀
        '550e8400-e29b-41d4-a716-446655440008', // 씨름
        '550e8400-e29b-41d4-a716-446655440016'  // 인왕제색도
      ];

      const index = (userSeed + dayOfYear) % defaultArtworks.length;
      const selectedArtworkId = defaultArtworks[index];

      // 작품 정보 조회
      const { data: artwork, error } = await this.supabase
        .from('artworks')
        .select('*')
        .eq('id', selectedArtworkId)
        .single();

      if (error || !artwork) {
        return await this.getFallbackArtwork();
      }

      return {
        artworkId: selectedArtworkId,
        artwork: artwork
      };

    } catch (error) {
      console.error('Error selecting daily artwork:', error);
      return await this.getFallbackArtwork();
    }
  }

  /**
   * 작품 프레젠테이션 생성 (간소화 버전)
   */
  async generatePresentation(artworkId, userId) {
    try {
      const { data: artwork, error } = await this.supabase
        .from('artworks')
        .select('*')
        .eq('id', artworkId)
        .single();

      if (error || !artwork) {
        throw new Error(`Artwork ${artworkId} not found`);
      }

      // 간단한 프레젠테이션 구성
      const presentation = {
        visual: {
          imageUrl: artwork.image_url,
          title: artwork.title,
          artist: artwork.artist,
          metadata: artwork.metadata
        },
        content: {
          description: `${artwork.artist}의 작품 ${artwork.title}입니다.`,
          yearCreated: artwork.year_created,
          medium: artwork.medium,
          style: artwork.style
        }
      };

      return presentation;

    } catch (error) {
      console.error('Error generating presentation:', error);
      throw error;
    }
  }

  /**
   * 모든 작품 조회
   */
  async getAllArtworks() {
    try {
      const { data, error } = await this.supabase
        .from('artworks')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all artworks:', error);
      throw error;
    }
  }

  /**
   * 폴백 작품 (모네 수련)
   */
  async getFallbackArtwork() {
    const { data } = await this.supabase
      .from('artworks')
      .select('*')
      .eq('id', '550e8400-e29b-41d4-a716-446655440002')
      .single();

    return {
      artworkId: '550e8400-e29b-41d4-a716-446655440002',
      artwork: data || {
        id: '550e8400-e29b-41d4-a716-446655440002',
        title: '수련',
        artist: '클로드 모네'
      }
    };
  }

  // 기존 복잡한 기능들은 일단 스텁으로 처리
  async saveJournalEntry(userId, artworkId, entry) {
    return { id: 'temp', message: '기능 준비 중입니다.' };
  }

  async getUserCollection(userId, limit = 20) {
    return { entries: [], stats: { totalEntries: 0 } };
  }
}

module.exports = new SupabaseArtService();