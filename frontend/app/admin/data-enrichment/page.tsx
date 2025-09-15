'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock, Play, Square, BarChart3, Database, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface QualityReport {
  totalExhibitions: number;
  withDescription: number;
  withKeywords: number;
  withAptScores: number;
  completionRates: {
    description: string;
    keywords: string;
    aptScores: string;
  };
  aptMatchingStats: Record<string, { count: number; percentage: string }>;
  generatedAt: string;
}

interface BatchJob {
  id: string;
  batch_name: string;
  status: string;
  progress_percentage: number;
  total_exhibitions: number;
  processed_exhibitions: number;
  successful_exhibitions: number;
  failed_exhibitions: number;
  started_at: string;
  completed_at?: string;
  isActive?: boolean;
  realTimeProgress?: number;
  realTimeStatus?: string;
}

interface DashboardData {
  exhibitions: Array<{
    id: string;
    exhibition_title: string;
    venue_name: string;
    has_description: string;
    has_keywords: string;
    has_category: string;
    has_apt_scores: string;
    quality_score: number;
    created_at: string;
  }>;
  statistics: {
    total: number;
    avg_score: number;
    high_quality: number;
    medium_quality: number;
    low_quality: number;
  };
  recentBatches: BatchJob[];
  activeBatches: Array<{
    name: string;
    status: string;
    progress: number;
  }>;
}

interface APTStats {
  apt_type: string;
  type_name: string;
  animal: string;
  total_exhibitions: number;
  avg_score: number;
  excellent_matches: number;
  good_matches: number;
  fair_matches: number;
  excellent_percentage: string;
  good_percentage: string;
  fair_percentage: string;
}

export default function DataEnrichmentPage() {
  const [qualityReport, setQualityReport] = useState<QualityReport | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [aptStats, setAptStats] = useState<APTStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeBatch, setActiveBatch] = useState<BatchJob | null>(null);
  
  // 배치 설정
  const [batchSize, setBatchSize] = useState(10);
  const [maxBatches, setMaxBatches] = useState(3);
  const [batchName, setBatchName] = useState('');

  // 실시간 업데이트를 위한 인터벌
  useEffect(() => {
    fetchAllData();
    
    // 5초마다 대시보드 데이터 업데이트
    const interval = setInterval(() => {
      if (!isProcessing) {
        fetchDashboardData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // 활성 배치 모니터링
  useEffect(() => {
    if (activeBatch && activeBatch.isActive) {
      const monitorInterval = setInterval(() => {
        fetchBatchStatus(activeBatch.id);
      }, 2000);

      return () => clearInterval(monitorInterval);
    }
  }, [activeBatch]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchQualityReport(),
        fetchDashboardData(),
        fetchAPTStats()
      ]);
    } catch (error) {
      toast.error('데이터 로딩 실패');
      console.error('Data fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQualityReport = async () => {
    try {
      const response = await fetch('/api/exhibitions/enrich/quality-report');
      const data = await response.json();
      if (data.success) {
        setQualityReport(data.report);
      }
    } catch (error) {
      console.error('Quality report fetch error:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/exhibitions/enrich/dashboard');
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
        
        // 활성 배치가 있는지 확인
        const activeJob = data.data.activeBatches.find((batch: any) => batch.status === 'running');
        if (activeJob && !activeBatch) {
          setActiveBatch({
            id: activeJob.id || '',
            batch_name: activeJob.name,
            status: activeJob.status,
            progress_percentage: activeJob.progress,
            isActive: true,
            realTimeProgress: activeJob.progress,
            realTimeStatus: activeJob.status
          } as BatchJob);
          setIsProcessing(true);
        }
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
    }
  };

  const fetchAPTStats = async () => {
    try {
      const response = await fetch('/api/exhibitions/enrich/apt-stats');
      const data = await response.json();
      if (data.success) {
        setAptStats(data.data);
      }
    } catch (error) {
      console.error('APT stats fetch error:', error);
    }
  };

  const fetchBatchStatus = async (batchId: string) => {
    try {
      const response = await fetch(`/api/exhibitions/enrich/status/${batchId}`);
      const data = await response.json();
      if (data.success) {
        setActiveBatch(data.batch);
        
        if (data.batch.status === 'completed' || data.batch.status === 'failed') {
          setIsProcessing(false);
          setActiveBatch(null);
          fetchAllData(); // 완료 후 데이터 새로고침
          
          if (data.batch.status === 'completed') {
            toast.success(`배치 작업이 완료되었습니다! (성공: ${data.batch.successful_exhibitions}개)`);
          } else {
            toast.error('배치 작업이 실패했습니다.');
          }
        }
      }
    } catch (error) {
      console.error('Batch status fetch error:', error);
    }
  };

  const startEnrichment = async () => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/exhibitions/enrich/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchSize,
          maxBatches,
          batchName: batchName || `manual_batch_${Date.now()}`
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('데이터 보강 작업이 시작되었습니다!');
        setActiveBatch({
          id: data.batchId,
          batch_name: data.batchName,
          status: 'running',
          progress_percentage: 0,
          isActive: true
        } as BatchJob);
        
        // 상태 모니터링 시작
        setTimeout(() => fetchBatchStatus(data.batchId), 2000);
      } else {
        toast.error(data.message || '작업 시작 실패');
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error('작업 시작 중 오류 발생');
      console.error('Start enrichment error:', error);
      setIsProcessing(false);
    }
  };

  const cancelBatch = async () => {
    if (!activeBatch) return;
    
    try {
      const response = await fetch(`/api/exhibitions/enrich/cancel/${activeBatch.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('배치 작업이 취소되었습니다.');
        setIsProcessing(false);
        setActiveBatch(null);
        fetchAllData();
      } else {
        toast.error('배치 취소 실패');
      }
    } catch (error) {
      toast.error('배치 취소 중 오류 발생');
      console.error('Cancel batch error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500', icon: Clock },
      running: { color: 'bg-blue-500', icon: Play },
      completed: { color: 'bg-green-500', icon: CheckCircle },
      failed: { color: 'bg-red-500', icon: AlertCircle },
      cancelled: { color: 'bg-gray-500', icon: Square }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500 text-white">우수</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500 text-white">양호</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500 text-white">보통</Badge>;
    return <Badge className="bg-red-500 text-white">부족</Badge>;
  };

  const getAnimalEmoji = (animal: string) => {
    const emojiMap = {
      fox: '🦊', cat: '🐱', owl: '🦉', turtle: '🐢',
      chameleon: '🦎', hedgehog: '🦔', octopus: '🐙', beaver: '🦫',
      butterfly: '🦋', penguin: '🐧', parrot: '🦜', deer: '🦌',
      dog: '🐕', duck: '🦆', elephant: '🐘', eagle: '🦅'
    };
    return emojiMap[animal as keyof typeof emojiMap] || '🎨';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg text-gray-600">데이터를 로딩 중...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">전시 데이터 보강 시스템</h1>
              <p className="text-gray-600">AI 기반 전시 설명 생성 및 APT 매칭 점수 계산</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>마지막 업데이트: {qualityReport?.generatedAt ? new Date(qualityReport.generatedAt).toLocaleString('ko-KR') : '알 수 없음'}</p>
          </div>
        </div>

        {/* 실시간 배치 모니터링 */}
        {activeBatch && (
          <Alert className="border-blue-200 bg-blue-50">
            <Play className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>배치 작업 진행 중:</strong> {activeBatch.batch_name}
                  {activeBatch.realTimeStatus && (
                    <span className="ml-2">{getStatusBadge(activeBatch.realTimeStatus)}</span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <Progress value={activeBatch.realTimeProgress || activeBatch.progress_percentage} className="h-2" />
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(activeBatch.realTimeProgress || activeBatch.progress_percentage)}%
                  </span>
                  <Button variant="outline" size="sm" onClick={cancelBatch}>
                    취소
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="enrichment">보강 작업</TabsTrigger>
            <TabsTrigger value="apt-stats">APT 통계</TabsTrigger>
            <TabsTrigger value="exhibitions">전시 목록</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            {/* 전체 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">전체 전시</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{qualityReport?.totalExhibitions.toLocaleString() || 0}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">설명 보유율</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {qualityReport?.completionRates.description || '0'}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {qualityReport?.withDescription || 0}개 전시
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">키워드 보유율</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {qualityReport?.completionRates.keywords || '0'}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {qualityReport?.withKeywords || 0}개 전시
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">APT 점수 보유율</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {qualityReport?.completionRates.aptScores || '0'}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {qualityReport?.withAptScores || 0}개 전시
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 품질 분포 */}
            {dashboardData && (
              <Card>
                <CardHeader>
                  <CardTitle>데이터 품질 분포</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{dashboardData.statistics.high_quality}</div>
                      <div className="text-sm text-green-700">우수 (80점 이상)</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{dashboardData.statistics.medium_quality}</div>
                      <div className="text-sm text-yellow-700">양호 (60-79점)</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{dashboardData.statistics.low_quality}</div>
                      <div className="text-sm text-red-700">부족 (40점 미만)</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(dashboardData.statistics.avg_score)}</div>
                      <div className="text-sm text-blue-700">평균 점수</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 보강 작업 탭 */}
          <TabsContent value="enrichment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>새 보강 작업 시작</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="batchSize">배치 크기</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      min="1"
                      max="50"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxBatches">최대 배치 수</Label>
                    <Input
                      id="maxBatches"
                      type="number"
                      value={maxBatches}
                      onChange={(e) => setMaxBatches(parseInt(e.target.value))}
                      min="1"
                      max="10"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="batchName">배치 이름 (선택)</Label>
                    <Input
                      id="batchName"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="auto_batch_timestamp"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    예상 처리 시간: 약 {batchSize * maxBatches * 3}초
                  </div>
                  <Button 
                    onClick={startEnrichment} 
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        처리 중...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        보강 작업 시작
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 최근 배치 작업 */}
            <Card>
              <CardHeader>
                <CardTitle>최근 배치 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData?.recentBatches.map((batch) => (
                    <div key={batch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <div className="font-medium">{batch.batch_name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(batch.started_at).toLocaleString('ko-KR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(batch.status)}
                        <div className="text-right text-sm">
                          <div>성공: {batch.successful_exhibitions}/{batch.total_exhibitions}</div>
                          {batch.progress_percentage > 0 && (
                            <div className="text-xs text-gray-500">
                              {Math.round(batch.progress_percentage)}% 완료
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.recentBatches || dashboardData.recentBatches.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      최근 배치 작업이 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* APT 통계 탭 */}
          <TabsContent value="apt-stats" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>APT 유형별 매칭 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aptStats.map((stat) => (
                    <div key={stat.apt_type} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getAnimalEmoji(stat.animal)}</span>
                          <span className="font-medium text-sm">{stat.apt_type}</span>
                        </div>
                        <div className="text-right text-xs text-gray-600">
                          평균 {stat.avg_score}점
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {stat.type_name}
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>전체:</span>
                          <span className="font-medium">{stat.total_exhibitions}개</span>
                        </div>
                        <div className="flex justify-between">
                          <span>우수(80+):</span>
                          <span className="text-green-600 font-medium">
                            {stat.excellent_matches}개 ({stat.excellent_percentage}%)
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>양호(60+):</span>
                          <span className="text-yellow-600 font-medium">
                            {stat.good_matches}개 ({stat.good_percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 전시 목록 탭 */}
          <TabsContent value="exhibitions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>전시 데이터 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">전시명</th>
                        <th className="text-left p-2">장소</th>
                        <th className="text-center p-2">설명</th>
                        <th className="text-center p-2">키워드</th>
                        <th className="text-center p-2">카테고리</th>
                        <th className="text-center p-2">APT 점수</th>
                        <th className="text-center p-2">품질</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.exhibitions.slice(0, 20).map((exhibition) => (
                        <tr key={exhibition.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="max-w-xs truncate font-medium">
                              {exhibition.exhibition_title}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="max-w-xs truncate text-gray-600">
                              {exhibition.venue_name}
                            </div>
                          </td>
                          <td className="text-center p-2">{exhibition.has_description}</td>
                          <td className="text-center p-2">{exhibition.has_keywords}</td>
                          <td className="text-center p-2">{exhibition.has_category}</td>
                          <td className="text-center p-2">{exhibition.has_apt_scores}</td>
                          <td className="text-center p-2">
                            {getQualityBadge(exhibition.quality_score)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!dashboardData?.exhibitions || dashboardData.exhibitions.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      전시 데이터가 없습니다.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}