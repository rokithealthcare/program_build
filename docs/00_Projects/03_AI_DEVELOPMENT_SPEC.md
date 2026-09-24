# 03. AI Development Spec

Antigravity AI Agent와 Codex CLI는 이 문서를 개발 작업의 작업 규칙으로 사용한다. 이 게임의 핵심 구조를 임의로 바꾸면 안 된다.

## 필수 작업 순서

| 순서 | 작업 | 필수 산출물 |
|---|---|---|
| 1 | 요청 분석 | 영향 문서 확인 |
| 2 | 기존 코드/데이터 검색 | 관련 파일 목록 |
| 3 | 문서 갱신 | GDD/TDD/Balance/TODO 중 해당 문서 |
| 4 | 데이터 추가 | JSON/config |
| 5 | 코드 구현 | 기존 구조 유지 |
| 6 | 테스트 | 실행 결과 기록 |
| 7 | TODO 갱신 | 완료/추가 작업 반영 |
| 8 | CHANGELOG 기록 | 날짜, 변경 파일, 검증 |

## 기존 게임 로직 임의 변경 금지

| 금지 | 설명 |
|---|---|
| Core Loop 변경 | 아이 발사 -> 플레이어 타격 -> 보상 루프 유지 |
| Manager 병합 | 편의상 Manager를 하나로 합치지 않음 |
| JSON 제거 | 수치를 코드 상수로 옮기지 않음 |
| 판정 기준 변경 | GDD/Balance 문서 수정 없이 변경 금지 |
| BM 강제화 | 광고/과금을 강제 플레이 조건으로 만들지 않음 |

## 기능 구현 전 확인 문서

| 작업 유형 | 확인 문서 |
|---|---|
| 신규 똥 | `01_GDD.md`, `05_BALANCE_BOOK.md`, `04_ART_BIBLE.md` |
| 신규 보스 | `01_GDD.md`, `02_TDD.md`, `05_BALANCE_BOOK.md` |
| 신규 스테이지 | `01_GDD.md`, `05_BALANCE_BOOK.md` |
| UI 변경 | `01_GDD.md`, `04_ART_BIBLE.md` |
| 저장 구조 | `02_TDD.md`, `03_AI_DEVELOPMENT_SPEC.md` |
| 과금/광고 | `01_GDD.md`, `05_BALANCE_BOOK.md` |

## 코드 작성 규칙

| 항목 | 규칙 |
|---|---|
| 파일명 | 클래스/컴포넌트는 PascalCase, 데이터 key는 snake_case |
| 함수명 | 동사는 명확하게 사용: `spawnPoop`, `resolveHit` |
| 하드코딩 | 밸런스 수치, 가격, 확률, HP, 점수 금지 |
| 주석 | 복잡한 판정/확률 로직에만 짧게 작성 |
| 의존성 | Manager 간 직접 호출보다 EventBus 우선 |
| 테스트 | 계산 로직은 단위 테스트 작성 |

## 데이터 하드코딩 금지 예시

금지:

```ts
const poopSpeed = 520;
const goldRate = 10;
```

허용:

```ts
const poopSpeed = runtimeConfig.poopBalance[poopId].speed;
const goldRate = runtimeConfig.conditionRates[conditionId].gold;
```

## 에셋 교체 규칙

| 항목 | 유지해야 할 값 |
|---|---|
| pivot | 기존 중심점 유지 |
| hitbox id | 기존 충돌 key 유지 |
| 파일 참조 | JSON의 asset key 갱신 |
| 투명 영역 | 불필요한 여백 최소화 |
| 해상도 | 기존 기준보다 작게 교체 금지 |

## 기능별 구현 순서

### 신규 똥 추가

1. `05_BALANCE_BOOK.md`에 수치 추가.
2. `04_ART_BIBLE.md`에 시각 규칙 추가.
3. `poop_balance.json`에 데이터 추가.
4. `condition_rates.json`에 확률 반영.
5. `PoopManager` 특수 행동 추가.
6. 판정/스폰 테스트 작성.
7. CHANGELOG 기록.

### 신규 보스 추가

1. GDD 보스 표에 추가.
2. Balance Book에 HP, 패턴, 보상 추가.
3. Art Bible에 디자인 규칙 추가.
4. `boss_balance.json`에 timeline 추가.
5. `BossManager`가 기존 패턴 executor로 실행하게 구성.
6. 보스 스테이지 연결.
7. QA 체크리스트 수행.

## 테스트 기준

| 영역 | 최소 기준 |
|---|---|
| 데이터 | JSON schema 검증 통과 |
| 확률 | 10,000회 샘플링 시 목표 확률 +-3% |
| 판정 | Perfect/Good/Graze/Miss 경계값 테스트 |
| 저장 | 기존 SaveData 로드 성공 |
| UI | 3개 해상도에서 터치 영역과 텍스트 겹침 없음 |
| 성능 | 60초 플레이 중 크래시 없음, FPS 기준 만족 |

## CHANGELOG 작성 양식

```md
## YYYY-MM-DD

### Added
- 추가된 기능

### Changed
- 변경된 기능

### Fixed
- 수정된 버그

### Data
- 변경된 JSON/config

### Test
- 실행한 테스트와 결과
```

