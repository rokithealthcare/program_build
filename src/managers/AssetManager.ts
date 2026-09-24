import Phaser from 'phaser';

export class AssetManager {
  private static instance: AssetManager;
  private missingAssets = new Set<string>();

  private assetRegistry: Record<string, string> = {
    child_poop_start_001: 'art/characters/child/animation/poop_start/child_poop_start_001.png',
    child_poop_start_002: 'art/characters/child/animation/poop_start/child_poop_start_002.png',
    child_poop_start_003: 'art/characters/child/animation/poop_start/child_poop_start_003.png',
    child_poop_start_004: 'art/characters/child/animation/poop_start/child_poop_start_004.png',
    child_poop_start_005: 'art/characters/child/animation/poop_start/child_poop_start_005.png',
    child_poop_start_006: 'art/characters/child/animation/poop_start/child_poop_start_006.png',
    child_poop_start_007: 'art/characters/child/animation/poop_start/child_poop_start_007.png',
    child_poop_start_008: 'art/characters/child/animation/poop_start/child_poop_start_008.png',
    child_poop_start_009: 'art/characters/child/animation/poop_start/child_poop_start_009.png',
    child_poop_start_010: 'art/characters/child/animation/poop_start/child_poop_start_010.png',
    child_poop_start_011: 'art/characters/child/animation/poop_start/child_poop_start_011.png',
    child_poop_start_012: 'art/characters/child/animation/poop_start/child_poop_start_012.png',
    child_poop_start_013: 'art/characters/child/animation/poop_start/child_poop_start_013.png',
    child_poop_start_014: 'art/characters/child/animation/poop_start/child_poop_start_014.png',
    child_poop_start_015: 'art/characters/child/animation/poop_start/child_poop_start_015.png',
    child_poop_start_016: 'art/characters/child/animation/poop_start/child_poop_start_016.png',
    child_poop_start_017: 'art/characters/child/animation/poop_start/child_poop_start_017.png',
    child_poop_start_018: 'art/characters/child/animation/poop_start/child_poop_start_018.png',
    child_poop_start_019: 'art/characters/child/animation/poop_start/child_poop_start_019.png',
    child_poop_start_020: 'art/characters/child/animation/poop_start/child_poop_start_020.png',
    child_poop_start_021: 'art/characters/child/animation/poop_start/child_poop_start_021.png',
    child_poop_start_022: 'art/characters/child/animation/poop_start/child_poop_start_022.png',
    child_poop_start_023: 'art/characters/child/animation/poop_start/child_poop_start_023.png',
    child_poop_start_024: 'art/characters/child/animation/poop_start/child_poop_start_024.png',
    child_poop_start_025: 'art/characters/child/animation/poop_start/child_poop_start_025.png',
    child_poop_start_026: 'art/characters/child/animation/poop_start/child_poop_start_026.png',
    child_poop_start_027: 'art/characters/child/animation/poop_start/child_poop_start_027.png',
    child_poop_start_028: 'art/characters/child/animation/poop_start/child_poop_start_028.png',
    child_poop_start_029: 'art/characters/child/animation/poop_start/child_poop_start_029.png',
    child_poop_start_030: 'art/characters/child/animation/poop_start/child_poop_start_030.png',
    child_poop_start_031: 'art/characters/child/animation/poop_start/child_poop_start_031.png',
    child_poop_start_032: 'art/characters/child/animation/poop_start/child_poop_start_032.png',
    char_child_body_idle: 'art/characters/child/body_idle.png',
    char_child_body_straining: 'art/characters/child/body_straining.png',
    char_child_face_normal: 'art/characters/child/face_normal.png',
    char_child_face_straining: 'art/characters/child/face_straining.png',
    char_child_face_happy: 'art/characters/child/face_happy.png',
    char_child_face_shocked: 'art/characters/child/face_shocked.png',
    char_player_body: 'art/characters/player/body.png',
    item_player_bat: 'art/characters/player/bat.png',
    poop_normal: 'art/poop/normal.png',
    poop_fast: 'art/poop/fast.png',
    poop_heavy: 'art/poop/heavy.png',
    poop_gold: 'art/poop/gold.png',
    bg_park_sky: 'art/backgrounds/park_sky.png',
    bg_park_foreground: 'art/backgrounds/park_foreground.png',
    projectile_ball: 'art/effects/projectile_ball.png',
    ui_hud_panel: 'art/ui/hud_panel.png',
    fx_ring: 'art/effects/ring.png',
    fx_spark: 'art/effects/spark.png'
  };

  private constructor() {}

  public static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * Phaser Scene의 preload 라이프사이클에서 호출하여 리소스를 로드합니다.
   * 실제 에셋 파일이 없더라도 크래시나 무한 로딩이 발생하지 않도록 방어합니다.
   */
  public preloadAssets(scene: Phaser.Scene) {
    this.missingAssets.clear();

    // 로드 에러 방어 처리: 유실된 리소스를 missingAssets에 등록하고 진행시킴
    scene.load.on('loaderror', (fileObj: any) => {
      if (import.meta.env.DEV) {
        console.warn(`[AssetManager] 리소스 로딩 실패(Fallback 적용 예정): ${fileObj.key} (${fileObj.src})`);
      }
      this.missingAssets.add(fileObj.key);
    });

    // assets_catalog.json 비동기 로드 시도 (참고용, 필수 종속성 배제)
    scene.load.json('assets_catalog', 'data/assets_catalog.json');

    // 기본 레지스트리에 명시된 모든 PNG 로드 시도
    for (const [key, path] of Object.entries(this.assetRegistry)) {
      scene.load.image(key, path);
    }
  }

  /**
   * 에셋의 유효성 검사 후 캐시에 존재하면 해당 키를 반환하고,
   * 파일이 누락되어 캐시에 존재하지 않으면 Graphics 드로잉을 통해 텍스처를 동적 생성 및 캐싱한 후 반환합니다.
   */
  public getOrGenerateTexture(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    fallbackDrawFn: (g: Phaser.GameObjects.Graphics) => void
  ): string {
    // 1. Phaser 이미지 캐시에 이미 키가 유효하게 존재하고, missingAssets 목록에 없는 경우
    if (scene.textures.exists(key) && !this.missingAssets.has(key)) {
      return key;
    }

    // 2. 캐시에 없거나, 로드 과정에서 에러가 났던 에셋인 경우 동적 Graphics Fallback 실행
    const dynamicKey = `fallback_${key}`;
    if (scene.textures.exists(dynamicKey)) {
      return dynamicKey;
    }

    try {
      const g = scene.make.graphics({ x: 0, y: 0 }, false);
      fallbackDrawFn(g);
      g.generateTexture(dynamicKey, width, height);
      g.destroy();
      
      if (import.meta.env.DEV) {
        console.log(`[AssetManager] Fallback 텍스처 동적 빌드 완료: ${dynamicKey} (${width}x${height})`);
      }
      return dynamicKey;
    } catch (err) {
      console.error(`[AssetManager] Fallback 텍스처 생성 중 오류 발생:`, err);
      // 최악의 경우 기본 Phaser 화이트 픽셀 텍스처 대체 반환
      return '__WHITE';
    }
  }

  /**
   * 에셋 유실 리스트 반환
   */
  public getMissingAssets(): Set<string> {
    return this.missingAssets;
  }
}
