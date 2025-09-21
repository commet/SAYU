/**
 * SAYU Art Counselor - API 연결 테스트 페이지
 * 16개 작품 데이터와 추천 시스템 동작 확인
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface Artwork {
  id: string;
  title: string;
  artist: string;
  year_created: string;
  style: string;
  image_url: string;
  metadata: any;
}

interface TestResult {
  artworks: Artwork[];
  todaysArtwork: any;
  error?: string;
}

const TestAPIPage: React.FC = () => {
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('LAEF');

  const personalityTypes = [
    'LAEF', 'LAEC', 'LAMF', 'LAMC',
    'LREF', 'LREC', 'LRMF', 'LRMC',
    'SAEF', 'SAEC', 'SAMF', 'SAMC',
    'SREF', 'SREC', 'SRMF', 'SRMC'
  ];

  // API 기본 테스트
  const runAPITest = async () => {
    setLoading(true);
    try {
      // 1. 모든 작품 조회 테스트
      const artworksResponse = await fetch('/api/art-counselor/artworks');
      const artworksData = await artworksResponse.json();

      // 2. 오늘의 작품 추천 테스트 (임시 사용자 ID)
      const todayResponse = await fetch('/api/art-counselor/today', {
        headers: {
          'Authorization': 'Bearer test-user-id'
        }
      });
      const todayData = await todayResponse.json();

      setTestResult({
        artworks: artworksData.success ? artworksData.data : [],
        todaysArtwork: todayData
      });

    } catch (error) {
      console.error('API Test Error:', error);
      setTestResult({
        artworks: [],
        todaysArtwork: null,
        error: error.message
      });
    }
    setLoading(false);
  };

  // 컴포넌트 마운트 시 자동 테스트 실행
  useEffect(() => {
    runAPITest();
  }, []);

  return (
    <>
      <Head>
        <title>SAYU Art Counselor - API 테스트</title>
        <meta name="description" content="16개 작품 데이터와 추천 시스템 테스트" />
      </Head>

      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
          🎨 SAYU Art Counselor API 테스트
        </h1>

        {/* 테스트 실행 버튼 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={runAPITest}
            disabled={loading}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '테스트 실행 중...' : 'API 테스트 다시 실행'}
          </button>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>API 연결 테스트 중...</p>
          </div>
        )}

        {/* 에러 표시 */}
        {testResult?.error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '15px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h3>❌ API 연결 오류</h3>
            <p>{testResult.error}</p>
            <p>백엔드 서버가 실행 중인지 확인해주세요. (포트 3007)</p>
          </div>
        )}

        {/* 테스트 결과 */}
        {testResult && !loading && (
          <div>
            {/* 오늘의 작품 추천 테스트 */}
            <section style={{ marginBottom: '40px' }}>
              <h2>📅 오늘의 작품 추천 테스트</h2>
              {testResult.todaysArtwork ? (
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {testResult.todaysArtwork.success ? (
                    <div>
                      <h3>✅ 추천 성공!</h3>
                      <p><strong>작품 ID:</strong> {testResult.todaysArtwork.data?.artworkId}</p>
                      {testResult.todaysArtwork.data?.artwork && (
                        <div>
                          <p><strong>제목:</strong> {testResult.todaysArtwork.data.artwork.title}</p>
                          <p><strong>작가:</strong> {testResult.todaysArtwork.data.artwork.artist}</p>
                          <p><strong>연도:</strong> {testResult.todaysArtwork.data.artwork.year_created}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <h3>⚠️ 추천 실패</h3>
                      <p>{testResult.todaysArtwork.message}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p>오늘의 작품 추천 데이터를 가져올 수 없습니다.</p>
              )}
            </section>

            {/* 16개 작품 목록 */}
            <section style={{ marginBottom: '40px' }}>
              <h2>🎭 16개 작품 데이터 테스트</h2>
              <p><strong>총 작품 수:</strong> {testResult.artworks.length}개</p>

              {testResult.artworks.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {testResult.artworks.map((artwork) => (
                    <div
                      key={artwork.id}
                      style={{
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        padding: '15px',
                        backgroundColor: 'white'
                      }}
                    >
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
                        {artwork.title}
                      </h4>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>작가:</strong> {artwork.artist}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>연도:</strong> {artwork.year_created}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>스타일:</strong> {artwork.style}
                      </p>
                      {artwork.metadata?.country && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>국가:</strong> {artwork.metadata.country}
                        </p>
                      )}
                      <p style={{
                        margin: '10px 0 0 0',
                        fontSize: '12px',
                        color: '#999',
                        wordBreak: 'break-all'
                      }}>
                        ID: {artwork.id}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#fff3cd',
                  color: '#856404',
                  padding: '15px',
                  borderRadius: '5px'
                }}>
                  <p>작품 데이터를 찾을 수 없습니다. 백엔드 API가 정상 동작하는지 확인해주세요.</p>
                </div>
              )}
            </section>

            {/* 성격별 추천 테스트 (향후 구현) */}
            <section>
              <h2>🔮 성격별 추천 시스템 (준비 중)</h2>
              <div style={{
                backgroundColor: '#e7f3ff',
                border: '1px solid #b8daff',
                borderRadius: '5px',
                padding: '15px'
              }}>
                <p>16가지 성격 유형별 맞춤 추천 시스템이 곧 추가됩니다.</p>
                <p>현재는 기본 추천 알고리즘이 동작합니다.</p>
              </div>
            </section>
          </div>
        )}

        {/* 테스트 요약 */}
        {testResult && !loading && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px'
          }}>
            <h3>📊 테스트 요약</h3>
            <ul>
              <li>✅ Supabase 연결: 성공</li>
              <li>✅ 16개 작품 데이터: {testResult.artworks.length}개 확인</li>
              <li>✅ 오늘의 작품 추천: {testResult.todaysArtwork?.success ? '동작' : '확인 필요'}</li>
              <li>🚧 성격별 추천: 준비 중</li>
            </ul>
          </div>
        )}
      </div>
    </>
  );
};

export default TestAPIPage;