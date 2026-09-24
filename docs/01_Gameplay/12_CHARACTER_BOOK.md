# 12. Character Book

참조 문서: `01_GDD.md`, `04_ART_BIBLE.md`, `18_FOOD_SYSTEM.md`, `19_COLLECTION_SYSTEM.md`

## 캐릭터 구조

| 캐릭터 | 기능 | 성장 여부 | 수집 연결 |
|---|---|---|---|
| 플레이어 | 조준/타격 주체 | O | 스킨, 장비 |
| 아이 | 음식/컨디션/발사 주체 | O | 표정, 발사 모션, 아이 스킨 |
| 보스 | 스테이지 시험 | X | 보스 도감 |
| NPC | 스테이지 규칙 제공 | X | 칭호/업적 |

## 아이 성장 시스템

아이 성장은 플레이어 능력치와 분리한다. Story Mode에서만 성장 효과가 적용되며 Rank Mode에서는 비활성 또는 cosmetic만 적용한다.

| 성장 ID | 효과 | 최대 레벨 | 적용 모드 |
|---|---|---:|---|
| digestion_power | 소화 시간 감소, 음식 효과 안정화 | 50 | Story |
| stomach_resist | bad/poison 디버프 확률 감소 | 40 | Story |
| golden_chance | gold 계열 등장 확률 증가 | 30 | Story |
| rare_poop_sense | Rare 이상 발견 확률 증가 | 30 | Story |
| face_expression | 표정 슬롯 해금 | 20 | Story/Cosmetic |
| food_capacity | 동시에 보유 가능한 음식 프리셋 증가 | 10 | Story |
| launch_motion | 발사 모션 해금 | 20 | Cosmetic |
| child_skin_slot | 아이 스킨 슬롯 확장 | 10 | Cosmetic |

## 성장 공식

```text
childGrowthCost = floor(baseCost * growthRate^(level - 1))
effectValue = baseValue + level * valuePerLevel
```

| 성장 | baseCost | growthRate | valuePerLevel |
|---|---:|---:|---:|
| digestion_power | 120 | 1.12 | 소화 시간 -0.8% |
| stomach_resist | 150 | 1.14 | 디버프 확률 -0.6% |
| golden_chance | 220 | 1.16 | gold weight +0.4 |
| rare_poop_sense | 260 | 1.17 | Rare+ weight +0.3 |

## 플레이어 성장과 역할 분리

| 구분 | 플레이어 성장 | 아이 성장 |
|---|---|---|
| 핵심 | 타격 성능 | 발사/소화/수집 확률 |
| 체감 | 조작이 쉬워짐 | 보상이 다양해짐 |
| Rank Mode | 최소화/제거 | 제거 |
| BM 주의 | Pay to Win 금지 | 수집 편의 중심 |

## 아이 표정 확장

| Face ID | 해금 조건 | 연결 효과 |
|---|---|---|
| face_idle | 기본 | 없음 |
| face_happy | Stage 1 | good |
| face_strain | Stage 3 | bad |
| face_panic | Stage 6 | urgent |
| face_spicy | spicy_food 10회 사용 | fast/poison 예고 |
| face_sleepy | milk 10회 사용 | slow/large poop 예고 |
| face_legend | Legendary poop 5종 발견 | 희귀 발견 연출 |

## 발사 모션

| Motion ID | 설명 | 게임 영향 |
|---|---|---|
| launch_default | 기본 발사 | 없음 |
| launch_spin | 회전 발사 | 비행 패턴 시각 강조 |
| launch_jump | 점프 후 발사 | 보스 컷씬용 |
| launch_space | 무중력 밀어내기 | space theme |
| launch_festival | 폭죽 타이밍 발사 | festival theme |

## Boss Character Template

| 항목 | 필수 여부 | 설명 |
|---|---|---|
| bossId | 필수 | snake_case 고정 ID |
| silhouette | 필수 | 5인치 화면에서 구분되는 외형 |
| introCutscene | 필수 | 첫 등장 컷씬 |
| dialogueSet | 필수 | 등장/피격/분노/패배 |
| aiProfile | 필수 | 공격 선택 규칙 |
| rewardTable | 필수 | 최초/반복 보상 분리 |
| bgmId | 필수 | 고유 음악 |

```json
{
  "bossId": "crane_foreman",
  "displayNameKey": "boss.crane_foreman.name",
  "aiProfile": "ai_boss_crane_pressure",
  "introCutscene": "cutscene_boss_crane_intro",
  "bgmId": "bgm_boss_construction",
  "dialogueSet": "dialogue_boss_crane",
  "rewardTable": "reward_boss_crane"
}
```

