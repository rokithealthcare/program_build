# 05. Balance Book

모든 밸런스 수치는 JSON/config에서 관리한다. 이 문서의 값은 초기 기준값이며, 코드에 직접 하드코딩하지 않는다.

## 컨디션별 똥 등장 확률

| 컨디션 | normal | fast | heavy | split | gold | poison | bomb | 합계 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| good | 40 | 15 | 10 | 10 | 15 | 5 | 5 | 100 |
| normal | 45 | 15 | 15 | 10 | 5 | 5 | 5 | 100 |
| bad | 30 | 10 | 20 | 10 | 3 | 20 | 7 | 100 |
| urgent | 25 | 35 | 10 | 15 | 5 | 5 | 5 | 100 |
| boss_sync | 20 | 20 | 15 | 20 | 5 | 10 | 10 | 100 |

```json
{
  "schemaVersion": 1,
  "conditionRates": {
    "good": { "normal": 40, "fast": 15, "heavy": 10, "split": 10, "gold": 15, "poison": 5, "bomb": 5 }
  }
}
```

## 똥 종류별 속도/크기/점수/난이도

| ID | 속도 px/s | 반지름 px | 기본 점수 | 난이도 | 특수 규칙 |
|---|---:|---:|---:|---:|---|
| normal | 520 | 42 | 100 | 1 | 없음 |
| fast | 760 | 34 | 150 | 3 | 잔상 표시 |
| heavy | 380 | 62 | 180 | 2 | Good 이하 시 튕김 |
| split | 480 | 44 | 220 | 4 | 50% 지점에서 2개 분열 |
| gold | 560 | 38 | 500 | 2 | 코인 +20 |
| poison | 500 | 40 | 200 | 4 | Miss 시 5초 점수 -20% |
| bomb | 450 | 48 | 250 | 3 | 명중 시 주변 120px 제거 |

## 스테이지별 난이도

| 스테이지 | 시간 | 목표 점수 | 발사 간격 | 주요 요소 | 보스 |
|---|---:|---:|---:|---|---|
| 1 | 75 | 1500 | 1.60 | normal 학습 | 없음 |
| 2 | 80 | 2200 | 1.45 | fast 등장 | 없음 |
| 3 | 85 | 3200 | 1.35 | heavy 등장 | 없음 |
| 4 | 90 | 4500 | 1.25 | split 등장 | 없음 |
| 5 | 120 | 6000 | 1.20 | 보스 튜토리얼 | toilet_golem |
| 10 | 130 | 11000 | 1.05 | 분열/장판 | sewer_slime |
| 20 | 150 | 22000 | 0.90 | 독/연속 발사 | stink_dragon |

## 보스 체력/공격 패턴/보상

| 보스 ID | HP | 패턴 | 보상 |
|---|---:|---|---|
| toilet_golem | 3000 | shield 4초, heavy 2연속 | coin 500, bossToken 50 |
| sewer_slime | 6500 | split 3회, poison 장판 | coin 900, shard 3 |
| stink_dragon | 15000 | fast 3연속, poison cloud, bomb rain | coin 1800, rareShard 5 |

```json
{
  "bossId": "toilet_golem",
  "hp": 3000,
  "patterns": [
    { "type": "shield", "durationSec": 4, "cooldownSec": 8 },
    { "type": "fire_poop", "poopId": "heavy", "count": 2, "intervalSec": 0.5 }
  ],
  "rewards": { "coin": 500, "bossToken": 50 }
}
```

## 점수 공식

```text
score = floor(baseScore * judgementMultiplier * comboMultiplier * stageMultiplier * eventMultiplier)
```

| 판정 | 배율 |
|---|---:|
| Perfect | 1.5 |
| Good | 1.0 |
| Graze | 0.5 |
| Miss | 0 |

## 콤보 공식

```text
comboMultiplier = min(1 + floor(combo / 10) * 0.1, 3.0)
```

| 콤보 | 배율 |
|---:|---:|
| 0~9 | 1.0 |
| 10~19 | 1.1 |
| 50~59 | 1.5 |
| 100 이상 | 2.0 이상, 최대 3.0 |

## 보상 공식

```text
coinReward = floor(stageBaseCoin * starMultiplier * coinBonusMultiplier)
expReward = floor(targetScore / 100 + clearBonus)
```

| 별 | 조건 | 보상 배율 |
|---|---|---:|
| 1 | 클리어 | 1.0 |
| 2 | 목표 점수 120% | 1.25 |
| 3 | 목표 점수 150% 또는 Miss 3회 이하 | 1.5 |

## 광고 보상

| 광고 | 보상 | 제한 |
|---|---|---|
| 결과 2배 | 코인/경험치 2배 | 스테이지당 1회 |
| 부활 | 라이프 1 회복 | 1판 1회 |
| 무료 상자 | 코인 100~500 | 하루 5회 |
| 미션 즉시 갱신 | 일일 미션 1개 교체 | 하루 3회 |

## 성장 비용

```text
cost(level) = floor(baseCost * pow(growthRate, level - 1))
```

| 성장 | baseCost | growthRate | 최대 레벨 |
|---|---:|---:|---:|
| Power | 100 | 1.12 | 50 |
| Aim Assist | 150 | 1.14 | 30 |
| Hit Radius | 180 | 1.15 | 30 |
| Coin Bonus | 120 | 1.13 | 50 |
| Skill Cooldown | 250 | 1.18 | 20 |

## 스킨 가격

| 등급 | 코인 가격 | 젬 가격 | 예시 |
|---|---:|---:|---|
| common | 1000 | 0 | 기본 색상 |
| rare | 5000 | 80 | 운동복 |
| epic | 15000 | 240 | 히어로 |
| legendary | 0 | 600 | 시즌 한정 |

## 일일 미션 보상

| 미션 | 조건 | 보상 |
|---|---|---|
| hit_100 | 똥 100개 명중 | coin 300 |
| perfect_20 | Perfect 20회 | gem 10 |
| clear_3 | 스테이지 3회 클리어 | coin 500 |
| boss_1 | 보스 1회 처치 | bossToken 20 |
| ad_1 | 광고 보상 1회 수령 | coin 200 |

