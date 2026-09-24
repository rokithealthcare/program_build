# 19. Collection System

참조 문서: `01_GDD.md`, `12_CHARACTER_BOOK.md`, `13_JSON_SCHEMA.md`, `18_FOOD_SYSTEM.md`

## Collection 범위

| Collection | 목표 수 | 보상 |
|---|---:|---|
| 똥 도감 | 100종 이상 | 스킨, 칭호, 희귀 아이템 |
| 음식 도감 | 50종 이상 | 음식 슬롯, 레시피 |
| Boss 도감 | 30종 이상 | 보스 스킨, BGM |
| Skin 도감 | 100종 이상 | 칭호, 장식 |
| 칭호 | 80종 이상 | 프로필 표시 |
| 업적 | 150개 이상 | gem, title, skin |

## 똥 희귀도

| Rarity | 출현 비중 | 발견 연출 | 보상 포인트 |
|---|---:|---|---:|
| Common | 65% | 기본 | 1 |
| Rare | 22% | 파란 테두리 | 3 |
| Epic | 9% | 보라 이펙트 | 8 |
| Legendary | 3% | 컷인 | 20 |
| Mythic | 0.9% | 전용 음악 stinger | 50 |
| Secret | 0.1% 이하 | 조건 숨김 | 100 |

## 100종 확장 구조

똥은 `baseType + foodTheme + rarityVariant + patternVariant` 조합으로 확장한다.

| 축 | 예시 |
|---|---|
| baseType | normal, fast, heavy, split, gold, poison, bomb |
| foodTheme | banana, burger, spicy, milk, kimchi |
| rarityVariant | shiny, royal, cosmic, ghost |
| patternVariant | arc, zigzag, bounce, spiral |

## 발견 조건

| 조건 | 예시 |
|---|---|
| Hit | 특정 똥 명중 |
| Perfect | Perfect로 명중 |
| Food | 특정 음식 활성 중 발견 |
| Stage | 특정 Stage에서만 등장 |
| Boss | 보스 패턴에서만 등장 |
| Secret | 숨겨진 조합 |

## 보상 Ladder

| 도감 포인트 | 보상 |
|---:|---|
| 10 | coin 500 |
| 30 | title_rookie_collector |
| 60 | player_skin_researcher |
| 100 | food_slot +1 |
| 200 | child_face_legend |
| 400 | legendary_skin_ticket |
| 800 | secret_title |

## Collection Flow

```text
Poop Hit
-> Check Discovery
-> If New: pause-safe popup after wave
-> Add Collection Point
-> Check Milestone
-> Grant Reward
-> Suggest Related Target
```

## Collection JSON 예시

```json
{
  "collectionId": "poop_dex",
  "entries": {
    "poop_spicy_comet": {
      "rarity": "legendary",
      "hintKey": "hint.poop_spicy_comet",
      "discover": {
        "type": "perfect_hit",
        "conditions": [
          { "type": "food_active", "foodId": "food_spicy" },
          { "type": "stage_theme", "theme": "festival" }
        ]
      },
      "points": 20,
      "rewardOnDiscover": { "collectionShard": 5 }
    }
  }
}
```

## 도감 UX 규칙

| 상태 | 표시 |
|---|---|
| 미발견 | 실루엣 + 힌트 1개 |
| 발견 | 이름, rarity, 발견 조건 일부 |
| 완성 | 애니메이션, 상세 설명, 관련 음식 |
| Secret | 발견 전 완전 숨김 |

