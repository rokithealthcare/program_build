import Phaser from 'phaser';
import { GameManager } from '../managers/GameManager';
import { StageManager } from '../managers/StageManager';
import { PoopManager } from '../managers/PoopManager';
import { AudioManager } from '../managers/AudioManager';
import { AssetManager } from '../managers/AssetManager';
import { EventBus } from '../core/EventBus';
import { PlayerController } from '../gameplay/PlayerController';
import { AimPreview } from '../gameplay/AimPreview';
import { PlayerProjectile } from '../gameplay/PlayerProjectile';
import { PoopProjectile } from '../gameplay/PoopProjectile';
import { HitResolver } from '../gameplay/HitResolver';

export class GameScene extends Phaser.Scene {
  private hudText!: Phaser.GameObjects.Text;
  private scoreUnsubscribe!: () => void;
  private comboUnsubscribe!: () => void;
  private lifeUnsubscribe!: () => void;
  private faceUnsubscribe!: () => void;
  private poopMissedUnsubscribe!: () => void;

  private playerController!: PlayerController;
  private aimPreview!: AimPreview;
  private projectileGroup!: Phaser.Physics.Arcade.Group;
  private poopGroup!: Phaser.Physics.Arcade.Group;

  // 6단계 추가: 인게임 타이머 변수
  private remainingTime: number = 90;
  private stageTimer: Phaser.Time.TimerEvent | null = null;

  // 7&8단계 추가: 스프라이트 및 이펙트 변수
  private visualScore: number = 0;
  private childContainer!: Phaser.GameObjects.Container;
  private childBodySprite!: Phaser.GameObjects.Sprite;
  private childFaceSprite!: Phaser.GameObjects.Sprite;
  private playerBatSprite!: Phaser.GameObjects.Sprite;
  private missWarningGraphics!: Phaser.GameObjects.Graphics;

  // 11단계 추가: 애니메이션 트윈 변수
  private childTween: Phaser.Tweens.Tween | null = null;

  constructor() {
    super({ key: 'GameScene' });
  }

  private hasChildPoopStartAssets(): boolean {
    const missingAssets = AssetManager.getInstance().getMissingAssets();
    for (let i = 1; i <= 32; i++) {
      const key = `child_poop_start_${String(i).padStart(3, '0')}`;
      if (!this.textures.exists(key) || missingAssets.has(key)) {
        return false;
      }
    }
    return true;
  }

  preload() {
    // 7단계: 사운드 리소스 준비
    AudioManager.getInstance().preloadSounds(this);
    // 8단계: 이미지 스프라이트 리소스 준비 ( catalog 로드 포함 )
    AssetManager.getInstance().preloadAssets(this);
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 8단계: 공원 테마 배경 텍스처 획득 및 이미지 렌더링 ( fallback 드로잉 바인딩 )
    const skyKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      'bg_park_sky',
      width,
      height,
      (g) => {
        g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xe0f7fa, 0xe0f7fa, 1.0);
        g.fillRect(0, 0, width, height);
      }
    );
    this.add.image(0, 0, skyKey).setOrigin(0, 0);

    const parkKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      'bg_park_foreground',
      width,
      height,
      (g) => {
        // 잔디 땅 (연초록색, Y=1200 이하 영역)
        g.fillStyle(0x7cfc00, 1.0);
        g.fillRect(0, 1200, width, height - 1200);

        // 짙은 흙 레이어
        g.fillStyle(0x8b5a2b, 0.3);
        g.fillRect(0, 1800, width, height - 1800);

        // 나무 3그루
        const treeXCoords = [150, 500, 930];
        treeXCoords.forEach(x => {
          g.fillStyle(0x5c4033, 1.0);
          g.fillRect(x - 15, 1050, 30, 150);
          g.fillStyle(0x228b22, 0.95);
          g.fillCircle(x, 970, 70);
          g.fillCircle(x - 40, 1000, 50);
          g.fillCircle(x + 40, 1000, 50);
        });

        // 벤치
        g.fillStyle(0x795548, 1.0);
        g.fillRect(250, 1170, 140, 12);
        g.fillRect(260, 1182, 10, 20);
        g.fillRect(350, 1182, 10, 20);
      }
    );
    this.add.image(0, 0, parkKey).setOrigin(0, 0);

    // 8단계: 똥 4종 시각 텍스처 재생성 ( AssetManager fallback 관리 하에 생성 )
    this.createDetailedPoopTextures();

    // 야구 공 텍스처 빌드
    AssetManager.getInstance().getOrGenerateTexture(
      this,
      'projectile_ball',
      40,
      40,
      (g) => {
        g.fillStyle(0x000000, 0.25);
        g.fillCircle(20, 23, 17);
        g.fillStyle(0xf8fafc, 1.0);
        g.fillCircle(20, 20, 18);
        g.lineStyle(2, 0xef4444, 1.0);
        g.beginPath();
        g.arc(10, 20, 12, -Math.PI / 3, Math.PI / 3, false);
        g.strokePath();
        g.beginPath();
        g.arc(30, 20, 12, Math.PI * 2 / 3, Math.PI * 4 / 3, false);
        g.strokePath();
        g.fillStyle(0xef4444, 1.0);
        [-8, -3, 3, 8].forEach(offsetY => {
          g.fillCircle(14, 20 + offsetY, 1.5);
          g.fillCircle(26, 20 + offsetY, 1.5);
        });
        g.fillStyle(0xffffff, 0.85);
        g.fillCircle(14, 14, 4);
      }
    );

    // 7단계: 가이드라인 DEV 전용화
    this.drawGuidelines(width, height);

    // 8단계: 아이 캐릭터 몸통 텍스처 빌드 및 스프라이트 생성 (Idle / Straining 분리)
    const childBodyIdleKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      'char_child_body_idle',
      130,
      200,
      (g) => {
        g.fillStyle(0xffe0bd, 1.0); // 얼굴 살구색
        g.fillCircle(65, 60, 60);

        g.fillStyle(0xe74c3c, 1.0); // 티셔츠
        g.beginPath();
        g.moveTo(65 - 40, 120);
        g.lineTo(65 + 40, 120);
        g.lineTo(65 + 50, 170);
        g.lineTo(65 - 50, 170);
        g.closePath();
        g.fill();

        g.fillStyle(0x3498db, 1.0); // 반바지
        g.fillRect(65 - 40, 170, 80, 20);

        g.fillStyle(0xffffff, 1.0); // 운동화
        g.fillRect(65 - 35, 190, 25, 10);
        g.fillRect(65 + 10, 190, 25, 10);
      }
    );

    const childBodyStrainingKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      'char_child_body_straining',
      130,
      200,
      (g) => {
        g.fillStyle(0xffe0bd, 1.0); // 얼굴 살구색 (힘줘서 무릎 굽힘으로 살짝 낮춤)
        g.fillCircle(65, 70, 60);

        g.fillStyle(0xe74c3c, 1.0); // 티셔츠 (몸 굽힘 표현)
        g.beginPath();
        g.moveTo(65 - 42, 130);
        g.lineTo(65 + 42, 130);
        g.lineTo(65 + 60, 175);
        g.lineTo(65 - 60, 175);
        g.closePath();
        g.fill();

        g.fillStyle(0xe74c3c, 1.0); // 몸 앞으로 당긴 팔뚝
        g.fillRect(65 - 55, 130, 20, 30);
        g.fillRect(65 + 35, 130, 20, 30);
        g.fillStyle(0xffe0bd, 1.0); // 쥔 주먹
        g.fillCircle(65 - 45, 165, 12);
        g.fillCircle(65 + 45, 165, 12);

        g.fillStyle(0x3498db, 1.0); // 반바지 (벌린 다리)
        g.fillRect(65 - 50, 175, 100, 15);

        g.fillStyle(0xffffff, 1.0); // 운동화
        g.fillRect(65 - 45, 190, 25, 10);
        g.fillRect(65 + 20, 190, 25, 10);
      }
    );

    const hasPoopStartFrames = this.hasChildPoopStartAssets();

    // 12단계: 애니메이션 등록 (프레임 이미지가 모두 있을 때만)
    if (hasPoopStartFrames) {
      if (!this.anims.exists('child_idle')) {
        const getFrames = (start: number, end: number) => {
          const frames = [];
          for (let i = start; i <= end; i++) {
            const frameNum = String(i + 1).padStart(3, '0');
            frames.push({ key: `child_poop_start_${frameNum}` });
          }
          return frames;
        };

        this.anims.create({
          key: 'child_idle',
          frames: getFrames(0, 3),
          frameRate: 10,
          repeat: -1
        });
        this.anims.create({
          key: 'child_straining_start',
          frames: getFrames(4, 7),
          frameRate: 10,
          repeat: 0
        });
        this.anims.create({
          key: 'child_straining_loop',
          frames: getFrames(8, 15),
          frameRate: 10,
          repeat: -1
        });
        this.anims.create({
          key: 'child_spawn',
          frames: getFrames(16, 23),
          frameRate: 12,
          repeat: 0
        });
        this.anims.create({
          key: 'child_recover',
          frames: getFrames(24, 31),
          frameRate: 10,
          repeat: 0
        });
      }
    }

    if (hasPoopStartFrames) {
      // 640x960 해상도이므로 스케일을 0.2로 설정해 적절한 크기로 축소 적용
      this.childBodySprite = this.add.sprite(0, 0, 'child_poop_start_001').setOrigin(0.5, 1.0).setScale(0.2);
    } else {
      this.childBodySprite = this.add.sprite(0, 0, childBodyIdleKey).setOrigin(0.5, 1.0).setScale(1.0);
    }

    // 아이 텍스트 라벨
    this.add.text(width / 2, 190, '아이', {
      fontFamily: 'Arial',
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setStroke('#000000', 4);

    // 8단계: 아이 표정 스프라이트 인스턴스화 (상대좌표 y = -120 배치)
    this.childFaceSprite = this.add.sprite(0, -120, '').setOrigin(0.5, 0.5);
    
    if (hasPoopStartFrames) {
      this.childFaceSprite.setAlpha(0); // 스프라이트 모드 시 얼굴 오버레이 가림
    } else {
      this.childFaceSprite.setAlpha(1);
      this.updateChildFaceTexture('normal');
    }

    // 10단계: 부모 컨테이너로 두 스프라이트를 묶어 관리 (기준점 Y=380)
    this.childContainer = this.add.container(width / 2, 380, [
      this.childBodySprite,
      this.childFaceSprite
    ]);

    // 11단계: 기본 호흡 애니메이션 기동
    this.playChildIdleBreathing();

    // 8단계: 플레이어 몸통 텍스처 빌드 및 스프라이트 생성
    const playerBodyKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      'char_player_body',
      160,
      200,
      (g) => {
        // 몸통 (어두운 남색)
        g.fillStyle(0x34495e, 1.0);
        g.beginPath();
        g.moveTo(80 - 50, 100 + 40);
        g.lineTo(80 + 50, 100 + 40);
        g.lineTo(80 + 80, 100 + 120);
        g.lineTo(80 - 80, 100 + 120);
        g.closePath();
        g.fill();

        // 머리
        g.fillStyle(0xffe0bd, 1.0);
        g.fillCircle(80, 100 - 10, 45);

        // 야구 모자
        g.fillStyle(0x27ae60, 1.0);
        g.fillCircle(80, 100 - 30, 47);
        g.fillRect(80 - 60, 100 - 32, 120, 8);
      }
    );
    this.add.sprite(width / 2, 1600, playerBodyKey);

    // 8단계: 플레이어 야구 배트 텍스처 빌드 및 스프라이트 생성
    const playerBatKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      'item_player_bat',
      40,
      160,
      (g) => {
        // 손잡이
        g.fillStyle(0xd7ccc8, 1.0);
        g.fillRect(10, 80, 15, 80);
        // 배트 헤드
        g.fillStyle(0xa1887f, 1.0);
        g.fillRect(8, 0, 19, 80);
        // 배트 끝
        g.fillStyle(0x5d4037, 1.0);
        g.fillRect(8, 0, 19, 5);
      }
    );
    // 배트의 회전 중심점을 손잡이 근처 (x=0.5, y=0.8) 부근으로 배치
    this.playerBatSprite = this.add.sprite(width / 2, 1600, playerBatKey).setOrigin(0.5, 0.8);

    // 플레이어 텍스트 라벨
    this.add.text(width / 2, 1840, '하단 플레이어 영역 (조작/타격)', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#a5d6a7'
    }).setOrigin(0.5).setStroke('#000000', 4);

    // HUD 영역 배치
    this.hudText = this.add.text(50, 485, '', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.6)',
      padding: { x: 20, y: 15 }
    });
    this.hudText.setStroke('#000000', 4);
    this.updateHUD();

    this.createDummyButtons(width);

    this.projectileGroup = this.physics.add.group({
      classType: PlayerProjectile,
      runChildUpdate: true
    });

    this.aimPreview = new AimPreview(this);

    const onShoot = (angle: number, power: number) => {
      let proj = this.projectileGroup.getFirstDead(false) as PlayerProjectile;
      if (!proj) {
        proj = new PlayerProjectile(this, width / 2, 1600);
        this.projectileGroup.add(proj, true);
      }
      proj.fire(width / 2, 1600, angle, power);

      // 7단계: 발사 효과음 및 배트 스윙 애니메이션
      AudioManager.getInstance().playSfx('shoot');
      this.swingBat(angle);
    };

    const onAimUpdate = (angle: number, power: number) => {
      this.aimPreview.draw(width / 2, 1600, angle, power);
    };

    const onAimClear = () => {
      this.aimPreview.clear();
    };

    this.playerController = new PlayerController(this, onShoot, onAimUpdate, onAimClear);

    this.poopGroup = this.physics.add.group({
      classType: PoopProjectile,
      runChildUpdate: true
    });

    const activeStageId = GameManager.getInstance().getStageId() || 'stage_001';
    const stageDef = StageManager.getInstance().getStageConfig(activeStageId);
    const intervalMs = stageDef.spawnIntervalMs || 1500;

    PoopManager.getInstance().initialize(this, this.poopGroup, intervalMs);

    // 6단계 물리 충돌(오버랩)체 바인딩 추가
    this.physics.add.overlap(
      this.projectileGroup,
      this.poopGroup,
      this.handleOverlap as any,
      undefined,
      this
    );

    // 6단계 초 단위 제한시간 타이머 등록
    this.remainingTime = stageDef.timeLimitSec || 90;
    EventBus.getInstance().emit('STAGE_TARGET_SCORE_LOADED', {
      targetScore: stageDef.targetScore
    });

    this.stageTimer = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (GameManager.getInstance().getCurrentState() === 'Playing') {
          this.remainingTime--;
          
          EventBus.getInstance().emit('STAGE_TIMER_CHANGED', {
            remainingTime: this.remainingTime
          });

          this.updateHUD();

          if (this.remainingTime <= 0) {
            GameManager.getInstance().finishStage('fail');
          }
        }
      },
      loop: true
    });

    // 7단계: Miss 경고 사각형 초기화
    this.missWarningGraphics = this.add.graphics();
    this.missWarningGraphics.fillStyle(0xff0000, 0.4);
    this.missWarningGraphics.fillRect(0, 0, width, height);
    this.missWarningGraphics.lineStyle(20, 0xff0000, 0.8);
    this.missWarningGraphics.strokeRect(10, 10, width - 20, height - 20);
    this.missWarningGraphics.setAlpha(0);
    this.missWarningGraphics.setDepth(100);

    // EventBus 구독
    const bus = EventBus.getInstance();
    
    // 7단계: 점수 변경 시 카운트업 트윈 연동
    const onScoreChanged = (payload: any) => {
      this.tweens.add({
        targets: this,
        visualScore: payload.score,
        duration: 350,
        ease: 'Quad.easeOut',
        onUpdate: () => this.updateHUD()
      });
      // 점수 획득 텍스트 펄스 트윈
      this.tweens.add({
        targets: this.hudText,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 80,
        yoyo: true
      });
    };

    // 7단계: 콤보 펄스 트윈 연동
    const onComboChanged = () => {
      this.updateHUD();
      this.tweens.add({
        targets: this.hudText,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 100,
        yoyo: true
      });
    };

    const onLifeChanged = () => this.updateHUD();

    // 8단계: 표정 변경 수신 리스너 ( 텍스처 교체 및 바디 스프라이트 상태 연동 + 11단계 트윈 및 12단계 애니메이션 연동 )
    const onChildFaceChange = (payload: { faceType: 'normal' | 'straining' | 'happy' | 'shocked' }) => {
      const hasPoopStartFrames = this.hasChildPoopStartAssets();

      const wasStraining = hasPoopStartFrames
        ? (this.childBodySprite.anims.currentAnim?.key === 'child_straining_loop' || 
           this.childBodySprite.anims.currentAnim?.key === 'child_straining_start')
        : this.childFaceSprite.texture.key.includes('straining');

      if (!hasPoopStartFrames) {
        this.updateChildFaceTexture(payload.faceType);
      }

      // 10단계: 표정 변화에 따른 body sprite 텍스처 교체
      if (payload.faceType === 'straining') {
        if (!hasPoopStartFrames) {
          this.childBodySprite.setTexture(childBodyStrainingKey);
          this.childFaceSprite.setY(-110);
        }
        // 11/12단계: 힘주기 떨림/애니메이션 기동
        this.playChildStrainingShake();
      } else {
        if (!hasPoopStartFrames) {
          this.childBodySprite.setTexture(childBodyIdleKey);
          this.childFaceSprite.setY(-120);
        }

        // 11/12단계: 이전 상태가 힘주기였을 경우 펀치 및 바운스 복구 연출 적용
        if (wasStraining) {
          this.playChildSpawnPunch();
        } else {
          this.playChildIdleBreathing();
        }
      }
    };

    // 7단계: 미스 시 누적 처리 및 연출
    const onPoopMissed = () => {
      GameManager.getInstance().incrementMiss();
      AudioManager.getInstance().playSfx('miss');
      this.showMissWarningVFX();
      this.updateHUD();
    };

    bus.on('SCORE_CHANGED', onScoreChanged);
    bus.on('COMBO_CHANGED', onComboChanged);
    bus.on('LIFE_CHANGED', onLifeChanged);
    bus.on('CHILD_FACE_CHANGE', onChildFaceChange);
    bus.on('POOP_MISSED', onPoopMissed);

    this.scoreUnsubscribe = () => bus.off('SCORE_CHANGED', onScoreChanged);
    this.comboUnsubscribe = () => bus.off('COMBO_CHANGED', onComboChanged);
    this.lifeUnsubscribe = () => bus.off('LIFE_CHANGED', onLifeChanged);
    this.faceUnsubscribe = () => bus.off('CHILD_FACE_CHANGE', onChildFaceChange);
    this.poopMissedUnsubscribe = () => bus.off('POOP_MISSED', onPoopMissed);

    bus.once('STAGE_FINISHED', (payload) => {
      AudioManager.getInstance().playSfx('result');
      this.cleanupEvents();
      this.scene.start('ResultScene', payload);
    });
  }

  update() {
    this.projectileGroup.getChildren().forEach((child) => {
      if (child.active) {
        child.update();
      }
    });

    this.poopGroup.getChildren().forEach((child) => {
      if (child.active) {
        child.update();
      }
    });
  }

  private handleOverlap(
    proj: PlayerProjectile,
    poop: PoopProjectile
  ) {
    if (!proj.active || !poop.active) return;

    // 1. HitResolver 판정
    const result = HitResolver.resolveHit(proj, poop);

    // 7단계: 골드 획득 시 전용 효과음, 일반 명중 시 명중 효과음 분기
    if (result.judgement !== 'miss') {
      if (poop.poopId === 'gold') {
        AudioManager.getInstance().playSfx('gold');
      } else {
        AudioManager.getInstance().playSfx('hit');
      }
    }

    // 2. 판정 VFX 연출 실행
    this.showJudgementVFX(poop.x, poop.y, result.judgement);

    // 7단계: Perfect 시 카메라 흔들림
    if (result.judgement === 'perfect') {
      this.cameras.main.shake(150, 0.015);
    }

    // 7단계: Good / Graze 피격 파티클 이펙트
    if (result.judgement === 'good' || result.judgement === 'graze') {
      const color = result.judgement === 'good' ? 0x2ecc71 : 0x3498db;
      this.createSparkParticles(poop.x, poop.y, color);
    }

    // 3. 투사체 풀 회수
    proj.despawn();
    poop.despawn();
  }

  // 8단계: 아이 표정 스프라이트 텍스처 업데이트 및 fallback 드로잉 핸들링
  private updateChildFaceTexture(faceType: 'normal' | 'straining' | 'happy' | 'shocked') {
    const key = `char_child_face_${faceType}`;
    const textureKey = AssetManager.getInstance().getOrGenerateTexture(
      this,
      key,
      120,
      80,
      (g) => {
        const cx = 60;
        const cy = 40;
        if (faceType === 'normal') {
          g.fillStyle(0x000000, 1.0);
          g.fillCircle(cx - 20, cy - 10, 6);
          g.fillCircle(cx + 20, cy - 10, 6);
          g.lineStyle(4, 0x000000, 1.0);
          g.beginPath();
          g.arc(cx, cy + 10, 10, 0, Math.PI, false);
          g.strokePath();
        } else if (faceType === 'straining') {
          g.lineStyle(4, 0x000000, 1.0);
          g.lineBetween(cx - 28, cy - 15, cx - 12, cy - 5);
          g.lineBetween(cx - 28, cy - 5, cx - 12, cy - 15);
          g.lineBetween(cx + 12, cy - 15, cx + 28, cy - 5);
          g.lineBetween(cx + 12, cy - 5, cx + 28, cy - 15);
          g.lineBetween(cx - 15, cy + 15, cx + 15, cy + 15);
        } else if (faceType === 'happy') {
          g.lineStyle(4, 0x000000, 1.0);
          g.beginPath();
          g.arc(cx - 20, cy - 5, 8, Math.PI, 0, false);
          g.strokePath();
          g.beginPath();
          g.arc(cx + 20, cy - 5, 8, Math.PI, 0, false);
          g.strokePath();
          g.fillStyle(0x000000, 1.0);
          g.beginPath();
          g.arc(cx, cy + 5, 14, 0, Math.PI, false);
          g.closePath();
          g.fill();
        } else if (faceType === 'shocked') {
          g.fillStyle(0xffffff, 1.0);
          g.fillCircle(cx - 20, cy - 10, 10);
          g.fillCircle(cx + 20, cy - 10, 10);
          g.fillStyle(0x000000, 1.0);
          g.fillCircle(cx - 20, cy - 10, 4);
          g.fillCircle(cx + 20, cy - 10, 4);
          g.lineStyle(4, 0x000000, 1.0);
          g.strokeCircle(cx, cy + 15, 8);
        }
      }
    );
    if (this.childFaceSprite) {
      this.childFaceSprite.setTexture(textureKey);
    }
  }

  // 8단계: 똥 4종 상세 텍스처 렌더링 및 Fallback 로드
  private createDetailedPoopTextures() {
    const poopSpecs = [
      { id: 'normal', radius: 25, color: 0x8b5a2b },
      { id: 'fast', radius: 20, color: 0x2980b9 },
      { id: 'heavy', radius: 50, color: 0xd35400 },
      { id: 'gold', radius: 25, color: 0xf1c40f }
    ];

    poopSpecs.forEach((spec) => {
      const diameter = spec.radius * 2;
      
      // AssetManager에 PNG 파일 매핑을 시도하고 파일이 유실되었을 때만 fallback 콜백을 태워 그린다.
      AssetManager.getInstance().getOrGenerateTexture(
        this,
        `poop_${spec.id}`,
        diameter,
        diameter,
        (g) => {
          if (spec.id === 'normal') {
            g.fillStyle(spec.color, 1.0);
            g.fillCircle(spec.radius, spec.radius, spec.radius);
            g.fillStyle(0xffffff, 1.0);
            g.fillCircle(spec.radius - 8, spec.radius - 5, 6);
            g.fillStyle(0x000000, 1.0);
            g.fillCircle(spec.radius - 8, spec.radius - 5, 3);
            g.fillStyle(0xffffff, 1.0);
            g.fillCircle(spec.radius + 8, spec.radius - 5, 6);
            g.fillStyle(0x000000, 1.0);
            g.fillCircle(spec.radius + 8, spec.radius - 5, 3);
            g.lineStyle(2, 0x000000, 1.0);
            g.beginPath();
            g.arc(spec.radius, spec.radius + 6, 6, 0, Math.PI, false);
            g.strokePath();
          } else if (spec.id === 'fast') {
            g.fillStyle(spec.color, 1.0);
            g.beginPath();
            g.moveTo(spec.radius, 0);
            g.lineTo(diameter, spec.radius);
            g.lineTo(spec.radius, diameter);
            g.lineTo(0, spec.radius);
            g.closePath();
            g.fill();
            g.fillStyle(0xffffff, 1.0);
            g.beginPath();
            g.moveTo(spec.radius, spec.radius - 10);
            g.lineTo(spec.radius + 5, spec.radius);
            g.lineTo(spec.radius - 3, spec.radius);
            g.lineTo(spec.radius, spec.radius + 10);
            g.closePath();
            g.fill();
          } else if (spec.id === 'heavy') {
            g.fillStyle(spec.color, 1.0);
            g.fillCircle(spec.radius, spec.radius, spec.radius);
            g.lineStyle(3, 0x5e2700, 0.7);
            g.lineBetween(10, spec.radius, diameter - 10, spec.radius);
            g.lineBetween(spec.radius, 10, spec.radius, diameter - 10);
          } else if (spec.id === 'gold') {
            g.fillStyle(spec.color, 1.0);
            g.fillCircle(spec.radius, spec.radius, spec.radius);
            g.lineStyle(3, 0xffffff, 1.0);
            g.strokeCircle(spec.radius, spec.radius, spec.radius - 3);
            g.lineStyle(4, 0xffffff, 1.0);
            g.beginPath();
            g.arc(spec.radius + 2, spec.radius, 8, Math.PI * 0.25, Math.PI * 1.75, true);
            g.strokePath();
          }
        }
      );
    });
  }

  // 8단계: 배트 휘두르기 스프라이트 트윈 연출
  private swingBat(angle?: number) {
    if (!this.playerBatSprite) return;
    const targetAngle = angle !== undefined ? Phaser.Math.RadToDeg(angle) - 90 : -110;
    this.tweens.add({
      targets: this.playerBatSprite,
      angle: targetAngle,
      duration: 80,
      yoyo: true,
      hold: 40,
      ease: 'Back.easeOut'
    });
  }

  // 7단계: 가이드라인 조건부 노출
  private drawGuidelines(width: number, height: number) {
    const graphics = this.add.graphics();
    const topLimit = height * 0.25; 
    const bottomLimit = height * 0.75; 

    // DEV 환경일 때만 배경 가이드라인 박스를 옅게 채움
    if (import.meta.env.DEV) {
      graphics.fillStyle(0xe74c3c, 0.08); // 상단
      graphics.fillRect(0, 0, width, topLimit);
      
      graphics.fillStyle(0x3498db, 0.03); // 중단
      graphics.fillRect(0, topLimit, width, bottomLimit - topLimit);

      graphics.fillStyle(0x2ecc71, 0.08); // 하단
      graphics.fillRect(0, bottomLimit, width, height - bottomLimit);
    }

    // 경계 가이드 라인선은 얇은 실선으로 깔끔하게 남겨둠
    graphics.lineStyle(2, 0xffffff, 0.3);
    graphics.lineBetween(0, topLimit, width, topLimit);
    graphics.lineBetween(0, bottomLimit, width, bottomLimit);

    // 타격 기준점 Y=1600 가이드 점선 그리기
    graphics.lineStyle(2, 0xffeb3b, 0.3);
    graphics.lineBetween(0, 1600, width, 1600);
  }

  // 7단계: Good / Graze 피격 파티클 이펙트
  private createSparkParticles(x: number, y: number, color: number) {
    for (let i = 0; i < 12; i++) {
      const spark = this.add.graphics();
      spark.fillStyle(color, 1.0);
      spark.fillCircle(0, 0, Phaser.Math.Between(4, 8));
      spark.setPosition(x, y);

      const angle = Math.random() * Math.PI * 2;
      const speed = Phaser.Math.Between(150, 350);
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      this.tweens.add({
        targets: spark,
        x: x + vx * 0.4,
        y: y + vy * 0.4,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 400,
        onComplete: () => spark.destroy()
      });
    }
  }

  // 7단계: Miss 빨간색 테두리 연출
  private showMissWarningVFX() {
    if (!this.missWarningGraphics) return;
    
    this.tweens.add({
      targets: this.missWarningGraphics,
      alpha: 1.0,
      duration: 100,
      yoyo: true,
      hold: 50,
      ease: 'Quad.easeOut'
    });
  }

  private showJudgementVFX(x: number, y: number, judge: string) {
    let color = '#ffffff';
    if (judge === 'perfect') color = '#f1c40f'; // 금색
    if (judge === 'good') color = '#2ecc71';    // 녹색
    if (judge === 'graze') color = '#3498db';   // 파란색
    if (judge === 'miss') color = '#e74c3c';    // 빨간색

    const label = this.add.text(x, y - 40, judge.toUpperCase(), {
      fontFamily: 'Arial',
      fontSize: '48px',
      fontStyle: 'bold',
      color,
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    label.setScale(0.2);

    this.tweens.add({
      targets: label,
      scale: 1.25,
      y: y - 110,
      duration: 150,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: label,
          y: y - 180,
          alpha: 0,
          duration: 450,
          ease: 'Quad.easeIn',
          onComplete: () => label.destroy()
        });
      }
    });

    if (judge === 'perfect') {
      // PERFECT 시 동심원 스플래시 연출
      const ring = this.add.graphics();
      ring.lineStyle(6, 0xf1c40f, 1.0);
      ring.strokeCircle(x, y, 15);
      
      this.tweens.add({
        targets: ring,
        scaleX: 5.5,
        scaleY: 5.5,
        alpha: 0,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => ring.destroy()
      });
    }
  }

  private updateHUD() {
    if (!this.hudText) return;
    const gm = GameManager.getInstance();
    
    // 실시간 잔여 제한 시간 표출 포함 및 visualScore 카운트업 연동
    this.hudText.setText(
      `STAGE: ${gm.getStageId()}\n` +
      `SCORE: ${Math.round(this.visualScore)}\n` +
      `COMBO: ${gm.getCombo()} (MAX: ${gm.getMaxCombo()})\n` +
      `LIFE : ${gm.getLife()} / ${gm.getMaxLife()}\n` +
      `TIME : ${this.remainingTime}s`
    );
  }

  private createDummyButtons(width: number) {
    const activeStageId = GameManager.getInstance().getStageId() || 'stage_001';
    const stageDef = StageManager.getInstance().getStageConfig(activeStageId);
    
    this.add.text(width / 2, 1060, `목표 점수: ${stageDef.targetScore}점`, {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setStroke('#000000', 4);
  }

  private cleanupEvents() {
    // 11단계: 활성 트윈 강제 안전 종료
    this.stopChildTween();

    if (this.scoreUnsubscribe) this.scoreUnsubscribe();
    if (this.comboUnsubscribe) this.comboUnsubscribe();
    if (this.lifeUnsubscribe) this.lifeUnsubscribe();
    if (this.faceUnsubscribe) this.faceUnsubscribe();
    if (this.poopMissedUnsubscribe) this.poopMissedUnsubscribe();
    
    if (this.playerController) {
      this.playerController.destroy();
    }
    if (this.aimPreview) {
      this.aimPreview.destroy();
    }

    PoopManager.getInstance().cleanup();

    // 타이머 디스포즈
    if (this.stageTimer) {
      this.stageTimer.destroy();
      this.stageTimer = null;
    }
  }

  shutdown() {
    this.cleanupEvents();
  }

  destroy() {
    this.cleanupEvents();
  }

  // ==========================================
  // 11단계: Child Animation Controller 트윈 헬퍼
  // ==========================================

  private stopChildTween() {
    if (this.childTween) {
      this.childTween.stop();
      this.childTween = null;
    }
    if (this.childContainer) {
      this.childContainer.setScale(1);
      this.childContainer.setX(this.cameras.main.width / 2);
      this.childContainer.setY(380);
    }
    if (this.childBodySprite) {
      this.childBodySprite.off('animationcomplete-child_straining_start');
      this.childBodySprite.off('animationcomplete-child_spawn');
    }
  }

  private playChildIdleBreathing() {
    this.stopChildTween();

    const hasPoopStartFrames = this.hasChildPoopStartAssets();

    if (hasPoopStartFrames && this.childBodySprite) {
      this.childBodySprite.play('child_idle', true);
    } else if (this.childContainer) {
      this.childTween = this.tweens.add({
        targets: this.childContainer,
        scaleY: 1.03,
        duration: 1000,
        yoyo: true,
        loop: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private playChildStrainingShake() {
    this.stopChildTween();
    
    const hasPoopStartFrames = this.hasChildPoopStartAssets();
    const cx = this.cameras.main.width / 2;

    if (hasPoopStartFrames && this.childBodySprite) {
      // 12단계: 힘주기 애니메이션 재생 (straining_start -> straining_loop)
      this.childBodySprite.play('child_straining_start');
      this.childBodySprite.once('animationcomplete-child_straining_start', () => {
        if (this.childBodySprite && this.childBodySprite.anims.currentAnim?.key === 'child_straining_start') {
          this.childBodySprite.play('child_straining_loop', true);
        }
      });

      // 12단계 추가 연출: 몸이 살짝 아래로 내려가는 느낌(y: 380 -> 385) + 떨림 효과 컨테이너 적용
      this.childTween = this.tweens.add({
        targets: this.childContainer,
        y: 385,
        x: { from: cx - 2, to: cx + 2 },
        duration: 40,
        yoyo: true,
        loop: -1
      });
    } else if (this.childContainer) {
      this.childTween = this.tweens.add({
        targets: this.childContainer,
        x: { from: cx - 2, to: cx + 2 },
        duration: 40,
        yoyo: true,
        loop: -1
      });
    }
  }

  private playChildSpawnPunch() {
    this.stopChildTween();
    
    const hasPoopStartFrames = this.hasChildPoopStartAssets();

    if (hasPoopStartFrames && this.childBodySprite) {
      // 12단계 추가 연출: Spawn 순간 60~80ms의 미세 카메라 셰이크
      this.cameras.main.shake(70, 0.006);

      // 스폰 배출 애니메이션 재생
      this.childBodySprite.play('child_spawn');
      
      this.childBodySprite.once('animationcomplete-child_spawn', () => {
        if (this.childBodySprite) {
          // 복원 애니메이션 재생
          this.childBodySprite.play('child_recover');

          // 12단계 추가 연출: 착지 시 아주 작은 Bounce 탄성 복귀
          this.childTween = this.tweens.add({
            targets: this.childContainer,
            y: 380, // 385에서 380 원복
            scaleY: 1.02,
            duration: 150,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
              if (this.childBodySprite) {
                this.childBodySprite.play('child_idle', true);
              }
            }
          });
        }
      });
    } else if (this.childContainer) {
      // 기존 Fallback
      this.childContainer.setScale(1.0, 0.75);
      
      this.childTween = this.tweens.add({
        targets: this.childContainer,
        scaleY: 1.0,
        scaleX: 1.0,
        duration: 500,
        ease: 'Bounce.easeOut', // 탄성 복구 바운스
        onComplete: () => {
          this.playChildIdleBreathing(); // 바운스 완료 후 다시 호흡 작동
        }
      });
    }
  }
}
