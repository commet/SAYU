# Korean Public APIs for Exhibition/Art Data - Complete Catalog

Research date: 2026-03-14

## Currently Used by SAYU

| # | API Name | Endpoint | Env Var | Status |
|---|----------|----------|---------|--------|
| 1 | KCISA 전시정보(통합) API_CCA_145 | `https://api.kcisa.kr/openapi/API_CCA_145/request` | `KCISA_EXHIBITION_API_KEY` | Active |
| 2 | KCISA 국립현대미술관 docMeta | `https://api.kcisa.kr/openapi/service/rest/moca/docMeta` | `KCISA_API_KEY` | Active |
| 3 | KCISA 문화예술공연(통합) CNV_060 | `https://api.kcisa.kr/openapi/CNV_060/request` | `KCISA_CULTURE_API_KEY` | Active |
| 4 | 한눈에보는문화정보조회서비스 | `https://apis.data.go.kr/B553457/cultureinfo` | `KOREA_CULTURE_API_KEY` | Active |
| 5 | 서울열린데이터광장 culturalEventInfo | `http://openapi.seoul.go.kr:8088/{key}/json/culturalEventInfo/` | `SEOUL_OPENDATA_API_KEY` | Active |
| 6 | 한국관광공사 TourAPI KorService1 | `http://apis.data.go.kr/B551011/KorService1` | `VISITKOREA_API_KEY` | Configured but unused |

---

## NEW APIs to Add

### TIER 1: High Value - Direct Exhibition Data (Recommend Immediate Integration)

#### 1. KCISA 예술의전당_전시정보 (API_CCA_149)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CCA_149/request`
- **Data**: Exhibition information from Seoul Arts Center (SAC) - one of Korea's most important exhibition venues
- **Fields**: Title, period, time, venue, admission fee, description
- **API Key**: Register at https://www.culture.go.kr/data (free, same KCISA key works)
- **Records**: ~100-300 per year (SAC exhibitions only)
- **Free**: Yes
- **Why**: SAC hosts major art exhibitions year-round. Direct API = much better than crawling.

#### 2. KCISA 예술의전당_종합 공연정보 (API_CCA_148)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CCA_148/request`
- **Data**: All performances and events at Seoul Arts Center, including exhibitions tagged as performances
- **Fields**: Title, keywords, description, performance time
- **API Key**: Same KCISA key
- **Records**: ~500-1000 per year
- **Free**: Yes
- **Why**: Catches exhibition-adjacent events that API_CCA_149 might miss.

#### 3. KCISA 국립아시아문화전당_행사일정 (API_CCA_167)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CCA_167/request`
- **Data**: Event schedules from Asia Culture Center (ACC) in Gwangju
- **Fields**: Event list and detail information
- **API Key**: Same KCISA key
- **Records**: ~200-400 per year
- **Free**: Yes
- **Why**: ACC is a major national cultural institution. Covers Gwangju region.

#### 4. KCISA 전국 박물관 미술관_공연행사 (API_CNV_066)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CNV_066/request`
- **Data**: Performance and event info near museums/galleries nationwide. Includes museum name, address, coordinates, schedule.
- **API Key**: Same KCISA key
- **Records**: Potentially thousands
- **Free**: Yes
- **Why**: Maps events to physical museum/gallery locations. Great for location-based recommendations.

#### 5. KCISA 공연정보(통합) (API_CCA_144)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CCA_144/request`
- **Data**: Integrated performance info from 27 institutions (same institutions as API_CCA_145 exhibition integrated). Can capture cross-tagged exhibition events.
- **API Key**: Same KCISA key
- **Records**: Several thousand
- **Free**: Yes
- **Why**: Same 27-institution coverage as our exhibition API but for performances. Some exhibitions are tagged as performances.

#### 6. 문화체육관광부_12개 기관 전시정보 (data.go.kr #15105037)
- **Endpoint**: Via KCISA (linked from data.go.kr to culture.go.kr)
- **Data**: Exhibition info from 12 major institutions including 국립어린이청소년도서관, 국립현대미술관, 대한민국역사박물관
- **API Key**: data.go.kr registration (free)
- **Records**: ~200-500
- **Free**: Yes
- **Why**: Focused on 12 top-tier institutions. May overlap with API_CCA_145 but provides different metadata format.

#### 7. 문화체육관광부_전시정보(국립현대미술관) (data.go.kr #15058313)
- **Endpoint**: Via KCISA
- **Data**: MMCA-specific exhibition details including exhibition planning, media art, cultural policy data
- **API Key**: data.go.kr registration (free)
- **Records**: ~50-100 per year (MMCA exhibitions only)
- **Free**: Yes
- **Why**: Richer MMCA-specific data than the general docMeta endpoint we already use.

#### 8. 문화체육관광부_국립지방박물관 전시 통합정보 (data.go.kr #15105220)
- **Endpoint**: Via KCISA
- **Data**: Integrated exhibition info from all 13 national regional museums (국립경주/광주/부여/대구/청주/김해/제주/춘천/진주/공주/익산/나주/미륵사지박물관)
- **API Key**: data.go.kr registration (free)
- **Records**: ~300-500
- **Free**: Yes
- **Why**: Fills the regional museum gap. These are major institutions outside Seoul.

#### 9. KOPIS 공연예술통합전산망 (data.go.kr #15097805)
- **Endpoint**: `http://www.kopis.or.kr/openApi/restful/pblprfr`
- **Data**: Comprehensive performing arts database. Includes exhibition-adjacent events, venue info, ticket sales data.
- **Sub-endpoints**:
  - `/pblprfr` - Performance list
  - `/pblprfr/{id}` - Performance detail
  - `/prfplc` - Venue list
  - `/prfplc/{id}` - Venue detail
  - `/boxoffice` - Box office rankings
- **API Key**: Register at https://www.kopis.or.kr (free, separate registration)
- **Records**: 100,000+ performances in database
- **Free**: Yes
- **Why**: The single largest performing arts database in Korea. While focused on performances, it captures exhibitions at performing arts centers.
- **Note**: Uses genre codes (AAAA=theater, BBBC=musical, EEEA=mixed genre). Filter for EEEA or keywords to find exhibitions.

#### 10. 한국문화정보원_문화시설조회서비스 (data.go.kr #15138930)
- **Endpoint**: `https://apis.data.go.kr/B553457/nopenapi/rest/cultureartspaces`
- **Data**: Cultural facility information nationwide (museums, galleries, art centers, performance halls)
- **Fields**: Facility name, address, coordinates, type, opening hours, contact
- **API Key**: data.go.kr registration (free, auto-approved)
- **Records**: Several thousand facilities
- **Free**: Yes
- **Why**: Master list of all cultural venues in Korea. Essential for mapping exhibitions to venues and for location-based discovery.

---

### TIER 2: Regional Exhibition APIs (Good for Coverage)

#### 11. 부산광역시_전시 목록 서비스 (data.go.kr #15063737)
- **Endpoint**: Busan city API
- **Data**: Exhibition listings in Busan metropolitan area
- **API Key**: data.go.kr registration
- **Records**: ~100-300
- **Free**: Yes

#### 12. 부산광역시_전시 상세 서비스 (data.go.kr #15063738)
- **Endpoint**: `https://apis.data.go.kr/6260000/BusanCultureExhibitDetailService/getBusanCultureExhibitDetail`
- **Data**: Detailed exhibition info for Busan exhibitions
- **API Key**: data.go.kr registration
- **Records**: ~100-300
- **Free**: Yes

#### 13. 부산광역시_전시공간 목록 서비스 (data.go.kr #15063756)
- **Endpoint**: Busan city API
- **Data**: Exhibition venues/spaces in Busan
- **API Key**: data.go.kr registration
- **Records**: ~50-100 venues
- **Free**: Yes

#### 14. 부산광역시_부산시립미술관 소장품정보 (data.go.kr #15143189)
- **Endpoint**: `https://apis.data.go.kr/6260000/PsgudInfoService`
- **Data**: Busan Museum of Art collection information
- **API Key**: data.go.kr registration
- **Records**: Unknown (collection-based)
- **Free**: Yes

#### 15. 대구광역시_공연/전시 정보 (data.go.kr #15084620)
- **Endpoint**: Daegu city API
- **Data**: Performance and exhibition information from Daegu Cultural Arts Promotion Agency
- **API Key**: data.go.kr registration
- **Records**: ~100-300
- **Free**: Yes

#### 16. 제주특별자치도_제주문화예술진흥원 공연/전시 정보 (data.go.kr #15057632)
- **Endpoint**: Jeju province API
- **Data**: Performance and exhibition info from Jeju Culture & Arts Foundation (main hall, small hall, exhibition hall)
- **API Key**: data.go.kr registration
- **Records**: ~50-100
- **Free**: Yes

#### 17. 제주특별자치도_전시문화행사정보 (data.go.kr #15082029)
- **Endpoint**: Jeju province API
- **Data**: Exhibition/culture/event information including category, fees, venue, contact
- **API Key**: data.go.kr registration
- **Records**: ~100-300
- **Free**: Yes

#### 18. 경기도_문화 전시 현황 (data.go.kr #15057402)
- **Endpoint**: Available via data.gg.go.kr
- **Data**: Exhibition status from Gyeonggi Cultural Foundation, Gyeonggi Museum, Gyeonggi Museum of Art, Nam June Paik Art Center, Silhak Museum, Jeonggok Prehistoric Museum, Gyeonggi Children's Museum, Gyeonggi Creation Center
- **API Key**: data.go.kr or data.gg.go.kr registration
- **Records**: ~100-200
- **Free**: Yes
- **Why**: Covers 8 major Gyeonggi institutions including Nam June Paik Art Center.

#### 19. 경기도_문화 행사 현황 (data.go.kr #15117057)
- **Endpoint**: Gyeonggi province API
- **Data**: Cultural event information from Gyeonggi province
- **API Key**: data.go.kr registration
- **Records**: ~200-500
- **Free**: Yes

#### 20. 인천광역시_문화예술행사 (data.go.kr #15057287)
- **Endpoint**: Incheon city API
- **Data**: Cultural arts events in Incheon
- **API Key**: data.go.kr registration
- **Records**: ~100-200
- **Free**: Yes

#### 21. 광주광역시_미술관 소장품 (data.go.kr #15110435)
- **Endpoint**: `https://apis.data.go.kr/6290000/gjCollection`
- **Data**: Gwangju Museum of Art collection data
- **API Key**: data.go.kr registration
- **Records**: Unknown (collection-based)
- **Free**: Yes

#### 22. 서울올림픽기념국민체육진흥공단_소마미술관 조각작품 정보 (data.go.kr #15107785)
- **Endpoint**: `https://apis.data.go.kr/B551014/SRVC_SOMA_SCLPTR`
- **Data**: SOMA (Seoul Olympic Museum of Art) sculpture/artwork information
- **API Key**: data.go.kr registration
- **Records**: ~100-500
- **Free**: Yes

#### 23. 국회 국회사무처_아트갤러리 전시 일정 (data.go.kr #15126012)
- **Endpoint**: `https://open.assembly.go.kr/portal/data/service/selectServicePage.do`
- **Data**: National Assembly Art Gallery exhibition schedule
- **API Key**: open.assembly.go.kr registration
- **Records**: ~20-50 per year
- **Free**: Yes

---

### TIER 3: Collection/Artifact APIs (Artwork Data, Not Exhibition Events)

#### 24. 문화체육관광부_국립박물관 전시도록 (data.go.kr #15105232)
- **Endpoint**: Via KCISA
- **Data**: Exhibition catalog/publication information from national museums
- **Free**: Yes

#### 25. 문화체육관광부_20개 기관 유물정보 (data.go.kr #15105038)
- **Endpoint**: Via KCISA
- **Data**: Artifact information from 20 government institutions
- **Free**: Yes

#### 26. 문화체육관광부_국립중앙박물관 유물정보 (data.go.kr #15121515)
- **Endpoint**: Via KCISA
- **Data**: National Museum of Korea artifact/collection data
- **Free**: Yes

#### 27. 문화체육관광부_국립경주박물관 유물정보 (data.go.kr #15104928)
- **Endpoint**: Via KCISA
- **Data**: Gyeongju National Museum artifact data
- **Free**: Yes

#### 28. 문화체육관광부_국립중앙박물관_e뮤지엄_유물정보 (data.go.kr #15104964)
- **Endpoint**: Via KCISA
- **Data**: National Museum e-Museum digitized artifact information
- **Free**: Yes

#### 29. KCISA 국립중앙박물관 외_유물정보(주요유물) (API_CNV_048)
- **Endpoint**: `https://api.kcisa.kr/API_CNV_048/request`
- **Data**: Key artifacts from national museums
- **Free**: Yes

#### 30. KCISA 국립광주박물관 외_전시도록 (API_CNV_049)
- **Endpoint**: `https://api.kcisa.kr/API_CNV_049/request`
- **Data**: Exhibition catalogs from Gwangju National Museum and others
- **Free**: Yes

#### 31. KCISA 국립광주박물관_소장품_리스트 (API_CHA_088)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CHA_088/request`
- **Data**: Gwangju National Museum collection list
- **Free**: Yes

#### 32. KCISA 국립청주박물관_소장품 (API_CHA_084)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CHA_084/request`
- **Data**: Cheongju National Museum collection
- **Free**: Yes

#### 33. KCISA 국립현대미술관_레지던시작가소식 (API_CCA_166)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CCA_166/request`
- **Data**: MMCA residency artist news/updates
- **Free**: Yes
- **Why**: Good for tracking emerging artists and their activities.

#### 34. 국가유산청_왕실유물정보 (data.go.kr #3073972)
- **Endpoint**: Korea Heritage Service API
- **Data**: Royal artifact information
- **Free**: Yes

#### 35. 문화체육관광부 국립중앙박물관 국립공주박물관_유물정보 (data.go.kr #3078569)
- **Endpoint**: Via data.go.kr
- **Data**: Artifact info from National Museum and Gongju National Museum
- **Free**: Yes

---

### TIER 4: Supplementary/Venue APIs

#### 36. KCISA 국립한글박물관_문화행사 (API_CCA_164)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CCA_164/request`
- **Data**: Korean Alphabet Museum cultural events
- **Free**: Yes

#### 37. KCISA 국립부여박물관_교육행사 (API_CHA_086)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CHA_086/request`
- **Data**: Buyeo National Museum education events
- **Free**: Yes

#### 38. 국가유산청 국립무형유산원_무형문화재 전시 정보 (data.go.kr #15041863)
- **Endpoint**: Heritage Service API
- **Data**: Intangible cultural heritage exhibition information
- **Free**: Yes

#### 39. 문화체육관광부_국립지방박물관 문화행사 통합정보 (data.go.kr #15105222)
- **Endpoint**: Via KCISA
- **Data**: Cultural events from all 13 national regional museums
- **Free**: Yes

#### 40. 문화체육관광부_문화예술공연(통합) (data.go.kr #15121487)
- **Endpoint**: This is the data.go.kr mirror of our existing CNV_060 KCISA API
- **Data**: Same as CNV_060 - integrated cultural arts performance info
- **Note**: Duplicate of what we already use via KCISA. Skip if CNV_060 works.

#### 41. KCISA 국립민속박물관_한국민속대백과사전 (API_CHA_083)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CHA_083/request`
- **Data**: Korean Folk Encyclopedia data from National Folk Museum
- **Free**: Yes

#### 42. KCISA 국립국악원_소장자료(공공누리) (API_CHA_085)
- **Endpoint**: `https://api.kcisa.kr/openapi/API_CHA_085/request`
- **Data**: National Gugak Center collection data (traditional music)
- **Free**: Yes

---

## API Key Registration Summary

| Portal | URL | Registration | Approval |
|--------|-----|-------------|----------|
| data.go.kr (공공데이터포털) | https://www.data.go.kr | Free account | Most APIs auto-approved |
| culture.go.kr (문화공공데이터광장/KCISA) | https://www.culture.go.kr/data | Free account | Auto-approved |
| Seoul Open Data | https://data.seoul.go.kr | Free account | Auto-approved |
| KOPIS | https://www.kopis.or.kr | Free account, separate API key request | Manual review ~1-2 days |
| Gyeonggi Open Data | https://data.gg.go.kr | Free account | Auto-approved |
| National Assembly Open API | https://open.assembly.go.kr | Free account | Auto-approved |

### Key Insight on KCISA Keys
Many KCISA APIs share the same authentication system. If you have a key for one API_CCA_xxx or API_CNV_xxx endpoint, it may work for others. However, you should verify this for each endpoint as some APIs require separate activation.

---

## Priority Implementation Plan

### Phase 1 - Quick Wins (same KCISA key, just add endpoints)
1. API_CCA_149 - Seoul Arts Center exhibitions
2. API_CCA_167 - Asia Culture Center events
3. API_CNV_066 - Museum/gallery events nationwide
4. API_CCA_144 - Integrated performance info (27 institutions)

### Phase 2 - New Key Required (data.go.kr registration)
5. 문화시설조회서비스 (B553457/nopenapi/rest/cultureartspaces) - venue master list
6. 국립지방박물관 전시 통합정보 (#15105220) - 13 regional museum exhibitions
7. 12개 기관 전시정보 (#15105037) - 12 key institution exhibitions

### Phase 3 - Regional Coverage
8. Busan exhibition APIs (#15063737, #15063738)
9. Daegu exhibition API (#15084620)
10. Jeju exhibition APIs (#15057632, #15082029)
11. Gyeonggi exhibition APIs (#15057402, #15117057)
12. Incheon cultural events (#15057287)

### Phase 4 - Specialized Sources
13. KOPIS API (requires separate registration)
14. Collection/artifact APIs (for artwork data enrichment)
15. National Assembly Art Gallery (#15126012)

---

## Estimated Total Records

| Source Type | Estimated Records | Notes |
|-------------|------------------|-------|
| Currently collected | ~9,000+ | From 6 active sources |
| Tier 1 new sources | ~5,000-10,000 | Exhibition events + venues |
| Tier 2 regional | ~1,000-2,000 | Regional cities coverage |
| Tier 3 collections | ~50,000+ | Artwork/artifact metadata |
| KOPIS | ~100,000+ | Performing arts (filter for exhibitions) |
| **Total potential** | **~165,000+** | **With all sources integrated** |

---

## Notes

1. All APIs listed here are free and publicly available through Korean government open data portals.
2. The KCISA APIs (api.kcisa.kr) are the most reliable source for exhibition-specific data.
3. data.go.kr APIs sometimes redirect to KCISA (culture.go.kr) for cultural data.
4. Regional city APIs provide local exhibition data not covered by national APIs.
5. Daily rate limits are typically 1,000 calls/day for data.go.kr and KCISA APIs.
6. Seoul Open Data (culturalEventInfo) currently has ~3,950 active events.
7. The API_CCA_145 (exhibition integrated) now covers 27 institutions (up from 23 originally documented).
