# SAYU 전시 데이터 보강 시스템

SAYU의 전시 데이터를 AI 기반으로 자동 보강하고 16가지 APT 유형별 매칭 점수를 계산하는 시스템입니다.

## 🎯 주요 기능

### 1. AI 기반 전시 설명 자동 생성
- **Google Gemini API** 활용
- 전시 제목, 장소, 장르 정보 기반 설명 생성
- 200-300자 내외의 한국어 감성적 설명
- 방문자 관점의 체험 중심 서술

### 2. 키워드 자동 추출
- AI 기반 핵심 키워드 5-8개 추출
- 감정, 분위기, 장르, 매체 키워드 포함
- 검색 및 매칭 시스템에 활용

### 3. 전시 카테고리 자동 분류
- 10가지 주요 카테고리로 자동 분류
- 회화, 조각, 설치미술, 미디어아트, 사진, 디자인 등
- 규칙 기반 + AI 학습 조합

### 4. APT 유형별 매칭 점수 계산
- **16가지 APT 유형**별 0-100점 매칭 점수
- 감정 키워드, 카테고리, 장소 선호도 종합 반영
- 실시간 개인화 추천 시스템 기반

### 5. 외부 API 연동
- **국립현대미술관 API**
- **서울시립미술관 API**  
- 공식 전시 정보 보강

## 🗄️ 데이터베이스 구조

### 핵심 테이블

```sql
-- 키워드 테이블
exhibition_keywords (
  exhibition_id, keyword, weight, source
)

-- 카테고리 테이블  
exhibition_categories (
  exhibition_id, category, confidence, source
)

-- APT 매칭 점수 테이블
apt_exhibition_scores (
  exhibition_id, apt_type, score, calculated_at
)

-- 데이터 품질 관리
exhibition_data_quality (
  exhibition_id, overall_score, completeness_score
)

-- 배치 작업 관리
data_enrichment_batches (
  batch_name, status, progress_percentage
)
```

## 🚀 설치 및 실행

### 1. 환경변수 설정

```bash
# .env 파일에 추가
GEMINI_API_KEY=your_gemini_api_key
NMMA_API_KEY=your_national_museum_api_key       # 선택
SEOUL_MUSEUM_API_KEY=your_seoul_museum_api_key  # 선택
```

### 2. 스키마 설정

```bash
# 데이터베이스 스키마 생성
npm run enrich:setup

# 또는 개별 실행
node run-exhibition-enrichment.js --setup
```

### 3. 데이터 보강 실행

```bash
# 기본 실행 (10개씩 3배치)
npm run enrich:run

# 커스텀 배치 크기 
node run-exhibition-enrichment.js --enrich --batch=20 --max=5

# 전체 프로세스 (설정+보강+리포트)
npm run enrich:full
```

### 4. 품질 리포트 확인

```bash
# 콘솔 리포트
npm run enrich:report

# 웹 대시보드 접속
http://localhost:3001/admin/data-enrichment
```

## 📊 관리자 대시보드

### 실시간 모니터링
- `/admin/data-enrichment` 접속
- 배치 작업 실시간 진행률 표시
- APT 유형별 매칭 현황 시각화
- 데이터 품질 지표 대시보드

### 대시보드 기능
1. **개요 탭**: 전체 통계 및 품질 분포
2. **보강 작업 탭**: 새 작업 시작 및 이력 관리  
3. **APT 통계 탭**: 16가지 유형별 매칭 현황
4. **전시 목록 탭**: 개별 전시 데이터 상태

## 🔧 API 엔드포인트

### 배치 작업 관리
```
POST   /api/exhibitions/enrich/start        # 배치 시작
GET    /api/exhibitions/enrich/status/:id   # 진행 상황 조회
DELETE /api/exhibitions/enrich/cancel/:id   # 작업 취소
```

### 데이터 조회
```
GET /api/exhibitions/enrich/quality-report  # 품질 리포트
GET /api/exhibitions/enrich/dashboard       # 대시보드 데이터  
GET /api/exhibitions/enrich/apt-stats       # APT 통계
```

### 개별 처리
```
POST /api/exhibitions/enrich/single/:id     # 단일 전시 보강
```

## 🎨 16가지 APT 유형 매핑

### 몽상가 부족 (LA군)
- **LAEF (여우)**: 몽환적 방랑자 - 추상, 초현실, 자유 지향
- **LAEC (고양이)**: 감성 큐레이터 - 세련, 조화, 미적 감각
- **LAMF (올빼미)**: 직관적 탐구자 - 철학, 개념, 깊이 추구  
- **LAMC (거북이)**: 철학적 수집가 - 체계, 연구, 보존 중시

### 관찰자 부족 (LR군)  
- **LREF (카멜레온)**: 고독한 관찰자 - 사실주의, 자연, 정적
- **LREC (고슴도치)**: 섬세한 감정가 - 따뜻함, 공감, 이야기
- **LRMF (문어)**: 디지털 탐험가 - 기술, 혁신, 미래 지향
- **LRMC (비버)**: 학구적 연구자 - 학술, 이론, 전문성

### 연결자 부족 (SA군)
- **SAEF (나비)**: 감성 나누미 - 공유, 밝음, 긍정 에너지
- **SAEC (펭귄)**: 예술 네트워커 - 커뮤니티, 소통, 협력
- **SAMF (앵무새)**: 영감 전도사 - 메시지, 변화, 사회적 영향
- **SAMC (사슴)**: 문화 기획자 - 교육, 조직, 포용적 기획

### 전달자 부족 (SR군)
- **SREF (강아지)**: 열정적 관람자 - 에너지, 참여, 체험 중시
- **SREC (오리)**: 따뜻한 안내자 - 친절, 보살핌, 가족 친화
- **SRMF (코끼리)**: 지식 멘토 - 교육, 학습, 경험 공유
- **SRMC (독수리)**: 체계적 교육자 - 구조적, 전문적, 완성도

## 📈 데이터 품질 지표

### 완성도 점수 (0-100점)
- **설명 보유**: 30점 (200자 이상 = 30점, 100자 이상 = 20점)
- **키워드 보유**: 25점 (5개 이상 = 25점, 3개 이상 = 15점)  
- **APT 커버리지**: 25점 (8개 이상 60점 = 25점)
- **카테고리 분류**: 10점
- **이미지 보유**: 10점

### 품질 등급
- **우수 (80점 이상)**: 모든 데이터 완비
- **양호 (60-79점)**: 기본 정보 충족
- **보통 (40-59점)**: 일부 정보 부족  
- **부족 (40점 미만)**: 대폭적인 보강 필요

## 🔄 배치 처리 흐름

1. **전시 선별**: 설명이 없거나 부족한 전시 탐지
2. **외부 API 조회**: 공식 미술관 API에서 추가 정보 수집
3. **AI 설명 생성**: Gemini API로 감성적 설명 생성
4. **키워드 추출**: 핵심 키워드 5-8개 자동 추출
5. **카테고리 분류**: 10개 주요 카테고리로 자동 분류
6. **APT 점수 계산**: 16가지 유형별 매칭 점수 계산
7. **데이터 저장**: 관련 테이블에 보강 결과 저장
8. **품질 평가**: 종합 품질 점수 계산 및 기록

## ⚡ 성능 최적화

### API 레이트 리미트 관리
- 배치 간 5초 대기 시간
- Gemini API: 분당 60회 제한 준수
- 미술관 API: 개별 제한 사항 준수

### 메모리 최적화  
- 배치 단위 처리로 메모리 사용량 제어
- 대용량 쿼리 분할 실행
- 실시간 가비지 컬렉션 모니터링

### 에러 핸들링
- 재시도 로직 (최대 3회)
- 부분 실패 시 롤백 방지
- 상세 에러 로그 기록

## 🛠️ 트러블슈팅

### 일반적인 문제

**1. API 키 관련 오류**
```bash
❌ GEMINI_API_KEY가 설정되지 않았습니다
```
→ `.env` 파일에서 API 키 확인

**2. 스키마 적용 실패**  
```bash
❌ 테이블이 이미 존재합니다
```
→ 정상적인 메시지, 무시 가능

**3. 배치 작업 중단**
```bash
⚠️ 사용자에 의해 중단되었습니다
```
→ 진행 중인 작업은 데이터베이스에 기록됨

### 디버깅 명령어

```bash
# 스키마 상태 확인
npm run enrich:schema:verify

# 품질 리포트로 현황 파악
npm run enrich:report

# 개별 전시 테스트
curl -X POST localhost:3001/api/exhibitions/enrich/single/[exhibition-id]
```

## 📋 체크리스트

### 배포 전 확인사항
- [ ] 환경변수 설정 (GEMINI_API_KEY 필수)
- [ ] 데이터베이스 스키마 적용
- [ ] API 엔드포인트 테스트  
- [ ] 대시보드 접속 확인
- [ ] 샘플 배치 작업 실행

### 운영 모니터링
- [ ] 일일 품질 리포트 확인
- [ ] APT 매칭률 모니터링 (목표: 각 유형 60점 이상 20% 이상)
- [ ] API 사용량 추적
- [ ] 배치 작업 성공률 점검

## 🤝 기여하기

1. 새로운 APT 유형 선호도 패턴 추가
2. 추가 외부 API 연동 (해외 미술관)  
3. 다국어 지원 확대
4. 고도화된 AI 모델 적용
5. 성능 최적화 개선

---

**문의사항**: SAYU 개발팀  
**최종 업데이트**: 2025-01-13  
**버전**: v2.0