const express = require('express');
const router = express.Router();
const ExhibitionEnricher = require('../../services/exhibitionEnricher');
const { createClient } = require('@supabase/supabase-js');

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * 전시 데이터 보강 API 엔드포인트
 */

// 진행 중인 보강 작업들을 추적하기 위한 메모리 저장소
const activeBatches = new Map();

/**
 * POST /api/exhibitions/enrich/start
 * 전시 데이터 보강 배치 작업 시작
 */
router.post('/start', async (req, res) => {
  try {
    const { 
      batchSize = 10, 
      maxBatches = 5, 
      batchName,
      forceReenrich = false 
    } = req.body;

    // 배치 이름 생성
    const finalBatchName = batchName || `auto_batch_${Date.now()}`;
    
    // 중복 실행 방지
    if (activeBatches.has(finalBatchName)) {
      return res.status(409).json({
        success: false,
        message: '이미 실행 중인 배치가 있습니다.',
        batchName: finalBatchName
      });
    }

    // 데이터베이스에 배치 작업 기록
    const { data: batchRecord, error: batchError } = await supabase
      .from('data_enrichment_batches')
      .insert({
        batch_name: finalBatchName,
        batch_type: 'manual',
        batch_size: batchSize,
        status: 'pending',
        processing_config: {
          batchSize,
          maxBatches,
          forceReenrich,
          startedBy: req.user?.id || 'api'
        }
      })
      .select()
      .single();

    if (batchError) {
      console.error('배치 기록 생성 실패:', batchError);
      return res.status(500).json({
        success: false,
        message: '배치 작업 초기화 실패'
      });
    }

    // 보강 작업을 백그라운드에서 실행
    const enricher = new ExhibitionEnricher();
    
    // 활성 배치에 추가
    activeBatches.set(finalBatchName, {
      id: batchRecord.id,
      status: 'running',
      startTime: new Date(),
      progress: 0
    });

    // 백그라운드 처리 시작
    processEnrichmentBatch(enricher, batchRecord.id, finalBatchName, batchSize, maxBatches)
      .finally(() => {
        activeBatches.delete(finalBatchName);
      });

    res.json({
      success: true,
      message: '데이터 보강 작업이 시작되었습니다.',
      batchId: batchRecord.id,
      batchName: finalBatchName,
      estimatedDuration: `${batchSize * maxBatches * 3}초`
    });

  } catch (error) {
    console.error('보강 작업 시작 실패:', error);
    res.status(500).json({
      success: false,
      message: '보강 작업 시작 중 오류가 발생했습니다.',
      error: error.message
    });
  }
});

/**
 * GET /api/exhibitions/enrich/status/:batchId
 * 배치 작업 상태 조회
 */
router.get('/status/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    const { data: batch, error } = await supabase
      .from('data_enrichment_batches')
      .select('*')
      .eq('id', batchId)
      .single();

    if (error || !batch) {
      return res.status(404).json({
        success: false,
        message: '배치 작업을 찾을 수 없습니다.'
      });
    }

    // 메모리의 실시간 상태와 병합
    const memoryStatus = activeBatches.get(batch.batch_name);
    
    res.json({
      success: true,
      batch: {
        ...batch,
        isActive: memoryStatus !== undefined,
        realTimeProgress: memoryStatus?.progress || batch.progress_percentage,
        realTimeStatus: memoryStatus?.status || batch.status
      }
    });

  } catch (error) {
    console.error('상태 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '상태 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/exhibitions/enrich/quality-report
 * 데이터 품질 리포트 조회
 */
router.get('/quality-report', async (req, res) => {
  try {
    const enricher = new ExhibitionEnricher();
    const report = await enricher.generateQualityReport();

    if (!report) {
      return res.status(500).json({
        success: false,
        message: '품질 리포트 생성 실패'
      });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    console.error('품질 리포트 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '품질 리포트 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /api/exhibitions/enrich/dashboard
 * 데이터 보강 대시보드 데이터
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    // 보강 현황 뷰에서 데이터 조회
    const { data: exhibitions, error } = await supabase
      .from('exhibition_enrichment_dashboard')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('quality_score', { ascending: true });

    if (error) throw error;

    // 전체 통계 조회
    const { data: stats } = await supabase
      .from('exhibition_data_quality')
      .select(`
        COUNT(*) as total,
        AVG(overall_score) as avg_score,
        COUNT(CASE WHEN overall_score >= 80 THEN 1 END) as high_quality,
        COUNT(CASE WHEN overall_score >= 60 THEN 1 END) as medium_quality,
        COUNT(CASE WHEN overall_score < 40 THEN 1 END) as low_quality
      `)
      .single();

    // 최근 배치 작업 조회
    const { data: recentBatches } = await supabase
      .from('data_enrichment_batches')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(5);

    res.json({
      success: true,
      data: {
        exhibitions,
        statistics: stats || {
          total: 0,
          avg_score: 0,
          high_quality: 0,
          medium_quality: 0,
          low_quality: 0
        },
        recentBatches: recentBatches || [],
        activeBatches: Array.from(activeBatches.entries()).map(([name, data]) => ({
          name,
          ...data
        }))
      }
    });

  } catch (error) {
    console.error('대시보드 데이터 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '대시보드 데이터 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /api/exhibitions/enrich/single/:exhibitionId
 * 단일 전시 보강 실행
 */
router.post('/single/:exhibitionId', async (req, res) => {
  try {
    const { exhibitionId } = req.params;

    // 전시 데이터 조회
    const { data: exhibition, error } = await supabase
      .from('exhibitions_master')
      .select(`
        *,
        exhibitions_translations!inner (
          exhibition_title,
          description,
          language_code,
          venue_name
        ),
        venues!venue_id (
          name,
          type,
          district
        )
      `)
      .eq('exhibitions_translations.language_code', 'ko')
      .eq('id', exhibitionId)
      .single();

    if (error || !exhibition) {
      return res.status(404).json({
        success: false,
        message: '전시를 찾을 수 없습니다.'
      });
    }

    const enricher = new ExhibitionEnricher();
    
    // 단일 전시 보강 실행
    const enrichedData = await enricher.enrichExhibition(exhibition);
    
    if (!enrichedData) {
      return res.status(500).json({
        success: false,
        message: '전시 보강 처리 실패'
      });
    }

    // 보강된 데이터 저장
    const saved = await enricher.saveEnrichedData(enrichedData);
    
    if (!saved) {
      return res.status(500).json({
        success: false,
        message: '보강된 데이터 저장 실패'
      });
    }

    res.json({
      success: true,
      message: '전시 데이터가 성공적으로 보강되었습니다.',
      data: enrichedData.enriched_data
    });

  } catch (error) {
    console.error('단일 전시 보강 실패:', error);
    res.status(500).json({
      success: false,
      message: '전시 보강 중 오류가 발생했습니다.'
    });
  }
});

/**
 * DELETE /api/exhibitions/enrich/cancel/:batchId
 * 배치 작업 취소
 */
router.delete('/cancel/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    // 데이터베이스에서 배치 상태 업데이트
    const { error } = await supabase
      .from('data_enrichment_batches')
      .update({ 
        status: 'cancelled',
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId);

    if (error) throw error;

    // 메모리에서도 제거
    const batch = await supabase
      .from('data_enrichment_batches')
      .select('batch_name')
      .eq('id', batchId)
      .single();

    if (batch.data) {
      activeBatches.delete(batch.data.batch_name);
    }

    res.json({
      success: true,
      message: '배치 작업이 취소되었습니다.'
    });

  } catch (error) {
    console.error('배치 취소 실패:', error);
    res.status(500).json({
      success: false,
      message: '배치 취소 중 오류가 발생했습니다.'
    });
  }
});

/**
 * 배치 처리 함수 (백그라운드 실행)
 */
async function processEnrichmentBatch(enricher, batchId, batchName, batchSize, maxBatches) {
  const startTime = Date.now();
  
  try {
    // 배치 상태를 'running'으로 업데이트
    await supabase
      .from('data_enrichment_batches')
      .update({ 
        status: 'running',
        started_at: new Date().toISOString()
      })
      .eq('id', batchId);

    console.log(`🚀 배치 보강 시작: ${batchName}`);
    
    // 실제 보강 작업 실행
    const result = await enricher.runBatchEnrichment(batchSize, maxBatches);
    
    const endTime = Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    // 배치 완료 상태 업데이트
    await supabase
      .from('data_enrichment_batches')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        processed_exhibitions: result.processed,
        successful_exhibitions: result.success,
        failed_exhibitions: result.failed,
        progress_percentage: 100,
        quality_improvement: {
          successRate: result.successRate,
          processingTime: `${duration}초`,
          averageTimePerExhibition: `${(duration / result.processed).toFixed(1)}초`
        }
      })
      .eq('id', batchId);

    console.log(`✅ 배치 보강 완료: ${batchName} (${duration}초 소요)`);

  } catch (error) {
    console.error(`❌ 배치 보강 실패: ${batchName}`, error);
    
    // 배치 실패 상태 업데이트
    await supabase
      .from('data_enrichment_batches')
      .update({
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_summary: error.message
      })
      .eq('id', batchId);
  } finally {
    // 메모리에서 배치 제거
    activeBatches.delete(batchName);
  }
}

/**
 * GET /api/exhibitions/enrich/apt-stats
 * APT 유형별 매칭 통계
 */
router.get('/apt-stats', async (req, res) => {
  try {
    // APT 유형별 통계 조회
    const { data: aptStats, error } = await supabase
      .from('apt_exhibition_scores')
      .select(`
        apt_type,
        COUNT(*) as total_exhibitions,
        AVG(score) as avg_score,
        COUNT(CASE WHEN score >= 80 THEN 1 END) as excellent_matches,
        COUNT(CASE WHEN score >= 60 THEN 1 END) as good_matches,
        COUNT(CASE WHEN score >= 40 THEN 1 END) as fair_matches
      `)
      .group('apt_type');

    if (error) throw error;

    // APT 유형 정보 매핑
    const enricher = new ExhibitionEnricher();
    const aptTypesInfo = enricher.aptTypes;

    const enrichedStats = aptStats.map(stat => ({
      ...stat,
      type_name: aptTypesInfo[stat.apt_type]?.name || stat.apt_type,
      animal: aptTypesInfo[stat.apt_type]?.animal || 'unknown',
      avg_score: Math.round(stat.avg_score),
      excellent_percentage: ((stat.excellent_matches / stat.total_exhibitions) * 100).toFixed(1),
      good_percentage: ((stat.good_matches / stat.total_exhibitions) * 100).toFixed(1),
      fair_percentage: ((stat.fair_matches / stat.total_exhibitions) * 100).toFixed(1)
    }));

    res.json({
      success: true,
      data: enrichedStats.sort((a, b) => b.avg_score - a.avg_score)
    });

  } catch (error) {
    console.error('APT 통계 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: 'APT 통계 조회 중 오류가 발생했습니다.'
    });
  }
});

module.exports = router;