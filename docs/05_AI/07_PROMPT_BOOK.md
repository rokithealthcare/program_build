# 07. Prompt Book

Antigravity 또는 Codex CLI에 반복 사용할 표준 프롬프트 모음이다. 모든 프롬프트는 기존 기능 유지와 문서 우선 원칙을 포함한다.

## 공통 접두문

```text
너는 이 프로젝트의 Technical Game Designer 겸 개발 Agent다.
반드시 docs/00_GAME_CONSTITUTION.md, docs/01_GDD.md, docs/02_TDD.md, docs/03_AI_DEVELOPMENT_SPEC.md를 먼저 확인해라.
기존 게임의 핵심 구조인 "상단 아이가 컨디션에 따라 똥을 발사하고, 하단 플레이어가 슬링샷/타격으로 맞추는 모바일 세로형 액션 루프"를 절대 변경하지 마라.
밸런스 수치는 코드에 하드코딩하지 말고 JSON/config로 관리해라.
기능 구현 후 docs/08_TODO.md와 docs/09_CHANGELOG.md를 갱신해라.
```

## 신규 기능 추가 요청

```text
[공통 접두문]

신규 기능 "{기능명}"을 추가해라.
작업 전 관련 문서를 찾아 필요한 기획/기술/밸런스 항목을 먼저 갱신해라.
기존 Manager 구조와 EventBus 구조를 유지하고, 새 기능은 데이터 기반으로 확장 가능하게 만들어라.
기존 스테이지, 똥 종류, 보스, 저장 데이터가 깨지지 않게 테스트해라.
완료 후 변경 파일, 테스트 결과, 남은 TODO를 요약해라.
```

## 버그 수정 프롬프트

```text
[공통 접두문]

다음 버그를 수정해라: "{버그 설명}"
먼저 재현 경로와 영향 범위를 확인해라.
기존 정상 동작을 임의로 바꾸지 말고, 최소 범위로 원인을 수정해라.
수정 후 관련 테스트를 추가하거나 실행하고, 회귀 가능성이 있는 기능을 확인해라.
docs/09_CHANGELOG.md에 Fixed 항목으로 기록해라.
```

## 에셋 교체 프롬프트

```text
[공통 접두문]

에셋 "{기존 에셋}"을 "{새 에셋}"으로 교체해라.
docs/04_ART_BIBLE.md의 파일명, 투명 배경, pivot, hitbox 유지 규칙을 지켜라.
에셋 path와 assetId만 필요한 범위에서 갱신하고, collision radius와 hitboxId는 문서 승인 없이 변경하지 마라.
모바일 세로 화면에서 겹침과 잘림이 없는지 확인해라.
```

## 스테이지 추가 프롬프트

```text
[공통 접두문]

신규 스테이지 "{stage_id}"를 추가해라.
docs/01_GDD.md의 스테이지 시스템과 docs/05_BALANCE_BOOK.md의 난이도 표를 먼저 갱신해라.
stage JSON에는 timeLimitSec, targetScore, conditionPool, fireInterval, obstacles, bossId, rewardTable을 포함해라.
기존 스테이지 ID와 보상 테이블을 변경하지 마라.
```

## 보스 추가 프롬프트

```text
[공통 접두문]

신규 보스 "{boss_id}"를 추가해라.
GDD, TDD, Art Bible, Balance Book에 보스 이름, HP, 패턴, 보상, 시각 규칙을 먼저 정의해라.
BossManager의 기존 패턴 executor를 재사용하고, 보스 전용 하드코딩 로직을 만들지 마라.
패턴은 boss_balance.json timeline으로 관리해라.
```

## 밸런스 수정 프롬프트

```text
[공통 접두문]

다음 밸런스를 수정해라: "{수정 내용}"
docs/05_BALANCE_BOOK.md를 먼저 갱신하고, 대응하는 JSON/config 값을 수정해라.
코드 로직은 데이터 로딩 문제가 있는 경우에만 수정해라.
확률 합계가 100인지 검증하고, 변경 전후 영향을 표로 요약해라.
```

## 리팩토링 프롬프트

```text
[공통 접두문]

다음 범위를 리팩토링해라: "{대상 파일/모듈}"
동작 변경 없이 구조만 개선해라.
Core Loop, Manager 책임, EventBus 이벤트 이름, JSON schema를 변경하지 마라.
리팩토링 전후 테스트를 실행하고 결과를 비교해라.
동작 변경이 필요하면 작업을 중단하고 먼저 문서 변경안을 제시해라.
```

## QA 요청 프롬프트

```text
[공통 접두문]

현재 빌드의 QA를 수행해라.
docs/06_DEVELOPMENT_ROADMAP.md의 QA 항목과 docs/03_AI_DEVELOPMENT_SPEC.md의 테스트 기준을 기준으로 점검해라.
문제는 심각도 P0/P1/P2로 분류하고, 재현 경로, 기대 결과, 실제 결과, 관련 파일을 기록해라.
수정 가능한 P0/P1은 직접 수정하고, 수정 후 CHANGELOG와 TODO를 갱신해라.
```

## 기존 기능 유지 강제 프롬프트

```text
이번 작업에서 기존 기능을 삭제하거나 의미를 바꾸지 마라.
특히 다음은 유지해야 한다.
- 모바일 세로형 9:16 구조
- 상단 아이 발사, 하단 플레이어 타격 구조
- 컨디션 기반 똥 확률
- JSON 기반 밸런스
- Manager 분리 구조
- CHANGELOG/TODO 갱신

기존 구조를 변경해야 한다고 판단되면 즉시 구현을 멈추고, 변경 이유와 대안을 문서로 먼저 제안해라.
```

