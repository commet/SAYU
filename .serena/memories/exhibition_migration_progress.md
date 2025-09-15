# Exhibition Migration Progress - 2025-09-08

## 현재 상황
- exhibitions-sept-batch1.sql ~ batch22.sql 파일 생성 완료
- batch1-4.sql: 20개 전시 정보 입력 완료 (오수환 전시 포함)
- **batch5.sql부터 작업 재개 예정** (21-25번 전시)
- instagram_url 컬럼 추가 완료

## 다음 작업
- batch5.sql (21-25번 전시)부터 순차적으로 전시 정보 입력
- 각 batch는 5개 전시씩 포함
- 총 110개 전시 중 20개 완료, 90개 남음

## 파일 구조
- batch 파일들: exhibitions-sept-batch{1-22}.sql
- 상태 확인: exhibition-work-resume.js
- 작업 현황: exhibition-migration-status.md