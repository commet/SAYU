import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateGroqResponse, generateExhibitionRecommendation } from '@/lib/groq-client'
import { chatbotRateLimiter } from '@/lib/rate-limiter'

interface UserBehavior {
  engagementLevel?: string;
  currentMood?: string;
  timeOnPage?: number;
  [key: string]: unknown;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '';
}

// 페이지별 컨텍스트
const PAGE_CONTEXTS: Record<string, string> = {
  home: '홈페이지에서 사용자를 환영하고 SAYU 플랫폼을 소개합니다',
  gallery: '갤러리 페이지에서 작품 탐색을 도와줍니다',
  exhibitions: '전시 컨시어지로서 전시 정보와 추천을 제공합니다',
  profile: '개인 코치로서 사용자의 예술 취향을 분석합니다',
  community: '소셜 가이드로서 커뮤니티 활동을 지원합니다',
  results: '퀴즈 결과와 APT 유형에 대해 설명합니다',
  default: '예술과 문화에 대한 일반적인 대화를 나눕니다'
}

// Supabase에서 전시 데이터 가져오기
async function fetchCurrentExhibitions() {
  try {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    
    const { data: exhibitions } = await supabase
      .from('exhibitions')
      .select('id, title_local, venue_name, start_date, end_date, tags, description')
      .gte('end_date', today)
      .order('start_date', { ascending: false })
      .limit(20)
    
    return exhibitions || []
  } catch (error) {
    console.error('Failed to fetch exhibitions:', error)
    return []
  }
}

export async function POST(request: NextRequest) {
  console.log('🎯 Groq Chatbot API called')
  
  // Rate limiting
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  if (!chatbotRateLimiter.isAllowed(clientIp)) {
    return NextResponse.json({
      success: false,
      error: 'Too many requests. Please try again later.'
    }, { status: 429 })
  }
  
  try {
    const { 
      message, 
      userId, 
      userType = 'LAEF',
      page = 'default',
      context = {},
      userBehavior = {},
      conversationHistory = []
    } = await request.json()
    
    console.log('Processing request:', { 
      userType, 
      page, 
      messageLength: message?.length 
    })
    
    // 페이지 컨텍스트 구성
    const pageContext = {
      page,
      pageDescription: PAGE_CONTEXTS[page] || PAGE_CONTEXTS.default,
      userBehavior: {
        engagementLevel: userBehavior.engagementLevel || 'new',
        currentMood: userBehavior.currentMood || 'exploring',
        timeOnPage: userBehavior.timeOnPage || 0,
        ...userBehavior
      }
    }
    
    let response: string
    
    // 전시 관련 질문인 경우
    if (page === 'exhibitions' || 
        message.includes('전시') || 
        message.includes('추천') || 
        message.includes('미술관')) {
      
      const exhibitions = await fetchCurrentExhibitions()
      
      if (exhibitions.length > 0) {
        // 전시 추천 생성
        response = await generateExhibitionRecommendation(
          userType,
          exhibitions,
          message
        )
      } else {
        // 일반 응답
        response = await generateGroqResponse(
          message,
          userType,
          pageContext,
          conversationHistory
        )
      }
    } else {
      // 일반 대화
      response = await generateGroqResponse(
        message,
        userType,
        pageContext,
        conversationHistory
      )
    }
    
    // 응답 길이 제한
    const limitedResponse = response.length > 1500 
      ? response.substring(0, 1500) + '...' 
      : response
    
    // 동적 제안 생성
    const suggestions = generateSuggestions(page, userType, userBehavior)
    
    console.log('✅ Response generated successfully')
    
    return NextResponse.json({
      success: true,
      data: {
        response: limitedResponse,
        sessionId: `${userId}-${Date.now()}`,
        suggestions,
        personality: getPersonality(userType),
        contextAnalysis: {
          engagementLevel: pageContext.userBehavior.engagementLevel,
          currentMood: pageContext.userBehavior.currentMood,
          model: 'groq-llama3'
        },
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error: unknown) {
    console.error('Chatbot error:', error)

    return NextResponse.json({
      success: true,
      data: {
        response: getErrorResponseMessage(error),
        sessionId: `error-${Date.now()}`,
        suggestions: ["다시 질문해주세요", "다른 주제로 대화해보세요"],
        timestamp: new Date().toISOString()
      }
    })
  }
}

// 동적 제안 생성
function generateSuggestions(page: string, _userType: string, _userBehavior: UserBehavior): string[] {
  const suggestions: string[] = []
  
  if (page === 'exhibitions') {
    suggestions.push("오늘 가볼만한 전시 추천")
    suggestions.push("무료 전시 정보")
    suggestions.push("내 취향 전시 찾기")
  } else if (page === 'profile') {
    suggestions.push("내 APT 유형 설명")
    suggestions.push("예술 취향 분석")
    suggestions.push("성장 계획 세우기")
  } else if (page === 'gallery') {
    suggestions.push("이 작품 스타일 설명")
    suggestions.push("비슷한 작품 찾기")
    suggestions.push("작가 정보 알아보기")
  } else {
    suggestions.push("전시 추천받기")
    suggestions.push("APT 테스트 하기")
    suggestions.push("예술 이야기 듣기")
  }
  
  return suggestions.slice(0, 3)
}

// APT 유형별 성격
function getPersonality(userType: string): string {
  const personalities: Record<string, string> = {
    'LAEF': '몽환적 큐레이터',
    'LAEC': '우아한 큐레이터',
    'LAMF': '직관적 큐레이터',
    'LAMC': '학구적 큐레이터',
    'LREF': '섬세한 큐레이터',
    'LREC': '정확한 큐레이터',
    'LRMF': '혁신적 큐레이터',
    'LRMC': '체계적 큐레이터',
    'TAEF': '활발한 큐레이터',
    'TAEC': '사교적 큐레이터',
    'TAMF': '호기심 큐레이터',
    'TAMC': '리더십 큐레이터',
    'TREF': '표현적 큐레이터',
    'TREC': '완벽주의 큐레이터',
    'TRMF': '지혜로운 큐레이터',
    'TRMC': '전략적 큐레이터'
  }
  
  return personalities[userType] || '예술 큐레이터'
}

// 에러 응답
function getErrorResponseMessage(error: unknown): string {
  const errorMsg = getErrorMessage(error);
  if (errorMsg.includes('rate limit')) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
  }

  return "잠시 연결이 불안정합니다. 다시 한 번 말씀해주시겠어요?"
}

// OPTIONS 처리 (CORS)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}