# SAYU Exhibition Batch Update Status
## Last Updated: 2025-09-07

## 📊 전체 현황
- **총 필요 전시 업데이트**: 110개 (source_url 없는 전시)
- **총 필요 Batch 파일**: 22개 (5개씩 묶음)
- **완료된 Batch**: 4개 (20개 전시)
- **남은 작업**: 18개 Batch (90개 전시)

## ✅ 완료된 Batch (1-4)

### Batch 1 (exhibitions-sept-batch1.sql) - ✅ 실행 완료
1. 오수환: 천 개의 대화 (가나아트센터)
2. 조주현 (페이토갤러리)
3. 백경호 (눈 컨템포러리)
4. 김형대 (금산갤러리)
5. Nude: Flesh & Love (제이슨함)

### Batch 2 (exhibitions-sept-batch2.sql) - ✅ 실행 완료
6. 마르크 샤갈 특별전 (예술의전당)
7. 앤서니 브라운 (디피코 미술관)
8. 안토니 곰리 (뮤지엄 SAN)
9. 미셸 들라크루아 (셀로아트센터)
10. 안소니 맥콜 (PKM갤러리)

### Batch 3 (exhibitions-sept-batch3.sql) - ✅ 실행 완료
11. 백남준 (우양미술관)
12. 아모아코 보아포 (국제갤러리)
13. 이안 하·스벤 토이퍼 (파이프갤러리)
14. 강동주 (아마도예술공간)
15. 최지목 (갤러리바톤)

### Batch 4 (exhibitions-sept-batch4.sql) - ✅ 작성 완료, ⏳ 실행 대기
16. VELVET HAMMERS (핌서울)
17. 엘리자베스 랭그리터 (MUSEUM209)
18. 옥승철: 프로토타입 (롯데뮤지엄)
19. UNDO DMZ (파주 임진각 평화누리)
20. 2025 타이틀 매치 (서울시립 북서울미술관)

## ⏳ 대기중 Batch (5-12) - 템플릿 생성됨

### Batch 5 (exhibitions-sept-batch5.sql) - 📝 템플릿
21. Under One Roof (현대카드 스토리지) - 7/1~9/7
22. 마나 모아나 (국립중앙박물관) - 7/1~9/14
23. 앨리스 달튼 브라운 (더현대 서울) - 7/1~9/20
24. 제임스 터렐 (페이스갤러리) - 7/1~9/27
25. Pit Calls Wall (뮤지엄헤드) - 7/16~9/6

### Batch 6 (exhibitions-sept-batch6.sql) - 📝 템플릿
26. 김주리 (MO BY CAN) - 8/1~9/20
27. 박용식 (상업화랑 용산) - 8/1~9/20
28. 김주리 (캔파운데이션) - 8/1~9/20
29. 노이진 (뉴스프링프로젝트) - 8/1~9/21
30. 보 킴 (BHAK) - 8/1~9/27

### Batch 7 (exhibitions-sept-batch7.sql) - 📝 템플릿
31. [VELVET HAMMERS - Batch 4에서 완료]
32. 딥다이버 - 배윤환 (스페이스K 서울) - 8/14~11/9
33. 얇은 도약의 나날들 - 양혜규 (도도빌딩) - 8/15~9/7
34. 파편의 흐름 (갤러리조선) - 8/16~10/26
35. Dust - Ruofan Chen (SHOWER) - 8/22~9/14

### Batch 8 (exhibitions-sept-batch8.sql) - 📝 템플릿
36. Messengers - 김서현 (실린더 ONE) - 8/22~9/21
37. 파노라마 (송은) - 8/22~10/16
38. 열두 개의 질문 - 안규철 (국제갤러리 부산) - 8/22~10/19
39. 형상 회로 (일민미술관) - 8/22~10/26
40. 김환기와 브라질 (환기미술관) - 8/22~11/30

### Batch 9-12 - 📝 생성 예정
- Batch 9: 41-45번 전시
- Batch 10: 46-50번 전시
- Batch 11: 51-55번 전시
- Batch 12: 56-60번 전시

## 🔄 남은 Batch (13-22) - 생성 예정
- 61-110번 전시 (Batch 13-22)
- 총 50개 전시 추가 정보 필요

## 💡 작업 재개 시 체크리스트

### 즉시 실행 가능
1. **Batch 4 실행**: exhibitions-sept-batch4.sql을 Supabase Dashboard에서 실행

### 정보 수집 필요
2. **Batch 5-8**: 템플릿 파일 생성 완료, 전시 정보 수집 필요
3. **Batch 9-22**: 템플릿 파일 생성 필요

### 유용한 명령어
```bash
# 전체 현황 확인
node count-exhibitions-needing-details.js

# 특정 batch 상태 확인
node find-exhibitions-needing-details.js

# 작업 재개 시 상태 확인
node exhibition-work-resume.js
```

## 📌 주의사항
- genre 필드는 반드시 'contemporary'로 설정
- UPDATE 문 사용 시 WHERE 절에 IN 사용 (= 대신)
- exhibitions_translations 업데이트 시 별칭 et2 사용
- 각 batch는 5개 전시씩 포함
- source_url과 instagram_url 정보 수집 중요