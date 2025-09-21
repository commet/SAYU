-- SAYU Art Counselor - 16개 퍼블릭 도메인 작품 데이터 삽입

INSERT INTO artworks (id, title, artist, year_created, medium, dimensions, image_url, style, metadata) VALUES

-- 1. 빈센트 반 고흐 - 별이 빛나는 밤
('550e8400-e29b-41d4-a716-446655440001',
 '별이 빛나는 밤',
 '빈센트 반 고흐',
 '1889',
 '유화', '73.7 × 92.1 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
 '포스트 인상주의',
 '{"title_en": "The Starry Night", "artist_en": "Vincent van Gogh", "country": "France", "location": "뉴욕 현대미술관", "mood": ["contemplation", "wonder"], "colors": ["blue", "yellow", "black"]}'),

-- 2. 클로드 모네 - 수련
('550e8400-e29b-41d4-a716-446655440002',
 '수련',
 '클로드 모네',
 '1906',
 '유화', '89.9 × 94.1 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg/1280px-Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
 '인상주의',
 '{"title_en": "Water Lilies", "artist_en": "Claude Monet", "country": "France", "location": "시카고 미술관", "mood": ["peace", "tranquility"], "colors": ["blue", "green", "pink"]}'),

-- 3. 구스타프 클림트 - 키스
('550e8400-e29b-41d4-a716-446655440003',
 '키스',
 '구스타프 클림트',
 '1908',
 '유화, 금박', '180 × 180 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg/1280px-Gustav_Klimt_-_The_Kiss_-_Google_Cultural_Institute.jpg',
 '아르누보',
 '{"title_en": "The Kiss", "artist_en": "Gustav Klimt", "country": "Austria", "location": "벨베데레 궁전", "mood": ["love", "passion"], "colors": ["gold", "yellow", "brown"]}'),

-- 4. 에드바르 뭉크 - 절규
('550e8400-e29b-41d4-a716-446655440004',
 '절규',
 '에드바르 뭉크',
 '1893',
 '유화, 템페라, 파스텔', '91 × 73.5 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg/800px-Edvard_Munch%2C_1893%2C_The_Scream%2C_oil%2C_tempera_and_pastel_on_cardboard%2C_91_x_73_cm%2C_National_Gallery_of_Norway.jpg',
 '표현주의',
 '{"title_en": "The Scream", "artist_en": "Edvard Munch", "country": "Norway", "location": "노르웨이 국립미술관", "mood": ["anxiety", "fear"], "colors": ["orange", "red", "blue"]}'),

-- 5. 요하네스 페르메이르 - 진주 귀걸이를 한 소녀
('550e8400-e29b-41d4-a716-446655440005',
 '진주 귀걸이를 한 소녀',
 '요하네스 페르메이르',
 '1665',
 '유화', '44.5 × 39 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/1665_Girl_with_a_Pearl_Earring.jpg/800px-1665_Girl_with_a_Pearl_Earring.jpg',
 '바로크',
 '{"title_en": "Girl with a Pearl Earring", "artist_en": "Johannes Vermeer", "country": "Netherlands", "location": "마우리츠하위스 미술관", "mood": ["mystery", "beauty"], "colors": ["blue", "yellow", "brown"]}'),

-- 6. 산드로 보티첼리 - 비너스의 탄생
('550e8400-e29b-41d4-a716-446655440006',
 '비너스의 탄생',
 '산드로 보티첼리',
 '1485',
 '템페라', '172.5 × 278.9 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg/1280px-Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
 '초기 르네상스',
 '{"title_en": "The Birth of Venus", "artist_en": "Sandro Botticelli", "country": "Italy", "location": "우피치 갤러리", "mood": ["beauty", "divine"], "colors": ["pink", "blue", "white"]}'),

-- 7. 렘브란트 - 야경
('550e8400-e29b-41d4-a716-446655440007',
 '야경',
 '렘브란트',
 '1642',
 '유화', '363 × 437 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/The_Night_Watch_-_HD.jpg/1280px-The_Night_Watch_-_HD.jpg',
 '바로크',
 '{"title_en": "The Night Watch", "artist_en": "Rembrandt van Rijn", "country": "Netherlands", "location": "레이크스 미술관", "mood": ["action", "drama"], "colors": ["brown", "yellow", "black"]}'),

-- 8. 김홍도 - 씨름
('550e8400-e29b-41d4-a716-446655440008',
 '씨름',
 '김홍도',
 '1790',
 '수묵담채화', '27 × 22.7 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Ssireum_by_Kim_Hong-do.jpg/800px-Ssireum_by_Kim_Hong-do.jpg',
 '조선 후기 풍속화',
 '{"title_en": "Ssireum", "artist_en": "Kim Hong-do", "country": "Korea", "location": "국립중앙박물관", "mood": ["joy", "energy"], "colors": ["brown", "beige", "red"]}'),

-- 9. 신윤복 - 미인도
('550e8400-e29b-41d4-a716-446655440009',
 '미인도',
 '신윤복',
 '1805',
 '수묵담채화', '114 × 45.5 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Shin_Yun-bok-Miindo.jpg/600px-Shin_Yun-bok-Miindo.jpg',
 '조선 후기 풍속화',
 '{"title_en": "Portrait of a Beauty", "artist_en": "Shin Yun-bok", "country": "Korea", "location": "간송미술관", "mood": ["elegance", "grace"], "colors": ["white", "pink", "black"]}'),

-- 10. 폴 세잔 - 사과와 오렌지가 있는 정물
('550e8400-e29b-41d4-a716-446655440010',
 '사과와 오렌지가 있는 정물',
 '폴 세잔',
 '1899',
 '유화', '74 × 93 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Paul_C%C3%A9zanne%2C_Apples_and_Oranges%2C_ca._1899%2C_oil_on_canvas%2C_74_x_93_cm%2C_Mus%C3%A9e_d%27Orsay%2C_Paris.jpg/1280px-Paul_C%C3%A9zanne%2C_Apples_and_Oranges%2C_ca._1899%2C_oil_on_canvas%2C_74_x_93_cm%2C_Mus%C3%A9e_d%27Orsay%2C_Paris.jpg',
 '포스트 인상주의',
 '{"title_en": "Still Life with Apples and Oranges", "artist_en": "Paul Cézanne", "country": "France", "location": "오르세 미술관", "mood": ["balance", "harmony"], "colors": ["orange", "red", "blue"]}'),

-- 11. 피에르 오귀스트 르누아르 - 뱃놀이 일행의 오찬
('550e8400-e29b-41d4-a716-446655440011',
 '뱃놀이 일행의 오찬',
 '피에르 오귀스트 르누아르',
 '1881',
 '유화', '129.9 × 172.7 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg/1280px-Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg',
 '인상주의',
 '{"title_en": "Luncheon of the Boating Party", "artist_en": "Pierre-Auguste Renoir", "country": "France", "location": "필립스 컬렉션", "mood": ["joy", "social"], "colors": ["blue", "white", "yellow"]}'),

-- 12. 에드가 드가 - 무용 수업
('550e8400-e29b-41d4-a716-446655440012',
 '무용 수업',
 '에드가 드가',
 '1874',
 '유화', '85 × 75 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg/1024px-Edgar_Degas_-_The_Dance_Class_-_Google_Art_Project.jpg',
 '인상주의',
 '{"title_en": "The Dance Class", "artist_en": "Edgar Degas", "country": "France", "location": "오르세 미술관", "mood": ["grace", "discipline"], "colors": ["beige", "white", "brown"]}'),

-- 13. 카스파르 다비트 프리드리히 - 안개 바다 위의 방랑자
('550e8400-e29b-41d4-a716-446655440013',
 '안개 바다 위의 방랑자',
 '카스파르 다비트 프리드리히',
 '1818',
 '유화', '98.4 × 74.8 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg/800px-Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',
 '낭만주의',
 '{"title_en": "Wanderer above the Sea of Fog", "artist_en": "Caspar David Friedrich", "country": "Germany", "location": "함부르크 미술관", "mood": ["contemplation", "sublime"], "colors": ["grey", "blue", "white"]}'),

-- 14. 앙리 드 툴루즈 로트렉 - 물랭 루주
('550e8400-e29b-41d4-a716-446655440014',
 '물랭 루주의 무도회',
 '앙리 드 툴루즈 로트렉',
 '1892',
 '유화', '123 × 140.5 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Lautrec_at_the_moulin_rouge_1892.jpg/1280px-Lautrec_at_the_moulin_rouge_1892.jpg',
 '포스트 인상주의',
 '{"title_en": "At the Moulin Rouge", "artist_en": "Henri de Toulouse-Lautrec", "country": "France", "location": "시카고 미술관", "mood": ["nightlife", "energy"], "colors": ["red", "yellow", "green"]}'),

-- 15. 윌리엄 터너 - 비, 증기, 속도
('550e8400-e29b-41d4-a716-446655440015',
 '비, 증기, 속도',
 '윌리엄 터너',
 '1844',
 '유화', '91 × 121.8 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Rain_Steam_and_Speed_the_Great_Western_Railway.jpg/1280px-Rain_Steam_and_Speed_the_Great_Western_Railway.jpg',
 '낭만주의',
 '{"title_en": "Rain, Steam and Speed", "artist_en": "J.M.W. Turner", "country": "England", "location": "내셔널 갤러리", "mood": ["motion", "progress"], "colors": ["yellow", "brown", "grey"]}'),

-- 16. 정선 - 인왕제색도
('550e8400-e29b-41d4-a716-446655440016',
 '인왕제색도',
 '정선',
 '1751',
 '수묵담채화', '79.2 × 138.2 cm',
 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Inwangjesaekdo.jpg/1280px-Inwangjesaekdo.jpg',
 '조선 후기 진경산수화',
 '{"title_en": "Inwangjesaekdo", "artist_en": "Jeong Seon", "country": "Korea", "location": "리움미술관", "mood": ["majesty", "nature"], "colors": ["grey", "brown", "blue"]}')

ON CONFLICT (id) DO NOTHING;

-- 삽입 결과 확인
SELECT
  COUNT(*) as total_artworks,
  COUNT(CASE WHEN metadata->>'country' = 'Korea' THEN 1 END) as korean_artists,
  array_agg(DISTINCT style) as art_styles
FROM artworks;

SELECT 'SUCCESS: 16개 작품 데이터 삽입 완료!' as message;