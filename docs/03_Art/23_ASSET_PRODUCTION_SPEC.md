# 23. Asset Production Specification (에셋 제작 규격서)

본 문서는 **똥 홈런 게임 Stage 1 Vertical Slice**에 필요한 2D 그래픽 에셋의 제작 규격과 이미지 생성 AI 프롬프트 가이드, 그리고 개발 엔진에 적용할 때의 기술적 제약 사항을 명세합니다.

---

## 1. 에셋 제작의 4대 기본 원칙 (Critical Constraints)

실제 그래픽 에셋 제작 및 인게임 적용 단계에서 다음 4가지 핵심 제약 조건을 반드시 준수해야 합니다.

1. **에셋 크롭(Crop) 적용 금지**
   - 기존의 참고용 이미지나 타 화면 리소스를 임의로 잘라내어(crop) 텍스처로 재사용하는 행위를 절대 금지합니다. 모든 에셋은 고유한 컨셉에 맞춰 독립적으로 신규 제작합니다.
2. **단일 통짜 배경 이미지 사용 금지**
   - 전체 플레이 화면이 한 장으로 합쳐진 통짜 배경 이미지를 삽입하는 것을 금지합니다. 배경은 카메라 스크롤, 깊이감 연출(Parallax Scrolling), 그리고 레이어 처리를 위해 반드시 **하늘 레이어(Sky)**와 **전경 레이어(Foreground: 잔디, 나무, 벤치 등)**로 분리하여 개별 파일로 제작해야 합니다.
3. **개별 독립 PNG 파일 원칙**
   - 스프라이트 시트(Sprite Sheet) 형태의 통합 이미지로 제작하기 전에, 모든 리소스는 배경 투명도(Alpha Channel)가 완벽하게 처리된 개별 독립 PNG 파일 단위로 우선 생산합니다.
4. **무오류 Fallback 유지 규칙**
   - 개발 및 런타임 환경에서 실제 에셋 이미지 파일(PNG)이 누락되어 로드하지 못하더라도, 게임 엔진은 강제 크래시를 내지 않고 8단계에서 구현된 **기존 Graphics 기반 동적 렌더링 Fallback** 상태로 안전하게 전환되어 정상 플레이가 가능해야 합니다.

---

## 2. 7단계/8단계 연동 P0 에셋 사양서 (Asset Catalog Specification)

`assets_catalog.json`에 선언된 16종의 핵심 P0 에셋 명세입니다.

| 에셋 ID (AssetId) | 대상 파일명 (PNG Path) | 권장 해상도 (px) | 투명 배경 여부 | 중심점 기준 (Pivot) | 충돌체 유지 기준 (Hitbox) |
|---|---|---|---|---|---|
| **char_child_body** | `art/characters/child/body.png` | 130 x 180 | **투명 (O)** | 중앙 하단 (0.5, 1.0) | 없음 (비전투 연출용) |
| **char_child_face_normal** | `art/characters/child/face_normal.png` | 120 x 80 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |
| **char_child_face_straining** | `art/characters/child/face_straining.png` | 120 x 80 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |
| **char_child_face_happy** | `art/characters/child/face_happy.png` | 120 x 80 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |
| **char_child_face_shocked** | `art/characters/child/face_shocked.png` | 120 x 80 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |
| **char_player_body** | `art/characters/player/body.png` | 160 x 200 | **투명 (O)** | 중앙 하단 (0.5, 1.0) | 없음 (비전투 연출용) |
| **item_player_bat** | `art/characters/player/bat.png` | 40 x 160 | **투명 (O)** | 손잡이 하단 (0.5, 0.8) | 없음 (물리 판정은 배트 궤적으로 처리) |
| **poop_normal** | `art/poop/normal.png` | 50 x 50 | **투명 (O)** | 중앙 (0.5, 0.5) | **원형 충돌체 (반지름 25px)** |
| **poop_fast** | `art/poop/fast.png` | 40 x 40 | **투명 (O)** | 중앙 (0.5, 0.5) | **원형 충돌체 (반지름 20px)** |
| **poop_heavy** | `art/poop/heavy.png` | 100 x 100 | **투명 (O)** | 중앙 (0.5, 0.5) | **원형 충돌체 (반지름 50px)** |
| **poop_gold** | `art/poop/gold.png` | 50 x 50 | **투명 (O)** | 중앙 (0.5, 0.5) | **원형 충돌체 (반지름 25px)** |
| **bg_park_sky** | `art/backgrounds/park_sky.png` | 1080 x 1920 | **불투명 (X)** | 좌상단 (0, 0) | 없음 |
| **bg_park_foreground** | `art/backgrounds/park_foreground.png` | 1080 x 1920 | **투명 (O)** | 좌상단 (0, 0) | 없음 |
| **ui_hud_panel** | `art/ui/hud_panel.png` | 600 x 150 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |
| **fx_ring** | `art/effects/ring.png` | 200 x 200 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |
| **fx_spark** | `art/effects/spark.png` | 30 x 30 | **투명 (O)** | 중앙 (0.5, 0.5) | 없음 |

---

## 3. 이미지 생성 AI용 추천 프롬프트 가이드

이 게임은 캐주얼하고 유머러스한 느낌의 2D 카툰 그래픽 스타일을 지향합니다. Midjourney, DALL-E 3 등의 도구를 사용하여 에셋을 출력할 때 사용할 수 있는 프롬프트 템플릿입니다.

### A. 공통 수식어 (스타일 통일용)
> `flat vector illustration, 2d cartoon game asset, clean lines, vibrant colors, white background, no shading, minimal design --no realistic, shadow, border`

### B. 캐릭터 (Character Assets)
- **아이 몸통 (Child Body)**:
  - `A cute chubby toddler body standing, wearing a red t-shirt, cartoon game asset style, flat vector illustration, front view, white background --no face, head`
- **아이 표정 4종 (Child Facial Expressions)**:
  - `A set of simplified cute cartoon baby facial expressions: eyes and mouth only. Normal smile, straining face with eyes closed, happy laughing face, shocked face with wide eyes. Flat vector, clean lines, transparent friendly game UI style, white background`
- **플레이어 몸통 (Player Body)**:
  - `A cute simplified cartoon baseball player character body wearing white and navy baseball uniform and green cap, flat vector illustration, front view, white background --no face`
- **야구 방망이 (Baseball Bat)**:
  - `A classic cartoon wooden baseball bat game asset, flat vector illustration, isolated on white background`

### C. 똥 종류 (Poop Projectiles)
- **일반 똥 (Poop Normal)**:
  - `Cute glossy brown coiled poop character with funny eyes, flat vector cartoon asset, white background`
- **신속 똥 (Poop Fast)**:
  - `Fast aerodynamic blue poop icon with electric thunder bolt patterns, speed trail effects, flat 2d game asset, white background`
- **중량 똥 (Poop Heavy)**:
  - `Large heavy orange rock-textured poop, cracked stone details, massive and giant cartoon game asset, flat vector, white background`
- **황금 똥 (Poop Gold)**:
  - `Shiny glowing yellow golden coin poop with a coin emblem in the middle, sparkles, glossy, flat vector game asset, white background`

### D. 배경 및 이펙트 (Backgrounds & Effects)
- **공원 전경 (Park Foreground)**:
  - `Cartoon park landscape foreground with green grass, simple stylized trees, and a wooden bench. Flat vector, isolated layout, transparent overlay style, white background --no sky`

---

## 4. Antigravity AI Agent 적용 지시문 (Technical Rules for AI)

Antigravity AI Agent가 향후 제작된 스프라이트 에셋을 코드로 가져와 반영할 때 준수해야 할 핵심 기술 규칙입니다.

1. **AssetManager 우선 참조**
   - 씬 내부에서 이미지를 직접 로드(`load.image`)하는 대신, [AssetManager.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/managers/AssetManager.ts)의 `preloadAssets()`에 신규 에셋 매핑을 우선 등록하고, `getOrGenerateTexture()` 래퍼를 통해 씬에 가져와야 합니다.
2. **에셋 크기 변경 시 충돌체(Hitbox) 스케일 비례 조정**
   - 똥 스프라이트(`poop_normal`, `poop_heavy` 등)를 로드된 실제 스프라이트로 교체 시, PNG 파일의 크기가 달라지면 물리 컴포넌트(`Phaser.Physics.Arcade.Body`)의 `setCircle` 반지름 크기도 그에 비례하게 동기화해 주어야 합니다. `poopDef.radius` 수치 스펙은 절대로 어겨서는 안 됩니다.
3. **배트 회전 축(Origin) 매칭**
   - 배트 스프라이트(`item_player_bat.png`)가 실제 스프라이트로 교체되면 손잡이 위치가 중심축이 되도록 `setOrigin()` 값을 섬세하게 튜닝하여, 배트 스윙 회전(Tween) 시 플레이어 캐릭터 손 위치에서 어긋나 회전하는 그래픽 버그가 나지 않도록 해야 합니다.

---

## 5. 에셋 제작 우선순위 테이블 (Production Priority)

콘텐츠 빌드 안정성을 극대화하기 위해 에셋 제작 순서를 P0, P1, P2 단계로 구분하여 제작합니다.

| 우선순위 | 구분 | 대상 에셋 목록 | 제작 및 완료 기준 |
|---|---|---|---|
| **P0** | **핵심 Vertical Slice** | - 아이 몸통 (`char_child_body`) <br/> - 아이 표정 4종 (`char_child_face_*`) <br/> - 플레이어 몸통 (`char_player_body`) <br/> - 야구 배트 (`item_player_bat`) <br/> - 똥 4종 (`poop_normal`, `poop_fast`, `poop_heavy`, `poop_gold`) <br/> - 공원 테마 배경 2종 (`bg_park_sky`, `bg_park_foreground`) <br/> - HUD 패널 (`ui_hud_panel`) <br/> - Perfect 링 이펙트 (`fx_ring`) <br/> - 스파크 파티클 (`fx_spark`) | Stage 1을 실제 일러스트급 화면으로 구동하는 데 필요한 필수 에셋 일체 완료. |
| **P1** | **콘텐츠 확장 (2~5스테이지)** | - 분열 똥 (`poop_split`) <br/> - 독 똥 (`poop_poison`) <br/> - 폭탄 똥 (`poop_bomb`) <br/> - 보스 Toilet Golem 캐릭터 및 패턴 이펙트 <br/> - 상점 스킨(더미용 캐릭터) 및 버튼 세트 | 5스테이지 및 첫 보스 클리어 단계까지의 추가 콘텐츠 대응 에셋 완료. |
| **P2** | **도감 & 라이브BM 완성** | - 똥 도감용 썸네일 아이콘 20종 <br/> - 과금/상점 스킨 10종 <br/> - 일일 미션 보상 박스 이미지 및 팝업 프레임 | 글로벌 소프트 런칭 및 라이브 운영에 필요한 UI 장식용 에셋 완료. |
