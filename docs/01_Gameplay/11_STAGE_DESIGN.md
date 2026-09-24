# 11. Stage Design

참조 문서: `01_GDD.md`, `05_BALANCE_BOOK.md`, `13_JSON_SCHEMA.md`, `20_GAME_FEEL.md`

## 설계 원칙

Stage는 배경 교체가 아니라 플레이 규칙의 변형이다. 모든 Stage는 하나 이상의 고유 mechanic을 가져야 하며, 해당 mechanic은 JSON으로 정의되어야 한다.

| 원칙 | 구현 기준 |
|---|---|
| 1스테이지 1학습 | 새 mechanic은 안전한 상황에서 먼저 소개한다. |
| 3스테이지 1응용 | 소개 후 2~3개 스테이지에서 변형한다. |
| 보스 전 검증 | 보스는 해당 챕터 mechanic의 최종 시험이다. |
| 실패 원인 명확 | Miss가 장애물 때문인지 조작 때문인지 시각적으로 보여준다. |

## Stage Flow

```text
Stage Select
-> Load Stage JSON
-> Apply Theme
-> Apply Food/Condition Pool
-> Spawn Wave Timeline
-> Introduce Mechanic
-> Mix Poop Pattern
-> Boss or Result
-> Unlock Content
```

## 테마별 고유 플레이

| Theme | 핵심 경험 | Mechanic ID | 난이도 축 |
|---|---|---|---|
| park | 기본 튜토리얼 | none, gentle_wind | 조작 학습 |
| city | 건물 반사 | building_reflect | 각도 계산 |
| school | 학생 NPC 보호 | npc_protect | 우선순위 판단 |
| construction | 크레인 장애물 | crane_swing | 타이밍 |
| festival | 폭죽 연쇄 | firework_chain | 리스크/보상 |
| rainy_street | 강한 바람 | gust_wind | 궤적 보정 |
| amusement | 회전 장애물 | rotating_gate | 리듬 |
| sewer | 독가스 | poison_gas_zone | 위치 제한 |
| space | 무중력 | low_gravity | 속도 예측 |

## Stage Set 1~20 제안

| Stage | Theme | Food Focus | New/Focus Mechanic | Boss | Unlock |
|---:|---|---|---|---|---|
| 1 | park | banana | 기본 조준 | 없음 | normal |
| 2 | park | milk | fast 소개 | 없음 | fast |
| 3 | park | yogurt | 콤보 학습 | 없음 | combo_mission |
| 4 | city | cola | 반사 예고 | 없음 | building_reflect |
| 5 | city | hamburger | 반사 + heavy | toilet_golem | heavy |
| 6 | school | pizza | NPC 보호 | 없음 | npc_protect |
| 7 | school | yogurt | split 소개 | 없음 | split |
| 8 | construction | ramen | 크레인 | 없음 | crane_swing |
| 9 | construction | coffee | 빠른 웨이브 | 없음 | urgent |
| 10 | construction | coffee | 크레인 보스 | crane_foreman | bomb |
| 11 | festival | spicy_food | 폭죽 연쇄 | 없음 | firework_chain |
| 12 | festival | ice_cream | 슬로우/빠름 교차 | 없음 | cold_condition |
| 13 | rainy_street | kimchi | 바람 | 없음 | gust_wind |
| 14 | rainy_street | sweet_potato | 바람 + heavy | 없음 | rare_poop_pool |
| 15 | sewer | kimchi | 독가스 | sewer_slime | poison |
| 16 | amusement | cola | 회전 장애물 | 없음 | rotating_gate |
| 17 | amusement | hamburger | 반사 + 회전 | 없음 | epic_poop_pool |
| 18 | sewer | ramen | 독가스 + split | 없음 | poison_resist |
| 19 | space | experimental | 무중력 | 없음 | low_gravity |
| 20 | space | spicy_food | 무중력 보스 | stink_dragon | legendary_pool |

## Mechanic JSON 예시

```json
{
  "schemaVersion": 1,
  "stageId": "stage_013",
  "theme": "rainy_street",
  "timeLimitSec": 105,
  "targetScore": 13500,
  "conditionPool": ["normal", "urgent", "bad"],
  "foodPool": ["food_kimchi", "food_sweet_potato"],
  "mechanics": [
    {
      "type": "gust_wind",
      "intervalSec": 8,
      "durationSec": 2.5,
      "forceX": [-160, 160],
      "warningSec": 0.8
    }
  ],
  "waveTable": "wave_rainy_013",
  "bossId": null,
  "rewardTable": "reward_stage_013"
}
```

## Stage QA 기준

| 항목 | 통과 기준 |
|---|---|
| 첫 등장 mechanic | 첫 20초 안에 안전하게 1회 체험 |
| 시각 예고 | 위험 발생 0.6초 이상 전 표시 |
| 판정 공정성 | 장애물로 인한 불가피한 Miss 금지 |
| 모바일 가독성 | 720x1280에서 mechanic이 보임 |
| 반복성 | 같은 Stage를 5회 플레이해도 패턴 학습 가능 |

