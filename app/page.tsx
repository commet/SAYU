'use client';

import { useState } from 'react';

export default function HomePage() {
  const [step, setStep] = useState<'home' | 'loading' | 'quiz' | 'result'>('home');
  const [quizData, setQuizData] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const startQuiz = async () => {
    setStep('loading');
    setError('');
    
    try {
      console.log('Starting quiz...');
      
      const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: 'ko' }),
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Quiz data:', data);
      
      if (data.success) {
        setQuizData(data);
        setSessionId(data.sessionId);
        setStep('quiz');
      } else {
        setError('퀴즈 시작 실패: ' + data.message);
        setStep('home');
      }
    } catch (err: any) {
      console.error('Quiz start error:', err);
      setError(`연결 오류: ${err.message} (타입: ${err.constructor.name})`);
      setStep('home');
    }
  };

  const submitAnswer = async (choiceId: string) => {
    try {
      const response = await fetch('https://sayubackend-production.up.railway.app/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: quizData.currentQuestion.id,
          choiceId,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.completed) {
          setQuizData(data);
          setStep('result');
        } else {
          setQuizData({ ...quizData, currentQuestion: data.nextQuestion, progress: data.progress });
        }
      }
    } catch (err: any) {
      alert('답변 제출 오류: ' + err.message);
    }
  };

  // 홈 화면
  if (step === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-6xl font-bold mb-6">🎨 SAYU</h1>
          <p className="text-2xl mb-4">AI와 함께하는 미적 정체성 발견 여행</p>
          <p className="text-lg text-gray-300 mb-8">
            당신만의 독특한 미적 성향을 발견하고, 개인화된 예술 추천을 받아보세요.
          </p>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-2">⚠️ 오류 발생</h3>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={startQuiz}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-lg text-lg font-semibold w-full max-w-md"
          >
            미적 여정 시작하기 →
          </button>
          
          <div className="mt-8 text-sm text-gray-400">
            <p>현재 도메인: {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            <p>백엔드: https://sayubackend-production.up.railway.app</p>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 화면
  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-xl">퀴즈를 준비하고 있습니다...</p>
          <p className="text-sm text-gray-400 mt-2">백엔드 연결 중...</p>
        </div>
      </div>
    );
  }

  // 결과 화면
  if (step === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">🎉 퀴즈 완료!</h1>
          <h2 className="text-3xl font-semibold text-purple-300 mb-6">
            당신의 성향: {quizData?.result?.personalityType || 'UNKNOWN'}
          </h2>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
            <p className="text-lg">축하합니다! 당신의 미적 성향을 발견했습니다.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setStep('home');
                setQuizData(null);
                setSessionId('');
                setError('');
              }}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg"
            >
              다시 하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 화면
  const question = quizData?.currentQuestion;
  const progress = quizData?.progress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* 진행률 */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-8">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(progress?.current / progress?.total) * 100 || 0}%` }}
          ></div>
        </div>

        {/* 질문 */}
        <div className="text-center mb-8">
          <p className="text-lg opacity-80 mb-2">
            질문 {progress?.current || 1} / {progress?.total || 12}
          </p>
          <h2 className="text-3xl font-bold mb-4">{question?.scenario?.ko}</h2>
          <p className="text-xl">{question?.question?.ko}</p>
        </div>

        {/* 선택지 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {question?.choices?.map((choice: any) => (
            <button
              key={choice.id}
              onClick={() => submitAnswer(choice.id)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 text-left transition-all transform hover:scale-105 border-2 border-transparent hover:border-white/30"
            >
              <div className="text-3xl mb-3">
                {choice.id === 'A' ? '🚪' : '🌙'}
              </div>
              <h3 className="text-xl font-semibold mb-2">{choice.text?.ko}</h3>
              <span className="absolute top-4 right-4 text-2xl opacity-30">
                {choice.id}
              </span>
            </button>
          ))}
        </div>

        {/* 디버그 정보 */}
        <div className="mt-8 text-center text-sm opacity-50">
          세션: {sessionId.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
}