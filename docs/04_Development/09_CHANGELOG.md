# 09. Changelog

모든 개발 변경사항은 이 파일에 날짜별로 기록한다. 문서, 코드, 데이터, 에셋, 테스트 변경을 구분한다.

## 2026-07-01 (Session Loop & Crash Fix)

### Added
- [GameScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/GameScene.ts): 6단계 제한시간 타이머(90초) 설정 및 타격 물리 충돌(overlap) 연동 완료.
- [MainMenuScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/MainMenuScene.ts), [ResultScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/ResultScene.ts): GameManager의 씬 전이 상태 구조 연동 완료.

### Fixed
- [PoopManager.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/managers/PoopManager.ts): `stopSpawning()` 시 싱글톤 매니저의 `poopGroup` 및 `scene` 참조를 `null`로 클리어하여 씬 전환 후의 메모리 누수 및 디버그 오버레이 널 참조 크래시 해결.

### Changed
- [TODO.md](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/docs/08_TODO.md): P0 핵심 플레이 루프 체크리스트 전체 완료(`[x]`)로 갱신.

### Test
- `npm run build` 번들 컴파일 테스트 완료.
- 모바일 마우스/터치 슬링샷 홈런 타격 루프 및 타이머 초과/라이프 소진에 따른 게임 결과 화면 전환 정상 동작 검증.

## 2026-06-30 (Slingshot Input)

### Added
- 슬링샷 마우스/터치 드래그 입력 코어 [PlayerController.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/gameplay/PlayerController.ts) 구현.
- Phaser Graphics 기반 역방향 조준 점선 가이드 [AimPreview.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/gameplay/AimPreview.ts) 구현.
- Phaser Arcade Physics 및 ObjectPool 방식을 연동한 [PlayerProjectile.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/gameplay/PlayerProjectile.ts) 모의 투사체 구현.
- 조준 데이터 통신 및 디버깅용 [input.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/types/input.ts) 인터페이스 파일 추가.

### Changed
- [events.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/types/events.ts): 조준, 발사, 투사체 스폰/소멸 등 4단계 관련 신규 이벤트 5종 추가.
- [GameScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/GameScene.ts): 슬링샷 컨트롤러, 조준선 및 Physics 투사체 풀 바인딩 연동, 가상 수치 버튼들 Y=1060 영역으로 이동 재배치.
- [DebugOverlay.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/debug/DebugOverlay.ts): 실시간 조준 각도(Angle), 힘(Power), 픽셀 드래그 거리 추가 렌더링.
- [TODO.md](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/docs/08_TODO.md) 진행율 갱신.

### Test
- 모바일 마우스/터치 슬링샷 드래그 릴리즈 비행 및 화면 외 소멸(ObjectPool 회수) 검증 통과.
- 조작 임계값(20px 미만) 시 발사 캔슬 처리 검증 통과.
- `npm run build` 번들 빌드 컴파일 정상 동작 확인.

## 2026-06-30 (Data Foundation)

### Added
- Zod를 이용한 JSON 데이터 스키마 유효성 검증기 [SchemaValidator.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/data/SchemaValidator.ts) 구현.
- 5종 JSON 밸런스 데이터 파일 비동기 로딩을 위한 [DataLoader.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/data/DataLoader.ts) 및 전역 캐시용 [ConfigManager.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/core/ConfigManager.ts), 불변 객체 모델 [RuntimeConfig.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/data/RuntimeConfig.ts) 추가.
- 5종 JSON 데이터 생성:
  - `poop_balance.json`, `condition_rates.json`, `stage_balance.json`, `boss_balance.json`, `reward_balance.json`
- 개발 모드 전용 온스크린 디버그 오버레이 [DebugOverlay.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/debug/DebugOverlay.ts) 추가 (FPS, 활성 씬, JSON 로드 카운트, Canvas 해상도, 마우스 실시간 월드 좌표 표출).

### Changed
- [BootScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/BootScene.ts): 비동기 데이터 로딩 완료 대기 기능 추가 및 검증 실패 시 화면에 Zod 에러 명세 출력.
- [vite.config.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/vite.config.ts): `publicDir: 'assets'` 지정하여 static json 서빙 연동.
- [TODO.md](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/docs/08_TODO.md) 진행율 업데이트.

### Test
- Zod 검증 결함 탐지 테스트 완료: `condition_rates.json` 확률 합을 고의 불일치(105%) 시켰을 때 로딩 락 및 Zod Error UI(Red Screen) 표출 확인.
- `npm run build` 번들 빌드 컴파일 성공 확인.

## 2026-06-30 (Core Setup)

### Added
- Vite + TypeScript + Phaser 3 기반 프로젝트 뼈대 생성.
- Phaser 3 캔버스 마운트용 [index.html](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/index.html) 및 [vite.config.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/vite.config.ts) 생성.
- 기본 Scene 구조 추가:
  - [BootScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/BootScene.ts): 리소스 로드 흐름 준비.
  - [MainMenuScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/MainMenuScene.ts): 터치 시 인게임 진입 가상 로직 구현.
  - [GameScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/GameScene.ts): 1080x1920 세로 해상도 기준 25% / 50% / 25% 가이드 라인 드로잉 및 결과 페이지로의 씬 전환 버튼 배치.
  - [ResultScene.ts](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/src/scenes/ResultScene.ts): 결과 점수 출력 및 메인 복귀 흐름 구현.
- 게임 엔진 디렉토리 구조 생성:
  - `src/core`, `src/managers`, `src/gameplay`, `src/data`, `src/ui`, `src/save`, `src/utils`
  - `assets/data/balance`, `assets/art`, `assets/audio`

### Changed
- [TODO.md](file:///d:/0.%20%EA%B0%9C%EC%9D%B8/0D.%20%ED%95%99%EC%8A%B5/%EB%B0%94%EC%9D%B4%EB%B8%8C%EC%BD%94%EB%94%A9/%EB%98%A5%ED%99%88%EB%9F%B0%EA%B2%8C%EC%9E%84/docs/08_TODO.md) 진행 상황 완료 처리.

### Test
- `npm run build`를 구동하여 컴파일 및 롤다운 번들링 검증 완료. (dist/ 빌드 출력물 정상 생성)

### Risk
- Phaser 3 렌더링 최적화 및 9:16 스케일 시 디바이스별 레터박스 대응 검증 필요.

## 2026-06-30

### Added
- Antigravity AI Agent 협업을 위한 최종 개발 문서 패키지 생성.
- 게임 헌장, GDD, TDD, AI 개발 규칙, 아트 바이블, 밸런스 북, 로드맵, 프롬프트 북, TODO 문서 추가.
- 장기 잔존형 모바일 캐주얼 게임으로 확장하기 위한 신규 문서 11개 추가.
- 음식 시스템, 100종 이상 확장 가능한 도감, 아이 성장, 스테이지 고유 mechanic, 3개 게임 모드, 게임 필 기준 추가.

### Data
- JSON 기반 밸런스 관리 원칙과 예시 schema 정의.
- 컨디션별 똥 등장 확률, 똥 종류별 수치, 보스/성장/보상 초기 밸런스 정의.
- Food, Poop, Stage, Boss, Collection, Mode, Game Feel JSON schema 예시 추가.

### Test
- 문서 생성 작업이므로 런타임 테스트는 수행하지 않음.
- 향후 구현 시 JSON schema 검증, 판정 테스트, 저장 테스트, 해상도 테스트 필요.

## 변경 기록 양식

```md
## YYYY-MM-DD

### Added
- 새로 추가한 기능, 문서, 데이터, 에셋.

### Changed
- 기존 기능의 변경 내용.

### Fixed
- 수정한 버그와 재현 경로.

### Removed
- 제거한 항목. 제거 사유와 대체 항목 필수.

### Data
- JSON/config/schema 변경 내용.

### Art
- 에셋 추가/교체/삭제 내용과 hitbox 유지 여부.

### Test
- 실행한 테스트, 결과, 미실행 사유.

### Risk
- 남은 위험, 회귀 가능성, 추적 TODO.
```

## 기록 규칙

| 규칙 | 내용 |
|---|---|
| 날짜 | 한국 시간 기준 YYYY-MM-DD |
| 단위 | 사용자에게 의미 있는 변경 단위 |
| 삭제 | Removed에는 반드시 사유와 대체 방안 기록 |
| 테스트 | 테스트 미실행 시 이유를 명시 |
| 문서 | 기획/기술 문서 변경도 기록 |
