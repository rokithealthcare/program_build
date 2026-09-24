# 20. Game Feel

참조 문서: `01_GDD.md`, `04_ART_BIBLE.md`, `05_BALANCE_BOOK.md`, `11_STAGE_DESIGN.md`

## 목표

게임 필은 타격 액션의 반복 플레이를 만드는 핵심이다. 모든 피드백은 모바일에서 과하지 않게, 입력 후 100ms 이내에 반응해야 한다.

## 피드백 Layer

```text
Input
-> Aim Preview
-> Release/Hit Frame
-> Hit Stop
-> Impact Effect
-> Sound Layer
-> Score Pop
-> Combo Animation
-> Reward Particle
```

## 판정별 Feel Preset

| Judgement | Hit Stop | Shake | Slow | Flash | SFX | Vibration |
|---|---:|---:|---:|---|---|---|
| Perfect | 70ms | 4px/120ms | 0.85x 120ms | 노랑 80ms | layered_hit_big | medium |
| Good | 35ms | 2px/80ms | 없음 | 흰색 50ms | hit_normal | light |
| Graze | 15ms | 없음 | 없음 | 없음 | hit_small | none |
| Miss | 없음 | 3px/100ms | 없음 | 회색 60ms | miss_thud | light |
| Boss Break | 100ms | 6px/180ms | 0.75x 180ms | 빨강 100ms | boss_break | heavy |

## Combo Animation

| Combo | 연출 |
|---:|---|
| 5 | 숫자 bounce |
| 10 | 작은 불꽃 |
| 20 | 색상 변화 |
| 50 | 전용 stinger |
| 100 | 화면 가장자리 오라 |

## Critical Hit

Critical은 Perfect 중 일부에서 발생하는 보너스 연출이다. Rank/Battle 공정성을 위해 확률은 seed 기반 deterministic이어야 한다.

| 조건 | 확률 | 효과 |
|---|---:|---|
| Perfect | 5% | 점수 +20% |
| Perfect + gold | 10% | 코인 +10 |
| Boss weak point | 100% | phase damage |

## Game Feel JSON 예시

```json
{
  "schemaVersion": 1,
  "feelPresets": {
    "perfect": {
      "hitStopMs": 70,
      "cameraShake": { "amplitudePx": 4, "durationMs": 120 },
      "slowMotion": { "timeScale": 0.85, "durationMs": 120 },
      "screenFlash": { "color": "#FFD84A", "alpha": 0.25, "durationMs": 80 },
      "sfx": ["sfx_hit_core", "sfx_perfect_layer"],
      "vibration": "medium"
    }
  }
}
```

## 모바일 제한

| 항목 | 제한 |
|---|---|
| 화면 흔들림 | 기본 최대 6px, 접근성 옵션에서 0 가능 |
| Flash | alpha 0.35 이하 |
| 진동 | 200ms 이하 |
| 동시 파티클 | 40개 이하 |
| Slow Motion | 200ms 이하 |
| Hit Stop | 120ms 이하 |

## 접근성 옵션

| 옵션 | 효과 |
|---|---|
| Reduce Shake | shake amplitude 30% 또는 0 |
| Reduce Flash | flash alpha 50% 감소 |
| Vibration Off | 모든 진동 비활성 |
| High Contrast | 똥/장애물 외곽선 강화 |
| SFX Focus | BGM 낮추고 판정음 강조 |

## QA 기준

| 테스트 | 기준 |
|---|---|
| 입력 응답 | 릴리즈 후 100ms 이내 시각 변화 |
| 과한 연출 | Perfect 10연속에서도 목표물 가림 없음 |
| 저사양 | feel preset 활성 상태 30 FPS 이상 |
| 접근성 | Reduce 옵션 적용 후 수치 반영 |

