# 15. Asset List

참조 문서: `04_ART_BIBLE.md`, `11_STAGE_DESIGN.md`, `12_CHARACTER_BOOK.md`, `20_GAME_FEEL.md`

## 에셋 관리 원칙

| 원칙 | 내용 |
|---|---|
| assetId 우선 | 코드와 JSON은 파일 경로 대신 assetId를 참조한다. |
| 교체 안전성 | pivot, hitboxId, logical size를 유지한다. |
| Atlas 준비 | 똥/아이콘/이펙트는 atlas 묶음을 전제로 한다. |
| 등급 색상 | rarity별 테두리 색상은 UI와 도감에서 일관 사용한다. |

## 필수 초기 에셋

| assetId | 파일 | 크기 | 용도 |
|---|---|---:|---|
| child_face_idle_01 | art/characters/child/child_face_idle_01.png | 512 | 기본 표정 |
| child_face_happy_01 | art/characters/child/child_face_happy_01.png | 512 | good |
| child_face_strain_01 | art/characters/child/child_face_strain_01.png | 512 | bad |
| player_skin_default | art/characters/player/player_skin_default.png | 768 | 기본 플레이어 |
| poop_normal_01 | art/poop/poop_normal_01.png | 256 | normal |
| poop_fast_01 | art/poop/poop_fast_01.png | 256 | fast |
| poop_gold_01 | art/poop/poop_gold_01.png | 256 | gold |
| boss_toilet_golem_idle | art/bosses/boss_toilet_golem_idle.png | 1024 | 첫 보스 |
| bg_stage_park_01 | art/backgrounds/bg_stage_park_01.png | 1080x1920 | 공원 |
| ui_icon_coin | art/ui/ui_icon_coin.png | 256 | 코인 |
| fx_perfect_hit_01 | art/effects/fx_perfect_hit_01.png | 512 | Perfect |

## Stage별 배경/장애물

| Theme | Background | Obstacle | Effect |
|---|---|---|---|
| park | bg_stage_park_01 | none | fx_leaf_wind |
| city | bg_stage_city_01 | obstacle_building_reflector | fx_reflect_spark |
| school | bg_stage_school_01 | npc_student_01 | fx_warning_ring |
| construction | bg_stage_construction_01 | obstacle_crane_hook | fx_dust_hit |
| festival | bg_stage_festival_01 | obstacle_firework_launcher | fx_firework_pop |
| rainy_street | bg_stage_rainy_01 | obstacle_wind_zone | fx_rain_splash |
| amusement | bg_stage_amusement_01 | obstacle_rotating_gate | fx_spin_trail |
| sewer | bg_stage_sewer_01 | hazard_poison_gas | fx_poison_cloud |
| space | bg_stage_space_01 | hazard_gravity_field | fx_star_trail |

## Rarity UI 색상

| Rarity | Border | Glow | 사용처 |
|---|---|---|---|
| Common | #B8B8B8 | 없음 | 기본 |
| Rare | #3BA7FF | 약함 | 도감/보상 |
| Epic | #B15CFF | 중간 | 도감/연출 |
| Legendary | #FFB629 | 강함 | 컷인 |
| Mythic | #FF4C7D | 강함 + 파티클 | 희귀 발견 |
| Secret | #1CE6D8 | 글리치 | 비밀 발견 |

## Asset Manifest 예시

```json
{
  "schemaVersion": 1,
  "assets": {
    "poop_gold_01": {
      "path": "assets/art/poop/poop_gold_01.png",
      "type": "sprite",
      "logicalSize": { "width": 96, "height": 96 },
      "pivot": "center",
      "hitboxId": "poop_circle_38",
      "atlas": "atlas_poop_core"
    }
  }
}
```

## 제작 우선순위

| 우선순위 | 에셋 |
|---|---|
| P0 | 기본 아이/플레이어/7종 똥/공원 배경/UI 핵심 |
| P1 | 도시~공사장 배경, 첫 보스, 주요 이펙트 |
| P2 | 희귀 똥 100종 변형, 시즌 스킨, Secret 연출 |

