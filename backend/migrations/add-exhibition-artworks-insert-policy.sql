-- Allow authenticated users to insert exhibition artworks
-- This is needed for seeding data and admin operations

BEGIN;

-- RLS 정책: 인증된 사용자는 작품을 추가할 수 있음
-- (나중에 admin role이 생기면 그것으로 제한할 수 있음)
CREATE POLICY "Authenticated users can insert exhibition artworks"
    ON exhibition_artworks FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 익명 사용자도 작품을 추가할 수 있도록 (임시, 나중에 제거 가능)
-- 이는 샘플 데이터 삽입 및 초기 개발을 위한 것
CREATE POLICY "Allow public insert for development"
    ON exhibition_artworks FOR INSERT
    TO anon
    WITH CHECK (true);

COMMIT;
