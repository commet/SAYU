import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';
import {
  generateArtProfilePrompt,
  getRecommendedStylesForAPT,
  getArtProfileDescription,
  ART_STYLES,
  APT_PROMPT_PROFILES
} from '@/shared/apt-ai-prompt-mapping';

// Vercel/Edge timeout 설정 (최대 60초)
export const maxDuration = 60;

// Rate limiting (IP 기반)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1시간
  const maxRequests = 5; // 시간당 5회 (비용 관리)

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  const record = rateLimit.get(ip)!;
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export async function POST(request: NextRequest) {
  try {
    // IP 추출 (Vercel/Cloudflare 헤더 우선)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Rate limit 체크
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: '시간당 5회 생성 제한에 도달했습니다. 1시간 후 다시 시도해주세요.',
          retryAfter: 3600
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'Retry-After': '3600'
          }
        }
      );
    }

    const body = await request.json();
    const {
      aptCode,
      artStyle,
      gender = 'neutral'
    } = body as {
      aptCode: string;
      artStyle: string;
      gender?: 'male' | 'female' | 'neutral';
    };

    // 입력 유효성 검증
    if (!aptCode || !artStyle) {
      return NextResponse.json(
        { error: 'aptCode와 artStyle은 필수입니다' },
        { status: 400 }
      );
    }

    if (!APT_PROMPT_PROFILES[aptCode]) {
      return NextResponse.json(
        { error: `유효하지 않은 APT 코드: ${aptCode}` },
        { status: 400 }
      );
    }

    if (!ART_STYLES[artStyle]) {
      return NextResponse.json(
        { error: `유효하지 않은 아트 스타일: ${artStyle}` },
        { status: 400 }
      );
    }

    // API 토큰 확인
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        {
          error: 'Replicate API not configured',
          message: 'REPLICATE_API_TOKEN 환경변수를 설정해주세요',
          instructions: 'https://replicate.com/account/api-tokens'
        },
        { status: 503 }
      );
    }

    // 프롬프트 생성
    const { prompt, negativePrompt } = generateArtProfilePrompt(aptCode, artStyle, gender);

    console.log(`[ArtProfile] Generating: APT=${aptCode}, Style=${artStyle}, Gender=${gender}`);
    console.log(`[ArtProfile] Prompt length: ${prompt.length} chars`);

    // Replicate 클라이언트 초기화
    const replicate = new Replicate({ auth: apiToken });

    // SDXL 모델 사용 (고품질 텍스트-투-이미지)
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt,
          negative_prompt: negativePrompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          scheduler: 'K_EULER',
          refine: 'expert_ensemble_refiner',
          refine_steps: 10,
          num_outputs: 1,
          apply_watermark: false
        }
      }
    );

    // 결과 처리
    let resultUrl: string;
    if (Array.isArray(output)) {
      resultUrl = output[0] as string;
    } else {
      resultUrl = output as string;
    }

    // URL을 Base64 Data URL로 변환 (클라이언트 캐싱 지원)
    let dataUrl = resultUrl;
    if (resultUrl.startsWith('http')) {
      try {
        const response = await fetch(resultUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64Result = Buffer.from(arrayBuffer).toString('base64');
        dataUrl = `data:${blob.type};base64,${base64Result}`;
      } catch (fetchError) {
        console.error('[ArtProfile] Error converting to data URL:', fetchError);
        // URL 그대로 반환 (임시)
      }
    }

    // 결과 설명 생성
    const description = getArtProfileDescription(aptCode, artStyle, 'ko');
    const descriptionEn = getArtProfileDescription(aptCode, artStyle, 'en');
    const recommendedStyles = getRecommendedStylesForAPT(aptCode);

    console.log(`[ArtProfile] Generated successfully for ${aptCode}`);

    return NextResponse.json({
      success: true,
      data: {
        imageUrl: dataUrl,
        aptCode,
        artStyle,
        artStyleName: ART_STYLES[artStyle].nameKo,
        description,
        descriptionEn,
        recommendedStyles,
        metadata: {
          model: 'stability-ai/sdxl',
          dimensions: '1024x1024',
          generatedAt: new Date().toISOString()
        }
      },
      rateLimit: {
        remaining,
        resetIn: '1 hour'
      }
    }, {
      headers: {
        'X-RateLimit-Remaining': remaining.toString()
      }
    });

  } catch (error) {
    console.error('[ArtProfile] Error:', error);

    if (error instanceof Error) {
      // Replicate 특정 에러 처리
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Replicate rate limit exceeded' },
          { status: 429 }
        );
      }
      if (error.message.includes('billing')) {
        return NextResponse.json(
          { error: 'Replicate billing issue' },
          { status: 402 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate art profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET: 사용 가능한 스타일 및 APT 정보 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const aptCode = searchParams.get('aptCode');

  // 특정 APT에 대한 추천 스타일
  if (aptCode && APT_PROMPT_PROFILES[aptCode]) {
    const recommendedStyles = getRecommendedStylesForAPT(aptCode);
    return NextResponse.json({
      success: true,
      aptCode,
      recommendedStyles: recommendedStyles.map(id => ({
        id,
        ...ART_STYLES[id]
      })),
      allStyles: Object.values(ART_STYLES)
    });
  }

  // 전체 스타일 및 APT 목록
  return NextResponse.json({
    success: true,
    styles: Object.entries(ART_STYLES).map(([id, style]) => ({
      id,
      name: style.name,
      nameKo: style.nameKo,
      description: style.description,
      artistReference: style.artistReference
    })),
    aptCodes: Object.keys(APT_PROMPT_PROFILES),
    costInfo: {
      estimatedCost: '$0.003 per image',
      currency: 'USD',
      note: '약 4원/이미지 (SDXL 모델 기준)'
    },
    rateLimit: {
      perHour: 5,
      note: '무료 사용자 기준'
    }
  });
}
