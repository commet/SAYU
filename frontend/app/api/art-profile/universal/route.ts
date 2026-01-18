import { NextRequest, NextResponse } from 'next/server';
import { universalReplicateService, StyleType, ImageType } from '@/lib/replicate-universal-service';

export const maxDuration = 30;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'An error occurred';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const style = formData.get('style') as string;
    const imageType = formData.get('imageType') as string || 'auto';

    if (!imageFile || !style) {
      return NextResponse.json(
        { error: 'Image and style are required' },
        { status: 400 }
      );
    }

    // 파일 크기 체크 (5MB 제한)
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 5MB' },
        { status: 400 }
      );
    }

    console.log(`Universal transform: style=${style}, type=${imageType}`);

    // 서버 사이드에서 File을 Base64로 변환
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    // 범용 스타일 변환 실행 (Base64 데이터 전달)
    const result = await universalReplicateService.transformStyleFromBase64(
      base64,
      style as StyleType,
      {
        imageType: imageType as ImageType,
        quality: 'balanced',
        fileName: imageFile.name,
        onProgress: (p) => console.log(`Progress: ${p}%`)
      }
    );

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Universal transform error:', error);
    const errorMsg = getErrorMessage(error);

    if (errorMsg.includes('token not configured')) {
      return NextResponse.json(
        {
          error: 'Service not configured',
          message: 'Please configure Replicate API token'
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: 'Transform failed',
        message: errorMsg
      },
      { status: 500 }
    );
  }
}

// GET: 사용 가능한 스타일과 비용 정보
export async function GET() {
  const styles = universalReplicateService.getAvailableStyles();
  const costInfo = universalReplicateService.getCostInfo();
  
  return NextResponse.json({
    success: true,
    styles,
    costInfo,
    features: {
      autoDetection: true,
      fallbackSupport: true,
      supportedTypes: ['portrait', 'animal', 'landscape', 'object'],
      models: ['flux-schnell', 'sdxl-fallback']
    }
  });
}