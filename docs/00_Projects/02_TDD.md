# 02. Technical Design Document

## 기술 전제

Antigravity AI Agent가 구현하기 쉬운 데이터 기반 구조를 기준으로 한다. 엔진이 Unity, Godot, Phaser 중 무엇이든 아래 모듈 경계를 유지한다.

| 항목 | 기준 |
|---|---|
| 화면 | 모바일 세로 9:16, 기준 1080x1920 |
| 프레임 | 60 FPS 목표, 저사양 30 FPS 허용 |
| 데이터 | JSON 로드 후 RuntimeConfig로 캐싱 |
| 저장 | 로컬 SaveData + 클라우드 확장 가능 구조 |
| 입력 | Pointer/Touch 추상화 |

## 예상 프로젝트 구조

```text
project/
  assets/
    art/
    audio/
    data/
    fonts/
  src/
    core/
    managers/
    gameplay/
    ui/
    data/
    save/
    utils/
  tests/
  docs/
```

## assets 구조

```text
assets/
  art/
    characters/child/
    characters/player/
    bosses/
    poop/
    backgrounds/
    ui/
    effects/
  audio/
    bgm/
    sfx/
  data/
    balance/
      poop_balance.json
      condition_rates.json
      stage_balance.json
      boss_balance.json
      reward_balance.json
    catalog/
      skins.json
      missions.json
      collections.json
```

## src 구조

```text
src/
  core/
    EventBus.ts
    GameStateMachine.ts
    TimeService.ts
  managers/
    GameManager.ts
    StageManager.ts
    ConditionManager.ts
    PoopManager.ts
    BossManager.ts
    UIManager.ts
    AudioManager.ts
    SaveManager.ts
  gameplay/
    PlayerController.ts
    PoopProjectile.ts
    HitResolver.ts
    Obstacle.ts
    SkillController.ts
  data/
    DataLoader.ts
    RuntimeConfig.ts
    SchemaValidator.ts
  ui/
    screens/
    widgets/
  save/
    SaveData.ts
    SaveMigration.ts
  utils/
    MathUtil.ts
    ObjectPool.ts
```

## Manager 클래스 정의

### GameManager

| 책임 | 상세 |
|---|---|
| 게임 상태 | Boot, MainMenu, Loading, Playing, Paused, Result |
| 세션 시작/종료 | 스테이지 ID를 받아 세션 생성 |
| 점수/콤보 | HitResolver 결과를 받아 점수 계산 |
| 매니저 연결 | Stage, Condition, Poop, Boss, UI, Audio 조율 |

```ts
interface GameManager {
  startStage(stageId: string): void;
  pause(): void;
  resume(): void;
  finish(result: StageResult): void;
  addScore(event: HitScoreEvent): void;
}
```

### StageManager

| 책임 | 상세 |
|---|---|
| 스테이지 데이터 로드 | `stage_balance.json` |
| 웨이브 관리 | 발사 타임라인, 장애물 스폰 |
| 클리어 조건 | 점수, 시간, 보스 처치 |

### ConditionManager

| 책임 | 상세 |
|---|---|
| 컨디션 결정 | 스테이지 기본값 + 이벤트 |
| 확률 테이블 제공 | PoopManager에 현재 rate 전달 |
| 표정 이벤트 | UI/애니메이션으로 face 변경 전달 |

### PoopManager

| 책임 | 상세 |
|---|---|
| 똥 선택 | 컨디션별 weighted random |
| 발사 | ObjectPool에서 Projectile 획득 |
| 특수 행동 | split, bomb, poison 처리 |

### BossManager

| 책임 | 상세 |
|---|---|
| 보스 생성 | 보스 ID 기반 프리팹/스프라이트 로드 |
| 패턴 실행 | JSON timeline 실행 |
| 체력/보상 | HP 감소, 보상 이벤트 발행 |

### UIManager

| 책임 | 상세 |
|---|---|
| 화면 전환 | Main, StageSelect, InGame, Result, Shop |
| HUD 업데이트 | 점수, 콤보, 라이프, 스킬 |
| 팝업 | 구매 확인, 광고 보상, 일시정지 |

### AudioManager

| 책임 | 상세 |
|---|---|
| BGM | 화면/보스 상태별 전환 |
| SFX | 이벤트 key 기반 재생 |
| 설정 | 음량, 진동, 음소거 저장 |

### SaveManager

| 책임 | 상세 |
|---|---|
| 저장/로드 | SaveData serialize |
| 마이그레이션 | schemaVersion 기준 |
| 치트 방지 | 로컬 시간 보상 검증 |

## EventBus 구조

```ts
type GameEvent =
  | { type: "STAGE_STARTED"; stageId: string }
  | { type: "CONDITION_CHANGED"; conditionId: string; faceId: string }
  | { type: "POOP_SPAWNED"; poopId: string; instanceId: string }
  | { type: "POOP_HIT"; poopId: string; judgement: "perfect" | "good" | "graze" }
  | { type: "POOP_MISSED"; poopId: string }
  | { type: "BOSS_HP_CHANGED"; bossId: string; hp: number; maxHp: number }
  | { type: "STAGE_FINISHED"; result: StageResult };
```

구현 규칙:

| 규칙 | 내용 |
|---|---|
| 직접 참조 최소화 | Manager 간 강결합 대신 이벤트 사용 |
| 이벤트 이름 고정 | 출시 후 이름 변경 금지 |
| 페이로드 타입 | 누락 필드 없이 명시 |
| 디버그 로그 | 개발 빌드에서 이벤트 추적 가능 |

## JSON 데이터 로딩 구조

```ts
interface RuntimeConfig {
  poopBalance: Record<string, PoopBalance>;
  conditionRates: Record<string, Record<string, number>>;
  stageBalance: Record<string, StageBalance>;
  bossBalance: Record<string, BossBalance>;
  rewardBalance: RewardBalance;
}
```

```json
{
  "schemaVersion": 1,
  "stages": {
    "stage_001": {
      "name": "첫 발사",
      "timeLimitSec": 90,
      "targetScore": 2500,
      "conditionPool": ["normal"],
      "obstacles": [],
      "bossId": null,
      "rewardTable": "stage_basic_01"
    }
  }
}
```

## State Machine 구조

| State | 진입 조건 | 종료 조건 |
|---|---|---|
| Boot | 앱 시작 | 데이터 로드 완료 |
| MainMenu | Boot 완료 | 플레이/상점/도감 선택 |
| Loading | 스테이지 선택 | 리소스 로드 완료 |
| Playing | Loading 완료 | 클리어/실패/일시정지 |
| Paused | 일시정지 | 재개/나가기 |
| Result | 스테이지 종료 | 보상 수령 완료 |

## 충돌 판정 구조

| 대상 | Collider | 기준 |
|---|---|---|
| 똥 | Circle | `radius` JSON 값 |
| 플레이어 타격 | Arc 또는 Circle | 배트 스윙 각도와 reach |
| 슬링샷 투사체 | Circle | projectile radius |
| 장애물 | Box/Polygon | 에셋별 config |

```ts
interface HitboxConfig {
  id: string;
  shape: "circle" | "box" | "arc";
  radius?: number;
  width?: number;
  height?: number;
  offsetX: number;
  offsetY: number;
}
```

## 모바일 해상도 대응

| 항목 | 기준 |
|---|---|
| 기준 해상도 | 1080x1920 |
| Safe Area | 노치 영역에 HUD 배치 금지 |
| 월드 좌표 | 세로 기준 높이 고정, 가로는 letterbox 또는 확장 |
| 터치 영역 | 최소 88px |
| UI 스케일 | 기준 해상도 대비 clamp 0.85~1.2 |

## 성능 최적화 기준

| 항목 | 목표 |
|---|---|
| FPS | 일반 60, 저사양 30 이상 |
| Draw Call | 80 이하 목표 |
| Projectile | ObjectPool 사용, 런타임 생성 최소화 |
| Particle | 동시에 40개 이하 |
| Texture | 2048 이하 atlas 사용 |
| GC | 플레이 중 큰 allocation 금지 |

## 테스트 기준

| 테스트 | 기준 |
|---|---|
| JSON 검증 | 모든 확률 합계 100 |
| 판정 테스트 | 중심 거리별 judgement 일치 |
| 저장 테스트 | 버전 변경 후 migration 통과 |
| 해상도 테스트 | 720x1280, 1080x1920, 1440x2560 |
| 성능 테스트 | 30개 projectile 동시 처리 |

