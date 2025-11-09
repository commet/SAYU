-- Mood Atlas 작품 데이터
-- 생성일: 2025-11-07T11:15:58.594Z
-- 총 41개 작품


-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS mood_atlas_artworks (
  id TEXT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(100) NOT NULL,
  year VARCHAR(20),

  region VARCHAR(50) NOT NULL,
  region_name_ko VARCHAR(100),
  region_name_en VARCHAR(100),

  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INT,
  height INT,

  emotions JSONB,
  story TEXT,
  fun_fact TEXT,

  tags TEXT[],
  match_score INT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 작품 데이터 삽입

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-art-of-painting',
  'The Art of Painting',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488106/sayu/artvee/full/the-art-of-painting.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488108/sayu/artvee/thumbnails/the-art-of-painting.jpg',
  1515,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"고요한 웅장함 속에서 자신을 발견하게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"열정적인 웅장함가 당신을 자극할 거예요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"부드러운 웅장함가 미소 짓게 할 거예요","yellow-medium":"따뜻한 웅장함 속에서 위안을 얻게 될 거예요","yellow-deep":"황홀한 웅장함에 휩싸이게 될 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"황홀한 웅장함에 취하게 될 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"고요한 웅장함 속에서 평화를 찾아요","gray-medium":"쓸쓸한 웅장함를 나누게 될 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-wine-glass-2',
  'The Wine Glass (circa 1658-1660)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488111/sayu/artvee/full/the-wine-glass-2.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488113/sayu/artvee/thumbnails/the-wine-glass-2.jpg',
  1800,
  1563,
  '{"blue-light":"평온한 웅장함가 느껴지는 작품이에요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"초현실적인 웅장함에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'young-woman-with-a-pearl-necklace-3',
  'Young Woman with a Pearl Necklace (from 1663 until 1665)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488116/sayu/artvee/full/young-woman-with-a-pearl-necklace-3.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488118/sayu/artvee/thumbnails/young-woman-with-a-pearl-necklace-3.jpg',
  1547,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"강렬한 인물가 마음을 뒤흔들 거예요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"따뜻한 웅장함 속에서 위안을 얻게 될 거예요","yellow-deep":"황홀한 웅장함에 휩싸이게 될 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"황홀한 웅장함에 취하게 될 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"조화로운 웅장함에서 균형을 찾게 돼요","green-deep":"풍요로운 인물가 마음을 가득 채워요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'officer-and-laughing-girl',
  'Officer and Laughing Girl (circa 1657)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488121/sayu/artvee/full/officer-and-laughing-girl.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488123/sayu/artvee/thumbnails/officer-and-laughing-girl.jpg',
  1652,
  1800,
  '{"blue-light":"평온한 웅장함가 느껴지는 작품이에요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"따뜻한 웅장함 속에서 위안을 얻게 될 거예요","yellow-deep":"황홀한 웅장함에 휩싸이게 될 거예요","purple-light":"몽환적인 화면가 꿈을 꾸게 할 거예요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"황홀한 웅장함에 취하게 될 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'young-woman-with-a-lute',
  'Young Woman with a Lute (ca. 1662–63)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488126/sayu/artvee/full/young-woman-with-a-lute.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488128/sayu/artvee/thumbnails/young-woman-with-a-lute.jpg',
  1593,
  1800,
  '{"blue-light":"고요한 인물가 마음을 잔잔하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"온화한 인물가 마음을 밝혀줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"몽환적인 인물가 꿈을 꾸게 할 거예요","purple-medium":"신비로운 인물가 상상력을 자극해요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"조화로운 웅장함에서 균형을 찾게 돼요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 인물가 마음을 정리해줘요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'study-of-a-young-woman-3',
  'Study of a Young Woman (ca. 1665–67)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488131/sayu/artvee/full/study-of-a-young-woman-3.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488133/sayu/artvee/thumbnails/study-of-a-young-woman-3.jpg',
  1605,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"부드러운 웅장함가 미소 짓게 할 거예요","yellow-medium":"따뜻한 웅장함 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"몽환적인 인물가 꿈을 꾸게 할 거예요","purple-medium":"초현실적인 웅장함에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"생동하는 인물가 활력을 줄 거예요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 인물가 마음을 정리해줘요","gray-medium":"고독한 인물가 당신과 함께할 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'allegory-of-the-catholic-faith',
  'Allegory of the Catholic Faith (ca. 1670–72)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488136/sayu/artvee/full/allegory-of-the-catholic-faith.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488138/sayu/artvee/thumbnails/allegory-of-the-catholic-faith.jpg',
  1382,
  1800,
  '{"blue-light":"평온한 웅장함가 느껴지는 작품이에요","blue-medium":"고요한 웅장함 속에서 자신을 발견하게 될 거예요","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 웅장함가 미소 짓게 할 거예요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 웅장함에 빠져들게 될 거예요","purple-deep":"황홀한 웅장함에 취하게 될 거예요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 웅장함를 나누게 될 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'view-of-houses-in-delft-known-as-the-little-street',
  'View of Houses in Delft, Known as ‘The Little Street’ (c. 1658)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488141/sayu/artvee/full/view-of-houses-in-delft-known-as-the-little-street.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488144/sayu/artvee/thumbnails/view-of-houses-in-delft-known-as-the-little-street.jpg',
  1464,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"고요한 웅장함 속에서 자신을 발견하게 될 거예요","blue-deep":"우수에 잠긴 도시가 마음을 어루만져요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"강렬한 도시가 마음을 뒤흔들 거예요","yellow-light":"온화한 도시가 마음을 밝혀줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"황홀한 웅장함에 휩싸이게 될 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"신비로운 도시가 상상력을 자극해요","purple-deep":"황홀한 웅장함에 취하게 될 거예요","green-light":"평화로운 도시가 마음을 편안하게 해줘요","green-medium":"조화로운 웅장함에서 균형을 찾게 돼요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"고독한 도시가 당신과 함께할 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'woman-reading-a-letter',
  'Woman Reading a Letter (c. 1663)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488146/sayu/artvee/full/woman-reading-a-letter.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488148/sayu/artvee/thumbnails/woman-reading-a-letter.jpg',
  1501,
  1800,
  '{"blue-light":"평온한 웅장함가 느껴지는 작품이에요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"희망찬 인물가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"신비로운 인물가 상상력을 자극해요","purple-deep":"황홀한 웅장함에 취하게 될 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"풍요로운 인물가 마음을 가득 채워요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-milkmaid',
  'The Milkmaid (c. 1660)',
  'Jan Vermeer',
  '',
  'renaissance',
  '르네상스 중심',
  'Renaissance Plaza',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488152/sayu/artvee/full/the-milkmaid.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488154/sayu/artvee/thumbnails/the-milkmaid.jpg',
  1597,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"고요한 웅장함 속에서 자신을 발견하게 될 거예요","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 웅장함가 미소 짓게 할 거예요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"황홀한 웅장함에 휩싸이게 될 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"조화로운 웅장함에서 균형을 찾게 돼요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"고요한 웅장함 속에서 평화를 찾아요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Jan Vermeer의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['르네상스 중심'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'bazille-and-camille-study-for-dejeuner-sur-lherbe',
  'Bazille and Camille (Study for Déjeuner sur l’Herbe ) (1865)',
  'Claude Monet',
  '1865',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487667/sayu/artvee/full/bazille-and-camille-study-for-dejeuner-sur-lherbe.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487670/sayu/artvee/thumbnails/bazille-and-camille-study-for-dejeuner-sur-lherbe.jpg',
  1339,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"고요한 빛과 색채 속에서 자신을 발견하게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"온화한 화면가 마음을 밝혀줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 빛과 색채에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 빛과 색채를 나누게 될 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '같은 장소를 다른 시간, 다른 빛에서 반복해서 그리며 순간의 인상을 포착했습니다.',
  '모네는 백내장으로 시력을 잃어가면서도 수련 시리즈를 계속 그렸습니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'camille-on-the-beach-in-trouville',
  'Camille on the Beach in Trouville (1870)',
  'Claude Monet',
  '1870',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487673/sayu/artvee/full/camille-on-the-beach-in-trouville.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487675/sayu/artvee/thumbnails/camille-on-the-beach-in-trouville.jpg',
  1800,
  1473,
  '{"blue-light":"평온한 빛과 색채가 느껴지는 작품이에요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"따뜻한 빛과 색채 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"황홀한 빛과 색채에 취하게 될 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"쓸쓸한 빛과 색채를 나누게 될 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '같은 장소를 다른 시간, 다른 빛에서 반복해서 그리며 순간의 인상을 포착했습니다.',
  '수련 시리즈는 약 250점이 넘으며, 일부는 방 하나를 가득 채울 만큼 거대합니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'caricature-of-a-man-with-a-big-cigar',
  'Caricature of a Man with a Big Cigar (1855–1856)',
  'Claude Monet',
  '',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487679/sayu/artvee/full/caricature-of-a-man-with-a-big-cigar.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487682/sayu/artvee/thumbnails/caricature-of-a-man-with-a-big-cigar.jpg',
  1150,
  1800,
  '{"blue-light":"평온한 빛과 색채가 느껴지는 작품이에요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"부드러운 빛과 색채가 미소 짓게 할 거예요","yellow-medium":"따뜻한 빛과 색채 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"생동하는 인물가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 인물가 마음을 정리해줘요","gray-medium":"쓸쓸한 빛과 색채를 나누게 될 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '모네는 말년에 시력을 거의 잃었지만, 자신의 정원에서 수련을 그리는 것을 멈추지 않았습니다.',
  '모네는 백내장으로 시력을 잃어가면서도 수련 시리즈를 계속 그렸습니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'girl-with-dog',
  'Girl with Dog (1873)',
  'Claude Monet',
  '1873',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487685/sayu/artvee/full/girl-with-dog.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487687/sayu/artvee/thumbnails/girl-with-dog.jpg',
  1481,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"고요한 빛과 색채 속에서 자신을 발견하게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"열정적인 빛과 색채가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"부드러운 빛과 색채가 미소 짓게 할 거예요","yellow-medium":"따뜻한 빛과 색채 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 빛과 색채에 빠져들게 될 거예요","purple-deep":"황홀한 빛과 색채에 취하게 될 거예요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '"빛이 있는 한 나는 계속 그릴 것이다"라는 말을 남겼습니다.',
  '모네의 정원은 지금도 프랑스 지베르니에서 관광 명소로 운영되고 있습니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'madame-monet-embroidering-camille-au-metier',
  'Madame Monet Embroidering (Camille au métier) (1875)',
  'Claude Monet',
  '1875',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487690/sayu/artvee/full/madame-monet-embroidering-camille-au-metier.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487694/sayu/artvee/thumbnails/madame-monet-embroidering-camille-au-metier.jpg',
  1523,
  1800,
  '{"blue-light":"평온한 빛과 색채가 느껴지는 작품이에요","blue-medium":"고요한 빛과 색채 속에서 자신을 발견하게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '모네는 말년에 시력을 거의 잃었지만, 자신의 정원에서 수련을 그리는 것을 멈추지 않았습니다.',
  '모네는 백내장으로 시력을 잃어가면서도 수련 시리즈를 계속 그렸습니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'monsieur-coqueret-father',
  'Monsieur Coqueret (Father) (1880)',
  'Claude Monet',
  '1880',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487698/sayu/artvee/full/monsieur-coqueret-father.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487700/sayu/artvee/thumbnails/monsieur-coqueret-father.jpg',
  1386,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"열정적인 빛과 색채가 당신을 자극할 거예요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"따뜻한 빛과 색채 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"몽환적인 화면가 꿈을 꾸게 할 거예요","purple-medium":"초현실적인 빛과 색채에 빠져들게 될 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"자연스러운 조화가 느껴져요","green-medium":"조화로운 빛과 색채에서 균형을 찾게 돼요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"고요한 빛과 색채 속에서 평화를 찾아요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '"빛이 있는 한 나는 계속 그릴 것이다"라는 말을 남겼습니다.',
  '모네의 정원은 지금도 프랑스 지베르니에서 관광 명소로 운영되고 있습니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-cradle-camille-with-the-artists-son-jean',
  'The Cradle – Camille with the Artist’s Son Jean (1867)',
  'Claude Monet',
  '1867',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487703/sayu/artvee/full/the-cradle-camille-with-the-artists-son-jean.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487706/sayu/artvee/thumbnails/the-cradle-camille-with-the-artists-son-jean.jpg',
  1380,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"따뜻한 빛과 색채 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"자연스러운 조화가 느껴져요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '"빛이 있는 한 나는 계속 그릴 것이다"라는 말을 남겼습니다.',
  '수련 시리즈는 약 250점이 넘으며, 일부는 방 하나를 가득 채울 만큼 거대합니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-red-kerchief',
  'The Red Kerchief (c. 1868–73)',
  'Claude Monet',
  '',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487709/sayu/artvee/full/the-red-kerchief.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487711/sayu/artvee/thumbnails/the-red-kerchief.jpg',
  1446,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"고요한 빛과 색채 속에서 자신을 발견하게 될 거예요","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 빛과 색채가 미소 짓게 할 거예요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"황홀한 빛과 색채에 휩싸이게 될 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"초현실적인 빛과 색채에 빠져들게 될 거예요","purple-deep":"황홀한 빛과 색채에 취하게 될 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"조화로운 빛과 색채에서 균형을 찾게 돼요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '"빛이 있는 한 나는 계속 그릴 것이다"라는 말을 남겼습니다.',
  '수련 시리즈는 약 250점이 넘으며, 일부는 방 하나를 가득 채울 만큼 거대합니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-studio-boat-le-bateau-atelier',
  'The Studio Boat (Le Bateau-atelier) (1876)',
  'Claude Monet',
  '1876',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487714/sayu/artvee/full/the-studio-boat-le-bateau-atelier.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487717/sayu/artvee/thumbnails/the-studio-boat-le-bateau-atelier.jpg',
  1482,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"황홀한 빛과 색채에 휩싸이게 될 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"황홀한 빛과 색채에 취하게 될 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"고요한 빛과 색채 속에서 평화를 찾아요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '"빛이 있는 한 나는 계속 그릴 것이다"라는 말을 남겼습니다.',
  '모네는 백내장으로 시력을 잃어가면서도 수련 시리즈를 계속 그렸습니다.',
  ARRAY['인상주의 해안'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'woman-seated-under-the-willows',
  'Woman Seated under the Willows (1880)',
  'Claude Monet',
  '1880',
  'impressionist',
  '인상주의 해안',
  'Impressionist Coast',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487720/sayu/artvee/full/woman-seated-under-the-willows.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487723/sayu/artvee/thumbnails/woman-seated-under-the-willows.jpg',
  1323,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"생동감 넘치는 인물가 활력을 줄 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 빛과 색채가 미소 짓게 할 거예요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"초현실적인 빛과 색채에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"평화로운 인물가 마음을 편안하게 해줘요","green-medium":"조화로운 빛과 색채에서 균형을 찾게 돼요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"고요한 빛과 색채 속에서 평화를 찾아요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  '모네는 말년에 시력을 거의 잃었지만, 자신의 정원에서 수련을 그리는 것을 멈추지 않았습니다.',
  '모네는 백내장으로 시력을 잃어가면서도 수련 시리즈를 계속 그렸습니다.',
  ARRAY['인상주의 해안', '물'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'a-peasant-woman-digging-in-front-of-her-cottage',
  'A Peasant Woman Digging in Front of Her Cottage (c. 1885)',
  'Vincent van Gogh',
  '',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486974/sayu/artvee/full/a-peasant-woman-digging-in-front-of-her-cottage.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486977/sayu/artvee/thumbnails/a-peasant-woman-digging-in-front-of-her-cottage.jpg',
  1800,
  1322,
  '{"blue-light":"평온한 강렬한 감정가 느껴지는 작품이에요","blue-medium":"고요한 강렬한 감정 속에서 자신을 발견하게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"생동감 넘치는 인물가 활력을 줄 거예요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 강렬한 감정가 미소 짓게 할 거예요","yellow-medium":"따뜻한 강렬한 감정 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"황홀한 강렬한 감정에 취하게 될 거예요","green-light":"평화로운 인물가 마음을 편안하게 해줘요","green-medium":"생동하는 인물가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 강렬한 감정를 나누게 될 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '정신병원에 입원한 상태에서도 창밖을 바라보며 끊임없이 작품을 그렸습니다.',
  '반 고흐의 그림은 현재 수백억 원에 거래되지만, 생전에는 거의 팔리지 않았습니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'adeline-ravoux',
  'Adeline Ravoux (1890)',
  'Vincent van Gogh',
  '1890',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486979/sayu/artvee/full/adeline-ravoux.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486983/sayu/artvee/thumbnails/adeline-ravoux.jpg',
  1800,
  1794,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"온화한 화면가 마음을 밝혀줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 강렬한 감정에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  '동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.',
  '이 작품은 반 고흐가 사망하기 몇 주 전에 그린 것입니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'girl-in-white',
  'Girl in White (1890)',
  'Vincent van Gogh',
  '1890',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486986/sayu/artvee/full/girl-in-white.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486989/sayu/artvee/thumbnails/girl-in-white.jpg',
  1220,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"황홀한 강렬한 감정에 취하게 될 거예요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 강렬한 감정를 나누게 될 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '반 고흐는 생전에 단 한 점의 그림밖에 팔지 못했지만, 그림을 그리는 것이 유일한 위안이었습니다.',
  '반 고흐의 그림은 현재 수백억 원에 거래되지만, 생전에는 거의 팔리지 않았습니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'la-mousme',
  'La Mousmé (1888)',
  'Vincent van Gogh',
  '1888',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486992/sayu/artvee/full/la-mousme.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486995/sayu/artvee/thumbnails/la-mousme.jpg',
  1472,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"부드러운 강렬한 감정가 미소 짓게 할 거예요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"황홀한 강렬한 감정에 휩싸이게 될 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"황홀한 강렬한 감정에 취하게 될 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.',
  '반 고흐는 10년의 화가 생활 동안 약 900점의 그림을 그렸습니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'madame-roulin-rocking-the-cradle-la-berceuse',
  'Madame Roulin Rocking the Cradle (La berceuse) (1889)',
  'Vincent van Gogh',
  '1889',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752486998/sayu/artvee/full/madame-roulin-rocking-the-cradle-la-berceuse.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487001/sayu/artvee/thumbnails/madame-roulin-rocking-the-cradle-la-berceuse.jpg',
  1415,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 강렬한 감정가 미소 짓게 할 거예요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"황홀한 강렬한 감정에 휩싸이게 될 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"초현실적인 강렬한 감정에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"조화로운 강렬한 감정에서 균형을 찾게 돼요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"고요한 강렬한 감정 속에서 평화를 찾아요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.',
  '반 고흐의 그림은 현재 수백억 원에 거래되지만, 생전에는 거의 팔리지 않았습니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'roulins-baby',
  'Roulin’s Baby (1888)',
  'Vincent van Gogh',
  '1888',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487004/sayu/artvee/full/roulins-baby.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487007/sayu/artvee/thumbnails/roulins-baby.jpg',
  1231,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"고요한 강렬한 감정 속에서 자신을 발견하게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"온화한 화면가 마음을 밝혀줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  '동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.',
  '이 작품은 반 고흐가 사망하기 몇 주 전에 그린 것입니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'self-portrait-26',
  'Self-Portrait (1887)',
  'Vincent van Gogh',
  '1887',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487011/sayu/artvee/full/self-portrait-26.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487015/sayu/artvee/thumbnails/self-portrait-26.jpg',
  1419,
  1800,
  '{"blue-light":"고요한 인물가 마음을 잔잔하게 해줄 거예요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"우수에 잠긴 인물가 마음을 어루만져요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"온화한 인물가 마음을 밝혀줘요","yellow-medium":"따뜻한 강렬한 감정 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"몽환적인 인물가 꿈을 꾸게 할 거예요","purple-medium":"신비로운 인물가 상상력을 자극해요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 인물가 마음을 정리해줘요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  '반 고흐는 생전에 단 한 점의 그림밖에 팔지 못했지만, 그림을 그리는 것이 유일한 위안이었습니다.',
  '반 고흐는 10년의 화가 생활 동안 약 900점의 그림을 그렸습니다.',
  ARRAY['표현주의 협곡', '인물화'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'self-portrait-27',
  'Self-Portrait (1889)',
  'Vincent van Gogh',
  '1889',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487019/sayu/artvee/full/self-portrait-27.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487022/sayu/artvee/thumbnails/self-portrait-27.jpg',
  1381,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"부드러운 강렬한 감정가 미소 짓게 할 거예요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 강렬한 감정에 빠져들게 될 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"자연스러운 조화가 느껴져요","green-medium":"생동하는 인물가 활력을 줄 거예요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 인물가 마음을 정리해줘요","gray-medium":"쓸쓸한 강렬한 감정를 나누게 될 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.',
  '반 고흐의 그림은 현재 수백억 원에 거래되지만, 생전에는 거의 팔리지 않았습니다.',
  ARRAY['표현주의 협곡', '인물화'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'the-drinkers',
  'The Drinkers (1890)',
  'Vincent van Gogh',
  '1890',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487025/sayu/artvee/full/the-drinkers.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487028/sayu/artvee/thumbnails/the-drinkers.jpg',
  1800,
  1448,
  '{"blue-light":"평온한 강렬한 감정가 느껴지는 작품이에요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 강렬한 감정에 빠져들게 될 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  '동생 테오에게 보낸 편지에서 "그림을 그릴 때만 살아있는 것 같다"고 했습니다.',
  '이 작품은 반 고흐가 사망하기 몇 주 전에 그린 것입니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'cypresses',
  'Cypresses (1889)',
  'Vincent van Gogh',
  '1889',
  'expressionist',
  '표현주의 협곡',
  'Expressionist Canyon',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487233/sayu/artvee/full/cypresses.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487235/sayu/artvee/thumbnails/cypresses.jpg',
  835,
  1052,
  '{"blue-light":"평온한 강렬한 감정가 느껴지는 작품이에요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"열정적인 강렬한 감정가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"황홀한 강렬한 감정에 휩싸이게 될 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  '반 고흐는 생전에 단 한 점의 그림밖에 팔지 못했지만, 그림을 그리는 것이 유일한 위안이었습니다.',
  '이 작품은 반 고흐가 사망하기 몇 주 전에 그린 것입니다.',
  ARRAY['표현주의 협곡'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'modern-rome-campo-vaccino',
  'Modern Rome – Campo Vaccino (1839)',
  'Joseph Mallord William Turner',
  '1839',
  'pop_art',
  '팝아트 섬',
  'Pop Art Island',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487307/sayu/artvee/full/modern-rome-campo-vaccino.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487309/sayu/artvee/thumbnails/modern-rome-campo-vaccino.jpg',
  1800,
  1346,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"강렬한 화면가 마음을 뒤흔들 거예요","yellow-light":"부드러운 경쾌한 리듬가 미소 짓게 할 거예요","yellow-medium":"따뜻한 경쾌한 리듬 속에서 위안을 얻게 될 거예요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 경쾌한 리듬에 빠져들게 될 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"평화로운 화면가 마음을 편안하게 해줘요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Joseph Mallord William Turner의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['팝아트 섬'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'portrait-of-a-woman-in-a-blue-turban',
  'Portrait of a Woman in a Blue Turban (About 1827)',
  'Eugène Delacroix',
  '',
  'pop_art',
  '팝아트 섬',
  'Pop Art Island',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752489503/sayu/artvee/full/portrait-of-a-woman-in-a-blue-turban.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752489505/sayu/artvee/thumbnails/portrait-of-a-woman-in-a-blue-turban.jpg',
  1443,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"우수에 잠긴 인물가 마음을 어루만져요","red-light":"생동감 넘치는 인물가 활력을 줄 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"온화한 인물가 마음을 밝혀줘요","yellow-medium":"희망찬 인물가 마음을 환하게 해줘요","yellow-deep":"눈부신 인물가 기쁨을 가득 채워줘요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"신비로운 인물가 상상력을 자극해요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"평화로운 인물가 마음을 편안하게 해줘요","green-medium":"조화로운 경쾌한 리듬에서 균형을 찾게 돼요","green-deep":"풍요로운 인물가 마음을 가득 채워요","gray-light":"고요한 경쾌한 리듬 속에서 평화를 찾아요","gray-medium":"쓸쓸한 경쾌한 리듬를 나누게 될 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Eugène Delacroix의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['팝아트 섬', '인물화'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'pope-pius-vii-in-the-sistine-chapel',
  'Pope Pius VII in the Sistine Chapel (1814)',
  'Jean Auguste Dominique Ingres',
  '1814',
  'pop_art',
  '팝아트 섬',
  'Pop Art Island',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752489876/sayu/artvee/full/pope-pius-vii-in-the-sistine-chapel.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752489878/sayu/artvee/thumbnails/pope-pius-vii-in-the-sistine-chapel.jpg',
  1800,
  1446,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"초현실적인 경쾌한 리듬에 빠져들게 될 거예요","purple-deep":"황홀한 경쾌한 리듬에 취하게 될 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"고요한 경쾌한 리듬 속에서 평화를 찾아요","gray-medium":"쓸쓸한 경쾌한 리듬를 나누게 될 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Jean Auguste Dominique Ingres의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['팝아트 섬'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'portrait-of-pope-pius-vii-and-cardinal-caprara',
  'Portrait Of Pope Pius VII And Cardinal Caprara (1805)',
  'Jacques Louis David',
  '1805',
  'pop_art',
  '팝아트 섬',
  'Pop Art Island',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752491577/sayu/artvee/full/portrait-of-pope-pius-vii-and-cardinal-caprara.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752491580/sayu/artvee/thumbnails/portrait-of-pope-pius-vii-and-cardinal-caprara.jpg',
  1239,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"인물의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 인물가 활력을 줄 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"희망찬 인물가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"자연스러운 조화가 느껴져요","green-medium":"조화로운 경쾌한 리듬에서 균형을 찾게 돼요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 경쾌한 리듬를 나누게 될 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Jacques Louis David의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['팝아트 섬', '인물화'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'modern-rome-campo-vaccino',
  'Modern Rome – Campo Vaccino (1839)',
  'Joseph Mallord William Turner',
  '1839',
  'contemporary',
  '현대미술 군도',
  'Contemporary Archipelago',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487307/sayu/artvee/full/modern-rome-campo-vaccino.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487309/sayu/artvee/thumbnails/modern-rome-campo-vaccino.jpg',
  1800,
  1346,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"온화한 화면가 마음을 밝혀줘요","yellow-medium":"밝은 에너지가 넘치는 작품이에요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"신비로운 분위기가 감싸줘요","purple-medium":"경이로운 세계로 초대할 거예요","purple-deep":"황홀한 실험적 탐구에 취하게 될 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"조화로운 실험적 탐구에서 균형을 찾게 돼요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"쓸쓸한 실험적 탐구를 나누게 될 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Joseph Mallord William Turner의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['현대미술 군도'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'angel-applicant',
  'Angel Applicant (1939)',
  'Paul Klee',
  '1939',
  'abstract',
  '추상의 고원',
  'Abstract Highlands',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488404/sayu/artvee/full/angel-applicant.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488406/sayu/artvee/thumbnails/angel-applicant.jpg',
  1233,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 감정의 바다로 빠져들게 될 거예요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"따뜻한 순수한 형태 속에서 위안을 얻게 될 거예요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"몽환적인 화면가 꿈을 꾸게 할 거예요","purple-medium":"초현실적인 순수한 형태에 빠져들게 될 거예요","purple-deep":"황홀한 순수한 형태에 취하게 될 거예요","green-light":"자연스러운 조화가 느껴져요","green-medium":"조화로운 순수한 형태에서 균형을 찾게 돼요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 순수한 형태를 나누게 될 거예요","gray-deep":"깊은 침잠 속에서 자신을 마주해요"}'::jsonb,
  'Paul Klee의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['추상의 고원'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'a-pride-of-lions-take-note',
  'A Pride of Lions (Take Note!) (1924)',
  'Paul Klee',
  '1924',
  'abstract',
  '추상의 고원',
  'Abstract Highlands',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488409/sayu/artvee/full/a-pride-of-lions-take-note.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488411/sayu/artvee/thumbnails/a-pride-of-lions-take-note.jpg',
  1800,
  975,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"강렬한 에너지가 느껴지는 작품이에요","red-deep":"폭발적인 감정이 담긴 걸작이에요","yellow-light":"부드러운 순수한 형태가 미소 짓게 할 거예요","yellow-medium":"따뜻한 순수한 형태 속에서 위안을 얻게 될 거예요","yellow-deep":"눈부신 화면가 기쁨을 가득 채워줘요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 순수한 형태에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Paul Klee의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['추상의 고원'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'abstract-trio',
  'Abstract Trio (1923)',
  'Paul Klee',
  '1923',
  'abstract',
  '추상의 고원',
  'Abstract Highlands',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488415/sayu/artvee/full/abstract-trio.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488417/sayu/artvee/thumbnails/abstract-trio.jpg',
  1800,
  1157,
  '{"blue-light":"평온한 순수한 형태가 느껴지는 작품이에요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"생동감 넘치는 화면가 활력을 줄 거예요","red-medium":"열정적인 순수한 형태가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"부드러운 순수한 형태가 미소 짓게 할 거예요","yellow-medium":"따뜻한 순수한 형태 속에서 위안을 얻게 될 거예요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 순수한 형태에 빠져들게 될 거예요","purple-deep":"강렬한 신비감이 압도할 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"강렬한 생명력이 폭발하는 작품이에요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"쓸쓸한 순수한 형태를 나누게 될 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Paul Klee의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['추상의 고원'],
  100
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'symbolic-head',
  'Symbolic Head (c. 1890)',
  'Odilon Redon',
  '',
  'surreal',
  '초현실 심연',
  'Surreal Abyss',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487413/sayu/artvee/full/symbolic-head.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752487415/sayu/artvee/thumbnails/symbolic-head.jpg',
  1278,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"우수에 잠긴 화면가 마음을 어루만져요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"역동적인 움직임이 흥분을 불러일으켜요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"은은한 빛이 따뜻함을 전해줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"몽환적인 화면가 꿈을 꾸게 할 거예요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"황홀한 꿈의 세계에 취하게 될 거예요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"생동하는 화면가 활력을 줄 거예요","green-deep":"압도적인 자연의 힘을 느낄 거예요","gray-light":"담담한 화면가 마음을 정리해줘요","gray-medium":"고독한 화면가 당신과 함께할 거예요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Odilon Redon의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['초현실 심연'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'dickens-christmas-carol-scrooge-dreams',
  'Dickens’ Christmas carol. Scrooge dreams (1906-1921)',
  'Arthur Rackham',
  '',
  'surreal',
  '초현실 심연',
  'Surreal Abyss',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488232/sayu/artvee/full/dickens-christmas-carol-scrooge-dreams.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488235/sayu/artvee/thumbnails/dickens-christmas-carol-scrooge-dreams.jpg',
  1509,
  1800,
  '{"blue-light":"차분한 분위기가 마음을 편안하게 해줄 거예요","blue-medium":"화면의 깊이가 당신의 내면과 공명합니다","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"따뜻한 에너지가 전해질 거예요","red-medium":"열정적인 꿈의 세계가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"부드러운 꿈의 세계가 미소 짓게 할 거예요","yellow-medium":"따뜻한 꿈의 세계 속에서 위안을 얻게 될 거예요","yellow-deep":"강렬한 빛이 어둠을 밝혀줄 거예요","purple-light":"몽환적인 화면가 꿈을 꾸게 할 거예요","purple-medium":"신비로운 화면가 상상력을 자극해요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"부드러운 생명력이 전해질 거예요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"잔잔한 쓸쓸함이 위로가 될 거예요","gray-medium":"쓸쓸한 꿈의 세계를 나누게 될 거예요","gray-deep":"무의 경지에서 평온을 찾게 될 거예요"}'::jsonb,
  'Arthur Rackham의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['초현실 심연'],
  60
) ON CONFLICT (id) DO NOTHING;

INSERT INTO mood_atlas_artworks (
  id, title, artist, year, region, region_name_ko, region_name_en,
  image_url, thumbnail_url, width, height,
  emotions, story, fun_fact, tags, match_score
) VALUES (
  'astrological-fantasy',
  'Astrological Fantasy (1924)',
  'Paul Klee',
  '1924',
  'surreal',
  '초현실 심연',
  'Surreal Abyss',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488436/sayu/artvee/full/astrological-fantasy.jpg',
  'https://res.cloudinary.com/dkdzgpj3n/image/upload/v1752488438/sayu/artvee/thumbnails/astrological-fantasy.jpg',
  1321,
  1800,
  '{"blue-light":"고요한 화면가 마음을 잔잔하게 해줄 거예요","blue-medium":"깊은 사색에 잠기게 될 거예요","blue-deep":"깊은 그리움이 아름답게 표현된 작품이에요","red-light":"은은한 설렘이 느껴지는 작품이에요","red-medium":"열정적인 꿈의 세계가 당신을 자극할 거예요","red-deep":"뜨거운 열정이 화폭을 넘어 전해져요","yellow-light":"온화한 화면가 마음을 밝혀줘요","yellow-medium":"희망찬 화면가 마음을 환하게 해줘요","yellow-deep":"황홀한 꿈의 세계에 휩싸이게 될 거예요","purple-light":"은은한 신비감이 느껴지는 작품이에요","purple-medium":"초현실적인 꿈의 세계에 빠져들게 될 거예요","purple-deep":"초월적 경험을 선사할 걸작이에요","green-light":"자연스러운 조화가 느껴져요","green-medium":"자연의 에너지가 넘치는 작품이에요","green-deep":"풍요로운 화면가 마음을 가득 채워요","gray-light":"고요한 꿈의 세계 속에서 평화를 찾아요","gray-medium":"우울한 분위기가 공감을 불러일으켜요","gray-deep":"강렬한 공허함이 오히려 위안이 돼요"}'::jsonb,
  'Paul Klee의 대표작 중 하나로, 당대 예술계에 큰 영향을 미친 작품입니다.',
  '이 시대를 대표하는 걸작으로, 미술사적으로 중요한 의미를 지닙니다.',
  ARRAY['초현실 심연'],
  60
) ON CONFLICT (id) DO NOTHING;
