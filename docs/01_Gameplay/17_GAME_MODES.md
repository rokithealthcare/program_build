# 17. Game Modes

참조 문서: `00_GAME_CONSTITUTION.md`, `01_GDD.md`, `13_JSON_SCHEMA.md`, `14_UI_FLOW.md`

## 모드 원칙

게임 모드는 3개만 존재한다. 신규 모드는 추가하지 않고, 이벤트나 시즌은 아래 3개 모드의 rule set으로 구현한다.

| Mode | 목적 | 성장 적용 | 서버 필요 |
|---|---|---|---|
| Story Mode | 해금/성장/수집 | 전체 적용 | 선택 |
| Rank Mode | 주간 점수 경쟁 | 제거 또는 보정 | 필수 |
| Real-Time Battle Mode | 실시간 실력 경쟁 | 제거 또는 보정 | 필수 |

## Story Mode

| 항목 | 규칙 |
|---|---|
| 목적 | 모든 콘텐츠 해금의 중심 |
| 적용 성장 | 플레이어 성장, 아이 성장, 스킨 cosmetic |
| 해금 | Stage, Boss, Food, Condition, Poop, Skin |
| 실패 처리 | 재도전, 광고 부활, 성장 유도 |
| 보상 | 코인, 경험치, 도감, 음식 숙련도 |

Flow:

```text
Story Map -> Food Select -> Stage Prep -> Play -> Result -> Unlock/Growth -> Next Stage
```

## Rank Mode

모든 플레이어는 동일 seed에서 경쟁한다. 성장 능력치는 제거하거나 normalized preset을 사용한다.

| 항목 | 규칙 |
|---|---|
| 시즌 | 주간, 월요일 00:00 KST 시작 |
| 패턴 | 서버 seed 기반 deterministic wave |
| 랭킹 | Global, Country, Friend |
| 점수 | Score, Perfect, Max Combo, Clear Time |
| 보정 | 성장 능력치 미적용, 스킨 효과 없음 |
| 보상 | 주간 종료 후 우편함 지급 |

```json
{
  "modeId": "rank_weekly",
  "seasonId": "rank_2026_w27",
  "stageId": "stage_013",
  "seed": "rank_2026_w27_stage_013",
  "normalizedStats": {
    "power": 10,
    "hitRadius": 10,
    "aimAssist": 0
  },
  "leaderboards": ["global", "country", "friend"]
}
```

## Real-Time Battle Mode

직접 공격은 금지한다. 실력으로 생성한 작은 방해/버프만 허용한다.

| 항목 | 규칙 |
|---|---|
| 매칭 | 유사 실력 MMR |
| 패턴 | 양 플레이어 동일 seed |
| 승패 | 종합 점수 |
| 직접 공격 | 없음 |
| 방해 | 짧고 회피 가능한 수준 |
| 버프 | 실력 기반 보상 |

## Battle 판정 공식

```text
battleScore = score
  + perfectCount * 120
  + maxCombo * 15
  + bossClearBonus
  - missCount * 80
```

| 조건 | 상대 방해 | 자신 버프 |
|---|---|---|
| Perfect 5연속 | 0.4초 화면 흔들림 | 없음 |
| Combo 20 | 순간 바람 1회 | 판정 +5% 3초 |
| Boss Phase Break | 장애물 1개 생성 | 점수 +10% 5초 |
| Perfect 10연속 | 시야 방해 0.6초 | 슬로우 1초 |

## 방해 효과 제한

| 제한 | 값 |
|---|---:|
| 최대 지속시간 | 0.8초 |
| 연속 발동 쿨타임 | 8초 |
| 화면 가림 최대 면적 | 20% |
| 흔들림 강도 | 6px 이하 |
| 입력 차단 | 금지 |

## Mode Rule JSON

```json
{
  "schemaVersion": 1,
  "modes": {
    "story": { "growthPolicy": "full", "seedPolicy": "random", "rewardPolicy": "story_reward" },
    "rank": { "growthPolicy": "normalized", "seedPolicy": "server_fixed", "rewardPolicy": "weekly_rank" },
    "battle": { "growthPolicy": "normalized", "seedPolicy": "shared_match", "rewardPolicy": "battle_reward" }
  }
}
```

