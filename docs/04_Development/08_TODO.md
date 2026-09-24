# 08. TODO

이 문서는 현재 구현해야 할 작업 목록이다. 완료 시 체크하고, 새 작업은 P0/P1/P2로 분류한다.

## P0: 핵심 플레이 루프

- [x] 프로젝트 엔진/프레임워크 확정.
- [x] `assets/data/balance` 폴더 생성.
- [x] JSON schema와 DataLoader 구현.
- [x] GameManager 기본 State Machine 구현.
- [x] StageManager로 `stage_001` 로드.
- [x] 하단 플레이어 입력 구현: 드래그, 릴리즈.
- [x] PoopManager 기본 스폰 구현.
- [x] normal 똥 이동/충돌 구현.
- [x] HitResolver로 Perfect/Good/Graze/Miss 판정.
- [x] 점수와 콤보 계산 구현.
- [x] 인게임 HUD 구현: 점수, 콤보, 라이프.
- [x] 결과 화면 구현.
- [x] `09_CHANGELOG.md`에 구현 기록 추가.

## P0: 데이터 기반 밸런스

- [x] `poop_balance.json` 작성.
- [x] `condition_rates.json` 작성.
- [x] `stage_balance.json` 작성.
- [x] 확률 합계 100 검증 테스트 작성.
- [ ] 코드 내 밸런스 하드코딩 검사.

## P1: 확장 시스템

- [ ] 컨디션 시스템 구현: good, normal, bad, urgent.
- [ ] FoodManager 구현: 음식 효과, 지속시간, 소화 상태.
- [ ] ChildGrowthManager 구현: 소화력, 배탈 저항, 희귀똥 확률.
- [ ] CollectionManager 구현: 똥/음식/보스/스킨/칭호/업적 도감.
- [ ] 아이 표정 전환 구현.
- [ ] fast, heavy, split, gold, poison, bomb 구현.
- [ ] ObjectPool 구현.
- [ ] 장애물 1종 구현.
- [ ] 보스 `toilet_golem` 구현.
- [ ] SaveManager 기본 저장 구현.
- [ ] 성장 Power, Hit Radius 구현.
- [ ] 기본 상점 UI 구현.
- [ ] 튜토리얼 T1~T5 구현.

## P1: QA와 모바일 대응

- [ ] 720x1280 화면 검증.
- [ ] 1080x1920 화면 검증.
- [ ] 1440x2560 화면 검증.
- [ ] 터치 영역 88px 이상 확인.
- [ ] 60초 플레이 성능 테스트.
- [ ] 저장/로드 회귀 테스트.

## P2: 라이브/BM/수집

- [ ] 도감 시스템 구현.
- [ ] Story/Rank/Battle 모드 규칙 JSON 작성.
- [ ] Rank Mode deterministic seed 구조 설계.
- [ ] Real-Time Battle Mode 방해/버프 효과 설계.
- [ ] 시즌 보상 테이블 작성.
- [ ] 일일 미션 구현.
- [ ] 리워드 광고 인터페이스 구현.
- [ ] 전면 광고 노출 빈도 제어.
- [ ] IAP 상품 구조 정의.
- [ ] 스킨 20종 데이터 작성.
- [ ] 시즌 패스 초안 작성.
- [ ] 이벤트 로깅 설계.

## 작업 상태 규칙

| 상태 | 의미 |
|---|---|
| `[ ]` | 미시작 |
| `[~]` | 진행 중, 다음 커밋에서 완료 예정 |
| `[x]` | 구현과 검증 완료 |

## 우선순위 기준

| 우선순위 | 기준 |
|---|---|
| P0 | 없으면 게임이 성립하지 않거나 빌드가 깨지는 작업 |
| P1 | 출시 품질에 필요한 핵심 확장 작업 |
| P2 | 운영, 편의, 장기 잔존을 위한 작업 |
