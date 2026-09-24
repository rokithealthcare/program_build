# 14. UI Flow

참조 문서: `01_GDD.md`, `17_GAME_MODES.md`, `18_FOOD_SYSTEM.md`, `19_COLLECTION_SYSTEM.md`

## UI 목표

모바일 세로 화면에서 3초 안에 다음 행동을 이해할 수 있어야 한다. 메인 화면은 "플레이 재개", "성장", "수집", "이벤트"를 명확히 제공한다.

## 전체 Flow Diagram

```text
Boot
-> Title
-> Main Lobby
   -> Story Map -> Food Select -> Stage Prep -> InGame -> Result
   -> Rank Mode -> Weekly Rule -> InGame -> Rank Result
   -> Battle Mode -> Matchmaking -> InGame -> Battle Result
   -> Growth -> Player Growth / Child Growth
   -> Collection -> Poop/Food/Boss/Skin/Title/Achievement
   -> Shop -> Skin/IAP/Ad Reward
   -> Mission -> Daily/Weekly/Achievement
```

## 주요 화면

| 화면 | 목적 | 필수 CTA |
|---|---|---|
| Main Lobby | 다음 플레이 유도 | Story 계속하기 |
| Story Map | 해금 진행 표시 | 선택 Stage 시작 |
| Food Select | 전략 선택 | 음식 장착/시작 |
| Stage Prep | mechanic 예고 | 플레이 |
| InGame HUD | 플레이 정보 | 일시정지, 스킬 |
| Result | 보상/재도전 | 다음 Stage, 보상 2배 |
| Collection | 수집 욕구 | 미발견 힌트 |
| Growth | 성장 욕구 | 강화 |
| Rank | 경쟁 욕구 | 도전 |
| Battle | 실시간 경쟁 | 매칭 시작 |

## InGame HUD 배치

| 위치 | 요소 | 규칙 |
|---|---|---|
| 상단 중앙 | 아이/컨디션 | 플레이 영역 가림 최소 |
| 상단 좌측 | 점수/목표 | 숫자 5자리 이상 대응 |
| 상단 우측 | 콤보/일시정지 | Safe Area 안쪽 |
| 중앙 | 투사체/장애물 | UI 배치 금지 |
| 하단 좌측 | 스킬 | 88px 이상 |
| 하단 중앙 | 플레이어 조작 | 드래그 영역 |
| 하단 우측 | 음식 효과 타이머 | 작은 아이콘 + 링 |

## Food Select Flow

```text
Food Select
-> 음식 카드 선택
-> 효과/부작용/지속시간 표시
-> 추천 Stage 표시
-> 장착
-> Stage Prep에 modifier preview 표시
```

## Result 화면 정보 우선순위

| 순위 | 정보 | 이유 |
|---:|---|---|
| 1 | 클리어/실패 | 감정 정리 |
| 2 | 점수/별/랭크 | 실력 피드백 |
| 3 | 신규 발견 | 수집 동기 |
| 4 | 보상 | 성장 동기 |
| 5 | 다음 행동 | 재도전/다음 Stage |

## UI State JSON 예시

```json
{
  "screenId": "stage_prep",
  "layout": "portrait_9_16",
  "sections": [
    { "id": "stage_info", "anchor": "top", "heightRatio": 0.22 },
    { "id": "food_effect_preview", "anchor": "middle", "heightRatio": 0.38 },
    { "id": "cta_area", "anchor": "bottom", "heightRatio": 0.18 }
  ],
  "primaryCta": "button_start_stage",
  "safeArea": true
}
```

## UX 금지 규칙

| 금지 | 이유 |
|---|---|
| 인게임 중 전면 광고 | 코어 손맛 훼손 |
| 작은 텍스트로 핵심 효과 표시 | 모바일 가독성 저하 |
| 미발견 도감의 완전한 정보 공개 | 수집 동기 저하 |
| Rank/Battle 결과에서 과금 CTA 우선 | 경쟁 공정성 훼손 |

