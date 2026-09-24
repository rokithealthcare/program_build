# 18. Food System

참조 문서: `01_GDD.md`, `05_BALANCE_BOOK.md`, `12_CHARACTER_BOOK.md`, `13_JSON_SCHEMA.md`

## 핵심 원칙

음식은 단순 아이템이 아니다. 음식은 소화 상태, 컨디션, 아이 표정, 똥 종류, 비행 패턴, 점수 배율, 희귀도, 보상을 하나로 연결하는 전략 시스템이다.

## Food Pipeline

```text
Food Equip
-> Digestion Profile
-> Condition Modifier
-> Face Override
-> Poop Weight Modifier
-> Flight Pattern Modifier
-> Score/Reward Modifier
-> Collection Discovery
```

## 음식 목록 초안

| Food | Rarity | 효과 | 지속시간 | 해금 |
|---|---|---|---:|---|
| 햄버거 | Rare | heavy +20, coin +10% | 180초 | Stage 5 |
| 피자 | Rare | split +15, combo score +5% | 180초 | Stage 7 |
| 라면 | Epic | urgent +10, fast +15 | 150초 | Stage 8 |
| 김치 | Epic | poison +12, rare +5 | 150초 | Stage 13 |
| 우유 | Common | 속도 -5%, hitRadius +3% | 180초 | Stage 2 |
| 커피 | Epic | fireInterval -10%, score +8% | 120초 | Stage 9 |
| 콜라 | Rare | fast +12, bomb +5 | 150초 | Stage 4 |
| 고구마 | Rare | heavy +10, gold +4 | 180초 | Stage 14 |
| 바나나 | Common | normal 안정, gold +2 | 180초 | Stage 1 |
| 요구르트 | Common | bad 저항 +10%, rare +2 | 180초 | Stage 3 |
| 술 | Secret | 화면 흔들림 증가, Secret 확률 | 90초 | 성인 등급 이슈로 기본 비활성 |
| 매운 음식 | Legendary | fast/poison +20, score +15% | 120초 | Stage 11 |
| 아이스크림 | Rare | slow pattern, Perfect 배율 +0.1 | 150초 | Stage 12 |
| 샐러드 | Common | bad 감소, 보상 안정 | 210초 | Mission |

## Digestion State

| State | 조건 | 효과 |
|---|---|---|
| digesting | 음식 효과 활성 | modifier 적용 |
| stable | 부작용 없음 | normal/good 증가 |
| overloaded | 음식 2개 이상 과부하 | bad/urgent 증가 |
| sparkling | 좋은 조합 | gold/rare 증가 |
| upset | 나쁜 조합 | poison/heavy 증가 |

## 음식 조합

| 조합 | 결과 | 보상 |
|---|---|---|
| 바나나 + 우유 | stable | hitRadius +5% |
| 햄버거 + 콜라 | overloaded | heavy/fast 증가, score +8% |
| 김치 + 라면 | spicy_combo | poison/fast 증가, rare +5 |
| 요구르트 + 샐러드 | clean_digest | bad 저항, gold +3 |
| 커피 + 콜라 | caffeine_burst | fireInterval 감소, Miss 위험 증가 |

## Food JSON 예시

```json
{
  "foodId": "food_spicy",
  "rarity": "legendary",
  "durationSec": 120,
  "unlock": { "type": "stage_clear", "stageId": "stage_011" },
  "digestionProfile": "digest_spicy_burst",
  "conditionWeight": { "urgent": 12, "bad": 6 },
  "faceOverride": "face_spicy",
  "poopWeight": { "fast": 20, "poison": 15, "gold": 3 },
  "flightPatternWeight": { "zigzag": 10, "accelerate": 15 },
  "scoreMultiplier": 1.15,
  "rewardMultiplier": { "coin": 1.0, "collectionShard": 1.1 },
  "sideEffect": { "type": "screen_heat", "intensity": 0.25 }
}
```

## 밸런스 제한

| 항목 | 제한 |
|---|---|
| 점수 배율 | 단일 음식 최대 1.15 |
| 희귀 확률 | 단일 음식 Rare+ weight +5 이하 |
| 부작용 | 조작 불능 금지 |
| Rank Mode | 음식 효과 미적용 또는 주간 고정 음식 |
| Battle Mode | 양 플레이어 동일 음식 preset |

