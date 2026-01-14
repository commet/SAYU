import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/worldcup/upload
 * 이미지 업로드 (Supabase Storage)
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const sessionId = formData.get('session_id') as string;
    const files = formData.getAll('files') as File[];
    const consentStorage = formData.get('consent_storage') === 'true';

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'session_id is required' },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one file is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 세션 확인
    const { data: session, error: sessionError } = await supabase
      .from('exhibition_worldcup_sessions')
      .select('status, round_type')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    if (session.status !== 'setup') {
      return NextResponse.json(
        { success: false, error: 'Cannot upload after tournament started' },
        { status: 400 }
      );
    }

    const uploadedImages: any[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        // 파일 유효성 검사
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: Not an image file`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name}: File too large (max 5MB)`);
          continue;
        }

        // 파일명 생성
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop() || 'jpg';
        const storagePath = `worldcup/${sessionId}/${timestamp}_${randomId}.${extension}`;

        // Supabase Storage에 업로드
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('temp-worldcup')
          .upload(storagePath, file, {
            cacheControl: '86400', // 24시간
            upsert: false,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          errors.push(`${file.name}: ${uploadError.message}`);
          continue;
        }

        // 공개 URL 생성
        const { data: publicUrlData } = supabase.storage
          .from('temp-worldcup')
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData?.publicUrl;

        if (!publicUrl) {
          errors.push(`${file.name}: Failed to generate public URL`);
          continue;
        }

        // temp_worldcup_images 테이블에 저장
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { data: tempImage, error: dbError } = await supabase
          .from('temp_worldcup_images')
          .insert({
            session_id: sessionId,
            storage_path: storagePath,
            storage_url: publicUrl,
            original_filename: file.name,
            file_size_bytes: file.size,
            user_consented: consentStorage,
            expires_at: expiresAt,
          })
          .select()
          .single();

        if (dbError) {
          console.error('DB error:', dbError);
          errors.push(`${file.name}: Failed to save to database`);
          continue;
        }

        uploadedImages.push({
          id: tempImage.id,
          storage_path: storagePath,
          storage_url: publicUrl,
          original_filename: file.name,
          file_size_bytes: file.size,
          expires_at: expiresAt,
        });
      } catch (fileError: any) {
        console.error('File processing error:', fileError);
        errors.push(`${file.name}: ${fileError.message}`);
      }
    }

    return NextResponse.json({
      success: uploadedImages.length > 0,
      data: {
        uploaded: uploadedImages,
        count: uploadedImages.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/worldcup/upload
 * 업로드된 이미지 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { image_id, storage_path } = body;

    if (!image_id && !storage_path) {
      return NextResponse.json(
        { success: false, error: 'image_id or storage_path is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let pathToDelete = storage_path;

    if (image_id) {
      // DB에서 경로 조회
      const { data: image } = await supabase
        .from('temp_worldcup_images')
        .select('storage_path')
        .eq('id', image_id)
        .single();

      pathToDelete = image?.storage_path;

      // DB에서 삭제
      await supabase
        .from('temp_worldcup_images')
        .delete()
        .eq('id', image_id);
    }

    if (pathToDelete) {
      // Storage에서 삭제
      await supabase.storage.from('temp-worldcup').remove([pathToDelete]);
    }

    return NextResponse.json({
      success: true,
      data: { deleted: true },
    });
  } catch (error: any) {
    console.error('Delete upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
