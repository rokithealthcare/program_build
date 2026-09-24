# 13. JSON Schema

참조 문서: `02_TDD.md`, `03_AI_DEVELOPMENT_SPEC.md`, `05_BALANCE_BOOK.md`

## 목적

모든 콘텐츠는 JSON 추가만으로 확장 가능해야 한다. 코드에는 schema 검증, 로딩, 실행기만 존재하고 콘텐츠 값은 JSON에 둔다.

## 공통 규칙

| 규칙 | 내용 |
|---|---|
| schemaVersion | 모든 파일 최상위 필수 |
| ID | snake_case, 출시 후 변경 금지 |
| localization | 화면 표시 텍스트는 `textKey` 사용 |
| asset | 직접 경로보다 `assetId` 우선 |
| probability | 확률 테이블 합계는 100 또는 weight 방식 명시 |
| modeOverride | Story/Rank/Battle 적용 차이를 명시 |

## RuntimeConfig 확장

```ts
interface RuntimeConfig {
  poopBalance: Record<string, PoopDefinition>;
  conditionRates: Record<string, RateTable>;
  stageBalance: Record<string, StageDefinition>;
  bossBalance: Record<string, BossDefinition>;
  foodCatalog: Record<string, FoodDefinition>;
  collectionCatalog: Record<string, CollectionDefinition>;
  modeRules: Record<string, ModeRuleDefinition>;
  gameFeel: Record<string, FeelPreset>;
}
```

## Food Schema

```json
{
  "schemaVersion": 1,
  "foods": {
    "food_hamburger": {
      "displayNameKey": "food.hamburger.name",
      "rarity": "rare",
      "unlock": { "type": "story_stage_clear", "stageId": "stage_005" },
      "durationSec": 180,
      "digestionProfile": "digest_oily_heavy",
      "conditionModifiers": { "urgent": 5, "bad": 8 },
      "poopWeightModifiers": { "heavy": 20, "gold": 2 },
      "scoreMultiplier": 1.05,
      "rewardModifiers": { "coin": 1.1 },
      "sideEffects": [{ "type": "burp_warning", "chance": 15 }]
    }
  }
}
```

## Poop Schema

```json
{
  "schemaVersion": 1,
  "poops": {
    "poop_gold_banana": {
      "baseType": "gold",
      "rarity": "epic",
      "collectionGroup": "fruit_series",
      "speed": 580,
      "radius": 38,
      "score": 650,
      "flightPattern": "arc_soft",
      "assetId": "poop_gold_banana_01",
      "hitboxId": "poop_circle_38",
      "unlock": { "type": "food_mastery", "foodId": "food_banana", "level": 3 }
    }
  }
}
```

## Stage Schema

```json
{
  "stageId": "stage_016",
  "theme": "amusement",
  "modeAvailability": ["story", "rank", "battle"],
  "timeLimitSec": 110,
  "targetScore": 16000,
  "foodPool": ["food_cola", "food_hamburger"],
  "conditionPool": ["normal", "urgent"],
  "mechanics": [{ "type": "rotating_gate", "speedDeg": 90, "warningSec": 0.8 }],
  "waveTable": "wave_amusement_016",
  "bossId": null,
  "rewards": { "firstClear": "reward_stage_016_first", "repeat": "reward_stage_016_repeat" }
}
```

## Boss Schema

```json
{
  "bossId": "sewer_slime",
  "hp": 6500,
  "aiProfile": {
    "phaseRules": [
      { "hpBelow": 0.7, "addPatterns": ["split_burst"] },
      { "hpBelow": 0.35, "addPatterns": ["poison_floor"] }
    ],
    "patternSelect": "weighted_cooldown"
  },
  "patterns": {
    "split_burst": { "type": "fire_poop", "poopId": "split", "count": 3, "intervalSec": 0.35 },
    "poison_floor": { "type": "hazard_zone", "hazardId": "poison_gas", "durationSec": 4 }
  },
  "rewards": { "firstClear": "reward_boss_sewer_first", "repeat": "reward_boss_sewer_repeat" }
}
```

## Collection Schema

```json
{
  "collectionId": "poop_dex",
  "type": "poop",
  "entries": {
    "poop_gold_banana": {
      "rarity": "epic",
      "discoverCondition": { "type": "hit", "poopId": "poop_gold_banana" },
      "milestonePoints": 12
    }
  },
  "milestones": [
    { "points": 50, "reward": { "coin": 1000 } },
    { "points": 200, "reward": { "titleId": "title_poop_researcher" } }
  ]
}
```

## Validation Checklist

| 검사 | 실패 처리 |
|---|---|
| 필수 key 누락 | 개발 빌드 즉시 오류 |
| 잘못된 ID 참조 | 로딩 실패 |
| 확률 합계 오류 | schema validation 실패 |
| 미등록 assetId | placeholder 표시 + 에러 로그 |
| modeOverride 누락 | 기본 Story 규칙 적용 |

